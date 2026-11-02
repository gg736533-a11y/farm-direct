import React from 'react';
import { Heart } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export default function FavoriteButton({ productId, size = 'md', className = '' }) {
  const { isFavorite, toggleFavorite } = useShop();
  const active = isFavorite(productId);

  const sizeClasses = {
    sm: 'p-1.5 w-7 h-7',
    md: 'p-2 w-9 h-9',
    lg: 'p-2.5 w-11 h-11'
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(productId);
      }}
      className={`rounded-full flex items-center justify-center transition-all duration-200 ${
        active
          ? 'bg-rose-50 text-rose-600 border border-rose-200/80 shadow-xs scale-105'
          : 'bg-white/90 backdrop-blur-md text-charcoal-700 hover:text-rose-600 hover:bg-white border border-cream-200/80 shadow-soft hover:scale-105'
      } ${sizeClasses[size] || sizeClasses.md} ${className}`}
      aria-label={active ? 'Remove from favorites' : 'Add to favorites'}
      title={active ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        className={`${iconSizes[size] || iconSizes.md} transition-transform ${
          active ? 'fill-rose-500 text-rose-500 animate-pulse-short' : ''
        }`}
      />
    </button>
  );
}
