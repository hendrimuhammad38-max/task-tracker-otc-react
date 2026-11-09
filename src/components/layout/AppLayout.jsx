import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { BottomNav } from './BottomNav';
import { MobileDrawer } from './MobileDrawer';
import { Modal } from '../common/Modal';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export function AppLayout() {
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const handleConfirmLogout = async () => {
    setLoggingOut(true);
    try {
      await logout(false);
      setLogoutModalOpen(false);
      navigate('/login');
      toast?.info('Anda telah keluar dari sesi.', 'Keluar');
    } catch {
      setLogoutModalOpen(false);
      navigate('/login');
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="app">
      <Sidebar onLogoutClick={() => setLogoutModalOpen(true)} />

      <div className="main">
        <Topbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        <main id="page" className="page" tabIndex={-1}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              style={{ width: '100%' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <BottomNav onOpenMenu={() => setMobileMenuOpen(true)} />

      {/* Slide-over Mobile Drawer khusus HP */}
      <MobileDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onLogoutClick={() => setLogoutModalOpen(true)}
      />

      {/* Modal Konfirmasi Logout */}
      <Modal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        title="Keluar dari aplikasi?"
        icon={LogOut}
        iconClass="warn"
        footer={
          <>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setLogoutModalOpen(false)}
              disabled={loggingOut}
            >
              Batal
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleConfirmLogout}
              disabled={loggingOut}
            >
              {loggingOut ? 'Memproses…' : 'Keluar'}
            </button>
          </>
        }
      >
        <p className="muted">
          Anda perlu masuk kembali dengan No. Badge dan kata sandi untuk mengakses akun.
        </p>
      </Modal>
    </div>
  );
}
