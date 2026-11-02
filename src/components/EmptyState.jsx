import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  icon: Icon = ShoppingBag,
  title = 'Nothing here yet',
  description = 'Explore fresh products directly from local farmers.',
  buttonText = 'Explore Marketplace',
  buttonLink = '/marketplace',
  className = ''
}) {
  return (
    <div
      className={`text-center py-16 px-4 bg-white rounded-3xl border border-cream-200/90 shadow-soft max-w-lg mx-auto ${className}`}
    >
      <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-forest-50 text-forest-800 flex items-center justify-center mb-5 border border-forest-100 shadow-sm">
        <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-fresh-600" />
      </div>

      <h3 className="text-xl sm:text-2xl font-extrabold text-charcoal-900 tracking-tight">
        {title}
      </h3>

      <p className="text-sm text-charcoal-600 mt-2 max-w-sm mx-auto leading-relaxed">
        {description}
      </p>

      {buttonLink && (
        <div className="mt-6">
          <Link to={buttonLink}>
            <Button variant="primary" size="md" className="inline-flex items-center gap-2 shadow-sm font-bold">
              <span>{buttonText}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
