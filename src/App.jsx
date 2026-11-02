import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import MarketplacePage from './pages/MarketplacePage';
import ProductDetailPage from './pages/ProductDetailPage';
import FarmerProfilePage from './pages/FarmerProfilePage';
import HowItWorksPage from './pages/HowItWorksPage';
import ForFarmersPage from './pages/ForFarmersPage';
import TraceabilityPage from './pages/TraceabilityPage';
import SmartShoppingPage from './pages/SmartShoppingPage';
import FarmToolsPage from './pages/FarmToolsPage';
import AgricultureAdvisorPage from './pages/AgricultureAdvisorPage';

// Consumer Shopping & Account Pages (Session 3)
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import ConsumerProfilePage from './pages/ConsumerProfilePage';
import FavoritesPage from './pages/FavoritesPage';

// Farmer Portal Layout & Pages (Session 2)
import FarmerDashboardLayout from './components/farmer/FarmerDashboardLayout';
import FarmerDashboardPage from './pages/farmer/FarmerDashboardPage';
import FarmerProductsPage from './pages/farmer/FarmerProductsPage';
import FarmerProductFormPage from './pages/farmer/FarmerProductFormPage';
import FarmerOrdersPage from './pages/farmer/FarmerOrdersPage';
import FarmerProfileSettingsPage from './pages/farmer/FarmerProfileSettingsPage';
import FarmerVerificationPage from './pages/farmer/FarmerVerificationPage';
import FarmerAIAssistantPage from './pages/farmer/FarmerAIAssistantPage';


// State Management Providers
import { ShopProvider } from './context/ShopContext';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';

// Authentication & Authorization Pages (Session 4)
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

// Scroll to top helper on navigation
function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}

export default function App() {
  const location = useLocation();

  // Determine if the current route is within the private farmer management dashboard
  const isFarmerDashboard = [
    '/farmer/dashboard',
    '/farmer/products',
    '/farmer/orders',
    '/farmer/profile',
    '/farmer/verification',
    '/farmer/ai-assistant'
  ].some((prefix) => location.pathname === prefix || location.pathname.startsWith(prefix + '/'));


  return (
    <AuthProvider>
      <ShopProvider>
        <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-charcoal-900 selection:bg-fresh-200 selection:text-forest-950 font-sans">
          <ScrollToTop />

          {/* Render consumer Navbar ONLY for public marketplace routes */}
          {!isFarmerDashboard && <Navbar />}

          {/* Main Content Router */}
          <main className="flex-grow">
            <Routes>
              {/* Public Consumer Marketplace Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/smart-shopping" element={<SmartShoppingPage />} />
              <Route path="/farm-tools" element={<FarmToolsPage />} />
              <Route path="/agriculture-advisor" element={<AgricultureAdvisorPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/trace/:productId" element={<TraceabilityPage />} />
              <Route path="/farmer/:id" element={<FarmerProfilePage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/farmers" element={<ForFarmersPage />} />

              {/* Authentication & Authorization Routes (Session 4) */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />

              {/* Consumer Shopping, Cart, Orders & Account Routes (Session 3) - Protected for Consumer */}
              <Route
                path="/cart"
                element={
                  <ProtectedRoute allowedRole="consumer">
                    <CartPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute allowedRole="consumer">
                    <CheckoutPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/order-success"
                element={
                  <ProtectedRoute allowedRole="consumer">
                    <OrderSuccessPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute allowedRole="consumer">
                    <OrdersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders/:id"
                element={
                  <ProtectedRoute allowedRole="consumer">
                    <OrderDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowedRole="consumer">
                    <ConsumerProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/favorites"
                element={
                  <ProtectedRoute allowedRole="consumer">
                    <FavoritesPage />
                  </ProtectedRoute>
                }
              />

              {/* Private Farmer SaaS Dashboard Routes (Session 2 & Session 4 Role Protection) */}
              <Route
                element={
                  <ProtectedRoute allowedRole="farmer">
                    <FarmerDashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/farmer/dashboard" element={<FarmerDashboardPage />} />
                <Route path="/farmer/products" element={<FarmerProductsPage />} />
                <Route path="/farmer/products/new" element={<FarmerProductFormPage isEdit={false} />} />
                <Route path="/farmer/products/:id/edit" element={<FarmerProductFormPage isEdit={true} />} />
                <Route path="/farmer/orders" element={<FarmerOrdersPage />} />
                <Route path="/farmer/ai-assistant" element={<FarmerAIAssistantPage />} />
                <Route path="/farmer/profile" element={<FarmerProfileSettingsPage />} />
                <Route path="/farmer/verification" element={<FarmerVerificationPage />} />
              </Route>


              {/* Convenient /farmer shortcut redirect */}
              <Route path="/farmer" element={<Navigate to="/farmer/dashboard" replace />} />

              {/* Fallback route */}
              <Route path="*" element={<HomePage />} />
            </Routes>
          </main>

          {/* Render consumer Footer ONLY for public marketplace routes */}
          {!isFarmerDashboard && <Footer />}
        </div>
      </ShopProvider>
    </AuthProvider>
  );
}
