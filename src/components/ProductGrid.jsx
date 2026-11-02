import React from 'react';
import ProductCard from './ProductCard';
import { Sprout } from 'lucide-react';

export default function ProductGrid({
  products = [],
  columns = '4',
  emptyMessage = 'No farm products found matching your criteria.',
  className = ''
}) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-cream-300 max-w-lg mx-auto my-8">
        <div className="w-14 h-14 mx-auto bg-forest-50 text-forest-700 rounded-2xl flex items-center justify-center mb-3">
          <Sprout className="w-7 h-7" />
        </div>
        <h4 className="text-base font-bold text-charcoal-900">No Products Available</h4>
        <p className="text-sm text-charcoal-700 mt-1 max-w-xs mx-auto">{emptyMessage}</p>
      </div>
    );
  }

  const gridCols = {
    '2': 'grid-cols-1 sm:grid-cols-2',
    '3': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    '4': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns] || gridCols['4']} gap-5 sm:gap-6 ${className}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
