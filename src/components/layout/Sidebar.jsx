import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FilePlus2,
  ListChecks,
  ClipboardPen,
  Users,
  Database,
  History,
  Settings,
  LogOut,
  Target
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { initials, roleLabel } from '../../utils/formatters';
import { BrandLogo } from '../common/BrandLogo';

export function Sidebar({ onLogoutClick }) {
  const { user, isAdmin, today, settings } = useAuth();
  const navigate = useNavigate();

  const target = settings?.targetHarian || 50;
  const n = today?.count || 0;
  const pct = Math.min(100, Math.round((n / target) * 100));

  const mainItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/laporan-baru', label: 'Laporan Baru', icon: FilePlus2, plus: true },
    { path: '/laporan', label: 'Daftar Laporan', icon: ListChecks }
  ];

  const adminItems = [
    { path: '/pengawas', label: 'Lapor Superintendent', icon: ClipboardPen },
    { path: '/pengguna', label: 'Kelola Pengguna', icon: Users },
    { path: '/master', label: 'Data Master', icon: Database },
    { path: '/log', label: 'Log Aktivitas', icon: History }
  ];

  return (
    <aside className="sidebar" id="sidebar" aria-label="Navigasi utama">
      <div className="sb-brand">
        <BrandLogo size="sm" />
        <b>Task Tracker</b>
        <span className="sb-ver">OTC v1.3</span>
      </div>

      <div className="sb-profile">
        <div className="sb-avatar">{initials(user?.nama)}</div>
        <b>Hi, {user?.nama?.split(' ').slice(0, 2).join(' ')}!</b>
        <small>{roleLabel(user?.role)}</small>
        <span className="sb-id">{user?.badge}</span>
      </div>

      <nav className="sb-nav">
        {mainItems.map((it) => {
          const Icon = it.icon;
          return (
            <NavLink
              key={it.path}
              to={it.path}
              className={({ isActive }) => `sb-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{it.label}</span>
              {it.plus && <span className="sb-plus">+</span>}
            </NavLink>
          );
        })}

        {isAdmin && (
          <>
            <div className="sb-section">Admin Control</div>
            {adminItems.map((it) => {
              const Icon = it.icon;
              return (
                <NavLink
                  key={it.path}
                  to={it.path}
                  className={({ isActive }) => `sb-link ${isActive ? 'active' : ''}`}
                >
                  <Icon size={18} />
                  <span>{it.label}</span>
                </NavLink>
              );
            })}
          </>
        )}

        <div className="sb-section">Preferensi</div>
        <NavLink
          to="/profil"
          className={({ isActive }) => `sb-link ${isActive ? 'active' : ''}`}
        >
          <Settings size={18} />
          <span>Pengaturan & Profil</span>
        </NavLink>

        <a
          href="#logout"
          className="sb-link"
          onClick={(e) => {
            e.preventDefault();
            onLogoutClick();
          }}
        >
          <LogOut size={18} />
          <span>Keluar</span>
        </a>
      </nav>

      <div className="sb-target">
        <div className="sb-target-head">
          <Target size={16} />
          <span>Target Hari Ini</span>
          <span className="pct">{pct}%</span>
        </div>
        <div className="sb-target-num">
          <span>
            <b>{n}</b> / {target}
          </span>
          <span>Laporan</span>
        </div>
        <div className="progress">
          <span style={{ width: `${pct}%` }} />
        </div>
        <button
          type="button"
          className="btn btn-mint btn-block"
          onClick={() => navigate('/laporan-baru')}
        >
          + Laporan Baru
        </button>
      </div>
    </aside>
  );
}
