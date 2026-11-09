import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Plus,
  FolderCheck,
  History,
  CircleUserRound
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function BottomNav() {
  const { isAdmin } = useAuth();
  const location = useLocation();

  const isMineActive =
    location.pathname === '/laporan' &&
    new URLSearchParams(location.search).get('mine') === '1';

  return (
    <nav className="bottom-nav" id="bottom-nav" aria-label="Navigasi bawah">
      <NavLink
        to="/dashboard"
        className={({ isActive }) => `bn-item ${isActive ? 'active' : ''}`}
      >
        <LayoutDashboard size={20} />
        <span>Dashboard</span>
      </NavLink>

      <NavLink
        to="/laporan"
        end
        className={({ isActive }) => `bn-item ${isActive && !isMineActive ? 'active' : ''}`}
      >
        <ClipboardList size={20} />
        <span>Laporan</span>
      </NavLink>

      <NavLink
        to="/laporan-baru"
        className={({ isActive }) => `bn-item bn-plus ${isActive ? 'active' : ''}`}
      >
        <span className="bn-fab">
          <Plus size={22} />
        </span>
        <span>Input</span>
      </NavLink>

      {isAdmin ? (
        <NavLink
          to="/log"
          className={({ isActive }) => `bn-item ${isActive ? 'active' : ''}`}
        >
          <History size={20} />
          <span>Aktivitas</span>
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

      <NavLink
        to="/profil"
        className={({ isActive }) => `bn-item ${isActive ? 'active' : ''}`}
      >
        <CircleUserRound size={20} />
        <span>Profil</span>
      </NavLink>
    </nav>
  );
}
