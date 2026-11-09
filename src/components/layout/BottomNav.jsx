import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ClipboardList,
  Plus,
  FolderCheck,
  ClipboardPen,
  CircleUserRound,
  FilePlus2,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function BottomNav({ onOpenMenu }) {
  const { isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [fabMenuOpen, setFabMenuOpen] = useState(false);

  const isMineActive =
    location.pathname === '/laporan' &&
    new URLSearchParams(location.search).get('mine') === '1';

  const handleFabClick = (e) => {
    if (isAdmin) {
      e.preventDefault();
      setFabMenuOpen(!fabMenuOpen);
    } else {
      navigate('/laporan-baru');
    }
  };

  return (
    <>
      <nav className="bottom-nav" id="bottom-nav" aria-label="Navigasi bawah">
        {/* 1. Dashboard */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `bn-item ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        {/* 2. Daftar Laporan OTC */}
        <NavLink
          to="/laporan"
          end
          className={({ isActive }) => `bn-item ${isActive && !isMineActive ? 'active' : ''}`}
        >
          <ClipboardList size={20} />
          <span>Laporan</span>
        </NavLink>

        {/* 3. Tombol Tengah FAB (+) */}
        <button
          type="button"
          className="bn-item bn-plus"
          onClick={handleFabClick}
          aria-label="Input Laporan Baru"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          <motion.span
            className="bn-fab"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            animate={{ rotate: fabMenuOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Plus size={22} />
          </motion.span>
          <span>Input</span>
        </button>

        {/* 4. SUPERINTENDENT (KHUSUS ADMIN/PENGAWAS) ATAU MILIK SAYA (TRAINER) */}
        {isAdmin ? (
          <NavLink
            to="/pengawas"
            className={({ isActive }) => `bn-item ${isActive ? 'active' : ''}`}
            title="Laporan ke Superintendent"
          >
            <ClipboardPen size={20} />
            <span>Superintendent</span>
          </NavLink>
        ) : (
          <NavLink
            to="/laporan?mine=1"
            className={`bn-item ${isMineActive ? 'active' : ''}`}
          >
            <FolderCheck size={20} />
            <span>Milik Saya</span>
          </NavLink>
        )}

        {/* 5. Profil & Menu */}
        <NavLink
          to="/profil"
          className={({ isActive }) => `bn-item ${isActive ? 'active' : ''}`}
        >
          <CircleUserRound size={20} />
          <span>Profil</span>
        </NavLink>
      </nav>

      {/* FAB Quick Action Sheet untuk Pengawas di Layar HP */}
      <AnimatePresence>
        {fabMenuOpen && (
          <div
            className="modal-backdrop"
            style={{ zIndex: 9998, alignItems: 'flex-end', paddingBottom: '75px' }}
            onClick={() => setFabMenuOpen(false)}
          >
            <motion.div
              className="glass-card"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '90%',
                maxWidth: '340px',
                borderRadius: '20px',
                padding: '16px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--sh-lg)'
              }}
            >
              <div className="row" style={{ justifyContent: 'space-between', marginBottom: '12px' }}>
                <b style={{ fontSize: '14px' }}>Pilih Jenis Laporan:</b>
                <button
                  type="button"
                  className="btn-icon sm"
                  onClick={() => setFabMenuOpen(false)}
                >
                  <X size={15} />
                </button>
              </div>

              <div className="stack" style={{ gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-primary btn-block"
                  style={{ justifyContent: 'flex-start', padding: '12px 14px', borderRadius: '12px' }}
                  onClick={() => {
                    setFabMenuOpen(false);
                    navigate('/laporan-baru');
                  }}
                >
                  <FilePlus2 size={18} />
                  <div style={{ textAlign: 'left', marginLeft: '8px' }}>
                    <b>Laporan Pelatihan OTC</b>
                    <div className="tiny" style={{ opacity: 0.85 }}>Teori kelas &amp; praktik lapangan</div>
                  </div>
                </button>

                <button
                  type="button"
                  className="btn btn-ghost btn-block"
                  style={{
                    justifyContent: 'flex-start',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: '1px solid var(--primary)',
                    color: 'var(--primary)',
                    background: 'var(--primary-50)'
                  }}
                  onClick={() => {
                    setFabMenuOpen(false);
                    navigate('/pengawas/baru');
                  }}
                >
                  <ClipboardPen size={18} />
                  <div style={{ textAlign: 'left', marginLeft: '8px' }}>
                    <b>Lapor ke Superintendent</b>
                    <div className="tiny muted">Penugasan trainer harian pengawas</div>
                  </div>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
