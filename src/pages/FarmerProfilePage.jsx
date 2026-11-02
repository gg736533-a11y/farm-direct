import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Star,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Award,
  Sprout,
  ArrowLeft,
  Truck,
  PhoneCall,
  Share2,
  Package
} from 'lucide-react';
import TrustBadge from '../components/TrustBadge';
import Button from '../components/Button';
import ProductGrid from '../components/ProductGrid';
import { FARMERS } from '../data/farmers';
import { getProductsByFarmer, PRODUCTS } from '../data/products';
import farmersApi from '../api/farmers';

export default function FarmerProfilePage() {
  const { id } = useParams();
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dbFarmer, setDbFarmer] = useState(null);

  useEffect(() => {
    let isMounted = true;
    if (id) {
      farmersApi.getFarmerById(id)
        .then((res) => {
          const farmerData = res?.data?.data?.farmer || res?.data?.farmer;
          if (farmerData && isMounted) {
            setDbFarmer(farmerData);
          }
        })
        .catch(() => {});
    }
    return () => {
      isMounted = false;
    };
  }, [id]);

  const defaultFarmer = FARMERS[id] || FARMERS['ravi-farms'];
  const farmer = dbFarmer
    ? {
        id: dbFarmer.id,
        name: dbFarmer.farmName,
        ownerName: dbFarmer.ownerName,
        verified: dbFarmer.verified,
        verificationStatus: dbFarmer.verificationStatus,
        location: dbFarmer.location,
        bio: dbFarmer.description,
        tagline: dbFarmer.description,
        rating: 5.0,
        reviewCount: 0,
        totalProducts: dbFarmer.products?.length || 0,
        acreage: dbFarmer.farmAcreage !== null && dbFarmer.farmAcreage !== undefined
          ? `${dbFarmer.farmAcreage} Acres`
          : 'Not provided',
        established: '2024',
        farmingPractices: ['Natural Soil Compost', 'Native Desi Seeds', 'Pesticide Free'],
        avatar: defaultFarmer?.avatar || 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=200&auto=format&fit=crop&q=80',
        coverImage: defaultFarmer?.coverImage || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&auto=format&fit=crop&q=80',
        certifications: ['Direct Farmer Verification'],
        deliveryRadius: 'Local & Regional Fresh Delivery'
      }
    : defaultFarmer;

  const allFarmerProducts = useMemo(() => {
    if (dbFarmer?.products && dbFarmer.products.length > 0) {
      return dbFarmer.products.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        unit: p.unit,
        category: p.category?.toLowerCase() || 'vegetables',
        image: p.imageUrl || p.image || '',
        imageUrl: p.imageUrl || p.image || '',
        stock: p.availableQuantity,
        availableQuantity: p.availableQuantity,
        farmer: {
          id: dbFarmer.id,
          name: dbFarmer.farmName,
          verified: dbFarmer.verified
        },
        harvestDate: p.harvestDate,
        harvestFreshness: p.harvestFreshness
      }));
    }
    return getProductsByFarmer(farmer.id);
  }, [dbFarmer, farmer.id]);

  // Filter products by selected category
  const filteredProducts = useMemo(() => {
    if (categoryFilter === 'all') return allFarmerProducts;
    return allFarmerProducts.filter((p) => {
      if (categoryFilter === 'other') {
        return p.category !== 'vegetables' && p.category !== 'fruits';
      }
      return p.category === categoryFilter;
    });
  }, [allFarmerProducts, categoryFilter]);

  const categories = [
    { id: 'all', name: 'All Products' },

    { id: 'vegetables', name: 'Vegetables' },
    { id: 'fruits', name: 'Fruits' },
    { id: 'other', name: 'Other' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 animate-fade-in">
      {/* Back Navigation */}
      <div>
        <Link
          to="/marketplace"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-800 hover:text-fresh-600 transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>
      </div>

      {/* Profile Header Banner */}
      <div className="bg-white rounded-3xl border border-cream-200 shadow-soft overflow-hidden">
        {/* Cover Photo */}
        <div className="relative h-48 sm:h-64 lg:h-72 w-full bg-forest-900">
          <img
            src={farmer.coverImage}
            alt={`${farmer.name} farm land`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>

        {/* Farmer Info Bar */}
        <div className="px-6 sm:px-10 pb-8 relative -mt-16 sm:-mt-20">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            {/* Avatar & Title */}
            <div className="flex items-end gap-5">
              <img
                src={farmer.avatar}
                alt={farmer.name}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl object-cover ring-4 ring-white shadow-elevated bg-white"
              />
              <div className="pb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900">
                    {farmer.name}
                  </h1>
                  {farmer.verified ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-fresh-100 text-forest-900 border border-fresh-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-fresh-600" />
                      <span>✓ Verified Farmer</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                      <span>Verification Pending</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs sm:text-sm text-charcoal-700 mt-1">
                  <MapPin className="w-4 h-4 text-forest-600 shrink-0" />
                  <span>{farmer.location}</span>
                  <span className="text-charcoal-400">•</span>
                  <span>Est. {farmer.established}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-4 bg-cream-50 px-4 py-2.5 rounded-2xl border border-cream-200 text-xs shadow-xs">
              <div className="text-center">
                <span className="flex items-center gap-1 font-bold text-charcoal-900">
                  <Star className="w-3.5 h-3.5 fill-harvest-500 text-harvest-500" />
                  {farmer.rating || 4.8}
                </span>
                <span className="text-[10px] text-charcoal-600 font-medium">({farmer.reviewCount || 24} reviews)</span>
              </div>
              <div className="h-6 w-px bg-cream-300" />
              <div className="text-center">
                <span className="font-bold text-charcoal-900 block">{farmer.totalProducts || 24}</span>
                <span className="text-[10px] text-charcoal-600 font-medium">Products</span>
              </div>
              <div className="h-6 w-px bg-cream-300" />
              <div className="text-center">
                <span className="font-bold text-forest-800 block">Yes</span>
                <span className="text-[10px] text-charcoal-600 font-medium">Verified</span>
              </div>
            </div>
          </div>

          {/* Tagline & Bio */}
          <div className="mt-6 pt-6 border-t border-cream-200/80 space-y-4">
            <blockquote className="text-base sm:text-lg font-semibold text-forest-900 italic">
              &ldquo;{farmer.tagline || 'Fresh produce directly from our farm.'}&rdquo;
            </blockquote>

            <p className="text-sm text-charcoal-700 leading-relaxed max-w-3xl">
              {farmer.bio}
            </p>

            {/* Sustainable Farming Practices */}
            <div className="pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-charcoal-700 block mb-2">
                Certified Growing Practices:
              </span>
              <div className="flex flex-wrap gap-2">
                {farmer.farmingPractices.map((practice, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-forest-50 text-forest-900 border border-forest-100"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-fresh-600" />
                    <span>{practice}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Delivery radius note */}
            <div className="flex items-center gap-2 text-xs text-charcoal-700 pt-1">
              <Truck className="w-4 h-4 text-forest-700" />
              <span>Direct delivery radius: <strong>{farmer.deliveryRadius}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* 30. Products from Farmer Storefront Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-200 pb-4">
          <div>
            <h2 className="text-2xl font-extrabold text-charcoal-900">
              Products from {farmer.name}
            </h2>
            <p className="text-xs text-charcoal-700 mt-1">
              Fresh produce directly from our farm with transparent harvest dates.
            </p>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-cream-300 shadow-xs self-start sm:self-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  categoryFilter === cat.id
                    ? 'bg-forest-900 text-cream-50 shadow-xs'
                    : 'text-charcoal-700 hover:text-forest-900 hover:bg-cream-100'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <ProductGrid
          products={filteredProducts}
          columns="3"
          emptyMessage={`No products listed under "${categoryFilter}" from ${farmer.name}.`}
        />
      </div>
    </div>
  );
}
