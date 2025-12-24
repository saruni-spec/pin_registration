'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  showHeader?: boolean;
  onBack?: () => void;
}

export function Layout({ children, title, showHeader = true, onBack }: LayoutProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {showHeader && (
        <header className="bg-kra-red text-white px-4 py-4 shadow-md sticky top-0 z-10">
          <div className="max-w-md mx-auto flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 hover:bg-kra-red-dark rounded-lg transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h1 className="text-lg font-medium">KRA PIN Registration</h1>
          </div>
        </header>
      )}
      <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full">
        {title && (
          <h2 className="text-xl font-semibold text-gray-900 mb-6">{title}</h2>
        )}
        {children}
      </main>
    </div>
  );
}

// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'text';
  fullWidth?: boolean;
}

export function Button({ 
  variant = 'primary', 
  fullWidth = true, 
  children, 
  className = '',
  ...props 
}: ButtonProps) {
  const baseStyles = 'px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-kra-red text-white hover:bg-kra-red-dark',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    text: 'bg-transparent text-kra-red hover:text-kra-red-dark underline',
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export function Input({ 
  label, 
  helperText, 
  error, 
  className = '', 
  ...props 
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-kra-red focus:border-transparent ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}

// MaskedDataCard Component
interface MaskedDataCardProps {
  label: string;
  value: string;
}

export function MaskedDataCard({ label, value }: MaskedDataCardProps) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-gray-900 font-medium">{value}</p>
    </div>
  );
}

// DeclarationCheckbox Component
interface DeclarationCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  legalNote?: string;
}

export function DeclarationCheckbox({ 
  label, 
  legalNote, 
  ...props 
}: DeclarationCheckboxProps) {
  return (
    <div className="space-y-3">
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          className="mt-1 w-5 h-5 rounded border-gray-300 text-kra-red focus:ring-kra-red"
          {...props}
        />
        <span className="text-gray-700 flex-1">{label}</span>
      </label>
      {legalNote && (
        <p className="text-xs text-gray-500 pl-8">{legalNote}</p>
      )}
    </div>
  );
}

// SuccessState Component
import { CheckCircle } from 'lucide-react';

interface SuccessStateProps {
  message: string;
}

export function SuccessState({ message }: SuccessStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="w-20 h-20 bg-kra-light-gray rounded-full flex items-center justify-center mb-4">
        <CheckCircle className="w-12 h-12 text-kra-green" />
      </div>
      <p className="text-gray-900 text-center text-lg">{message}</p>
    </div>
  );
}
