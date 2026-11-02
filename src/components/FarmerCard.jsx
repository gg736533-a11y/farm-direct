import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, ArrowRight, Award, Sprout } from 'lucide-react';
import TrustBadge from './TrustBadge';

export default function FarmerCard({ farmer, className = '' }) {
  if (!farmer) return null;

  return (
    <div className={`bg-white rounded-2xl border border-cream-200/80 shadow-soft hover:shadow-card transition-all duration-300 overflow-hidden flex flex-col justify-between p-5 hover:-translate-y-1 ${className}`}>
      <div>
        {/* Header with Avatar & Badge */}
        <div className="flex items-start gap-4">
          <img
            src={farmer.avatar}
            alt={farmer.name}
            className="w-14 h-14 rounded-2xl object-cover ring-2 ring-forest-100 shadow-sm shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-base text-charcoal-900 truncate">{farmer.name}</h4>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-charcoal-700 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-forest-600 shrink-0" />
              <span className="truncate">{farmer.location}</span>
            </div>
            <div className="mt-2">
              <TrustBadge text="Verified Farmer" size="sm" />
            </div>
          </div>
        </div>

        {/* Tagline / Bio snippet */}
        <p className="mt-3.5 text-xs text-charcoal-700 leading-relaxed line-clamp-2">
          {farmer.tagline || farmer.bio}
        </p>

        {/* Farming practice tags */}
        {farmer.farmingPractices && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {farmer.farmingPractices.slice(0, 2).map((item, idx) => (
              <span key={idx} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-forest-50 text-forest-800 border border-forest-100">
                {item}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Stats & Profile Link */}
      <div className="mt-4 pt-3 border-t border-cream-200/70 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1 font-semibold text-charcoal-800">
            <Star className="w-3.5 h-3.5 fill-harvest-500 text-harvest-500" />
            {farmer.rating} ({farmer.reviewCount})
          </span>
          <span className="text-charcoal-600">•</span>
          <span className="text-charcoal-700">{farmer.totalProducts} Products</span>
        </div>

        <Link
          to={`/farmer/${farmer.id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-forest-800 hover:text-fresh-600 transition-colors"
        >
          <span>View Farm</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
