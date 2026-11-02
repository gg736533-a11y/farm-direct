import React, { createContext, useContext, useState, useEffect } from 'react';
import authApi from '../api/auth';
import { DEMO_CONSUMER, DEMO_FARMER } from './demoUsers';

const AuthContext = createContext(null);

/**
 * Normalizes backend user structure so frontend components can access
 * fields like user.role ('consumer' | 'farmer'), user.farmName, user.verified seamlessly.
 */
function normalizeUser(rawUser) {
  if (!rawUser) return null;

  const role = rawUser.role ? rawUser.role.toLowerCase() : 'consumer';

  return {
    ...rawUser,
    role, // normalized to lowercase ('consumer' | 'farmer')
    phone: rawUser.phone || '',
    farmName: rawUser.farmerProfile?.farmName || rawUser.farmName || '',
    verified: rawUser.farmerProfile?.verified ?? rawUser.verified ?? false,
    verificationStatus: rawUser.farmerProfile?.verificationStatus || rawUser.verificationStatus || 'PENDING',
    location: rawUser.farmerProfile?.location || rawUser.consumerProfile?.location || rawUser.location || '',
    description: rawUser.farmerProfile?.description || '',
    farmAcreage: rawUser.farmerProfile?.farmAcreage ?? null,
    farmerProfile: rawUser.farmerProfile || null,
    consumerProfile: rawUser.consumerProfile || null
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const response = await authApi.getMe();
      if (response?.data?.user) {
        const normalized = normalizeUser(response.data.user);
        setUser(normalized);
        return normalized;
      }
    } catch {
      // ignore
    }
    return null;
  };

  // Restore authenticated session from backend via HTTP-only cookie on mount
  useEffect(() => {
    async function restoreSession() {
      try {
        const response = await authApi.getMe();
        if (response?.data?.user) {
          setUser(normalizeUser(response.data.user));
        } else {
          setUser(null);
        }
      } catch (err) {
        // 401 is expected if not logged in
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, []);

  /**
   * Real backend login via POST /api/auth/login
   */
  const login = async ({ email, password }) => {
    try {
      const response = await authApi.login({
        email: email.trim(),
        password
      });

      if (response?.data?.user) {
        const safeUser = normalizeUser(response.data.user);
        setUser(safeUser);
        return { success: true, user: safeUser };
      }

      return { success: false, error: 'Login failed. Please check your credentials.' };
    } catch (err) {
      return {
        success: false,
        error: err.message || 'Invalid email or password.'
      };
    }
  };

  /**
   * Real backend authentication using seeded demo credentials
   */
  const loginAsDemo = async (role) => {
    const creds = role === 'farmer' ? DEMO_FARMER : DEMO_CONSUMER;
    return login({ email: creds.email, password: creds.password });
  };

  /**
   * Real backend registration via POST /api/auth/register
   */
  const register = async (formData) => {
    try {
      const response = await authApi.register({
        role: formData.role.toUpperCase(),
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        location: formData.location,
        farmName: formData.farmName,
        farmLocation: formData.farmLocation,
        farmDescription: formData.farmDescription,
        farmAcreage: formData.farmAcreage
      });

      if (response?.data?.user) {
        const safeUser = normalizeUser(response.data.user);
        setUser(safeUser);
        return { success: true, user: safeUser };
      }

      return { success: false, error: 'Registration failed.' };
    } catch (err) {
      return {
        success: false,
        error: err.message || 'Failed to create account.'
      };
    }
  };

  /**
   * Real backend logout via POST /api/auth/logout (clears HTTP-only cookie)
   */
  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.warn('Logout API call encountered an error:', err);
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    loginAsDemo,
    register,
    logout,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
