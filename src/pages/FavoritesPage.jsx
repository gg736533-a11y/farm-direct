import React, { useState, useEffect } from 'react';
import { Heart, ArrowLeft, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import EmptyState from '../components/EmptyState';
import favoritesApi from '../api/favorites';
import { useShop } from '../context/ShopContext';

export default function FavoritesPage() {
  const { favorites } = useShop();
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadFavorites() {
      try {
        setLoading(true);
        const res = await favoritesApi.getFavorites();
        if (res?.data?.products && isMounted) {
          setFavoriteProducts(res.data.products);
        }
      } catch (err) {
        console.error('Error fetching favorites:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadFavorites();
    return () => {
      isMounted = false;
    };
  }, [favorites]);

  // Filter only those whose IDs are currently in favorites
  const activeProducts = favoriteProducts.filter((p) => favorites.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <Link
          to="/marketplace"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-800 hover:text-fresh-600 mb-3 transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Marketplace</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-cream-200">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-charcoal-900 tracking-tight">
              My Favorites
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-600 mt-1">
              Your saved seasonal harvests and preferred local farmers.
            </p>
          </div>

          <span className="text-xs font-bold text-forest-900 bg-forest-50 px-3 py-1 rounded-full border border-forest-200 self-start sm:self-auto">
            {activeProducts.length} Saved {activeProducts.length === 1 ? 'Product' : 'Products'}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-forest-600 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-charcoal-600">Loading your saved favorites...</p>
        </div>
      ) : activeProducts.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No favorites yet"
          description="Save products you like while browsing the marketplace and find them here."
          buttonText="Explore Marketplace"
          buttonLink="/marketplace"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {activeProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
