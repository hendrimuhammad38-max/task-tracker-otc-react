import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API } from '../api/apiClient';
import { store } from '../utils/formatters';

const AuthContext = createContext(null);

export const ADMIN_ROLES = ['PENGAWAS', 'ADMIN'];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [masters, setMasters] = useState({ pelatihan: [], alat: [], departemen: [], lokasi: [] });
  const [settings, setSettings] = useState({ targetHarian: 50 });
  const [today, setToday] = useState({ count: 0 });
  const [brand, setBrandState] = useState(() => store.get('tto_brand', { ver: '', logo: '' }) || { ver: '', logo: '' });
  const [loading, setLoading] = useState(true);

  const applyBoot = useCallback((d) => {
    if (!d) return;
    if (d.user) setUser(d.user);
    if (d.masters) setMasters(d.masters);
    if (d.settings) setSettings(d.settings);
    if (d.today) setToday(d.today);
  }, []);

  const loadBranding = useCallback(async (currentBrand) => {
    if (!API.isConfigured()) return;
    try {
      const d = await API.call('getBranding', { ver: currentBrand?.ver || '' });
      if (d.same) return;
      const newB = { ver: d.ver || '', logo: d.logo || '' };
      setBrandState(newB);
      store.set('tto_brand', newB);
    } catch {
      /* abaikan */
    }
  }, []);

  const bootstrap = useCallback(async () => {
    const d = await API.call('bootstrap', {}, { silentAuth: true });
    applyBoot(d);
    store.set('tto_boot', d);
    if ((d.settings?.logoVer || '') !== (brand?.ver || '')) {
      loadBranding(brand);
    }
    return d;
  }, [applyBoot, brand, loadBranding]);

  const setBrand = useCallback((b) => {
    setBrandState(b);
    store.set('tto_brand', b);
  }, []);

  // Inisialisasi awal
  useEffect(() => {
    async function initAuth() {
      const token = store.get('tto_token');
      if (token && API.isConfigured()) {
        API.token = token;
        const boot = store.get('tto_boot');
        if (boot && boot.user) {
          applyBoot(boot);
          API.cache.load(boot.user.id);
          setLoading(false);
          bootstrap().catch((e) => {
            if (e.code === 'AUTH') logout(true);
          });
          return;
        }
        try {
          const d = await bootstrap();
          API.cache.load(d.user.id);
        } catch {
          API.token = null;
          store.del('tto_token');
        }
      }
      setLoading(false);
    }

    const onAuthExpired = () => logout(true);
    window.addEventListener('auth-expired', onAuthExpired);
    initAuth();

    return () => {
      window.removeEventListener('auth-expired', onAuthExpired);
    };
  }, [applyBoot, bootstrap]);

  const login = async (noBadge, password) => {
    const d = await API.call('login', { noBadge, password });
    API.token = d.token;
    store.set('tto_token', d.token);
    const bootData = await bootstrap();
    API.cache.load(bootData.user.id);
    return bootData.user;
  };

  const logout = async (expired = false) => {
    if (!expired) {
      try {
        await API.call('logout', {}, { silentAuth: true });
      } catch {
        /* abaikan */
      }
    }
    API.token = null;
    store.del('tto_token');
    store.del('tto_boot');
    API.cache.clear();
    setUser(null);
  };

  const isAdmin = user && ADMIN_ROLES.includes(user.role);

  return (
    <AuthContext.Provider
      value={{
        user,
        masters,
        settings,
        today,
        brand,
        loading,
        isAdmin,
        login,
        logout,
        bootstrap,
        setBrand,
        applyBoot
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
