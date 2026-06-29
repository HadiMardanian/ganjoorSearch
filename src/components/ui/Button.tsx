import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] shadow-sm disabled:opacity-60',
  secondary:
    'border border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-card)] hover:bg-[var(--color-accent-soft)] disabled:opacity-60',
  ghost:
    'text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] disabled:opacity-60',
};

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
