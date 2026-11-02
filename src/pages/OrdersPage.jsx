import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight, Clock, CheckCircle2, Truck, XCircle, ShoppingBag } from 'lucide-react';
import OrderStatusBadge from '../components/farmer/OrderStatusBadge';
import EmptyState from '../components/EmptyState';
import { useShop } from '../context/ShopContext';

export default function OrdersPage() {
  const { orders, loadingOrders } = useShop();
  const [filter, setFilter] = useState('All');

  const filteredOrders = orders.filter((o) => {
    if (filter === 'All') return true;
    return o.status === filter || o.rawStatus === filter.toUpperCase();
  });

  if (loadingOrders) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-3 animate-fade-in">
        <div className="w-8 h-8 border-3 border-forest-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-charcoal-600">Loading your farm-direct orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 animate-fade-in">
        <EmptyState
          icon={Package}
          title="No orders yet"
          description="You haven't placed any farm-direct orders yet. Explore our marketplace to buy fresh produce directly from farmers."
          buttonText="Explore Marketplace"
          buttonLink="/marketplace"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fade-in">
      {/* 27. Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-4 border-b border-cream-200">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-charcoal-900 tracking-tight">
            My Orders
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-600 mt-1">
            Track your farm-to-consumer harvests and previous purchases.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-cream-300 shadow-xs self-start sm:self-auto">
          {['All', 'Confirmed', 'Delivered'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === status
                  ? 'bg-forest-900 text-cream-50 shadow-xs'
                  : 'text-charcoal-700 hover:bg-cream-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const orderIdClean = (order.id || order.rawId || '').replace('#', '');

          return (
            <div
              key={order.id || order.rawId}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-cream-200 shadow-soft hover:shadow-card transition-all space-y-4"
            >
              {/* Order Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-cream-100">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-extrabold text-forest-950 text-sm sm:text-base">
                    {order.id}
                  </span>
                  <span className="text-xs text-charcoal-400">•</span>
                  <span className="text-xs text-charcoal-600">{order.orderDate}</span>
                </div>

                <OrderStatusBadge status={order.status} />
              </div>

              {/* Farmer & Items Preview */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-forest-900">
                    Farmer: {order.farmerName || 'Direct Farmers'} ✓
                  </p>
                  <p className="text-xs text-charcoal-700">
                    {order.items?.map((i) => `${i.name} (${i.quantity} ${i.unit || ''})`).join(', ') || 'Fresh Farm Produce'}
                  </p>
                  <p className="text-[11px] text-charcoal-500">
                    Delivery to: {order.deliveryAddress}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-cream-100">
                  <div className="text-right">
                    <span className="text-[10px] text-charcoal-400 uppercase font-bold block">Total Amount</span>
                    <span className="text-lg font-black text-forest-950">₹{order.total ?? order.totalAmount ?? 0}</span>
                  </div>

                  <Link
                    to={`/orders/${orderIdClean}`}
                    className="inline-flex items-center gap-1 text-xs font-bold px-4 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-cream-50 transition-colors shadow-xs"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
