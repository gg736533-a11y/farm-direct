import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../auth/AuthContext';
import ordersApi from '../api/orders';
import favoritesApi from '../api/favorites';

export const ShopContext = createContext(null);

export function ShopProvider({ children }) {
  const { user } = useAuth();
  const isConsumer = user?.role === 'CONSUMER' || user?.role === 'consumer';

  // 1. Cart State (Persisted in localStorage with real products)
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('farmdirect_cart');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading cart from localStorage:', e);
    }
    return [];
  });

  // 2. Favorites State (Real PostgreSQL-backed for Consumers)
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('farmdirect_favorites');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  // 3. Orders State (Real PostgreSQL-backed)
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // 4. Consumer Profile State
  const [profile, setProfile] = useState(() => {
    return {
      fullName: user?.name || 'Arun Kumar',
      email: user?.email || 'arun@example.com',
      phone: user?.phone || '+91 98402 12345',
      address: user?.consumerProfile?.location || 'Flat 402, Green Meadows, Fairlands',
      city: 'Salem',
      state: 'Tamil Nadu',
      pincode: '636016'
    };
  });

  // Update profile when auth user changes
  useEffect(() => {
    if (user) {
      setProfile((prev) => ({
        ...prev,
        fullName: user.name || prev.fullName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        address: user.consumerProfile?.location || prev.address
      }));
    }
  }, [user]);

  // Persist cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('farmdirect_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Persist favorites to localStorage as local fallback
  useEffect(() => {
    try {
      localStorage.setItem('farmdirect_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.error(e);
    }
  }, [favorites]);

  // Fetch real favorites from PostgreSQL when consumer is logged in
  const fetchFavorites = useCallback(async () => {
    if (!isConsumer) return;
    try {
      setLoadingFavorites(true);
      const res = await favoritesApi.getFavorites();
      if (res?.data?.favorites) {
        setFavorites(res.data.favorites);
        setFavoriteProducts(res.data.products || []);
      }
    } catch (err) {
      console.warn('Could not load favorites from API:', err.message);
    } finally {
      setLoadingFavorites(false);
    }
  }, [isConsumer]);

  // Fetch real consumer orders from PostgreSQL
  const fetchOrders = useCallback(async () => {
    if (!isConsumer) return;
    try {
      setLoadingOrders(true);
      const res = await ordersApi.getConsumerOrders();
      const orderList = res?.data?.orders || res?.data?.data?.orders || (Array.isArray(res?.data) ? res.data : []);
      setOrders(orderList);
    } catch (err) {
      console.warn('Could not load orders from API:', err.message);
    } finally {
      setLoadingOrders(false);
    }
  }, [isConsumer]);

  useEffect(() => {
    if (isConsumer) {
      fetchFavorites();
      fetchOrders();
    } else {
      setOrders([]);
    }
  }, [isConsumer, fetchFavorites, fetchOrders]);

  // Cart Operations
  const addToCart = (product, quantity = 1) => {
    if (!product) return;

    // Normalize product fields
    const normalizedProduct = {
      ...product,
      id: product.id,
      name: product.name,
      price: Number(product.price) || 0,
      unit: product.unit || 'kg',
      image: product.imageUrl || product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
      farmerName: product.farmer?.farmName || product.farmerName || 'Verified Farm',
      farmerId: product.farmerId || product.farmer?.id || '',
      availableQuantity: product.availableQuantity !== undefined ? product.availableQuantity : (product.stock !== undefined ? product.stock : 999),
      harvestFreshness: product.harvestFreshness || 'Farm Fresh Batch'
    };

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === normalizedProduct.id);
      const currentQty = existing ? existing.quantity : 0;
      const maxAvailable = normalizedProduct.availableQuantity;

      // Prevent exceeding available stock
      const newQty = Math.min(currentQty + quantity, maxAvailable);

      if (existing) {
        return prev.map((item) =>
          item.product.id === normalizedProduct.id
            ? { ...item, quantity: newQty, product: normalizedProduct }
            : item
        );
      }
      return [...prev, { product: normalizedProduct, quantity: Math.max(1, newQty) }];
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const maxAvailable = item.product.availableQuantity ?? 999;
          const safeQty = Math.min(quantity, maxAvailable);
          return { ...item, quantity: safeQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Cart Calculations
  const subtotal = cart.reduce(
    (acc, item) => acc + (Number(item.product.price) || 0) * item.quantity,
    0
  );
  const deliveryFee = cart.length > 0 ? 40 : 0;
  const total = subtotal + deliveryFee;
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Favorites Operations
  const toggleFavorite = async (productId) => {
    const isFav = favorites.includes(productId);

    // Optimistic UI update
    setFavorites((prev) =>
      isFav ? prev.filter((id) => id !== productId) : [...prev, productId]
    );

    // If consumer is authenticated, persist to PostgreSQL
    if (isConsumer) {
      try {
        if (isFav) {
          await favoritesApi.removeFavorite(productId);
        } else {
          await favoritesApi.addFavorite(productId);
        }
        fetchFavorites();
      } catch (err) {
        console.error('Error toggling favorite on server:', err);
        // Rollback on error
        fetchFavorites();
      }
    }
  };

  const isFavorite = (productId) => favorites.includes(productId);

  // Real Orders Operations (calling PostgreSQL backend)
  const placeOrder = async (orderData) => {
    if (cart.length === 0) {
      throw new Error('Your cart is empty.');
    }

    let pm = 'COD';
    if (typeof orderData.paymentMethod === 'string') {
      const pmu = orderData.paymentMethod.toUpperCase();
      if (pmu.includes('UPI')) pm = 'UPI';
      else if (pmu.includes('CARD')) pm = 'CARD';
      else pm = 'COD';
    }

    const payload = {
      items: cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity
      })),
      deliveryAddress: {
        fullName: orderData.fullName || profile.fullName,
        phone: orderData.phone || profile.phone,
        address: orderData.address || profile.address,
        city: orderData.city || profile.city,
        state: orderData.state || profile.state || 'Tamil Nadu',
        pincode: orderData.pincode || profile.pincode
      },
      paymentMethod: pm
    };

    const res = await ordersApi.createOrder(payload);
    const createdOrder = res?.data?.order || res?.data?.data?.order || res?.order || res?.data || res;

    // Update local state
    if (createdOrder) {
      setOrders((prev) => [createdOrder, ...prev.filter((o) => (o.id !== createdOrder.id && o.rawId !== createdOrder.rawId))]);
    }
    clearCart();

    return createdOrder;
  };

  const getOrderById = (orderId) => {
    if (!orderId) return null;
    const cleanId = orderId.replace('#', '').toLowerCase();
    return orders.find(
      (o) =>
        o.id?.toLowerCase() === orderId.toLowerCase() ||
        o.id?.replace('#', '').toLowerCase() === cleanId ||
        o.rawId?.toLowerCase() === cleanId
    );
  };

  const updateProfile = (updatedData) => {
    setProfile((prev) => ({ ...prev, ...updatedData }));
  };

  return (
    <ShopContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        subtotal,
        deliveryFee,
        total,
        cartCount,
        favorites,
        favoriteProducts,
        toggleFavorite,
        isFavorite,
        loadingFavorites,
        orders,
        loadingOrders,
        fetchOrders,
        placeOrder,
        getOrderById,
        profile,
        updateProfile
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
}
