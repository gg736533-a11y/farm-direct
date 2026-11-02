import React from 'react';
import { X, CheckCircle2, Clock, MapPin, Phone, User, Package, Calendar, ArrowRight } from 'lucide-react';
import OrderStatusBadge from './OrderStatusBadge';

export default function OrderDetailModal({ order, isOpen, onClose, onUpdateStatus }) {
  if (!isOpen || !order) return null;

  const timelineSteps = [
    'Order Placed',
    'Confirmed',
    'Packed',
    'Out for Delivery',
    'Delivered'
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'Pending': return 0;
      case 'Confirmed': return 1;
      case 'Packed': return 2;
      case 'Out for Delivery': return 3;
      case 'Delivered': return 4;
      default: return 0;
    }
  };

  const currentStepIdx = getStepIndex(order.status);
  const isCancelled = order.status === 'Cancelled';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-elevated border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-slate-900">
                Order {order.id}
              </span>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Placed on {order.date} at {order.time || '10:00 AM'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1 text-xs">
          {/* Visual Order Timeline */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
              Dispatch & Delivery Progress
            </h4>

            {isCancelled ? (
              <div className="p-3 bg-rose-50 text-rose-800 rounded-xl border border-rose-200 text-center font-bold">
                Order was cancelled by customer. Stock restored to inventory.
              </div>
            ) : (
              <div className="relative">
                {/* Horizontal Progress Bar on tablet/desktop */}
                <div className="hidden sm:flex items-center justify-between relative">
                  {/* Connecting Line */}
                  <div className="absolute top-3.5 left-6 right-6 h-0.5 bg-slate-200 -z-0">
                    <div
                      className="h-full bg-emerald-600 transition-all duration-300"
                      style={{
                        width: `${(currentStepIdx / (timelineSteps.length - 1)) * 100}%`
                      }}
                    />
                  </div>

                  {timelineSteps.map((step, idx) => {
                    const isDone = idx <= currentStepIdx;
                    const isCurrent = idx === currentStepIdx;

                    return (
                      <div key={step} className="flex flex-col items-center relative z-10">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                            isDone
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-white border-2 border-slate-300 text-slate-400'
                          }`}
                        >
                          {isDone ? '✓' : idx + 1}
                        </div>
                        <span
                          className={`mt-1.5 text-[10px] text-center max-w-[70px] leading-tight font-medium ${
                            isCurrent
                              ? 'font-bold text-emerald-800'
                              : isDone
                              ? 'text-slate-700'
                              : 'text-slate-400'
                          }`}
                        >
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Vertical Timeline on mobile */}
                <div className="sm:hidden space-y-3">
                  {timelineSteps.map((step, idx) => {
                    const isDone = idx <= currentStepIdx;
                    const isCurrent = idx === currentStepIdx;

                    return (
                      <div key={step} className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                            isDone
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white border border-slate-300 text-slate-400'
                          }`}
                        >
                          {isDone ? '✓' : idx + 1}
                        </div>
                        <span
                          className={`text-xs ${
                            isCurrent
                              ? 'font-bold text-emerald-800'
                              : isDone
                              ? 'text-slate-800'
                              : 'text-slate-400'
                          }`}
                        >
                          {step}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded ml-auto">
                            Current
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Customer & Delivery Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Customer Details
              </span>
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <User className="w-4 h-4 text-emerald-600" />
                <span>{order.customer}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{order.phone || '+91 98840 12345'}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Delivery Destination
              </span>
              <div className="flex items-start gap-2 text-slate-700 leading-relaxed">
                <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>{order.address || 'Fairlands, Salem - 636016'}</span>
              </div>
            </div>
          </div>

          {/* Ordered Items List */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Ordered Products
            </span>
            <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
              {(order.items || [
                { name: order.productsSummary || 'Organic Country Produce', quantity: '1 unit', pricePerUnit: order.numericAmount || 180, total: order.numericAmount || 180 }
              ]).map((item, idx) => (
                <div key={idx} className="p-3 bg-white flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">{item.name}</p>
                    <p className="text-slate-500 text-[11px]">
                      Quantity: {item.quantity} @ ₹{item.pricePerUnit} each
                    </p>
                  </div>
                  <span className="font-bold text-slate-900 text-sm">
                    ₹{item.total}
                  </span>
                </div>
              ))}
              <div className="p-3 bg-slate-50 flex items-center justify-between font-bold text-sm">
                <span>Total Settled to Farmer</span>
                <span className="text-forest-900 text-base">{order.amount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
          >
            Print Packing Slip
          </button>

          {!isCancelled && order.status !== 'Delivered' && (
            <div className="flex items-center gap-2">
              <select
                id="order-status-select"
                aria-label="Select next order status"
                value={
                  order.status === 'Pending' ? 'CONFIRMED' :
                  order.status === 'Confirmed' ? 'PACKED' :
                  order.status === 'Packed' ? 'SHIPPED' :
                  order.status === 'Out for Delivery' ? 'DELIVERED' : 'CONFIRMED'
                }
                onChange={(e) => onUpdateStatus?.(order.rawId || order.id, e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="CONFIRMED">Mark Confirmed</option>
                <option value="PACKED">Mark Packed</option>
                <option value="SHIPPED">Mark Out for Delivery</option>
                <option value="DELIVERED">Mark Delivered</option>
                <option value="CANCELLED">Cancel Order</option>
              </select>

              <button
                type="button"
                onClick={() => {
                  const nextStatus =
                    order.status === 'Pending' ? 'CONFIRMED' :
                    order.status === 'Confirmed' ? 'PACKED' :
                    order.status === 'Packed' ? 'SHIPPED' :
                    order.status === 'Out for Delivery' ? 'DELIVERED' : null;
                  if (nextStatus) {
                    onUpdateStatus?.(order.rawId || order.id, nextStatus);
                  }
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-forest-900 hover:bg-forest-800 rounded-xl shadow-xs transition-colors"
              >
                Advance to Next Step
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

