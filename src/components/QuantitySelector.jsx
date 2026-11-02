import React from 'react';
import { Minus, Plus } from 'lucide-react';

export default function QuantitySelector({
  quantity = 1,
  onChange,
  min = 1,
  max = 99,
  size = 'md',
  className = ''
}) {
  const handleDecrement = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity > min) {
      onChange(quantity - 1);
    }
  };

  const handleIncrement = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity < max) {
      onChange(quantity + 1);
    }
  };

  const sizeStyles = {
    sm: {
      btn: 'w-7 h-7 text-xs',
      text: 'w-8 text-xs font-bold',
      container: 'p-0.5'
    },
    md: {
      btn: 'w-8 h-8 text-sm',
      text: 'w-10 text-sm font-bold',
      container: 'p-1'
    },
    lg: {
      btn: 'w-10 h-10 text-base',
      text: 'w-12 text-base font-extrabold',
      container: 'p-1.5'
    }
  };

  const current = sizeStyles[size] || sizeStyles.md;

  return (
    <div
      className={`inline-flex items-center bg-cream-100/90 rounded-2xl border border-cream-300/80 shadow-xs ${current.container} ${className}`}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={quantity <= min}
        className={`${current.btn} rounded-xl bg-white text-charcoal-800 hover:bg-cream-200/80 disabled:opacity-40 disabled:hover:bg-white flex items-center justify-center transition-colors shadow-xs`}
        aria-label="Decrease quantity"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>

      <span className={`${current.text} text-center font-mono text-charcoal-900 select-none`}>
        {quantity}
      </span>

      <button
        type="button"
        onClick={handleIncrement}
        disabled={quantity >= max}
        className={`${current.btn} rounded-xl bg-white text-charcoal-800 hover:bg-cream-200/80 disabled:opacity-40 disabled:hover:bg-white flex items-center justify-center transition-colors shadow-xs`}
        aria-label="Increase quantity"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
