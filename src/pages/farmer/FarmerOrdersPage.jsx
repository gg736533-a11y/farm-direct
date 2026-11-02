import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Search,
  SlidersHorizontal,
  Clock,
  CheckCircle2,
  Package,
  Truck,
  Eye,
  Filter,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import ordersApi from '../../api/orders';
import OrderStatusBadge from '../../components/farmer/OrderStatusBadge';
import OrderDetailModal from '../../components/farmer/OrderDetailModal';
import { useFarmerToast } from '../../components/farmer/FarmerDashboardLayout';

export default function FarmerOrdersPage() {
  const { showToast } = useFarmerToast();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await ordersApi.getFarmerOrders();
      if (res.data?.success) {
        setOrders(res.data.data.orders || []);
      }
    } catch (err) {
      console.error('Failed to load farmer orders:', err);
      setError(err.response?.data?.message || 'Failed to load orders. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Dynamic summary metric counts from real PostgreSQL orders
  const summaryCounts = useMemo(() => {
    return {
      pending: orders.filter((o) => o.rawStatus === 'PENDING' || o.status === 'Pending').length,
      confirmed: orders.filter((o) => o.rawStatus === 'CONFIRMED' || o.status === 'Confirmed').length,
      packed: orders.filter((o) => o.rawStatus === 'PACKED' || o.status === 'Packed').length,
      delivered: orders.filter((o) => o.rawStatus === 'DELIVERED' || o.status === 'Delivered').length
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        (order.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.customer || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.productsSummary || '').toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (activeFilter === 'All') return true;
      return (
        order.status === activeFilter ||
        (order.rawStatus && order.rawStatus.toUpperCase() === activeFilter.toUpperCase())
      );
    });
  }, [orders, searchQuery, activeFilter]);

  const handleOpenDetail = (order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await ordersApi.updateFarmerOrderStatus(orderId, newStatus);
      if (res.data?.success) {
        showToast({
          type: 'success',
          title: 'Status Updated',
          message: `Order marked as ${newStatus}.`
        });
        await fetchOrders();
        // Update selected order if modal is still open
        if (selectedOrder) {
          setSelectedOrder((prev) =>
            prev ? { ...prev, rawStatus: newStatus, status: newStatus.charAt(0).toUpperCase() + newStatus.slice(1).toLowerCase() } : null
          );
        }
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: err.response?.data?.message || 'Failed to update order status.'
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 18. Header & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Orders
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage orders placed by your customers.
        </p>
      </div>

      {/* Top Summary Cards (Pending 7, Confirmed 5, Packed 3, Delivered 28) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
              Pending
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 block">
            {summaryCounts.pending}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">Awaiting confirmation</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Confirmed
            </span>
            <CheckCircle2 className="w-4 h-4 text-blue-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 block">
            {summaryCounts.confirmed}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">In farm prep</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
              Packed
            </span>
            <Package className="w-4 h-4 text-purple-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 block">
            {summaryCounts.packed}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">Ready for driver pickup</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Delivered
            </span>
            <Truck className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 block">
            {summaryCounts.delivered}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">Completed this month</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-4 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by order #FD, customer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          {['All', 'Pending', 'Confirmed', 'Packed', 'Delivered', 'Cancelled'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setActiveFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFilter === status
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Order Table on Desktop */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4">Order ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Order Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading orders...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-rose-600">
                    <div className="flex items-center justify-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>{error}</span>
                      <button
                        type="button"
                        onClick={fetchOrders}
                        className="ml-2 underline text-xs font-bold text-slate-700"
                      >
                        Retry
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500">
                    No orders found for this status.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {order.id}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {order.customer}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-[240px] truncate">
                      {order.productsSummary}
                    </td>
                    <td className="py-3.5 px-4 font-black text-forest-900 text-sm">
                      {order.amount}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {order.date}
                    </td>
                    <td className="py-3.5 px-4">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenDetail(order)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:text-emerald-800 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Responsive Order Cards */}
        <div className="lg:hidden divide-y divide-slate-100">
          {isLoading ? (
            <div className="p-8 text-center text-slate-500">
              <div className="flex justify-center items-center gap-2">
                <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Loading orders...</span>
              </div>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-rose-600 text-xs">
              {error}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No orders found for this status.
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="p-4 space-y-3">
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

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">{order.date}</span>
                    <span className="font-bold text-forest-900 text-sm">{order.amount}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenDetail(order)}
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

      {/* Order Detail Modal with Timeline */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
