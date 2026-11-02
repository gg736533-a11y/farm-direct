import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, Star, ShoppingBag, Check } from 'lucide-react';
import TrustBadge from './TrustBadge';
import FreshnessBadge from './FreshnessBadge';
import FavoriteButton from './FavoriteButton';
import { useShop } from '../context/ShopContext';

export default function ProductCard({ product, className = '' }) {
  const { addToCart } = useShop();
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
    }, 1800);
  };

  return (
    <div className={`group bg-white rounded-2xl border border-cream-200/80 shadow-soft hover:shadow-card transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1 ${className}`}>
      {/* Product Image Area */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-cream-100">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Top Badges & Favorite Button */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
          <div className="flex items-center gap-1.5">
            <FreshnessBadge text={product.harvestFreshness} size="sm" />
            {product.rating && (
              <span className="inline-flex items-center gap-1 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-full text-xs font-semibold text-charcoal-800 shadow-sm">
                <Star className="w-3 h-3 fill-harvest-500 text-harvest-500" />
                <span>{product.rating}</span>
              </span>
            )}
          </div>

          <FavoriteButton productId={product.id} size="sm" />
        </div>

        {/* Bottom subtle gradient on image */}
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Farmer & Location Line */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <Link
              to={`/farmer/${product.farmerId}`}
              className="text-xs font-semibold text-forest-800 hover:text-fresh-600 truncate transition-colors"
            >
              {product.farmerName}
            </Link>
            {product.verified && <TrustBadge text="Verified" size="sm" />}
          </div>

          {/* Product Title */}
          <h3 className="font-bold text-base text-charcoal-900 group-hover:text-forest-900 transition-colors line-clamp-1">
            <Link to={`/product/${product.id}`}>
              {product.name}
            </Link>
          </h3>

          {/* Location snippet */}
          <div className="flex items-center gap-1 text-xs text-charcoal-700 mt-1">
            <MapPin className="w-3.5 h-3.5 text-forest-600/70 shrink-0" />
            <span className="truncate">{product.location}</span>
          </div>
        </div>

        {/* Pricing & Actions */}
        <div className="mt-4 pt-3 border-t border-cream-200/70 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg sm:text-xl font-extrabold text-forest-950">₹{product.price}</span>
              <span className="text-xs font-medium text-charcoal-700">/ {product.unit}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick Add to Cart Button */}
            <button
              type="button"
              onClick={handleQuickAdd}
              className={`p-2 rounded-xl border transition-all duration-200 flex items-center justify-center ${
                added
                  ? 'bg-fresh-600 text-white border-fresh-600 scale-105'
                  : 'bg-cream-100 hover:bg-fresh-100 text-forest-900 border-cream-300 hover:border-fresh-300'
              }`}
              title="Add to Cart"
              aria-label="Add to cart"
            >
              {added ? <Check className="w-4 h-4 text-white" /> : <ShoppingBag className="w-4 h-4" />}
            </button>

            {/* View Product Link */}
            <Link
              to={`/product/${product.id}`}
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-2 rounded-xl bg-forest-50 text-forest-900 group-hover:bg-forest-900 group-hover:text-cream-50 transition-all duration-200"
            >
              <span>View</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
