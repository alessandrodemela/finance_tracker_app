import React from 'react';


interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = ({ label, error, options, className = '', ...props }: SelectProps) => {
  return (
    <div className="flex flex-col gap-1 w-full relative">
      {label && <label className="text-xs font-bold text-[var(--color-brand-secondary)] uppercase tracking-[0.1em]">{label}</label>}
      <select 
        className={`w-full bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] focus:border-[var(--color-brand-accent)] focus:bg-[rgba(255,255,255,0.05)] rounded-2xl py-3 px-4 text-white outline-none transition-all appearance-none ${error ? 'border-[var(--color-brand-danger)]' : ''} ${className}`} 
        {...props} 
      >
        <option value="" disabled className="text-black bg-white">Select an option</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="text-black bg-white">
            {opt.label}
          </option>
        ))}
      </select>
      <div className="absolute right-4 top-[calc(50%+4px)] transform -translate-y-1/2 pointer-events-none opacity-50">
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      {error && <span className="text-[var(--color-brand-danger)] text-xs mt-1">{error}</span>}
    </div>
  );
};
