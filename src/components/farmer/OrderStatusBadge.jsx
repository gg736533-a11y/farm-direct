import React from 'react';
import { Clock, CheckCircle2, Package, Truck, Check, XCircle, AlertTriangle } from 'lucide-react';

export default function OrderStatusBadge({ status, className = '' }) {
  const configs = {
    'Pending': {
      bg: 'bg-amber-50 text-amber-800 border-amber-200/80',
      dot: 'bg-amber-500',
      icon: Clock
    },
    'Confirmed': {
      bg: 'bg-blue-50 text-blue-800 border-blue-200/80',
      dot: 'bg-blue-500',
      icon: CheckCircle2
    },
    'Packed': {
      bg: 'bg-purple-50 text-purple-800 border-purple-200/80',
      dot: 'bg-purple-500',
      icon: Package
    },
    'Out for Delivery': {
      bg: 'bg-indigo-50 text-indigo-800 border-indigo-200/80',
      dot: 'bg-indigo-500',
      icon: Truck
    },
    'Delivered': {
      bg: 'bg-fresh-50 text-forest-800 border-fresh-200/80',
      dot: 'bg-fresh-600',
      icon: Check
    },
    'Cancelled': {
      bg: 'bg-rose-50 text-rose-800 border-rose-200/80',
      dot: 'bg-rose-500',
      icon: XCircle
    },
    // Stock statuses
    'Active': {
      bg: 'bg-fresh-50 text-forest-800 border-fresh-200/80',
      dot: 'bg-fresh-600',
      icon: CheckCircle2
    },
    'Low Stock': {
      bg: 'bg-amber-50 text-amber-800 border-amber-200/80',
      dot: 'bg-amber-500',
      icon: AlertTriangle
    },
    'Out of Stock': {
      bg: 'bg-rose-50 text-rose-800 border-rose-200/80',
      dot: 'bg-rose-500',
      icon: XCircle
    },
    'Expiring Soon': {
      bg: 'bg-orange-50 text-orange-800 border-orange-200/80',
      dot: 'bg-orange-500',
      icon: Clock
    }
  };

  const config = configs[status] || {
    bg: 'bg-slate-100 text-slate-800 border-slate-200',
    dot: 'bg-slate-500',
    icon: Clock
  };

  const IconComponent = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <IconComponent className="w-3 h-3 opacity-80" />
      <span>{status}</span>
    </span>
  );
}
