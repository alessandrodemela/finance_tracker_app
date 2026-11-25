import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { Account, BudgetCategory, Category, MovementType } from '@/types/database';

export interface ImportedBulkRow {
  id: string;
  type: MovementType;
  date: string;
  amount: string;
  account_id: string;
  from_account_id: string;
  to_account_id: string;
  category_id: string;
  budget_category_id: string;
  notes: string;
  is_fixed: boolean;
  is_split: boolean;
  is_necessary: boolean;
  _ui_checked?: boolean;
}

export interface ImportResult {
  rows: ImportedBulkRow[];
  skippedCount: number;
  warnings: string[];
}

const VALID_TYPES = new Set(['income', 'expense', 'transfer']);

const generateId = () => Math.random().toString(36).substr(2, 9);

function normalizeString(val: unknown): string {
  if (val === null || val === undefined) return '';
  return String(val).trim();
}

function isNoneValue(val: string): boolean {
  return !val || val.toLowerCase() === 'none' || val.toLowerCase() === 'null';
}

function parseBooleanFlag(val: unknown): boolean {
  const str = normalizeString(val).toLowerCase();
  return str === '1' || str === 'true' || str === 'si' || str === 'sì' || str === 'yes';
}

function getField(raw: Record<string, unknown>, candidates: string[]): unknown {
  const lowerCandidates = candidates.map((c) => c.toLowerCase());
  for (const key of Object.keys(raw)) {
    if (lowerCandidates.includes(key.trim().toLowerCase())) {
      return raw[key];
    }
  }
  return undefined;
}

const MONTH_MAP: Record<string, string> = {
  gen: '01', gennaio: '01', jan: '01', january: '01',
  feb: '02', febbraio: '02', february: '02',
  mar: '03', marzo: '03', march: '03',
  apr: '04', aprile: '04', april: '04',
  mag: '05', maggio: '05', may: '05',
  giu: '06', giugno: '06', jun: '06', june: '06',
  lug: '07', luglio: '07', jul: '07', july: '07',
  ago: '08', agosto: '08', aug: '08', august: '08',
  set: '09', settembre: '09', sep: '09', sept: '09', september: '09',
  ott: '10', ottobre: '10', oct: '10', october: '10',
  nov: '11', novembre: '11', november: '11',
  dic: '12', dicembre: '12', dec: '12', december: '12',
};

function normalizeDate(val: unknown): string {
  if (val instanceof Date && !isNaN(val.getTime())) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, '0');
    const d = String(val.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  if (typeof val === 'number') {
    const parsed = XLSX.SSF.parse_date_code(val);
    if (parsed) {
      const y = parsed.y;
      const m = String(parsed.m).padStart(2, '0');
      const d = String(parsed.d).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  }
  const str = normalizeString(val);
  if (!str) return '';

  // Handle YYYY-MM-DD / YYYY/MM/DD / YYYY.MM.DD (strip optional time)
  const ymdMatch = str.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/);
  if (ymdMatch) {
    return `${ymdMatch[1]}-${ymdMatch[2].padStart(2, '0')}-${ymdMatch[3].padStart(2, '0')}`;
  }

  // Handle DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY (and 2-digit year)
  const dmyMatch = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/);
  if (dmyMatch) {
    const year = dmyMatch[3].length === 2 ? `20${dmyMatch[3]}` : dmyMatch[3];
    return `${year}-${dmyMatch[2].padStart(2, '0')}-${dmyMatch[1].padStart(2, '0')}`;
  }

  // Handle Italian/English text months: "24 set 2026", "24-set-26", "24 settembre 2026"
  const textMonthMatch = str.match(/^(\d{1,2})[\s\/\-\.]+([a-zA-Zàèéìòù]+)[\s\/\-\.]+(\d{2,4})/);
  if (textMonthMatch) {
    const month = MONTH_MAP[textMonthMatch[2].toLowerCase()];
    if (month) {
      const year = textMonthMatch[3].length === 2 ? `20${textMonthMatch[3]}` : textMonthMatch[3];
      return `${year}-${month}-${textMonthMatch[1].padStart(2, '0')}`;
    }
  }

  return str;
}

export async function parseImportFile(
  file: File,
  accounts: Account[],
  expenseCategories: Category[],
  incomeCategories: Category[],
  budgetCategories: BudgetCategory[]
): Promise<ImportResult> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  let rawRows: Record<string, unknown>[] = [];

  if (ext === 'csv') {
    rawRows = await new Promise<Record<string, unknown>[]>((resolve, reject) => {
      Papa.parse<Record<string, unknown>>(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => resolve(results.data),
        error: (err) => reject(err),
      });
    });
  } else if (ext === 'xlsx' || ext === 'xls') {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, { defval: '', raw: true });
  } else {
    throw new Error('Formato file non supportato. Usa .csv, .xlsx o .xls');
  }

  const rows: ImportedBulkRow[] = [];
  let skippedCount = 0;
  let missingAccountCount = 0;
  let missingCategoryCount = 0;
  let transferCount = 0;
  let invalidDateCount = 0;
  let invalidDateSample: string | null = null;

  for (const raw of rawRows) {
    const rawType = normalizeString(raw['Type'] ?? raw['type']).toLowerCase();
    if (!VALID_TYPES.has(rawType)) {
      skippedCount++;
      continue;
    }

    const type = rawType as MovementType;
    const rawDateVal = getField(raw, ['Data Valuta', 'Date', 'Data', 'Data Operazione']);
    const date = normalizeDate(rawDateVal);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      invalidDateCount++;
      if (invalidDateSample === null) {
        invalidDateSample = `${String(rawDateVal)} (colonne: ${Object.keys(raw).join(', ')})`;
      }
    }
    const rawAmount = normalizeString(raw['Amount'] ?? raw['amount']).replace(',', '.');
    const amountNum = parseFloat(rawAmount);
    const amount = isNaN(amountNum) ? '' : String(Math.abs(amountNum));

    // Match Account
    const accountName = normalizeString(raw['Account'] ?? raw['account']);
    const matchedAccount = !isNoneValue(accountName)
      ? accounts.find((a) => a.name.toLowerCase() === accountName.toLowerCase())
      : undefined;

    if (!isNoneValue(accountName) && !matchedAccount) {
      missingAccountCount++;
    }

    // Match Category
    const categoryName = normalizeString(raw['Category'] ?? raw['category']);
    const categoryPool = type === 'income' ? incomeCategories : expenseCategories;
    const matchedCategory =
      type !== 'transfer' && !isNoneValue(categoryName)
        ? categoryPool.find((c) => c.name.toLowerCase() === categoryName.toLowerCase())
        : undefined;

    if (type !== 'transfer' && !isNoneValue(categoryName) && !matchedCategory) {
      missingCategoryCount++;
    }

    // Match Macro Category (budget_category_id)
    const macroName = normalizeString(raw['Macro Category'] ?? raw['macro_category'] ?? raw['Macro']);
    const matchedMacro =
      type !== 'transfer' && !isNoneValue(macroName)
        ? budgetCategories.find((b) => b.name.toLowerCase() === macroName.toLowerCase())
        : undefined;

    // Note (Descrizione viene ignorata come richiesto)
    const notes = normalizeString(raw['Note'] ?? raw['Notes'] ?? raw['notes']);

    // Flag is*: se type è expense, 1 -> true, vuoto -> false; altrimenti tutto false
    const isExpense = type === 'expense';
    const is_fixed = isExpense ? parseBooleanFlag(raw['is fixed'] ?? raw['is_fixed']) : false;
    const is_split = isExpense ? parseBooleanFlag(raw['is split'] ?? raw['is_split']) : false;
    const is_necessary = isExpense ? parseBooleanFlag(raw['is necessary'] ?? raw['is_necessary']) : false;

    if (type === 'transfer') {
      transferCount++;
    }

    rows.push({
      id: generateId(),
      type,
      date,
      amount,
      account_id: type === 'transfer' ? '' : (matchedAccount?.id ?? ''),
      from_account_id: type === 'transfer' ? (matchedAccount?.id ?? '') : '',
      to_account_id: '',
      category_id: matchedCategory?.id ?? '',
      budget_category_id: matchedMacro?.id ?? '',
      notes,
      is_fixed,
      is_split,
      is_necessary,
      _ui_checked: false,
    });
  }

  const warnings: string[] = [];
  if (skippedCount > 0) {
    warnings.push(`${skippedCount} righe ignorate (non sono transazioni valide).`);
  }
  if (missingAccountCount > 0) {
    warnings.push(`${missingAccountCount} righe con Account non trovato nel DB.`);
  }
  if (missingCategoryCount > 0) {
    warnings.push(`${missingCategoryCount} righe con Category non trovata nel DB.`);
  }
  if (transferCount > 0) {
    warnings.push(`${transferCount} trasferimenti richiedono la selezione del conto di destinazione (To Account).`);
  }
  if (invalidDateCount > 0) {
    warnings.push(`${invalidDateCount} righe con data non riconosciuta (es. "${invalidDateSample}").`);
  }

  return { rows, skippedCount, warnings };
}
