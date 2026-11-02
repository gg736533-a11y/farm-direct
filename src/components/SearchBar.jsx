import React from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar({
  value = '',
  onChange,
  placeholder = 'Search products, farmers or locations...',
  className = '',
  onClear
}) {
  return (
    <div className={`relative flex items-center w-full max-w-xl ${className}`}>
      <div className="absolute left-4 text-forest-700/60 pointer-events-none">
        <Search className="w-5 h-5" />
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-12 pr-10 py-3.5 bg-white rounded-2xl border border-cream-300/80 shadow-soft text-sm text-charcoal-900 placeholder:text-charcoal-600 focus:outline-none focus:ring-2 focus:ring-forest-600/30 focus:border-forest-600 transition-all"
      />

      {value && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3.5 p-1 text-charcoal-600 hover:text-charcoal-900 rounded-full hover:bg-cream-100 transition-colors"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
