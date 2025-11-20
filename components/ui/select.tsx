import React, { useState } from 'react';

export interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({ value, onValueChange, children }) => {
  return (
    <div className="relative">
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { value, onValueChange } as any);
        }
        return child;
      })}
    </div>
  );
};

export interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

export const SelectTrigger: React.FC<SelectTriggerProps> = ({ 
  value, 
  onValueChange, 
  children, 
  className = '', 
  ...props 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
      >
        {children}
        <svg className="h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </>
  );
};

export interface SelectValueProps {
  placeholder?: string;
  value?: string;
}

export const SelectValue: React.FC<SelectValueProps> = ({ placeholder, value }) => {
  return <span>{value || placeholder}</span>;
};

export interface SelectContentProps {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
}

export const SelectContent: React.FC<SelectContentProps> = ({ 
  children, 
  value, 
  onValueChange 
}) => {
  return (
    <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-gray-200 bg-white text-sm shadow-lg">
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { currentValue: value, onSelect: onValueChange } as any);
        }
        return child;
      })}
    </div>
  );
};

export interface SelectItemProps {
  value: string;
  currentValue?: string;
  onSelect?: (value: string) => void;
  children: React.ReactNode;
}

export const SelectItem: React.FC<SelectItemProps> = ({ 
  value, 
  currentValue, 
  onSelect, 
  children 
}) => {
  const isSelected = value === currentValue;

  return (
    <div
      className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 ${
        isSelected ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
      }`}
      onClick={() => onSelect?.(value)}
    >
      {isSelected && (
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </span>
      )}
      {children}
    </div>
  );
};