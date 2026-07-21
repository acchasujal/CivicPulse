import React from 'react';
import { cn } from '../../../lib/utils';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  label: string;
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  error?: string;
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  label,
  options,
  value,
  defaultValue,
  onChange,
  error,
  className,
}) => {
  return (
    <fieldset className={cn('w-full space-y-2 font-sans', className)}>
      <legend className="text-sm font-medium text-neutral-900 mb-1 select-none">{label}</legend>

      <div className="space-y-1">
        {options.map((opt) => {
          const inputId = `radio-${name}-${opt.value}`;
          const isSelected = value !== undefined ? value === opt.value : undefined;

          return (
            <label
              key={opt.value}
              htmlFor={inputId}
              className={cn(
                'flex items-start gap-3 min-h-[48px] p-2.5 rounded-md border border-transparent hover:border-neutral-200 cursor-pointer group transition-colors select-none',
                opt.disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
              )}
            >
              <div className="relative flex items-center justify-center mt-0.5">
                <input
                  type="radio"
                  id={inputId}
                  name={name}
                  value={opt.value}
                  checked={isSelected}
                  defaultChecked={defaultValue === opt.value}
                  disabled={opt.disabled}
                  onChange={(e) => onChange?.(e.target.value)}
                  className="sr-only peer"
                />
                <div className="w-5 h-5 rounded-pill border-2 border-neutral-300 bg-white transition-all flex items-center justify-center peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500 peer-focus-visible:ring-offset-2 peer-checked:border-primary-700">
                  <div className="w-2.5 h-2.5 rounded-pill bg-primary-700 opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-sm font-medium text-neutral-900 group-hover:text-primary-700 transition-colors">
                  {opt.label}
                </span>
                {opt.description && <span className="text-xs text-neutral-700 mt-0.5">{opt.description}</span>}
              </div>
            </label>
          );
        })}
      </div>

      {error && <p role="alert" className="text-xs font-medium text-danger mt-1">{error}</p>}
    </fieldset>
  );
};
