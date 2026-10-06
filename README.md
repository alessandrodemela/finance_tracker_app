# 💰 Finance Tracker

A personal finance management application built with **Next.js 16**, **Supabase**, and **Tailwind CSS**.

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

---

## ✨ Features

- 📊 **Dashboard** — Net worth chart, KPI cards, account balances, recent transactions
- 💸 **Transactions** — Add, edit, delete with single or bulk entry; income/expense/transfer support
- 🔍 **Search** — Full-text search across all transactions from the dashboard header
- 📅 **Monthly View** — Month-over-month comparison and category breakdown
- 📈 **Yearly & Insights** — 3-year comparison chart, savings growth trend
- 🎯 **Budget** — Per-category budgets with progress bars; copy from previous month
- ⚙️ **Settings** — Update display name and change password
- 🔒 **Auth** — Sign in, register, forgot password — all via Supabase Auth
- 🛡️ **Security** — Row Level Security (RLS) on all tables; atomic balance updates via PostgreSQL RPC

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Database & Auth | Supabase (PostgreSQL + Auth) |
| Styling | Tailwind CSS + CSS Variables |
| Charts | Recharts |
| Icons | Lucide React |
| Language | TypeScript 5 |

---

## 🛠️ Local Setup

### 1. Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com/) account with a project

### 2. Clone & Install

```bash
git clone https://github.com/alessandrodemela/finance_tracker_app.git
cd finance_tracker_app
npm install
```

### 3. Environment Variables

Copy the example file and fill in your credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

> **Where to find these:** Supabase Dashboard → Settings → API → Project URL & anon key

### 4. Supabase Database Setup

In the Supabase Dashboard → **SQL Editor**, run the migration file:

```
supabase/migrations/20260930_sprint6_rls_and_rpc.sql
```

This creates:
- The `adjust_account_balance` RPC (atomic balance update)
- `user_id` columns on all tables
- Row Level Security (RLS) policies
- All necessary indexes

> **Important:** After running the migration, set your `user_id` on existing rows by following the instructions in the STEP 9 comments inside the migration file.

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type check |

---

## 🏗️ Architecture

```
src/
├── app/                   # Next.js App Router pages
│   ├── page.tsx           # Dashboard (main shell)
│   ├── login/             # Auth page (sign in / register / forgot password)
│   ├── add/               # Add transaction page
│   ├── edit/[id]/         # Edit transaction page
│   ├── transactions/      # Transaction history page
│   └── budget/            # Budget management page
├── components/
│   ├── tabs/              # Dashboard tab content (Home, Monthly, Yearly, Insights, Budget)
│   ├── modals/            # Modals (NewTransaction, NewAccount, Settings)
│   └── ui/                # Shared UI components (Button, Card, Input, etc.)
├── hooks/
│   ├── useData.ts         # All data fetching hooks (useTransactions, useAccounts, etc.)
│   └── useTransactionSubmit.ts  # Centralized transaction submit/update logic
├── lib/
│   ├── financeService.ts  # All DB operations (record/update/delete/balance)
│   ├── supabase.ts        # Supabase client
│   └── utils.ts           # Utility functions
├── context/
│   └── DateContext.tsx    # Global current month state
└── types/
    └── database.ts        # TypeScript types for all DB tables
```

**Key patterns:**
- State refresh via DOM event (`finance_tracker_refresh`) — no external state library needed
- Global toasts and confirm dialogs via `GlobalUI` component (event-driven)
- All balance mutations go through `financeService.adjustAccountBalance` (atomic RPC)

---

## 🚢 Deployment (Vercel)

1. Push your code to GitHub
2. Connect to [Vercel](https://vercel.com/new)
3. Add environment variables: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

---

## 📄 License

MIT

