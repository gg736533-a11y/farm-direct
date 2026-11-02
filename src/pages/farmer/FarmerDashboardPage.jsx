import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  CheckCircle2,
  Clock,
  IndianRupee,
  Plus,
  Store,
  ExternalLink,
  ArrowRight,
  Sparkles,
  TrendingUp,
  ShieldAlert,
  Bot,
  AlertCircle
} from 'lucide-react';
import StatCard from '../../components/farmer/StatCard';
import SalesChart from '../../components/farmer/SalesChart';
import OrderStatusBadge from '../../components/farmer/OrderStatusBadge';
import FreshnessAlert from '../../components/farmer/FreshnessAlert';
import OrderDetailModal from '../../components/farmer/OrderDetailModal';
import { FARMER_PROFILE, AI_FEATURES } from '../../data/farmerData';
import { useFarmerToast } from '../../components/farmer/FarmerDashboardLayout';
import { useAuth } from '../../auth/AuthContext';
import farmersApi from '../../api/farmers';
import ordersApi from '../../api/orders';

export default function FarmerDashboardPage() {
  const { showToast } = useFarmerToast();
  const { user } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const farmerName = user?.name || FARMER_PROFILE.ownerName;
  const farmName = user?.farmName || FARMER_PROFILE.farmName;
  const isVerified = user
    ? user.verified === true && user.verificationStatus === 'VERIFIED'
    : FARMER_PROFILE.verified;

  const fetchDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await farmersApi.getDashboardStats();
      if (res.data?.success) {
        setDashboardData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load farmer dashboard:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard statistics.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const stats = dashboardData?.stats;
  const recentOrders = dashboardData?.recentOrders || [];

  const handleOpenOrder = (order) => {
    setSelectedOrder(order);
    setOrderModalOpen(true);
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await ordersApi.updateFarmerOrderStatus(orderId, newStatus);
      if (res.data?.success) {
        setOrderModalOpen(false);
        showToast({
          type: 'success',
          title: 'Order Updated',
          message: `Order marked as "${newStatus}".`
        });
        await fetchDashboard();
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: err.response?.data?.message || 'Failed to update order status.'
      });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 23. Verification Pending Warning Banner for newly registered farmers */}
      {!isVerified && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-amber-950">Verification Pending</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-200 text-amber-900 uppercase tracking-wider">
                  Under Review
                </span>
              </div>
              <p className="text-xs text-amber-800 mt-0.5">
                Your farmer account is currently under verification. Complete your verification information to build customer trust and unlock direct customer payouts.
              </p>
            </div>
          </div>
          <Link
            to="/farmer/verification"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold shrink-0 transition-colors shadow-xs"
          >
            <span>View Verification</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* 5. Header Greeting & Primary Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Good morning, {farmerName.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {farmName} • Here's what's happening with your farm store today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link

            to="/farmer/ai-assistant"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-950 text-xs font-bold shadow-xs transition-colors"
          >
            <Bot className="w-4 h-4 text-emerald-700" />
            <span>AI Assistant</span>
          </Link>


          <Link
            to="/farmer/products/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-white text-xs font-bold shadow-soft transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>


          <Link
            to={user?.farmerProfile?.id ? `/farmer/${user.farmerProfile.id}` : `/farmer/${FARMER_PROFILE.id}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold shadow-xs transition-colors"
          >
            <Store className="w-4 h-4 text-emerald-600" />
            <span>View Store</span>
          </Link>
        </div>
      </div>

      {/* 6. Dashboard Summary Cards (4 Cards with Real PostgreSQL Stats) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Total Products"
          value={isLoading ? '...' : (stats?.totalProducts?.value ?? 0)}
          supportingText={stats?.totalProducts?.change || '0 Active'}
          trend={stats?.totalProducts?.trend || 'up'}
          icon={Package}
          colorScheme="emerald"
        />
        <StatCard
          title="Active Listings"
          value={isLoading ? '...' : (stats?.activeListings?.value ?? 0)}
          supportingText={stats?.activeListings?.change || '0 Out of Stock'}
          trend={stats?.activeListings?.trend || 'up'}
          icon={CheckCircle2}
          colorScheme="blue"
        />
        <StatCard
          title="Pending Orders"
          value={isLoading ? '...' : (stats?.pendingOrders?.value ?? 0)}
          supportingText={stats?.pendingOrders?.change || 'All clear'}
          trend={stats?.pendingOrders?.trend || 'neutral'}
          icon={Clock}
          colorScheme="amber"
        />
        <StatCard
          title="Direct Sales"
          value={isLoading ? '...' : (stats?.totalSales?.value ?? '₹0')}
          supportingText={stats?.totalSales?.change || 'Direct customer sales'}
          trend={stats?.totalSales?.trend || 'up'}
          icon={IndianRupee}
          colorScheme="purple"
        />
      </div>


      {/* Main Grid: Sales Chart + Freshness Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: 7. Sales Overview Chart */}
        <div className="lg:col-span-2">
          <SalesChart />
        </div>

        {/* Right 1 Col: 17. Freshness & Expiry Alerts */}
        <div className="lg:col-span-1">
          <FreshnessAlert />
        </div>
      </div>

      {/* 8. Recent Orders Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-6">
        <div className="flex items-center justify-between pb-5 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Recent Orders
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Latest consumer orders direct from Salem farm hub
            </p>
          </div>

          <Link
            to="/farmer/orders"
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto mt-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-3">Order ID</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Products</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading recent orders...</span>
                    </div>
                  </td>
                </tr>
              ) : recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500">
                    No orders placed yet. As customers order your fresh produce, orders will show up here.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-800">
                      {order.id}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-900">
                      {order.customer}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 max-w-[200px] truncate">
                      {order.productsSummary}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-forest-900">
                      {order.amount}
                    </td>
                    <td className="py-3.5 px-3 text-slate-500">
                      {order.date}
                    </td>
                    <td className="py-3.5 px-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenOrder(order)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:text-emerald-800 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 transition-colors"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden space-y-3 mt-4">
          {isLoading ? (
            <div className="p-6 text-center text-slate-500 text-xs">
              <div className="flex justify-center items-center gap-2">
                <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Loading recent orders...</span>
              </div>
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs">
              No orders placed yet. As customers order your fresh produce, orders will show up here.
            </div>
          ) : (
            recentOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-slate-900">
                    {order.id}
                  </span>
                  <OrderStatusBadge status={order.status} />
                </div>

                <div>
                  <p className="font-bold text-sm text-slate-900">{order.customer}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{order.productsSummary}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">{order.date}</span>
                    <span className="font-bold text-forest-900 text-sm">{order.amount}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenOrder(order)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 21. AI Feature Placeholders */}
      <div className="bg-gradient-to-br from-slate-900 via-forest-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-elevated">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-fresh-400 shadow-inner">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-extrabold tracking-tight">
                  FarmDirect AI Assistant
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-fresh-300 border border-emerald-400/30">
                  COMING SOON
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Intelligent agricultural agent workflows designed for smallholder farmers
              </p>
            </div>
          </div>

          <span className="text-xs text-emerald-400 font-semibold self-start sm:self-auto">
            Session 3 & 4 Roadmap
          </span>
        </div>

        {/* 3 AI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {AI_FEATURES.map((feat) => {
            return (
              <div
                key={feat.id}
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-5 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-fresh-400">
                      <Sparkles className="w-4 h-4" />
                    </span>
                    <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 px-2 py-0.5 rounded bg-white/5 border border-white/10">
                      Coming Soon
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-white mt-3">
                    {feat.title}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    {feat.tagline}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>AI Agent Ready</span>
                  <span className="text-fresh-400">Preview</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        onUpdateStatus={handleUpdateOrderStatus}
      />
    </div>
  );
}
