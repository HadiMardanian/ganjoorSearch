import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[#9a3412] text-white hover:bg-[#7c2d12] shadow-sm disabled:opacity-60',
  secondary:
    'border border-[#9a3412] text-[#9a3412] bg-white hover:bg-orange-50 disabled:opacity-60',
  ghost:
    'text-stone-700 hover:bg-stone-100 disabled:opacity-60',
};

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9a3412] ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
