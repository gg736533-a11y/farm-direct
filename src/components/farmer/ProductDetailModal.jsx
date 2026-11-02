import React from 'react';
import { X, ExternalLink, Eye, ShoppingCart, Star, Calendar, MapPin, ShieldCheck, Tag, QrCode } from 'lucide-react';
import { Link } from 'react-router-dom';
import OrderStatusBadge from './OrderStatusBadge';

export default function ProductDetailModal({ product, isOpen, onClose }) {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-elevated border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Farmer Product Insights
            </span>
            <OrderStatusBadge status={product.stock === 0 ? 'Out of Stock' : product.stock < (product.lowStockThreshold || 15) ? 'Low Stock' : 'Active'} />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* Top Hero: Image + Primary Details */}
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            <img
              src={product.image}
              alt={product.name}
              className="w-full sm:w-44 h-40 object-cover rounded-2xl border border-slate-200 shadow-soft flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                {product.category}
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 mt-1.5">
                {product.name}
              </h3>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-black text-forest-900">
                  ₹{product.price}
                </span>
                <span className="text-xs text-slate-500">/ {product.unit}</span>
              </div>

              {/* Farmer Store Performance Metrics */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
                <div className="bg-slate-50 p-2 rounded-xl">
                  <div className="flex items-center justify-center gap-1 text-slate-400 text-xs">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Views</span>
                  </div>
                  <div className="text-sm font-bold text-slate-800 mt-0.5">
                    {product.views || 1420}
                  </div>
                </div>

                <div className="bg-slate-50 p-2 rounded-xl">
                  <div className="flex items-center justify-center gap-1 text-slate-400 text-xs">
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Orders</span>
                  </div>
                  <div className="text-sm font-bold text-slate-800 mt-0.5">
                    {product.orders || 84}
                  </div>
                </div>

                <div className="bg-slate-50 p-2 rounded-xl">
                  <div className="flex items-center justify-center gap-1 text-amber-500 text-xs">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="text-slate-500">Rating</span>
                  </div>
                  <div className="text-sm font-bold text-slate-800 mt-0.5">
                    {product.rating || 4.9} ★
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stock & Batch Information */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Inventory & Harvest Transparency
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Current Stock</span>
                <span className={`font-bold mt-0.5 block ${product.stock === 0 ? 'text-rose-600' : product.stock < 15 ? 'text-amber-600' : 'text-slate-900'}`}>
                  {product.stock} {product.unit}s
                </span>
                {product.stock > 0 && product.stock < 15 && (
                  <span className="text-[10px] text-amber-700 font-semibold block">
                    Only {product.stock} {product.unit}s remaining
                  </span>
                )}
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Harvest Date</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">
                  {product.harvestDate}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Packing Date</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">
                  {product.packingDate}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Expiry Date</span>
                <span className="font-bold text-amber-800 mt-0.5 block">
                  {product.expiryDate}
                </span>
              </div>
            </div>
          </div>

          {/* Description & Origin */}
          <div className="space-y-2 text-xs">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px] block">
              Origin & Ingredients
            </span>
            <div className="flex items-center gap-1.5 text-slate-700">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>{product.origin || 'Salem, Tamil Nadu'}</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              <strong className="text-slate-800">Ingredients:</strong> {product.ingredients || '100% Pure Organic'}
            </p>
            <p className="text-slate-600 leading-relaxed">
              {product.description}
            </p>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link
              to={`/farmer/products/${product.id}/edit`}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors"
            >
              Edit Product
            </Link>

            <Link
              to={`/trace/${product.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-700" />
              <span>QR & Traceability</span>
            </Link>
          </div>

          {/* "Customer View" button: links to /product/:id */}
          <Link
            to={`/product/${product.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-forest-900 hover:bg-forest-800 transition-colors shadow-sm"
          >
            <span>Customer View</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
