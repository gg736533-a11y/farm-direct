import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Clock,
  CheckCircle2,
  Heart,
  ArrowLeft,
  ShoppingBag,
  MessageSquare,
  Star,
  ExternalLink,
  Store,
  RefreshCw,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import Button from '../components/Button';
import TrustBadge from '../components/TrustBadge';
import FreshnessBadge from '../components/FreshnessBadge';
import TrustLabel from '../components/TrustLabel';
import QRCodeLabel from '../components/QRCodeLabel';
import ProductTraceabilityCertificate from '../components/ProductTraceabilityCertificate';
import ProductCard from '../components/ProductCard';
import QuantitySelector from '../components/QuantitySelector';
import FavoriteButton from '../components/FavoriteButton';
import productsApi from '../api/products';
import aiApi from '../api/ai';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../auth/AuthContext';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart, isFavorite, toggleFavorite } = useShop();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [quantity, setQuantity] = useState(1);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [contactModalOpen, setContactModalOpen] = useState(false);

  // GenAI Summary Feature States (Session 8)
  const { user, isAuthenticated } = useAuth();
  const [summary, setSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState('');
  const [summaryLanguage, setSummaryLanguage] = useState('en');

  const handleFetchSummary = async (lang = 'en') => {
    if (!isAuthenticated) {
      setSummaryError('Please log in to generate AI summary.');
      return;
    }
    setSummaryLoading(true);
    setSummaryError('');
    try {
      const res = await aiApi.generateProductSummary({
        name: product.name,
        category: product.category,
        ingredients: product.ingredients || product.transparency?.ingredients || '',
        origin: product.origin || product.location || '',
        description: product.description || ''
      });

      if (res?.success && res.summary) {
        let finalSummary = res.summary;
        if (lang === 'ta') {
          const transRes = await aiApi.translateContent({
            text: res.summary,
            targetLanguage: 'ta'
          });
          finalSummary = transRes?.translatedText || res.summary;
        } else if (lang === 'simple') {
          const simpRes = await aiApi.simplifyContent({
            text: res.summary
          });
          finalSummary = simpRes?.simplifiedText || res.summary;
        }
        setSummary(finalSummary);
        setSummaryLanguage(lang);
      } else {
        setSummaryError('AI service is temporarily unavailable.');
      }
    } catch (err) {
      console.error('Failed to generate summary:', err);
      setSummaryError(err.status === 401 ? 'Please log in to generate AI summary.' : 'AI service is temporarily unavailable.');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleSwitchLanguage = async (newLang) => {
    if (newLang === summaryLanguage) return;
    if (!isAuthenticated) {
      setSummaryError('Please log in to generate AI summary.');
      return;
    }
    setSummaryLoading(true);
    setSummaryError('');
    try {
      if (newLang === 'en') {
        await handleFetchSummary('en');
      } else if (newLang === 'ta') {
        const transRes = await aiApi.translateContent({
          text: summary,
          targetLanguage: 'ta'
        });
        if (transRes?.translatedText) {
          setSummary(transRes.translatedText);
          setSummaryLanguage('ta');
        }
      } else if (newLang === 'simple') {
        const simpRes = await aiApi.simplifyContent({
          text: summary
        });
        if (simpRes?.simplifiedText) {
          setSummary(simpRes.simplifiedText);
          setSummaryLanguage('simple');
        }
      }
    } catch (err) {
      console.error('Failed to translate summary:', err);
      setSummaryError('AI service is temporarily unavailable.');
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function loadProductDetails() {
      try {
        setLoading(true);
        setError(null);
        const res = await productsApi.getProductById(id);
        if (res?.data?.product && isMounted) {
          const p = res.data.product;
          setProduct(p);
          setQuantity(1);

          // Fetch related products in same category
          try {
            const relRes = await productsApi.getProducts({ category: p.category, limit: 5 });
            if (relRes?.data?.products && isMounted) {
              setRelatedProducts(relRes.data.products.filter((item) => item.id !== p.id).slice(0, 4));
            }
          } catch (e) {
            console.warn('Could not load related products:', e);
          }
        } else if (isMounted) {
          setError('Product not found.');
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching product detail:', err);
          setError(err.message || 'Unable to load product details.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (id) {
      loadProductDetails();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <RefreshCw className="w-8 h-8 text-forest-600 animate-spin mx-auto" />
        <p className="text-sm font-semibold text-charcoal-600">Loading product traceability details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold text-charcoal-900">{error || 'Product not found'}</h2>
        <p className="text-sm text-charcoal-600">
          The requested product could not be located in our active farm catalog.
        </p>
        <Link to="/marketplace">
          <Button variant="primary">Return to Marketplace</Button>
        </Link>
      </div>
    );
  }

  const isFav = isFavorite(product.id);
  const isOutOfStock = product.availableQuantity === 0 || product.status === 'OUT_OF_STOCK';
  const farmerName = product.farmer?.farmName || product.farmerName || 'Verified Farm';
  const farmerId = product.farmer?.id || product.farmerId || '';
  const farmerUser = product.farmer?.user?.name || farmerName;
  const farmerPhone = product.farmer?.user?.phone || '+91 94431 87654';

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    setFeedbackMessage(`Added ${quantity} ${product.unit}${quantity > 1 ? 's' : ''} of "${product.name}" to your cart!`);
    setTimeout(() => {
      setFeedbackMessage('');
    }, 4000);
  };

  const handleContactFarmer = () => {
    setContactModalOpen(true);
  };

  return (
    <>
      <div className="web-page-wrapper print:hidden max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 animate-fade-in">
      {/* Back Link */}
      <div className="flex items-center justify-between">
        <Link
          to="/marketplace"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-800 hover:text-fresh-600 transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>

        <span className="text-xs text-charcoal-500 font-medium">
          Category: <span className="font-bold text-forest-900 capitalize">{product.category}</span>
        </span>
      </div>

      {/* Feedback Banner */}
      {feedbackMessage && (
        <div className="p-4 rounded-2xl bg-forest-900 text-cream-50 flex items-center justify-between shadow-elevated border border-fresh-500/40 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-fresh-400" />
            <span className="text-sm font-semibold">{feedbackMessage}</span>
          </div>
          <Link
            to="/cart"
            className="px-3 py-1.5 rounded-xl bg-fresh-600 hover:bg-fresh-500 text-white text-xs font-bold transition-colors"
          >
            View Cart
          </Link>
        </div>
      )}

      {/* Top Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        {/* Left Column: Product Image Showcase */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative rounded-3xl overflow-hidden bg-cream-100 border border-cream-200/80 shadow-soft aspect-[4/3] sm:aspect-square">
            <img
              src={product.imageUrl || product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
              <FreshnessBadge text={product.harvestFreshness || 'Fresh Batch'} size="lg" />
            </div>
            <div className="absolute top-4 right-4">
              <FavoriteButton productId={product.id} size="lg" />
            </div>
          </div>

          {/* Quick provenance chips */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-white p-3 rounded-2xl border border-cream-200 shadow-xs">
              <span className="block text-[10px] uppercase font-bold text-charcoal-500">Origin</span>
              <span className="text-xs font-bold text-charcoal-900 truncate block mt-0.5">
                {product.origin || product.location || 'Salem'}
              </span>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-cream-200 shadow-xs">
              <span className="block text-[10px] uppercase font-bold text-charcoal-500">Batch Code</span>
              <span className="text-xs font-bold text-charcoal-900 truncate block mt-0.5 font-mono">
                {product.batchNumber || `BATCH-${product.id.slice(-6).toUpperCase()}`}
              </span>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-cream-200 shadow-xs">
              <span className="block text-[10px] uppercase font-bold text-charcoal-500">Verification</span>
              <span className="text-xs font-bold text-forest-800 truncate block mt-0.5">
                {product.farmer?.verified ? 'Verified Farm' : 'Local Farm'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Product Info, Pricing, Actions */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            {/* Farmer tag */}
            <div className="flex items-center justify-between gap-3 mb-2">
              <Link
                to={`/farmer/${farmerId}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-800 hover:text-fresh-600 transition-colors"
              >
                <span>{farmerName}</span>
                {product.farmer?.verified && <TrustBadge text="Verified Farmer" size="sm" />}
              </Link>
            </div>

            {/* Product Title */}
            <h1 className="text-2xl sm:text-4xl font-extrabold text-charcoal-900 tracking-tight">
              {product.name}
            </h1>

            {/* Location & Availability */}
            <div className="flex items-center gap-4 text-xs text-charcoal-700 mt-2">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-forest-600" />
                <span>{product.location}</span>
              </span>
              <span>•</span>
              {isOutOfStock ? (
                <span className="inline-flex items-center gap-1 text-rose-600 font-bold">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>Out of Stock</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-fresh-700 font-bold">
                  <span className="w-2 h-2 rounded-full bg-fresh-500" />
                  <span>In Stock ({product.availableQuantity} {product.unit}s available)</span>
                </span>
              )}
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-5 rounded-2xl bg-cream-100/70 border border-cream-200 flex items-baseline justify-between">
            <div>
              <span className="text-xs text-charcoal-500 uppercase font-bold tracking-wider block">
                Direct Farm Price
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-3xl sm:text-4xl font-black text-forest-950">₹{product.price}</span>
                <span className="text-sm font-semibold text-charcoal-700">/ {product.unit}</span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-forest-800 bg-white px-3 py-1 rounded-full border border-cream-300 shadow-xs">
              Zero Middlemen Markup
            </span>
          </div>

          {/* Quantity Selector & Add to Cart */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-charcoal-700">Quantity:</span>
                <QuantitySelector
                  quantity={quantity}
                  onChange={(newQty) => {
                    const maxQty = product.availableQuantity || 1;
                    setQuantity(Math.min(newQty, maxQty));
                  }}
                  size="md"
                />
              </div>

              <Button
                variant={isOutOfStock ? 'secondary' : 'primary'}
                size="lg"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 justify-center shadow-md font-bold py-3.5"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                <span>
                  {isOutOfStock ? 'Out of Stock' : `Add to Cart (₹${product.price * quantity})`}
                </span>
              </Button>
            </div>

            {/* Secondary Actions */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={handleContactFarmer}
                className="py-2.5 px-3 rounded-xl border border-cream-300 hover:bg-cream-100 text-xs font-bold text-charcoal-800 flex items-center justify-center gap-1.5 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-forest-700" />
                <span>Contact Farmer</span>
              </button>

              <button
                type="button"
                onClick={() => toggleFavorite(product.id)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                  isFav
                    ? 'bg-rose-50 border-rose-200 text-rose-700'
                    : 'border-cream-300 hover:bg-cream-100 text-charcoal-800'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>{isFav ? 'Favorited' : 'Add to Favorites'}</span>
              </button>
            </div>
          </div>

          {/* Freshness Information Section */}
          <div className="bg-white rounded-2xl p-5 border border-cream-200/90 shadow-soft space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-cream-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-forest-700" />
                <h3 className="font-extrabold text-sm text-charcoal-900">
                  Freshness Information
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-fresh-100 text-forest-900 border border-fresh-200">
                {product.harvestFreshness || 'Fresh Batch'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-charcoal-500 block text-[10px] font-semibold uppercase">Harvested</span>
                <span className="font-bold text-charcoal-900 mt-0.5 block">{product.harvestDate || 'Freshly Harvested'}</span>
              </div>
              <div>
                <span className="text-charcoal-500 block text-[10px] font-semibold uppercase">Packed</span>
                <span className="font-bold text-charcoal-900 mt-0.5 block">{product.packingDate || 'Packed on Order'}</span>
              </div>
              <div>
                <span className="text-charcoal-500 block text-[10px] font-semibold uppercase">Best Before</span>
                <span className="font-bold text-forest-900 mt-0.5 block">{product.expiryDate || '7-10 Days'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FarmDirect Trust & Transparency Section (Section 6 & 15) */}
      <div className="pt-6 border-t border-cream-200/80">
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-forest-800">
            Digital Provenance & Transparency
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 tracking-tight mt-1">
            Trust & Transparency
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-600 mt-1">
            Verified provenance directly from PostgreSQL. Scan the QR code with any phone camera to trace this batch.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-5xl mx-auto">
          {/* Trust Label Column */}
          <div className="lg:col-span-7 space-y-6">
            <TrustLabel
              product={{
                id: product.id,
                name: product.name,
                farmerName: farmerName,
                verified: product.farmer?.verified,
                harvestDate: product.harvestDate,
                packingDate: product.packingDate,
                expiryDate: product.expiryDate,
                origin: product.origin || product.location,
                ingredients: product.ingredients,
                batchNumber: product.batchNumber
              }}
            />

            {/* Structured Transparency Attributes Card (Section 6) */}
            <div className="bg-white rounded-2xl p-5 border border-cream-200/90 shadow-soft text-xs space-y-2.5">
              <h4 className="font-extrabold text-charcoal-900 uppercase tracking-wider text-[11px] pb-2 border-b border-cream-100">
                Verified Provenance Details
              </h4>
              <div className="flex justify-between py-1 border-b border-cream-100">
                <span className="text-charcoal-500 font-medium">Farmer:</span>
                <span className="font-bold text-charcoal-900">{farmerName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-cream-100">
                <span className="text-charcoal-500 font-medium">Verification:</span>
                <span className="font-bold text-fresh-700">
                  {product.farmer?.verified ? '✓ Verified Farmer' : 'Verification Pending'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-cream-100">
                <span className="text-charcoal-500 font-medium">Origin:</span>
                <span className="font-semibold text-charcoal-900 text-right">{product.origin || product.location || 'Not provided'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-cream-100">
                <span className="text-charcoal-500 font-medium">Harvested:</span>
                <span className="font-semibold text-charcoal-900">{product.harvestDate || 'Not provided'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-cream-100">
                <span className="text-charcoal-500 font-medium">Packed:</span>
                <span className="font-semibold text-charcoal-900">{product.packingDate || 'Not provided'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-cream-100">
                <span className="text-charcoal-500 font-medium">Best Before:</span>
                <span className="font-semibold text-forest-900">{product.expiryDate || 'Not provided'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-cream-100">
                <span className="text-charcoal-500 font-medium">Batch:</span>
                <span className="font-mono font-bold text-forest-950">{product.batchNumber || 'Not provided'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-charcoal-500 font-medium">Ingredients:</span>
                <span className="font-medium text-forest-900 text-right max-w-[220px] truncate">{product.ingredients || 'Not provided'}</span>
              </div>
            </div>
          </div>

          {/* QR Code Label Column (Section 14 & 15) */}
          <div className="lg:col-span-5 space-y-4">
            <QRCodeLabel
              productId={product.id}
              productName={product.name}
              farmerName={farmerName}
              batchNumber={product.batchNumber}
              harvestDate={product.harvestDate}
              packingDate={product.packingDate}
              expiryDate={product.expiryDate}
              origin={product.origin || product.location}
            />

            <div className="text-center pt-2">
              <Link
                to={`/trace/${product.id}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-800 hover:text-forest-950 underline"
              >
                <span>View Public Traceability Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* About the Product & About the Farmer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        {/* Product Description */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-soft space-y-4">
          <h3 className="font-extrabold text-lg text-charcoal-900">
            About this product
          </h3>
          <p className="text-sm text-charcoal-700 leading-relaxed">
            {product.description}
          </p>

          {/* AI-Generated Summary (Session 8) */}
          <div className="p-4 rounded-2xl bg-cream-50/90 border border-fresh-200/90 space-y-2.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-fresh-100 text-forest-900 border border-fresh-300">
                  <Sparkles className="w-3 h-3 text-fresh-600" />
                  <span>AI-generated summary</span>
                </span>
              </div>

              {summary && (
                <div className="flex items-center gap-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => handleSwitchLanguage('en')}
                    className={`px-2 py-0.5 rounded-md font-bold transition-colors ${summaryLanguage === 'en' ? 'bg-forest-900 text-white' : 'text-charcoal-600 hover:bg-cream-200'}`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwitchLanguage('ta')}
                    className={`px-2 py-0.5 rounded-md font-bold transition-colors ${summaryLanguage === 'ta' ? 'bg-forest-900 text-white' : 'text-charcoal-600 hover:bg-cream-200'}`}
                  >
                    தமிழ் (Tamil)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwitchLanguage('simple')}
                    className={`px-2 py-0.5 rounded-md font-bold transition-colors ${summaryLanguage === 'simple' ? 'bg-forest-900 text-white' : 'text-charcoal-600 hover:bg-cream-200'}`}
                  >
                    Simple
                  </button>
                </div>
              )}
            </div>

            {summary ? (
              <p className="text-xs text-charcoal-800 leading-relaxed font-medium italic bg-white/70 p-3 rounded-xl border border-cream-200">
                "{summary}"
              </p>
            ) : (
              <div className="flex items-center justify-between gap-3 pt-1">
                <p className="text-xs text-charcoal-500">
                  Generate a concise, easy-to-understand explanation of this product.
                </p>
                <button
                  type="button"
                  id="ai-product-summary-btn"
                  disabled={summaryLoading}
                  onClick={() => handleFetchSummary('en')}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-white text-xs font-bold transition-all disabled:opacity-50 shadow-xs"
                >
                  <Sparkles className={`w-3.5 h-3.5 text-fresh-400 ${summaryLoading ? 'animate-spin' : ''}`} />
                  <span>{summaryLoading ? 'Generating...' : 'Generate AI Summary'}</span>
                </button>
              </div>
            )}

            {summaryError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs text-rose-700 animate-fade-in">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{summaryError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleFetchSummary(summaryLanguage)}
                  className="px-2 py-0.5 bg-white hover:bg-rose-100 text-rose-800 rounded-lg border border-rose-300 font-bold transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            <p className="text-[10px] text-charcoal-400">
              Note: This is an AI-generated explanation. Official provenance facts are listed below.
            </p>
          </div>

          <div className="pt-3 border-t border-cream-200/80 text-xs text-charcoal-600 space-y-1">
            <p><strong>Ingredients:</strong> {product.ingredients || `100% Pure ${product.name}`}</p>
            <p><strong>Origin:</strong> {product.origin || product.location}</p>
            <p><strong>Available Stock:</strong> {product.availableQuantity} {product.unit}s</p>
          </div>
        </div>

        {/* About the Farmer */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-soft flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-cream-200">
              <span className="text-xs font-bold uppercase tracking-wider text-charcoal-500">
                About the Farmer
              </span>
              {product.farmer?.verified && <TrustBadge text="Verified Farmer" size="sm" />}
            </div>

            <div className="mt-4">
              <h4 className="font-extrabold text-lg text-charcoal-900">
                {farmerName}
              </h4>
              <p className="text-xs text-charcoal-600 mt-0.5">
                Owner: {farmerUser} • {product.location}
              </p>
              {product.farmer?.farmAcreage && (
                <p className="text-xs text-forest-800 font-semibold mt-1">
                  Farm Size: {product.farmer.farmAcreage} Acres
                </p>
              )}
            </div>

            <p className="text-xs sm:text-sm text-charcoal-600 mt-3 leading-relaxed">
              {product.farmer?.description || 'Growing fresh farm produce with transparent harvest-to-consumer practices.'}
            </p>
          </div>

          <Link
            to={`/farmer/${farmerId}`}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-forest-900 hover:bg-forest-800 text-cream-50 text-xs font-bold transition-colors shadow-xs"
          >
            <Store className="w-4 h-4 text-fresh-400" />
            <span>View Farmer Store</span>
          </Link>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-forest-800">
                Fresh Recommendations
              </span>
              <h3 className="text-2xl font-extrabold text-charcoal-900">
                You May Also Like
              </h3>
            </div>

            <Link
              to="/marketplace"
              className="text-xs font-bold text-forest-800 hover:text-forest-950 underline"
            >
              View all products →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relProduct) => (
              <ProductCard key={relProduct.id} product={relProduct} />
            ))}
          </div>
        </div>
      )}

      {/* Contact Farmer Modal */}
      {contactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-elevated border border-cream-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-cream-200">
              <h4 className="font-extrabold text-charcoal-900">Contact {farmerName}</h4>
              <button
                type="button"
                onClick={() => setContactModalOpen(false)}
                className="text-charcoal-400 hover:text-charcoal-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Have questions about harvest schedules, custom bulk orders, or farm visits? Reach {farmerName} directly:
            </p>
            <div className="p-3.5 bg-cream-50 rounded-2xl border border-cream-200 text-xs space-y-1 font-semibold text-charcoal-800">
              <p>📍 Location: {product.location}</p>
              <p>📞 Phone: {farmerPhone}</p>
              <p>👤 Contact Person: {farmerUser}</p>
            </div>
            <button
              type="button"
              onClick={() => setContactModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-forest-900 text-cream-50 font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>

    {/* Dedicated Single-Page A4 Product Traceability Certificate for Print / PDF */}
    <ProductTraceabilityCertificate
      productId={product.id}
      productName={product.name}
      farmerName={farmerName}
      location={product.location}
      isVerified={product.farmer?.verified}
      origin={product.origin || product.location}
      harvestDate={product.harvestDate}
      packingDate={product.packingDate}
      expiryDate={product.expiryDate}
      batchNumber={product.batchNumber}
      ingredients={product.ingredients}
      category={product.category}
      hasPurchased={false}
    />
  </>
  );
}
