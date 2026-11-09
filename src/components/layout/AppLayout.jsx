import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { BottomNav } from './BottomNav';
import { Modal } from '../common/Modal';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export function AppLayout() {
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
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
        <Topbar />
        <main id="page" className="page" tabIndex={-1}>
          <Outlet />
        </main>
      </div>

      <BottomNav />

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
