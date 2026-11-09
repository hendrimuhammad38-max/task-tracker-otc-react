import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  LayoutDashboard,
  FilePlus2,
  ListChecks,
  ClipboardPen,
  Users,
  Database,
  History,
  Settings,
  LogOut,
  Target,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { initials, roleLabel } from '../../utils/formatters';
import { BrandLogo } from '../common/BrandLogo';

export function MobileDrawer({ isOpen, onClose, onLogoutClick }) {
  const { user, isAdmin, today, settings } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const target = settings?.targetHarian || 50;
  const n = today?.count || 0;
  const pct = Math.min(100, Math.round((n / target) * 100));

  const handleNav = (path) => {
    onClose();
    navigate(path);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="modal-backdrop"
          style={{ zIndex: 9999, justifyContent: 'flex-start', padding: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="mobile-drawer"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '84%',
              maxWidth: '320px',
              height: '100%',
              background: 'var(--surface)',
              borderRight: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--sh-lg)',
              overflowY: 'auto'
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: '18px 16px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--surface-2)'
              }}
            >
              <div className="row" style={{ gap: '10px' }}>
                <BrandLogo size="sm" />
                <div>
                  <b style={{ fontSize: '15px', display: 'block' }}>Task Tracker</b>
                  <span className="tiny muted">OTC v1.3 • Mobile Menu</span>
                </div>
              </div>
              <button
                type="button"
                className="btn-icon sm"
                onClick={onClose}
                aria-label="Tutup Menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Profile Bar */}
            <div
              style={{
                padding: '16px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <div className="sb-avatar" style={{ width: 42, height: 42, fontSize: 16 }}>
                {initials(user?.nama)}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <b className="truncate" style={{ display: 'block', fontSize: '14px' }}>
                  {user?.nama}
                </b>
                <span className="tiny muted" style={{ display: 'block' }}>
                  {roleLabel(user?.role)}
                </span>
                <span className="pill pill-mono" style={{ fontSize: '11px', padding: '1px 6px' }}>
                  {user?.badge}
                </span>
              </div>
            </div>

            {/* Drawer Links */}
            <nav style={{ padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
              <button
                type="button"
                className="sb-link"
                style={{ width: '100%', textAlign: 'left', border: 'none', background: 'transparent' }}
                onClick={() => handleNav('/dashboard')}
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </button>

              <button
                type="button"
                className="sb-link"
                style={{ width: '100%', textAlign: 'left', border: 'none', background: 'transparent' }}
                onClick={() => handleNav('/laporan')}
              >
                <ListChecks size={18} />
                <span>Daftar Laporan OTC</span>
              </button>

              <button
                type="button"
                className="sb-link"
                style={{ width: '100%', textAlign: 'left', border: 'none', background: 'transparent' }}
                onClick={() => handleNav('/laporan-baru')}
              >
                <FilePlus2 size={18} />
                <span>+ Input Laporan Baru</span>
              </button>

              {isAdmin && (
                <>
                  <div className="sb-section" style={{ marginTop: '12px' }}>
                    Admin &amp; Pengawas
                  </div>

                  {/* MENU UTAMA YANG DICARI USER: LAPOR SUPERINTENDENT */}
                  <button
                    type="button"
                    className="sb-link"
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      border: '1px solid rgba(23, 112, 122, 0.3)',
                      background: 'rgba(23, 112, 122, 0.08)',
                      borderRadius: '12px',
                      fontWeight: 700
                    }}
                    onClick={() => handleNav('/pengawas')}
                  >
                    <ClipboardPen size={18} color="var(--primary)" />
                    <span style={{ color: 'var(--primary)', flex: 1 }}>
                      Lapor Superintendent
                    </span>
                    <span className="pill pill-ok" style={{ fontSize: '10px', padding: '1px 5px' }}>
                      v1.3
                    </span>
                  </button>

                  <button
                    type="button"
                    className="sb-link"
                    style={{ width: '100%', textAlign: 'left', border: 'none', background: 'transparent' }}
                    onClick={() => handleNav('/pengguna')}
                  >
                    <Users size={18} />
                    <span>Kelola Pengguna</span>
                  </button>

                  <button
                    type="button"
                    className="sb-link"
                    style={{ width: '100%', textAlign: 'left', border: 'none', background: 'transparent' }}
                    onClick={() => handleNav('/master')}
                  >
                    <Database size={18} />
                    <span>Data Master</span>
                  </button>

                  <button
                    type="button"
                    className="sb-link"
                    style={{ width: '100%', textAlign: 'left', border: 'none', background: 'transparent' }}
                    onClick={() => handleNav('/log')}
                  >
                    <History size={18} />
                    <span>Log Aktivitas</span>
                  </button>
                </>
              )}

              <div className="sb-section" style={{ marginTop: '12px' }}>
                Akun &amp; Sistem
              </div>

              <button
                type="button"
                className="sb-link"
                style={{ width: '100%', textAlign: 'left', border: 'none', background: 'transparent' }}
                onClick={() => handleNav('/profil')}
              >
                <Settings size={18} />
                <span>Pengaturan &amp; Profil</span>
              </button>

              <button
                type="button"
                className="sb-link"
                style={{ width: '100%', textAlign: 'left', border: 'none', background: 'transparent' }}
                onClick={toggleTheme}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                <span>Tema: {theme === 'dark' ? 'Mode Gelap' : 'Mode Terang'}</span>
              </button>

              <button
                type="button"
                className="sb-link"
                style={{ width: '100%', textAlign: 'left', border: 'none', background: 'transparent', color: 'var(--bad)' }}
                onClick={() => {
                  onClose();
                  onLogoutClick();
                }}
              >
                <LogOut size={18} />
                <span>Keluar Akun</span>
              </button>
            </nav>

            {/* Target Progress Bar */}
            <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border)', background: 'var(--surface-2)' }}>
              <div className="row" style={{ justifyContent: 'space-between', fontSize: '12px', fontWeight: 700 }}>
                <span className="row" style={{ gap: 6 }}>
                  <Target size={14} /> Target Hari Ini
                </span>
                <span>{pct}%</span>
              </div>
              <div className="progress mt-1">
                <span style={{ width: `${pct}%` }} />
              </div>
              <div className="tiny muted mt-1">
                <b>{n}</b> dari {target} laporan tercapai
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
