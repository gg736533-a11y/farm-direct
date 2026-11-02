import React from 'react';
import { X, Filter, Check, RotateCcw, ShieldCheck } from 'lucide-react';

export default function FilterSidebar({
  filters,
  onChange,
  onReset,
  isOpen = false,
  onClose,
  totalResults = 0
}) {
  const categories = [
    { id: 'ALL', name: 'All Categories' },
    { id: 'VEGETABLES', name: 'Vegetables' },
    { id: 'FRUITS', name: 'Fruits' },
    { id: 'GRAINS', name: 'Grains' },
    { id: 'DAIRY', name: 'Dairy' },
    { id: 'EGGS', name: 'Eggs' },
    { id: 'HONEY', name: 'Honey' },
    { id: 'NUTS', name: 'Nuts & Seeds' },
    { id: 'OTHER', name: 'Farm Specials' }
  ];

  const priceRanges = [
    { id: 'all', name: 'All Prices' },
    { id: 'under-100', name: 'Under ₹100' },
    { id: '100-250', name: '₹100 – ₹250' },
    { id: '250-500', name: '₹250 – ₹500' },
    { id: 'above-500', name: '₹500+' }
  ];

  const freshnessOptions = [
    { id: 'all', name: 'All Freshness' },
    { id: 'today', name: 'Harvested Today' },
    { id: '1-2days', name: '1–2 Days Ago' },
    { id: '3-5days', name: '3–5 Days Ago' }
  ];

  const locations = [
    { id: 'all', name: 'All Locations' },
    { id: 'salem', name: 'Salem, Tamil Nadu' },
    { id: 'erode', name: 'Erode, Tamil Nadu' },
    { id: 'namakkal', name: 'Namakkal, Tamil Nadu' }
  ];

  const content = (
    <div className="space-y-6 text-xs">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-4 border-b border-cream-200">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-forest-800" />
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-charcoal-900">
            Filter Harvests
          </h3>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-forest-700 hover:text-forest-900 font-bold flex items-center gap-1 hover:underline"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Categories */}
      <div>
        <h4 className="font-bold text-xs uppercase tracking-wider text-charcoal-900 mb-2.5">
          Category
        </h4>
        <div className="space-y-1.5">
          {categories.map((cat) => (
            <label
              key={cat.id}
              className="flex items-center gap-2 text-charcoal-700 hover:text-forest-900 cursor-pointer select-none"
            >
              <input
                type="radio"
                name="category"
                checked={(filters.category || 'ALL').toUpperCase() === cat.id}
                onChange={() => onChange('category', cat.id)}
                className="w-3.5 h-3.5 accent-forest-700 cursor-pointer"
              />
              <span className={(filters.category || 'ALL').toUpperCase() === cat.id ? 'font-bold text-forest-950' : 'font-medium'}>
                {cat.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="pt-4 border-t border-cream-200/70">
        <h4 className="font-bold text-xs uppercase tracking-wider text-charcoal-900 mb-2.5">
          Price Range
        </h4>
        <div className="space-y-1.5">
          {priceRanges.map((pr) => (
            <label
              key={pr.id}
              className="flex items-center gap-2 text-charcoal-700 hover:text-forest-900 cursor-pointer select-none"
            >
              <input
                type="radio"
                name="priceRange"
                checked={filters.priceRange === pr.id}
                onChange={() => onChange('priceRange', pr.id)}
                className="w-3.5 h-3.5 accent-forest-700 cursor-pointer"
              />
              <span className={filters.priceRange === pr.id ? 'font-bold text-forest-950' : 'font-medium'}>
                {pr.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Freshness Window */}
      <div className="pt-4 border-t border-cream-200/70">
        <h4 className="font-bold text-xs uppercase tracking-wider text-charcoal-900 mb-2.5">
          Freshness
        </h4>
        <div className="space-y-1.5">
          {freshnessOptions.map((opt) => (
            <label
              key={opt.id}
              className="flex items-center gap-2 text-charcoal-700 hover:text-forest-900 cursor-pointer select-none"
            >
              <input
                type="radio"
                name="freshness"
                checked={filters.freshness === opt.id}
                onChange={() => onChange('freshness', opt.id)}
                className="w-3.5 h-3.5 accent-forest-700 cursor-pointer"
              />
              <span className={filters.freshness === opt.id ? 'font-bold text-forest-950' : 'font-medium'}>
                {opt.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Location */}
      <div className="pt-4 border-t border-cream-200/70">
        <h4 className="font-bold text-xs uppercase tracking-wider text-charcoal-900 mb-2.5">
          Farm Origin
        </h4>
        <div className="space-y-1.5">
          {locations.map((loc) => (
            <label
              key={loc.id}
              className="flex items-center gap-2 text-charcoal-700 hover:text-forest-900 cursor-pointer select-none"
            >
              <input
                type="radio"
                name="location"
                checked={filters.location === loc.id}
                onChange={() => onChange('location', loc.id)}
                className="w-3.5 h-3.5 accent-forest-700 cursor-pointer"
              />
              <span className={filters.location === loc.id ? 'font-bold text-forest-950' : 'font-medium'}>
                {loc.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Verification & Availability Toggles */}
      <div className="pt-4 border-t border-cream-200/70 space-y-3">
        <label className="flex items-center justify-between cursor-pointer p-2.5 rounded-xl bg-cream-50 hover:bg-cream-100 border border-cream-200 select-none">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-forest-700" />
            <span className="font-bold text-charcoal-900 text-xs">Verified Farmers Only</span>
          </div>
          <input
            type="checkbox"
            checked={filters.verifiedOnly}
            onChange={(e) => onChange('verifiedOnly', e.target.checked)}
            className="w-4 h-4 rounded accent-forest-700 cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer p-2.5 rounded-xl bg-cream-50 hover:bg-cream-100 border border-cream-200 select-none">
          <span className="font-bold text-charcoal-900 text-xs">In Stock Only</span>
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => onChange('inStockOnly', e.target.checked)}
            className="w-4 h-4 rounded accent-forest-700 cursor-pointer"
          />
        </label>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-28 bg-white rounded-3xl p-6 border border-cream-200/90 shadow-soft">
          {content}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-charcoal-950/60 backdrop-blur-xs animate-fade-in"
            onClick={onClose}
          />

          {/* Drawer Panel */}
          <div className="relative ml-auto w-full max-w-xs sm:max-w-sm bg-white h-full shadow-elevated p-6 overflow-y-auto z-10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-cream-200">
                <span className="font-extrabold text-base text-charcoal-900">
                  Filter Products
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-charcoal-500 hover:text-charcoal-800 hover:bg-cream-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {content}
            </div>

            <div className="pt-6 border-t border-cream-200 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-4 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-bold text-xs shadow-soft"
              >
                Apply Filters ({totalResults} Results)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
