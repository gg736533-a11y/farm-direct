import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  MessageSquare,
  Check,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import OrderStatusBadge from '../components/farmer/OrderStatusBadge';
import ordersApi from '../api/orders';
import { useShop } from '../context/ShopContext';

export default function OrderDetailPage() {
  const { id } = useParams();
  const { getOrderById } = useShop();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadOrder() {
      try {
        setLoading(true);
        setError(null);

        // Try API first
        try {
          const res = await ordersApi.getConsumerOrderById(id);
          const fetched = res?.data?.order || res?.data?.data?.order || res?.data;
          if (fetched && isMounted) {
            setOrder(fetched);
            return;
          }
        } catch (apiErr) {
          // If 403 or specific error, handle
          if (apiErr.status === 403) {
            if (isMounted) setError('Forbidden: You do not have permission to view this order.');
            return;
          }
        }

        // Check context fallback
        const local = getOrderById(id);
        if (local && isMounted) {
          setOrder(local);
        } else if (isMounted) {
          setError('Order not found.');
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Unable to load order details.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadOrder();

    return () => {
      isMounted = false;
    };
  }, [id, getOrderById]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-3 animate-fade-in">
        <RefreshCw className="w-8 h-8 text-forest-600 animate-spin mx-auto" />
        <p className="text-sm font-semibold text-charcoal-600">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4 animate-fade-in">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold text-charcoal-900">{error || 'Order not found'}</h2>
        <p className="text-sm text-charcoal-600">
          The requested order could not be located or you may not have permission to view it.
        </p>
        <Link
          to="/orders"
          className="inline-block px-5 py-2.5 rounded-xl bg-forest-900 text-cream-50 font-bold text-xs hover:bg-forest-800 transition-colors"
        >
          Return to My Orders
        </Link>
      </div>
    );
  }

  const timelineSteps = [
    { title: 'Order Placed', desc: 'Received & routed to farm' },
    { title: 'Confirmed', desc: 'Harvest batch acknowledged' },
    { title: 'Packed', desc: 'Breathable eco-box graded' },
    { title: 'Out for Delivery', desc: 'Dispatched on express runner' },
    { title: 'Delivered', desc: 'Received at doorstep' }
  ];

  const getStepIndex = (status) => {
    const s = String(status).toLowerCase();
    if (s.includes('pending')) return 0;
    if (s.includes('confirm')) return 1;
    if (s.includes('pack')) return 2;
    if (s.includes('shipped') || s.includes('out for delivery')) return 3;
    if (s.includes('deliver')) return 4;
    return 1;
  };

  const currentStepIdx = getStepIndex(order.status || order.rawStatus);

  const handleContact = () => {
    setFeedback(`Contacting ${order.farmerName}: ${order.farmerPhone || '+91 94431 87654'}`);
    setTimeout(() => setFeedback(''), 4500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fade-in">
      {/* Back Link */}
      <div>
        <Link
          to="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-800 hover:text-fresh-600 mb-3 transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Orders</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cream-200">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 tracking-tight">
                Order {order.id}
              </h1>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="text-xs text-charcoal-600 mt-1">
              Placed on {order.orderDate} • Settled directly with {order.farmerName}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleContact}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-cream-300 hover:bg-cream-100 text-charcoal-800 text-xs font-bold shadow-xs transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-forest-700" />
              <span>Contact Farmer</span>
            </button>
          </div>
        </div>
      </div>

      {feedback && (
        <div className="p-4 rounded-2xl bg-forest-900 text-cream-50 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-fresh-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Visual Order Status Timeline */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-soft space-y-6">
        <h3 className="font-extrabold text-base text-charcoal-900 pb-2 border-b border-cream-100">
          Harvest Dispatch & Delivery Timeline
        </h3>

        {/* Desktop Horizontal Stepper */}
        <div className="hidden sm:flex items-center justify-between relative pt-2">
          {/* Connecting Line */}
          <div className="absolute top-6 left-6 right-6 h-0.5 bg-cream-200 -z-0">
            <div
              className="h-full bg-forest-900 transition-all duration-300"
              style={{
                width: `${(currentStepIdx / (timelineSteps.length - 1)) * 100}%`
              }}
            />
          </div>

          {timelineSteps.map((step, idx) => {
            const isDone = idx <= currentStepIdx;
            const isCurrent = idx === currentStepIdx;

            return (
              <div key={step.title} className="flex flex-col items-center relative z-10">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isDone
                      ? 'bg-forest-900 text-cream-50 ring-4 ring-fresh-100'
                      : 'bg-white border-2 border-cream-300 text-charcoal-400'
                  }`}
                >
                  {isDone ? <Check className="w-4 h-4" /> : idx + 1}
                </div>
                <span
                  className={`mt-2 text-xs text-center font-bold max-w-[90px] leading-tight ${
                    isCurrent ? 'text-forest-900' : isDone ? 'text-charcoal-800' : 'text-charcoal-400'
                  }`}
                >
                  {step.title}
                </span>
                <span className="text-[10px] text-charcoal-500 text-center max-w-[90px] mt-0.5 leading-snug">
                  {step.desc}
                </span>
              </div>
            );
          })}
        </div>

        {/* Mobile Vertical Timeline */}
        <div className="sm:hidden space-y-4">
          {timelineSteps.map((step, idx) => {
            const isDone = idx <= currentStepIdx;
            const isCurrent = idx === currentStepIdx;

            return (
              <div key={step.title} className="flex items-start gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    isDone
                      ? 'bg-forest-900 text-cream-50'
                      : 'bg-white border border-cream-300 text-charcoal-400'
                  }`}
                >
                  {isDone ? '✓' : idx + 1}
                </div>
                <div>
                  <p className={`text-xs font-bold ${isCurrent ? 'text-forest-900' : 'text-charcoal-800'}`}>
                    {step.title}
                  </p>
                  <p className="text-[11px] text-charcoal-500">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ordered Products & Price Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Itemized Harvest Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-cream-200 shadow-soft space-y-4">
          <h3 className="font-extrabold text-base text-charcoal-900 pb-2 border-b border-cream-100">
            Purchased Harvest Items
          </h3>

          <div className="divide-y divide-cream-100">
            {order.items?.map((item, idx) => (
              <div key={idx} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-xl object-cover border border-cream-200"
                    />
                  )}
                  <div>
                    <h4 className="font-bold text-sm text-charcoal-900">{item.name}</h4>
                    <p className="text-xs text-charcoal-500">
                      Quantity: {item.quantity} {item.unit || ''} @ ₹{item.price} each
                    </p>
                  </div>
                </div>
                <span className="font-extrabold text-forest-950 text-sm">
                  ₹{item.total || item.subtotal || item.price * item.quantity}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-cream-200 space-y-2 text-xs">
            <div className="flex justify-between text-charcoal-600">
              <span>Subtotal</span>
              <span className="font-bold text-charcoal-900">₹{order.subtotal || order.total - 40}</span>
            </div>
            <div className="flex justify-between text-charcoal-600">
              <span>Delivery Fee (Direct Express Transport)</span>
              <span className="font-bold text-charcoal-900">₹{order.deliveryFee || 40}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-forest-950 pt-2 border-t border-cream-100">
              <span>Total Settled</span>
              <span>₹{order.total}</span>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Delivery & Farmer Details */}
        <div className="space-y-4">
          {/* Farmer Contact Card */}
          <div className="bg-white rounded-3xl p-5 border border-cream-200 shadow-soft space-y-2.5 text-xs">
            <span className="font-bold text-charcoal-400 uppercase tracking-wider text-[10px] block">
              Direct Farmer Sourcing
            </span>
            <h4 className="font-extrabold text-sm text-charcoal-900">{order.farmerName} ✓</h4>
            <p className="text-charcoal-600 text-[11px] leading-relaxed">
              Harvested and dispatched directly from farm plots in Salem district.
            </p>
            {order.farmerId && (
              <Link
                to={`/farmer/${order.farmerId}`}
                className="inline-block text-forest-800 hover:text-forest-950 font-bold underline text-xs pt-1"
              >
                View Farmer Storefront →
              </Link>
            )}
          </div>

          {/* Delivery Address Card */}
          <div className="bg-white rounded-3xl p-5 border border-cream-200 shadow-soft space-y-2 text-xs">
            <span className="font-bold text-charcoal-400 uppercase tracking-wider text-[10px] block">
              Delivery Destination
            </span>
            <div className="flex items-start gap-2 text-charcoal-800">
              <MapPin className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{order.deliveryAddress}</p>
            </div>
            <p className="text-[11px] text-charcoal-500 pt-1">
              Payment Method: <strong>{order.paymentMethod || 'Cash on Delivery'}</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
