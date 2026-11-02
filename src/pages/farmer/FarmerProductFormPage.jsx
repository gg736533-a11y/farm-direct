import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  UploadCloud,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Sparkles,
  RotateCcw,
  Check,
  Languages
} from 'lucide-react';
import TrustLabelPreview from '../../components/farmer/TrustLabelPreview';
import QRCodeLabel from '../../components/QRCodeLabel';
import ProductTraceabilityCertificate from '../../components/ProductTraceabilityCertificate';
import { FARMER_PROFILE } from '../../data/farmerData';
import { useFarmerToast } from '../../components/farmer/FarmerDashboardLayout';
import { useAuth } from '../../auth/AuthContext';
import productsApi from '../../api/products';
import aiApi from '../../api/ai';
import verificationApi from '../../api/verification';
import AnomalyFlag from '../../components/verification/AnomalyFlag';

export default function FarmerProductFormPage({ isEdit = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useFarmerToast();
  const { user } = useAuth();

  const farmName = user?.farmerProfile?.farmName || user?.farmName || FARMER_PROFILE.farmName;
  const farmLocation = user?.farmerProfile?.location || user?.location || 'Salem, Tamil Nadu';

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Vegetables',
    description: '',
    price: '',
    unit: 'kg',
    quantity: '50',
    availableQuantity: '50',
    harvestDate: new Date().toISOString().split('T')[0],
    packingDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    origin: farmLocation,
    location: farmLocation,
    ingredients: '',
    batchNumber: `FD-BATCH-${Date.now().toString().slice(-6)}`,
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'
  });

  // GenAI Feature States (Session 8)
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiDraft, setAiDraft] = useState('');
  const [showAiDraftModal, setShowAiDraftModal] = useState(false);
  const [lastAiAction, setLastAiAction] = useState(null);

  // AI Verification State (Session 10)
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationAnalysis, setVerificationAnalysis] = useState(null);

  const handleRunVerificationCheck = async () => {
    if (!id) return;
    try {
      setVerificationLoading(true);
      const res = await verificationApi.analyzeProduct(id);
      if (res?.success) {
        setVerificationAnalysis(res);
        showToast({
          type: res.flags?.length > 0 ? 'info' : 'success',
          title: 'AI Verification Check',
          message: res.flags?.length > 0
            ? `${res.flags.length} potential issue(s) identified for review.`
            : 'All verification checks passed with zero anomalies.'
        });
      }
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Verification Error',
        message: err.message || 'Unable to analyze product verification.'
      });
    } finally {
      setVerificationLoading(false);
    }
  };

  // If editing, load real product from PostgreSQL
  useEffect(() => {
    let isMounted = true;

    async function loadProduct() {
      if (!isEdit || !id) return;
      try {
        setLoading(true);
        const res = await productsApi.getProductById(id);
        if (res?.data?.product && isMounted) {
          const p = res.data.product;
          setFormData({
            name: p.name || '',
            category: p.category || 'Vegetables',
            description: p.description || '',
            price: String(p.price || ''),
            unit: p.unit || 'kg',
            quantity: String(p.quantity || p.availableQuantity || '50'),
            availableQuantity: String(p.availableQuantity ?? '50'),
            harvestDate: p.harvestDate || (p.transparency?.harvestDate ? new Date(p.transparency.harvestDate).toISOString().split('T')[0] : ''),
            packingDate: p.packingDate || (p.transparency?.packingDate ? new Date(p.transparency.packingDate).toISOString().split('T')[0] : ''),
            expiryDate: p.expiryDate || (p.transparency?.expiryDate ? new Date(p.transparency.expiryDate).toISOString().split('T')[0] : ''),
            origin: p.origin || p.location || farmLocation,
            location: p.location || farmLocation,
            ingredients: p.ingredients || p.transparency?.ingredients || `100% ${p.name}`,
            batchNumber: p.batchNumber || p.transparency?.batchNumber || `FD-BATCH-${p.id.slice(-6).toUpperCase()}`,
            imageUrl: p.imageUrl || p.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'
          });
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching product for edit:', err);
          setValidationError('Unable to load product information.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [id, isEdit, farmLocation]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setValidationError('');
  };

  // GenAI Feature Handlers
  const handleGenerateDescription = async () => {
    if (!formData.name || formData.name.trim().length < 2) {
      showToast({
        type: 'warning',
        title: 'Product Name Required',
        message: 'Please enter a product name first so the AI can craft an accurate description.'
      });
      return;
    }

    setAiLoading(true);
    setAiError('');
    setLastAiAction(() => handleGenerateDescription);

    try {
      const res = await aiApi.generateProductDescription({
        name: formData.name.trim(),
        category: formData.category,
        origin: formData.origin || formData.location || farmLocation,
        location: formData.location || farmLocation,
        ingredients: formData.ingredients,
        unit: formData.unit,
        harvestDate: formData.harvestDate,
        packingDate: formData.packingDate,
        expiryDate: formData.expiryDate,
        batchNumber: formData.batchNumber,
        farmName
      });

      if (res?.success && res.description) {
        setAiDraft(res.description);
        setShowAiDraftModal(true);
      } else {
        setAiError('AI service is temporarily unavailable.');
      }
    } catch (err) {
      console.error('Failed to generate description:', err);
      setAiError('AI service is temporarily unavailable.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleTranslate = async (targetLang) => {
    const sourceText = aiDraft || formData.description;
    if (!sourceText || !sourceText.trim()) {
      showToast({
        type: 'warning',
        title: 'Description Required',
        message: 'Please provide or generate a description first to translate.'
      });
      return;
    }

    setAiLoading(true);
    setAiError('');
    setLastAiAction(() => () => handleTranslate(targetLang));

    try {
      const res = await aiApi.translateContent({
        text: sourceText.trim(),
        targetLanguage: targetLang
      });

      if (res?.success && (res.translatedText || res.simplifiedText)) {
        setAiDraft(res.translatedText || res.simplifiedText);
        setShowAiDraftModal(true);
      } else {
        setAiError('AI service is temporarily unavailable.');
      }
    } catch (err) {
      console.error('Translation error:', err);
      setAiError('AI service is temporarily unavailable.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSimplify = async () => {
    const sourceText = aiDraft || formData.description;
    if (!sourceText || !sourceText.trim()) {
      showToast({
        type: 'warning',
        title: 'Description Required',
        message: 'Please provide or generate a description first to simplify.'
      });
      return;
    }

    setAiLoading(true);
    setAiError('');
    setLastAiAction(() => handleSimplify);

    try {
      const res = await aiApi.simplifyContent({
        text: sourceText.trim()
      });

      if (res?.success && res.simplifiedText) {
        setAiDraft(res.simplifiedText);
        setShowAiDraftModal(true);
      } else {
        setAiError('AI service is temporarily unavailable.');
      }
    } catch (err) {
      console.error('Simplify error:', err);
      setAiError('AI service is temporarily unavailable.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleApplyAiDraft = () => {
    if (aiDraft.trim()) {
      setFormData((prev) => ({ ...prev, description: aiDraft.trim() }));
      setShowAiDraftModal(false);
      showToast({
        type: 'success',
        title: 'Description Applied',
        message: 'AI-generated description copied to product description field.'
      });
    }
  };

  const handleCancelAiDraft = () => {
    setShowAiDraftModal(false);
    setAiDraft('');
    setAiError('');
  };

  const validate = () => {
    if (!formData.name.trim()) return 'Product Name is required.';
    if (!formData.category.trim()) return 'Category is required.';
    if (!formData.price || Number(formData.price) < 0) return 'Price must be 0 or greater.';
    if (!formData.unit.trim()) return 'Unit is required.';
    if (formData.quantity === '' || parseInt(formData.quantity, 10) < 0) return 'Total Quantity cannot be negative.';
    if (formData.availableQuantity === '' || parseInt(formData.availableQuantity, 10) < 0) return 'Available Quantity cannot be negative.';

    // Date validation
    if (formData.harvestDate && formData.expiryDate) {
      const hDate = new Date(formData.harvestDate);
      const eDate = new Date(formData.expiryDate);
      if (hDate > eDate) {
        return 'Expiry date cannot be before harvest date.';
      }
    }

    return null;
  };

  const handleSave = async (status = 'ACTIVE') => {
    const err = validate();
    if (err) {
      setValidationError(err);
      return;
    }

    setSubmitting(true);
    setValidationError('');

    const payload = {
      name: formData.name.trim(),
      category: formData.category.trim(),
      description: formData.description.trim() || `Fresh ${formData.name} from ${farmName}.`,
      price: Number(formData.price),
      unit: formData.unit.trim(),
      quantity: parseInt(formData.quantity, 10) || 0,
      availableQuantity: parseInt(formData.availableQuantity, 10) || 0,
      imageUrl: formData.imageUrl.trim(),
      location: formData.location.trim() || farmLocation,
      status: parseInt(formData.availableQuantity, 10) === 0 ? 'OUT_OF_STOCK' : status,
      harvestDate: formData.harvestDate || null,
      packingDate: formData.packingDate || null,
      expiryDate: formData.expiryDate || null,
      origin: formData.origin.trim() || formData.location.trim() || farmLocation,
      batchNumber: formData.batchNumber.trim() || `FD-BATCH-${Date.now().toString().slice(-6)}`,
      ingredients: formData.ingredients.trim() || `100% ${formData.name.trim()}`
    };

    try {
      if (isEdit) {
        await productsApi.updateProduct(id, payload);
        showToast({
          type: 'success',
          title: 'Product Updated',
          message: `Changes for "${payload.name}" have been saved to PostgreSQL.`
        });
      } else {
        await productsApi.createProduct(payload);
        showToast({
          type: 'success',
          title: 'Product Published',
          message: `"${payload.name}" is now live in the FarmDirect marketplace.`
        });
      }
      navigate('/farmer/products');
    } catch (apiErr) {
      console.error('Error saving product:', apiErr);
      setValidationError(apiErr.message || 'Failed to save product. Please verify all inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublish = (e) => {
    e.preventDefault();
    handleSave('ACTIVE');
  };

  const handleSaveDraft = (e) => {
    e.preventDefault();
    handleSave('DRAFT');
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-forest-700 animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-600">Loading product details...</p>
      </div>
    );
  }

  return (
    <>
      <div className="web-page-wrapper print:hidden space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Back Button & Header */}
      <div>
        <Link
          to="/farmer/products"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Products</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {isEdit ? `Edit Product: ${formData.name || 'Listing'}` : 'Add New Product'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Create a transparent product listing for your customers with digital provenance.
            </p>
          </div>
        </div>
      </div>

      {validationError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold flex items-center gap-2 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form */}
        <form onSubmit={handlePublish} className="lg:col-span-7 space-y-6">
          {/* SECTION 1 — BASIC INFORMATION */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-soft space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-xs font-bold">
                1
              </span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Basic Information
              </h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Fresh Country Tomatoes"
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
              >
                <option value="Vegetables">Vegetables</option>
                <option value="Fruits">Fruits</option>
                <option value="Grains">Grains</option>
                <option value="Honey">Honey</option>
                <option value="Dairy">Dairy</option>
                <option value="Spices">Spices</option>
                <option value="Beverages">Beverages</option>
                <option value="Eggs">Eggs</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                <label className="block text-xs font-semibold text-slate-800">
                  Description
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    id="ai-generate-desc-btn"
                    disabled={aiLoading}
                    onClick={handleGenerateDescription}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
                  >
                    <Sparkles className={`w-3.5 h-3.5 text-emerald-600 ${aiLoading ? 'animate-spin' : ''}`} />
                    <span>{aiLoading ? 'Generating...' : 'AI Generate Description'}</span>
                  </button>

                  {(formData.description || aiDraft) && (
                    <>
                      <button
                        type="button"
                        disabled={aiLoading}
                        onClick={() => handleTranslate('ta')}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors disabled:opacity-50"
                        title="Translate description to Tamil"
                      >
                        <Languages className="w-3 h-3 text-slate-500" />
                        <span>தமிழ் (Tamil)</span>
                      </button>
                      <button
                        type="button"
                        disabled={aiLoading}
                        onClick={handleSimplify}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors disabled:opacity-50"
                        title="Rewrite in Simple English"
                      >
                        <span>Simple English</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {aiError && (
                <div className="mb-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs text-rose-700 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{aiError}</span>
                  </div>
                  {lastAiAction && (
                    <button
                      type="button"
                      onClick={() => lastAiAction()}
                      className="px-2.5 py-0.5 bg-white hover:bg-rose-100 text-rose-800 rounded-lg border border-rose-300 font-bold transition-colors"
                    >
                      Retry
                    </button>
                  )}
                </div>
              )}

              {showAiDraftModal && (
                <div className="mb-3 p-3.5 rounded-xl bg-emerald-50/80 border-2 border-emerald-500/30 space-y-2.5 animate-fade-in">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      <span>AI-generated content — review before publishing</span>
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">Editable Preview</span>
                  </div>

                  <textarea
                    rows={3}
                    value={aiDraft}
                    onChange={(e) => setAiDraft(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-lg border border-emerald-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 resize-none font-sans leading-relaxed"
                  />

                  <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleApplyAiDraft}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Use this description</span>
                      </button>
                      <button
                        type="button"
                        disabled={aiLoading}
                        onClick={handleGenerateDescription}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                        <span>Regenerate</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleCancelAiDraft}
                      className="px-3 py-1.5 text-slate-500 hover:text-slate-800 text-xs font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <textarea
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe variety, soil, harvest technique, taste..."
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 resize-none"
              />
            </div>
          </div>

          {/* SECTION 2 — PRICING & STOCK */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-soft space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-xs font-bold">
                2
              </span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Pricing & Stock
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Price (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                    ₹
                  </span>
                  <input
                    type="number"
                    name="price"
                    required
                    min="0"
                    step="any"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="40"
                    className="w-full pl-8 pr-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Unit *
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
                >
                  <option value="kg">kg</option>
                  <option value="dozen">dozen</option>
                  <option value="500g">500g</option>
                  <option value="250g">250g</option>
                  <option value="piece">piece</option>
                  <option value="bunch">bunch</option>
                  <option value="litre">litre</option>
                  <option value="pack of 6">pack of 6</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Available Quantity *
                </label>
                <input
                  type="number"
                  name="availableQuantity"
                  required
                  min="0"
                  value={formData.availableQuantity}
                  onChange={handleChange}
                  placeholder="50"
                  className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3 — FARM & HARVEST INFORMATION */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-soft space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-xs font-bold">
                3
              </span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Farm & Harvest Information
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Harvest Date
                </label>
                <input
                  type="date"
                  name="harvestDate"
                  value={formData.harvestDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Packing Date
                </label>
                <input
                  type="date"
                  name="packingDate"
                  value={formData.packingDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Expiry Date
                </label>
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Origin / Farm Location
              </label>
              <input
                type="text"
                name="origin"
                value={formData.origin}
                onChange={handleChange}
                placeholder="Plot 4, Ravi Farms, Salem, Tamil Nadu"
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
              />
            </div>
          </div>

          {/* SECTION 4 — INGREDIENTS & TRANSPARENCY */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-soft space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-xs font-bold">
                4
              </span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Ingredients & Transparency
              </h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Ingredients
              </label>
              <textarea
                rows={2}
                name="ingredients"
                value={formData.ingredients}
                onChange={handleChange}
                placeholder="e.g. 100% Native Country Tomato"
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30 resize-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Printed directly onto the customer FarmDirect Digital Provenance label.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Batch Number
              </label>
              <input
                type="text"
                name="batchNumber"
                value={formData.batchNumber}
                onChange={handleChange}
                placeholder="TOM-2026-0917"
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* SECTION 5 — PRODUCT IMAGE */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-soft space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-xs font-bold">
                5
              </span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Product Image URL
              </h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Image URL
              </label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
              />
            </div>

            {formData.imageUrl && (
              <div className="mt-2 w-24 h-24 rounded-xl overflow-hidden border border-slate-200">
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';
                  }}
                />
              </div>
            )}
          </div>

          {/* SECTION 6 — AI VERIFICATION (Session 10) */}
          {isEdit && id && (
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-soft space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-xs font-bold">
                    6
                  </span>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                      AI Verification
                    </h3>
                    {verificationAnalysis && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          (verificationAnalysis.flags || []).length === 0
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : (verificationAnalysis.flags || []).length === 1
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {(verificationAnalysis.flags || []).length === 0
                          ? 'No issues detected'
                          : (verificationAnalysis.flags || []).length === 1
                          ? 'Review recommended'
                          : 'Multiple issues detected'}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  id="run-product-verification-btn"
                  onClick={handleRunVerificationCheck}
                  disabled={verificationLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 text-xs font-bold transition-all disabled:opacity-50 shadow-2xs self-start sm:self-center"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${verificationLoading ? 'animate-spin' : ''}`} />
                  <span>{verificationLoading ? 'Analyzing...' : 'Run Verification Check'}</span>
                </button>
              </div>

              {verificationAnalysis ? (
                <div className="space-y-3">
                  {verificationAnalysis.flags && verificationAnalysis.flags.length > 0 ? (
                    verificationAnalysis.flags.map((flag, idx) => (
                      <AnomalyFlag
                        key={`${flag.type}-${idx}`}
                        type={flag.type}
                        severity={flag.severity}
                        title={flag.title}
                        message={flag.message}
                        evidence={flag.evidence}
                        recommendation={flag.recommendation}
                      />
                    ))
                  ) : (
                    <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>No anomalies or data inconsistencies detected for this listing. Information is consistent.</span>
                    </div>
                  )}

                  {verificationAnalysis.summary && (
                    <p className="text-xs text-slate-500 italic pt-1">
                      {verificationAnalysis.summary}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  Run an automated verification check to detect pricing anomalies, missing transparency data, or inventory inconsistencies.
                </p>
              )}
            </div>
          )}

          {/* Form Actions Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors"
            >
              Save as Draft
            </button>

            <Link
              to="/farmer/products"
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-white text-xs font-bold shadow-soft transition-all"
            >
              {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Publish Product'}
            </button>
          </div>
        </form>

        {/* Right Column: Trust Label & Generated QR Code (Section 16 & 17) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Trust & Traceability Seal
            </h3>
            <span className="text-[11px] font-semibold text-emerald-700">
              {isEdit ? 'Active Listing' : 'Live Form Preview'}
            </span>
          </div>

          <TrustLabelPreview
            product={{
              id: isEdit ? id : '',
              name: formData.name || 'Fresh Produce',
              farmerName: farmName,
              verified: user?.farmerProfile?.verified ?? true,
              harvestDate: formData.harvestDate,
              packingDate: formData.packingDate,
              expiryDate: formData.expiryDate,
              origin: formData.origin,
              ingredients: formData.ingredients || (formData.name ? `100% ${formData.name}` : ''),
              batchNumber: formData.batchNumber
            }}
          />

          {/* QR Code Section (Section 16 & 17) */}
          {isEdit && id ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Product QR Code
                </h4>
                <Link
                  to={`/trace/${id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-forest-700 hover:text-forest-900 inline-flex items-center gap-1"
                >
                  <span>View Public Traceability</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <QRCodeLabel
                productId={id}
                productName={formData.name || 'Produce Item'}
                farmerName={farmName}
                batchNumber={formData.batchNumber}
                harvestDate={formData.harvestDate}
                packingDate={formData.packingDate}
                expiryDate={formData.expiryDate}
                origin={formData.origin}
              />
            </div>
          ) : (
            <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-500 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-5 h-5 text-slate-600" />
              </div>
              <h4 className="text-xs font-bold text-slate-800">QR Code Generation</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs mx-auto">
                A permanent scannable QR code and public traceability URL will be automatically generated upon publishing this product to the database.
              </p>
            </div>
          )}

          <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/60 text-xs text-emerald-900 leading-relaxed">
            <p className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Consumer Transparency Guarantee</span>
            </p>
            <p className="mt-1 text-slate-600 text-[11px]">
              FarmDirect automatically attaches this digital trust seal to your customer box with immutable harvest coordinates.
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Dedicated Single-Page A4 Product Traceability Certificate for Print / PDF */}
    {isEdit && id && (
      <ProductTraceabilityCertificate
        productId={id}
        productName={formData.name || 'Produce Item'}
        farmerName={farmName}
        location={formData.origin || 'Salem, Tamil Nadu'}
        isVerified={user?.verified ?? true}
        origin={formData.origin}
        harvestDate={formData.harvestDate}
        packingDate={formData.packingDate}
        expiryDate={formData.expiryDate}
        batchNumber={formData.batchNumber}
        ingredients={formData.ingredients}
        category={formData.category}
        hasPurchased={false}
      />
    )}
  </>
  );
}
