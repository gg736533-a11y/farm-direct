import React from 'react';
import { Link } from 'react-router-dom';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  to,
  href,
  onClick,
  className = '',
  icon: Icon,
  iconPosition = 'left',
  disabled = false,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none';

  const variants = {
    primary: 'bg-forest-900 text-cream-50 hover:bg-forest-800 active:bg-forest-950 shadow-sm hover:shadow focus:ring-forest-700',
    secondary: 'bg-fresh-100 text-forest-900 hover:bg-fresh-200 active:bg-fresh-300 focus:ring-fresh-500',
    accent: 'bg-fresh-600 text-white hover:bg-fresh-700 active:bg-fresh-800 shadow-sm focus:ring-fresh-500',
    outline: 'border border-forest-800/30 text-forest-900 bg-white hover:bg-forest-50/50 hover:border-forest-800 active:bg-forest-100/50 focus:ring-forest-600',
    ghost: 'text-charcoal-700 hover:text-forest-900 hover:bg-forest-50/70 focus:ring-forest-600',
    white: 'bg-white text-forest-950 hover:bg-cream-100 active:bg-cream-200 shadow-sm focus:ring-white',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5 font-semibold',
  };

  const combinedStyles = `${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`;

  const iconElement = Icon && <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />;

  if (to) {
    return (
      <Link to={to} className={combinedStyles} {...props}>
        {Icon && iconPosition === 'left' && iconElement}
        <span>{children}</span>
        {Icon && iconPosition === 'right' && iconElement}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={combinedStyles} {...props}>
        {Icon && iconPosition === 'left' && iconElement}
        <span>{children}</span>
        {Icon && iconPosition === 'right' && iconElement}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={combinedStyles}
      {...props}
    >
      {Icon && iconPosition === 'left' && iconElement}
      <span>{children}</span>
      {Icon && iconPosition === 'right' && iconElement}
    </button>
  );
}
