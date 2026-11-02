import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Sprout,
  MapPin,
  X,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import FilterSidebar from '../components/FilterSidebar';
import CategoryFilter from '../components/CategoryFilter';
import ProductGrid from '../components/ProductGrid';
import AITeaser from '../components/AITeaser';
import productsApi from '../api/products';
import { normalizeCategory } from '../data/categories';

export default function MarketplacePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Salem');
  const [isNearMeActive, setIsNearMeActive] = useState(false);
  const [sortBy, setSortBy] = useState('recommended');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [categoryCounts, setCategoryCounts] = useState({});

  // Advanced Filters State (canonical uppercase categories)
  const [filters, setFilters] = useState({
    category: 'ALL',
    priceRange: 'all',
    freshness: 'all',
    location: 'all',
    verifiedOnly: false,
    inStockOnly: false
  });

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await productsApi.getProducts({
        category: filters.category,
        priceRange: filters.priceRange,
        location: isNearMeActive ? selectedLocation : (filters.location !== 'all' ? filters.location : undefined),
        verifiedOnly: filters.verifiedOnly,
        inStockOnly: filters.inStockOnly,
        sortBy
      });

      if (res?.data?.products) {
        setProducts(res.data.products);
      } else {
        setProducts([]);
      }
      if (res?.data?.categoryCounts) {
        setCategoryCounts(res.data.categoryCounts);
      }
    } catch (err) {
      console.error('Error fetching marketplace products:', err);
      setError('Unable to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [filters.category, filters.priceRange, filters.verifiedOnly, filters.inStockOnly, filters.location, isNearMeActive, selectedLocation, sortBy]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      category: 'ALL',
      priceRange: 'all',
      freshness: 'all',
      location: 'all',
      verifiedOnly: false,
      inStockOnly: false
    });
    setSearchQuery('');
    setIsNearMeActive(false);
  };

  // Client-side instant search query filter
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase().trim();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.farmerName && p.farmerName.toLowerCase().includes(q)) ||
        (p.location && p.location.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.ingredients && p.ingredients.toLowerCase().includes(q))
    );
  }, [products, searchQuery]);

  const handleSampleSearch = (categoryTerm) => {
    const norm = normalizeCategory(categoryTerm);
    setFilters((prev) => ({ ...prev, category: norm }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fade-in">
      {/* 4. Marketplace Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-forest-100 text-forest-800 border border-forest-200">
            <Sprout className="w-3.5 h-3.5 text-fresh-600" />
            <span>Direct Consumer Marketplace</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-charcoal-900 tracking-tight">
            Fresh Products, Direct From Farmers
          </h1>
          <p className="text-charcoal-700 text-sm sm:text-base max-w-2xl">
            Discover fresh and traceable products from farmers near you. Harvest dates, packing time, and digital trust provenance on every batch.
          </p>
        </div>

        {/* 6. Location UI Selector */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-white p-2 rounded-2xl border border-cream-300 shadow-soft">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cream-100/90 text-xs text-charcoal-800 font-semibold">
            <MapPin className="w-3.5 h-3.5 text-forest-700" />
            <span>Delivering to:</span>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="bg-transparent font-bold text-forest-900 focus:outline-none cursor-pointer"
            >
              <option value="Salem">Salem, Tamil Nadu</option>
              <option value="Erode">Erode, Tamil Nadu</option>
              <option value="Namakkal">Namakkal, Tamil Nadu</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setIsNearMeActive(!isNearMeActive)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              isNearMeActive
                ? 'bg-forest-900 text-cream-50'
                : 'text-forest-800 hover:bg-cream-100'
            }`}
          >
            Near me
          </button>
        </div>
      </div>

      {/* 5. Search Bar & Sort Dropdown Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Large Search Bar */}
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-charcoal-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products, farmers or locations (e.g. tomatoes, Salem, honey)..."
            className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-white border border-cream-300 text-sm font-medium text-charcoal-900 placeholder:text-charcoal-400 shadow-soft focus:outline-none focus:ring-2 focus:ring-forest-600/30 focus:border-forest-600"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-charcoal-400 hover:text-charcoal-700 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Mobile Filter Button */}
        <button
          type="button"
          onClick={() => setMobileFilterOpen(true)}
          className="lg:hidden flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white border border-cream-300 text-xs font-bold text-charcoal-800 shadow-soft"
        >
          <SlidersHorizontal className="w-4 h-4 text-forest-700" />
          <span>Filters</span>
        </button>

        {/* 9. Sorting Dropdown */}
        <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-2xl border border-cream-300 shadow-soft self-end sm:self-auto">
          <ArrowUpDown className="w-4 h-4 text-forest-700 flex-shrink-0" />
          <span className="text-xs font-bold text-charcoal-700 uppercase tracking-wider hidden xs:inline">
            Sort:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent text-xs sm:text-sm font-semibold text-charcoal-900 focus:outline-none cursor-pointer"
          >
            <option value="recommended">Recommended</option>
            <option value="freshest">Freshest First</option>
            <option value="nearest">Nearest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* 7. Category Navigation Chips */}
      <div className="pt-1">
        <CategoryFilter
          selectedCategory={filters.category}
          counts={categoryCounts}
          onSelectCategory={(catId) => handleFilterChange('category', catId)}
        />
      </div>

      {/* 31. Smart Shopping UI Placeholder */}
      <AITeaser onSampleSearch={handleSampleSearch} />

      {/* Main Grid Layout: Desktop Left Filter Sidebar + Right Product Grid */}
      <div className="flex flex-col lg:flex-row gap-8 items-start pt-2">
        {/* 8. Desktop Filter Sidebar & Mobile Drawer */}
        <FilterSidebar
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
          isOpen={mobileFilterOpen}
          onClose={() => setMobileFilterOpen(false)}
          totalResults={filteredProducts.length}
        />

        {/* Right Section: Product Grid & Results Header */}
        <div className="flex-1 min-w-0 w-full space-y-6">
          {/* Results Counter & Active Pills */}
          <div className="flex items-center justify-between text-xs text-charcoal-700 pb-2 border-b border-cream-200">
            <p>
              Showing <span className="font-bold text-charcoal-900">{filteredProducts.length}</span> fresh products
              {filters.category && filters.category.toUpperCase() !== 'ALL' && (
                <span> in <span className="font-semibold capitalize text-forest-800">{filters.category.toLowerCase()}</span></span>
              )}
              {isNearMeActive && (
                <span> near <span className="font-semibold text-forest-800">{selectedLocation}</span></span>
              )}
              {searchQuery && (
                <span> matching &ldquo;<span className="font-semibold text-forest-800">{searchQuery}</span>&rdquo;</span>
              )}
            </p>

            {((filters.category && filters.category.toUpperCase() !== 'ALL') || filters.priceRange !== 'all' || filters.freshness !== 'all' || filters.location !== 'all' || filters.verifiedOnly || filters.inStockOnly || searchQuery) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-forest-800 hover:text-forest-950 font-bold underline cursor-pointer"
              >
                Reset All Filters
              </button>
            )}
          </div>

          {/* Loading, Error, or Product Grid */}
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-forest-600 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-charcoal-600">Loading fresh products from local farms...</p>
            </div>
          ) : error ? (
            <div className="p-8 rounded-3xl bg-white border border-rose-200 text-center space-y-4 shadow-soft">
              <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
              <div>
                <h3 className="text-base font-bold text-charcoal-900">{error}</h3>
                <p className="text-xs text-charcoal-500 mt-1">Please check backend server connection or retry.</p>
              </div>
              <button
                type="button"
                onClick={loadProducts}
                className="px-4 py-2 rounded-xl bg-forest-900 text-cream-50 text-xs font-bold hover:bg-forest-800 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <ProductGrid
              products={filteredProducts}
              columns="4"
              emptyMessage="No farm produce found matching your current filter criteria. Try resetting your filters."
            />
          )}
        </div>
      </div>
    </div>
  );
}
