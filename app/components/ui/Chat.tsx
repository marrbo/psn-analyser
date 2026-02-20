import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface ChatProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

export default function Chat({ children, variant = 'default', size = 'md', className = '' }: ChatProps) {
  const variantClasses = {
    default: 'bg-gray-900/50 text-gray-400/50 hover:text-gray-300',
    success: 'bg-green-900/50 text-green-800',
    warning: 'bg-yellow-100/20 text-yellow-800',
    danger: 'bg-red-100/20 text-red-800',
    info: 'bg-blue-100/20 text-blue-800',
  };

  const sizeClasses = {
    sm: 'p-3 text-xs',
    md: 'p-3 text-sm',
  };

  return (
    <div className={`chat chat-start ${className} max-w-200`}>
        <div className={clsx(
            `chat-bubble select-none text-left cursor-pointer`,
            variantClasses[variant],
            sizeClasses[size]
        )}>
          {children}
        </div>
    </div>
  );
}