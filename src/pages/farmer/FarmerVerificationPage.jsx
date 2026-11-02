import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  FileCheck,
  Building,
  CreditCard,
  AlertCircle,
  ExternalLink,
  Lock,
  Sparkles,
  ChevronRight,
  Package,
  Layers
} from 'lucide-react';
import { VERIFICATION_DATA } from '../../data/farmerData';
import { useFarmerToast } from '../../components/farmer/FarmerDashboardLayout';
import verificationApi from '../../api/verification';
import VerificationSummary from '../../components/verification/VerificationSummary';
import AnomalyFlag from '../../components/verification/AnomalyFlag';

export default function FarmerVerificationPage() {
  const { showToast } = useFarmerToast();

  const [analyzing, setAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [filterMode, setFilterMode] = useState('review'); // 'review' | 'all'

  // Run verification analysis on mount
  useEffect(() => {
    let isMounted = true;

    async function loadInitialAnalysis() {
      try {
        setAnalyzing(true);
        const res = await verificationApi.analyzeFarmer();
        if (res?.success && isMounted) {
          setAnalysisData(res);
        }
      } catch (err) {
        console.warn('Could not run automated verification on load:', err);
      } finally {
        if (isMounted) setAnalyzing(false);
      }
    }

    loadInitialAnalysis();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRunVerification = async () => {
    try {
      setAnalyzing(true);
      const res = await verificationApi.analyzeFarmer();
      if (res?.success) {
        setAnalysisData(res);
        showToast({
          type: 'success',
          title: 'Verification Audit Completed',
          message: `Analyzed ${res.totalProducts} products. Identified ${res.totalFlags} potential review items.`
        });
      }
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Analysis Error',
        message: err.message || 'Unable to perform verification check.'
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDocumentAction = (doc) => {
    showToast({
      type: doc.isApproved ? 'info' : 'warning',
      title: doc.title,
      message: doc.isApproved
        ? `Document #${doc.id} is verified and valid for Tamil Nadu agricultural trade.`
        : 'Bank account verification requires submission of cancelled cheque or passbook.'
    });
  };

  const productAnalyses = analysisData?.flags || [];
  const filteredProducts = productAnalyses.filter((item) => {
    if (filterMode === 'review') {
      return item.flags && item.flags.length > 0;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* 1. Header & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Farmer Verification
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Verified farmers help consumers shop with greater confidence and unlock direct marketplace selling.
        </p>
      </div>

      {/* 2. Main Verification Status Card */}
      <div className="bg-gradient-to-br from-emerald-900 via-forest-900 to-forest-950 rounded-3xl p-6 sm:p-8 text-white shadow-elevated relative overflow-hidden">
        <div className="absolute right-4 -bottom-10 opacity-10 pointer-events-none select-none">
          <ShieldCheck className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-fresh-400 shadow-inner flex-shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide bg-emerald-500/30 text-fresh-300 border border-emerald-400/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>✓ VERIFIED</span>
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white">
                {VERIFICATION_DATA.farmName}
              </h2>
              <p className="text-xs text-emerald-200/90 font-medium">
                {VERIFICATION_DATA.location} • {VERIFICATION_DATA.certifyingBody}
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-xs space-y-1 sm:text-right">
            <span className="text-slate-300 text-[11px] block">Accredited Until</span>
            <span className="font-bold text-white text-sm block">
              {VERIFICATION_DATA.renewalDate}
            </span>
            <span className="text-[10px] text-fresh-300 font-mono">
              Status: Active & In Good Standing
            </span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/15 text-xs">
          <div>
            <span className="text-emerald-300/80 text-[11px] uppercase tracking-wider font-semibold block">
              Farm Name
            </span>
            <span className="font-bold text-white mt-0.5 block">
              {VERIFICATION_DATA.farmName}
            </span>
          </div>

          <div>
            <span className="text-emerald-300/80 text-[11px] uppercase tracking-wider font-semibold block">
              Location
            </span>
            <span className="font-bold text-white mt-0.5 block">
              {VERIFICATION_DATA.location}
            </span>
          </div>

          <div>
            <span className="text-emerald-300/80 text-[11px] uppercase tracking-wider font-semibold block">
              Verification Status
            </span>
            <span className="font-bold text-fresh-300 mt-0.5 block flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-fresh-400" />
              <span>{VERIFICATION_DATA.status}</span>
            </span>
          </div>

          <div>
            <span className="text-emerald-300/80 text-[11px] uppercase tracking-wider font-semibold block">
              Verified On
            </span>
            <span className="font-bold text-white mt-0.5 block">
              {VERIFICATION_DATA.verifiedDate}
            </span>
          </div>
        </div>
      </div>

      {/* 3. AI Verification & Product Health Section (Session 10) */}
      <VerificationSummary
        riskLevel={analysisData?.riskLevel || 'LOW'}
        totalProducts={analysisData?.totalProducts || 0}
        productsRequiringReview={analysisData?.productsRequiringReview || 0}
        highSeverity={analysisData?.highSeverity || 0}
        mediumSeverity={analysisData?.mediumSeverity || 0}
        lowSeverity={analysisData?.lowSeverity || 0}
        summary={analysisData?.summary}
        recommendations={analysisData?.recommendations}
        onRunCheck={handleRunVerification}
        loading={analyzing}
      />

      {/* 4. Product-by-Product Analysis Breakdown */}
      {analysisData && productAnalyses.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Product Health & Consistency Audits
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Automated detection of pricing anomalies, transparency gaps, and date inconsistencies.
              </p>
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFilterMode('review')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterMode === 'review'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Require Review ({analysisData.productsRequiringReview || 0})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterMode === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                All Products ({productAnalyses.length})
              </button>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="p-8 text-center bg-emerald-50/40 rounded-2xl border border-emerald-100 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="text-sm font-bold text-emerald-900">
                {filterMode === 'review'
                  ? 'No Products Currently Require Review'
                  : 'No Products Found'}
              </h4>
              <p className="text-xs text-emerald-700 max-w-md mx-auto">
                All listed products satisfy baseline transparency, pricing consistency, and freshness requirements.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map(({ product, riskLevel, flags, summary: prodSummary, recommendations: prodRecs }) => (
                <div
                  key={product.id}
                  className={`p-5 rounded-2xl border transition-all space-y-4 ${
                    riskLevel === 'HIGH'
                      ? 'bg-rose-50/20 border-rose-200/90'
                      : riskLevel === 'MEDIUM'
                      ? 'bg-amber-50/20 border-amber-200/90'
                      : 'bg-slate-50/50 border-slate-200/80'
                  }`}
                >
                  {/* Product Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 font-bold overflow-hidden shrink-0">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-5 h-5 text-slate-400" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">
                            {product.name}
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                              riskLevel === 'HIGH'
                                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                : riskLevel === 'MEDIUM'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            }`}
                          >
                            {riskLevel} RISK
                          </span>
                        </div>
                        <span className="text-xs text-slate-500">
                          {product.category} • ₹{product.price} / {product.unit} • {product.availableQuantity} in stock
                        </span>
                      </div>
                    </div>

                    <Link
                      to={`/farmer/products/edit/${product.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-colors shadow-2xs self-start sm:self-center"
                    >
                      <span>View Product</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </Link>
                  </div>

                  {/* Anomaly Flags List */}
                  {flags && flags.length > 0 ? (
                    <div className="space-y-3">
                      {flags.map((flag, idx) => (
                        <AnomalyFlag
                          key={`${flag.type}-${idx}`}
                          type={flag.type}
                          severity={flag.severity}
                          title={flag.title}
                          message={flag.message}
                          evidence={flag.evidence}
                          recommendation={flag.recommendation}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-center gap-2 text-xs text-emerald-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>No potential anomalies or data inconsistencies detected for this listing.</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. Verification Documents Checklist Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft space-y-6">
        <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Submitted Verification Records
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Legal documents on file with the FarmDirect Rural Provenance Council
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60">
            2 of 3 Verified
          </span>
        </div>

        <div className="space-y-4">
          {VERIFICATION_DATA.documents.map((doc) => (
            <div
              key={doc.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                doc.isApproved
                  ? 'bg-slate-50/70 border-slate-200/80'
                  : 'bg-amber-50/50 border-amber-200/90'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    doc.isApproved
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {doc.id === 'doc-reg' ? (
                    <Building className="w-5 h-5" />
                  ) : doc.id === 'doc-id' ? (
                    <FileCheck className="w-5 h-5" />
                  ) : (
                    <CreditCard className="w-5 h-5" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">
                      {doc.title}
                    </h4>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        doc.isApproved
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {doc.statusText}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
                    {doc.description}
                  </p>
                  <span className="text-[11px] text-slate-400 block font-medium">
                    Updated: {doc.submittedDate}
                  </span>
                </div>
              </div>

              <div className="self-start sm:self-center">
                <button
                  type="button"
                  onClick={() => handleDocumentAction(doc)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                    doc.isApproved
                      ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      : 'bg-amber-700 hover:bg-amber-800 text-white shadow-xs'
                  }`}
                >
                  {doc.isApproved ? 'View Record' : 'Complete Setup'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Verification Information & What Consumers See */}
      <div className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200/80 space-y-4">
        <div className="flex items-center gap-2 text-slate-900">
          <Sparkles className="w-5 h-5 text-emerald-600" />
          <h3 className="text-base font-bold">
            What Consumers See on Your Listings
          </h3>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Because your farm has completed registration and identity verification, consumers on FarmDirect enjoy full transparency. Here is how your credentials translate to customer trust:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {VERIFICATION_DATA.consumerTransparencyPoints.map((point, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-white rounded-2xl border border-slate-200/80 flex items-start gap-2.5 text-xs text-slate-700"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{point}</span>
            </div>
          ))}
        </div>

        <div className="pt-2 flex items-center gap-2 text-[11px] text-slate-400 font-mono">
          <Lock className="w-3.5 h-3.5 text-slate-400" />
          <span>FarmDirect does not disclose sensitive government numbers publicly. Only certified badges and origin coordinates are displayed.</span>
        </div>
      </div>
    </div>
  );
}
