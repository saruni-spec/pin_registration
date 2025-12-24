'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Headphones, Home, LogOut, Menu } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  title: string;
  step?: string;
  onBack?: () => void;
  showMenu?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
}
export function Layout({ children, title, step, onBack, showMenu = false, showHeader = true, showFooter = true }: LayoutProps) {
  const router = useRouter();

  const handleMenuClick = () => {
   const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
    const message = encodeURIComponent('Main menu');
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  const handleLogout = async () => {
  
      await logout();

      const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
    const message = encodeURIComponent('Main menu');
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
      
  
  };

  const handleConnectAgent = () => {
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
    const message = encodeURIComponent('Connect to agent');
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

   const handleMainMenu = () => {
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
    const message = encodeURIComponent('Main menu');
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header - KRA Dark Theme */}
      {showHeader && (
        <div className="bg-[var(--kra-black)] text-white sticky top-0 z-10 shadow-md">
          <div className="max-w-4xl mx-auto px-3 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
                  aria-label="Go back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div>
                <h1 className="text-base font-medium">{title}</h1>
                {step && <p className="text-xs text-gray-400">{step}</p>}
              </div>
            </div>
            {showMenu && (
              <button
                onClick={handleMenuClick}
                className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Content - Compact padding */}
      <div className="flex-1 max-w-4xl mx-auto px-3 py-3 w-full">
        {children}
      </div>

      {/* Footer Navigation */}
      {showFooter && (
        <div className="bg-white border-t border-gray-200 sticky bottom-0 z-10">
          <div className="max-w-4xl mx-auto px-3 py-2">
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={handleMainMenu}
                className="flex flex-col items-center justify-center gap-0.5 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium text-[10px]"
              >
                <Home className="w-4 h-4" />
                Home
              </button>
              <button 
                onClick={handleConnectAgent}
                className="flex flex-col items-center justify-center gap-0.5 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700 font-medium text-[10px]"
              >
                <Headphones className="w-4 h-4" />
                Connect Agent
              </button>
              <button 
                onClick={handleLogout}
                className="flex flex-col items-center justify-center gap-0.5 py-2 bg-red-50 hover:bg-red-100 rounded-lg text-red-700 font-medium text-[10px]"
              >
                <LogOut className="w-4 h-4" />
               Logout
              </button>
            </div>
          </div>
        </div>
      )}
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
    primary: 'bg-green-600 text-white hover:bg-green-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    text: 'bg-transparent text-green-600 hover:text-green-700 underline',
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
        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent ${
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
          className="mt-1 w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-600"
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
import { logout } from '../actions/pin-registration';

interface SuccessStateProps {
  message: string;
}

export function SuccessState({ message }: SuccessStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
        <CheckCircle className="w-12 h-12 text-green-600" />
      </div>
      <p className="text-gray-900 text-center text-lg">{message}</p>
    </div>
  );
}
