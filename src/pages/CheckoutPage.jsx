import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle2,
  Lock,
  ShoppingBag
} from 'lucide-react';
import Button from '../components/Button';
import { useShop } from '../context/ShopContext';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, subtotal, deliveryFee, total, profile, placeOrder } = useShop();

  const [deliveryData, setDeliveryData] = useState({
    fullName: profile.fullName || 'Arun Kumar',
    phone: profile.phone || '+91 98402 12345',
    address: profile.address || 'Flat 402, Green Meadows, Fairlands',
    city: profile.city || 'Salem',
    state: profile.state || 'Tamil Nadu',
    pincode: profile.pincode || '636016'
  });

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If cart is empty and user arrives here directly, redirect to marketplace
  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-charcoal-900">No items to checkout</h2>
        <p className="text-sm text-charcoal-600">Please add items from the marketplace to proceed.</p>
        <Link to="/marketplace">
          <Button variant="primary">Return to Marketplace</Button>
        </Link>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDeliveryData((prev) => ({ ...prev, [name]: value }));
  };

  const [errorMsg, setErrorMsg] = useState('');

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const paymentName =
        paymentMethod === 'cod'
          ? 'COD'
          : paymentMethod === 'upi'
          ? 'UPI'
          : 'CARD';

      const newOrder = await placeOrder({
        ...deliveryData,
        paymentMethod: paymentName
      });

      navigate('/order-success', { state: { order: newOrder } });
    } catch (err) {
      console.error('Error placing order:', err);
      const serverMsg = err.data?.message || err.response?.data?.message || err.message;
      setErrorMsg(serverMsg || 'Failed to place order. Please check your details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fade-in">
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold animate-fade-in">
          ⚠️ {errorMsg}
        </div>
      )}
      {/* Header */}
      <div>
        <Link
          to="/cart"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-800 hover:text-fresh-600 mb-3 transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Cart</span>
        </Link>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-charcoal-900 tracking-tight">
          Checkout
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-600 mt-1">
          Direct farm-to-consumer order with harvest-fresh dispatch.
        </p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Sections */}
        <div className="lg:col-span-8 space-y-6">
          {/* SECTION 1: Delivery Information */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-soft space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-cream-200">
              <span className="w-6 h-6 rounded-full bg-forest-900 text-cream-50 flex items-center justify-center text-xs font-bold">
                1
              </span>
              <h3 className="font-extrabold text-base text-charcoal-900">
                Delivery Information
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal-800 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={deliveryData.fullName}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-cream-50 border border-cream-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-800 mb-1.5">
                  Phone Number (for delivery coordinator) *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={deliveryData.phone}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-cream-50 border border-cream-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600/30"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-charcoal-800 mb-1.5">
                  Delivery Street Address *
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  value={deliveryData.address}
                  onChange={handleChange}
                  placeholder="House/Flat No., Apartment, Street name"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-cream-50 border border-cream-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-800 mb-1.5">
                  City / District *
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  value={deliveryData.city}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-cream-50 border border-cream-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-800 mb-1.5">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={deliveryData.state}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-xl bg-cream-50 border border-cream-300 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal-800 mb-1.5">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    required
                    value={deliveryData.pincode}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-xl bg-cream-50 border border-cream-300 text-sm focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Order Items Preview */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-soft space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-cream-200">
              <span className="w-6 h-6 rounded-full bg-forest-900 text-cream-50 flex items-center justify-center text-xs font-bold">
                2
              </span>
              <h3 className="font-extrabold text-base text-charcoal-900">
                Order Items ({cart.length})
              </h3>
            </div>

            <div className="divide-y divide-cream-100 text-xs">
              {cart.map((item) => (
                <div key={item.product.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-12 h-12 rounded-xl object-cover border border-cream-200"
                    />
                    <div>
                      <p className="font-bold text-charcoal-900">{item.product.name}</p>
                      <p className="text-charcoal-500 text-[11px]">
                        {item.quantity} {item.product.unit} @ ₹{item.product.price} each • {item.product.farmerName}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-forest-950 text-sm">
                    ₹{item.product.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: Delivery Option */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-soft space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-cream-200">
              <span className="w-6 h-6 rounded-full bg-forest-900 text-cream-50 flex items-center justify-center text-xs font-bold">
                3
              </span>
              <h3 className="font-extrabold text-base text-charcoal-900">
                Delivery Option
              </h3>
            </div>

            <div className="p-4 rounded-2xl border-2 border-forest-600 bg-forest-50/40 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-forest-900 text-cream-50 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-fresh-400" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-forest-950">
                    Direct Farm Standard Delivery
                  </h4>
                  <p className="text-xs text-charcoal-600">
                    Dispatched in breathable eco-boxes • Estimated delivery: <strong>2–3 days</strong>
                  </p>
                </div>
              </div>
              <span className="font-bold text-forest-950 text-sm">₹40</span>
            </div>
          </div>

          {/* SECTION 4: Payment Method UI (Mock) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-soft space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-cream-200">
              <span className="w-6 h-6 rounded-full bg-forest-900 text-cream-50 flex items-center justify-center text-xs font-bold">
                4
              </span>
              <h3 className="font-extrabold text-base text-charcoal-900">
                Payment Method (Mock Selection)
              </h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <label
                className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-forest-600 bg-forest-50/50'
                    : 'border-cream-300 hover:bg-cream-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Banknote className="w-5 h-5 text-forest-700" />
                  <div>
                    <span className="font-bold text-charcoal-900 block text-sm">Cash on Delivery</span>
                    <span className="text-charcoal-500 text-[11px]">Pay directly upon harvest box delivery</span>
                  </div>
                </div>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="accent-forest-700 w-4 h-4 cursor-pointer"
                />
              </label>

              <label
                className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                  paymentMethod === 'upi'
                    ? 'border-forest-600 bg-forest-50/50'
                    : 'border-cream-300 hover:bg-cream-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-forest-700" />
                  <div>
                    <span className="font-bold text-charcoal-900 block text-sm">UPI (Google Pay / PhonePe / Paytm)</span>
                    <span className="text-charcoal-500 text-[11px]">Instant settlement directly to rural farmer bank DBT</span>
                  </div>
                </div>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="upi"
                  checked={paymentMethod === 'upi'}
                  onChange={() => setPaymentMethod('upi')}
                  className="accent-forest-700 w-4 h-4 cursor-pointer"
                />
              </label>

              <label
                className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                  paymentMethod === 'card'
                    ? 'border-forest-600 bg-forest-50/50'
                    : 'border-cream-300 hover:bg-cream-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-forest-700" />
                  <div>
                    <span className="font-bold text-charcoal-900 block text-sm">Credit / Debit Card</span>
                    <span className="text-charcoal-500 text-[11px]">Visa, Mastercard, RuPay</span>
                  </div>
                </div>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  className="accent-forest-700 w-4 h-4 cursor-pointer"
                />
              </label>
            </div>

            <div className="pt-2 flex items-center gap-2 text-[11px] text-charcoal-500">
              <Lock className="w-3.5 h-3.5 text-forest-700" />
              <span>Prototype Mode: No payment credentials are required or processed.</span>
            </div>
          </div>
        </div>

        {/* Right Column: 25. Checkout Summary */}
        <div className="lg:col-span-4 sticky top-28 space-y-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-cream-200/90 shadow-soft space-y-5">
            <h2 className="text-lg font-extrabold text-charcoal-900 pb-3 border-b border-cream-200">
              Order Summary
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center text-charcoal-600">
                <span>Items ({cart.length})</span>
                <span className="font-bold text-charcoal-900">₹{subtotal}</span>
              </div>

              <div className="flex justify-between items-center text-charcoal-600">
                <span>Delivery Charge</span>
                <span className="font-bold text-charcoal-900">₹{deliveryFee}</span>
              </div>

              <div className="pt-3 border-t border-cream-200/80 flex justify-between items-baseline">
                <span className="text-sm font-bold text-charcoal-900">Total</span>
                <span className="text-2xl font-black text-forest-950">₹{total}</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              type="submit"
              disabled={isSubmitting}
              className="w-full justify-center shadow-md font-extrabold py-3.5"
            >
              {isSubmitting ? 'Placing Order...' : `Place Order (₹${total})`}
            </Button>

            {/* Trust Note */}
            <div className="p-3.5 bg-fresh-50 rounded-2xl border border-fresh-200 text-xs text-forest-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-fresh-600" />
                <span>Transparent Farm Sourcing</span>
              </p>
              <p className="text-[11px] text-charcoal-700 leading-snug">
                You're buying directly from the listed farmer.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
