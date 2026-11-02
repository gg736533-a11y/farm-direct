import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight, Sprout, ShoppingBag, ShieldCheck } from 'lucide-react';
import Button from '../components/Button';
import { useShop } from '../context/ShopContext';

export default function OrderSuccessPage() {
  const location = useLocation();
  const { orders } = useShop();

  // Get order from state or most recent order from context
  const order = location.state?.order || orders[0] || {
    id: '#FD1025',
    farmerName: 'Ravi Farms',
    total: 180,
    items: [
      { name: 'Organic Tomatoes', quantity: 2, unit: 'kg' },
      { name: 'Fresh Spinach', quantity: 1, unit: 'bunch' }
    ]
  };

  const orderIdNumber = (order?.id || order?.rawId || '').replace('#', '');

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-cream-200 shadow-elevated text-center space-y-6">
        {/* Success Icon */}
        <div className="w-20 h-20 mx-auto rounded-full bg-fresh-100 text-fresh-700 flex items-center justify-center border-4 border-fresh-200 shadow-sm animate-bounce-short">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        {/* Heading & Subtitle */}
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-forest-50 text-forest-800 border border-forest-100">
            <Sprout className="w-3.5 h-3.5 text-fresh-600" />
            <span>Farm Direct Dispatch Scheduled</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 tracking-tight">
            Order Placed Successfully!
          </h1>
          <p className="text-sm text-charcoal-600 max-w-md mx-auto leading-relaxed">
            Thank you for supporting direct farmer-to-consumer commerce. Your produce will be hand-packed fresh for delivery.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-cream-50/80 rounded-2xl p-5 border border-cream-200 text-left space-y-3.5 text-xs">
          <div className="flex justify-between items-center pb-2.5 border-b border-cream-200">
            <span className="text-charcoal-500 font-bold uppercase text-[10px]">Order ID</span>
            <span className="font-mono font-extrabold text-forest-900 text-sm">{order.id || `#FD${orderIdNumber.slice(-6).toUpperCase()}`}</span>
          </div>

          <div className="flex justify-between items-center pb-2.5 border-b border-cream-200">
            <span className="text-charcoal-500 font-bold uppercase text-[10px]">Farmer</span>
            <div className="flex items-center gap-1 font-bold text-charcoal-900">
              <span>{order.farmerName || 'Direct Farmers'}</span>
              <span className="text-fresh-600 text-[10px]">✓</span>
            </div>
          </div>

          <div className="pb-2.5 border-b border-cream-200 space-y-1">
            <span className="text-charcoal-500 font-bold uppercase text-[10px] block">Ordered Harvests</span>
            <div className="space-y-1 font-semibold text-charcoal-800">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{item.name}</span>
                  <span className="text-charcoal-500">Qty: {item.quantity} {item.unit || ''}</span>
                </div>
              )) || <div>1x Farm Direct Product</div>}
            </div>
          </div>

          <div className="flex justify-between items-baseline pt-1">
            <span className="font-bold text-charcoal-900 text-sm">Total Paid</span>
            <span className="text-xl font-black text-forest-950">₹{order.total ?? order.totalAmount ?? 0}</span>
          </div>
        </div>

        {/* Buttons: View Order & Continue Shopping */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {orderIdNumber ? (
            <Link to={`/orders/${orderIdNumber}`} className="flex-1">
              <Button variant="primary" size="md" className="w-full justify-center shadow-md font-bold">
                <span>View Order Timeline</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          ) : (
            <Link to="/orders" className="flex-1">
              <Button variant="primary" size="md" className="w-full justify-center shadow-md font-bold">
                <span>View My Orders</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          )}

          <Link to="/orders" className="flex-1">
            <Button variant="outline" size="md" className="w-full justify-center font-bold">
              <span>All Orders</span>
            </Button>
          </Link>

          <Link to="/marketplace" className="flex-1">
            <Button variant="outline" size="md" className="w-full justify-center font-bold">
              <span>Marketplace</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
