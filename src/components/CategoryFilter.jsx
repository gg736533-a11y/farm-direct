import React from 'react';
import { CATEGORIES } from '../data/categories';
import { Sparkles, Carrot, Apple, Milk, Egg, Wheat, Droplets, Leaf } from 'lucide-react';

const iconMap = {
  Sparkles,
  Carrot,
  Apple,
  Milk,
  Egg,
  Wheat,
  Droplets,
  Leaf,
};

export default function CategoryFilter({
  selectedCategory = 'ALL',
  onSelectCategory,
  counts = {},
  className = ''
}) {
  const normSelected = selectedCategory ? selectedCategory.toString().toUpperCase() : 'ALL';

  return (
    <div className={`flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar ${className}`}>
      {CATEGORIES.map((cat) => {
        const Icon = iconMap[cat.icon] || Leaf;
        const isActive = normSelected === cat.id;
        const count = counts[cat.id] ?? 0;

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
              isActive
                ? 'bg-forest-900 text-cream-50 shadow-sm shadow-forest-950/20'
                : 'bg-white text-charcoal-700 hover:text-forest-950 hover:bg-cream-100/70 border border-cream-200'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-fresh-400' : 'text-forest-700/70'}`} />
            <span>{cat.name}</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                isActive ? 'bg-forest-800 text-fresh-300' : 'bg-cream-100 text-charcoal-600'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
