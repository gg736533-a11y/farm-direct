import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, ShieldCheck, ShoppingBag, Truck, ArrowLeft } from 'lucide-react';
import QuantitySelector from '../components/QuantitySelector';
import EmptyState from '../components/EmptyState';
import Button from '../components/Button';
import { useShop } from '../context/ShopContext';

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, subtotal, deliveryFee, total, clearCart } = useShop();

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 animate-fade-in">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Discover fresh products directly from local farmers with verified harvest provenance."
          buttonText="Explore Marketplace"
          buttonLink="/marketplace"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fade-in">
      {/* Header & Back Link */}
      <div>
        <Link
          to="/marketplace"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-800 hover:text-fresh-600 mb-3 transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Continue Shopping</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-cream-200">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-charcoal-900 tracking-tight">
              Your Cart
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-600 mt-1">
              Direct farm shipments prepared fresh upon order placement.
            </p>
          </div>

          <button
            type="button"
            onClick={clearCart}
            className="text-xs font-bold text-charcoal-500 hover:text-rose-600 underline self-start sm:self-auto"
          >
            Clear Cart
          </button>
        </div>
      </div>

      {/* Two Column Layout: Cart Items on Left, Order Summary on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-3xl border border-cream-200 shadow-soft overflow-hidden divide-y divide-cream-100">
            {cart.map((item) => {
              const itemTotal = (item.product.price || 0) * item.quantity;

              return (
                <div
                  key={item.product.id}
                  className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-cream-50/40 transition-colors"
                >
                  {/* Thumbnail & Title */}
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-cream-200 flex-shrink-0"
                    />

                    <div className="min-w-0 flex-1 space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-forest-800 bg-forest-50 px-2 py-0.5 rounded border border-forest-100">
                        {item.product.farmerName || 'Verified Farm'}
                      </span>

                      <h3 className="font-extrabold text-base text-charcoal-900 truncate">
                        <Link to={`/product/${item.product.id}`} className="hover:text-forest-900">
                          {item.product.name}
                        </Link>
                      </h3>

                      <p className="text-xs text-charcoal-600">
                        ₹{item.product.price} / {item.product.unit}
                      </p>

                      <p className="text-[11px] text-fresh-700 font-medium">
                        ✓ {item.product.harvestFreshness || 'Freshly Harvested'}
                      </p>
                    </div>
                  </div>

                  {/* Quantity & Subtotal */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-cream-100">
                    <QuantitySelector
                      quantity={item.quantity}
                      onChange={(newQty) => updateQuantity(item.product.id, newQty)}
                      size="sm"
                    />

                    <div className="text-right min-w-[70px]">
                      <span className="text-[10px] text-charcoal-400 block sm:hidden uppercase font-bold">Subtotal</span>
                      <span className="font-black text-base text-forest-950">
                        ₹{itemTotal}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-2 text-charcoal-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                      title="Remove item"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Direct Farm Trust Promise */}
          <div className="p-4 bg-cream-100/70 rounded-2xl border border-cream-200/80 flex items-center gap-3 text-xs text-charcoal-700">
            <Truck className="w-5 h-5 text-forest-700 flex-shrink-0" />
            <p>
              Harvested upon confirmation and dispatched directly from Salem district farms in eco-insulated breathable boxes.
            </p>
          </div>
        </div>

        {/* Right Column: 22. Order Summary Card */}
        <div className="lg:col-span-4 sticky top-28 space-y-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-cream-200/90 shadow-soft space-y-5">
            <h2 className="text-lg font-extrabold text-charcoal-900 pb-3 border-b border-cream-200">
              Order Summary
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center text-charcoal-600">
                <span>Subtotal</span>
                <span className="font-bold text-charcoal-900 text-sm">₹{subtotal}</span>
              </div>

              <div className="flex justify-between items-center text-charcoal-600">
                <span>Delivery</span>
                <span className="font-bold text-charcoal-900 text-sm">₹{deliveryFee}</span>
              </div>

              <div className="pt-3 border-t border-cream-200/80 flex justify-between items-baseline">
                <span className="text-sm font-bold text-charcoal-900">Total</span>
                <div className="text-right">
                  <span className="text-2xl font-black text-forest-950">₹{total}</span>
                  <span className="text-[10px] text-charcoal-500 block">Inclusive of all farm charges</span>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/checkout')}
              className="w-full justify-center shadow-md font-extrabold py-3.5"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>

            <p className="text-[11px] text-center text-charcoal-500 leading-normal">
              Final delivery charges may vary based on exact rural delivery distance.
            </p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-cream-200 text-xs text-charcoal-600 space-y-1">
            <span className="font-bold text-forest-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-fresh-600" />
              <span>100% Direct Farmer Remuneration</span>
            </span>
            <p className="text-[11px]">
              No intermediate distribution commissions. Farmers receive 100% of the produce value.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
