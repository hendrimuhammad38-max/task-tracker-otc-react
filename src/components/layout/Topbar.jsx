import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Sun, Moon, Bell, FileText, Download } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { initials, time, date, tz, num } from '../../utils/formatters';
import { BrandLogo } from '../common/BrandLogo';
import { Modal } from '../common/Modal';
import { API } from '../../api/apiClient';
import { StatusPill } from '../common/StatusPill';
import { useToast } from '../../context/ToastContext';

export function Topbar() {
  const { user, today } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [bellOpen, setBellOpen] = useState(false);
  const [recentReports, setRecentReports] = useState([]);
  const [loadingBell, setLoadingBell] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/laporan?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/laporan');
    }
  };

  const openBellModal = async () => {
    setBellOpen(true);
    setLoadingBell(true);
    try {
      const d = await API.swr('listReports', { size: 6 });
      setRecentReports(d.items || []);
    } catch (e) {
      toast?.bad(e.message, 'Gagal memuat laporan terbaru');
    } finally {
      setLoadingBell(false);
    }
  };

  const bellCount = today?.count || 0;

  return (
    <>
      <header className="topbar">
        <Link to="/dashboard" className="tb-brand">
          <BrandLogo size="sm" />
          <span>
            <b>Task Tracker OTC</b>
            <small>
              <span className="dot-live" /> GAS Sync Active
            </small>
          </span>
        </Link>

        <form className="tb-search" onSubmit={handleSearch} role="search">
          <Search size={18} />
          <input
            type="search"
            placeholder="Cari laporan, peserta, no. request…"
            aria-label="Cari laporan"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        <div className="tb-actions">
          <button
            type="button"
            className="btn-icon"
            onClick={toggleTheme}
            title="Ganti tema terang/gelap"
            aria-label="Ganti tema"
          >
            {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <button
            type="button"
            className="btn-icon"
            onClick={openBellModal}
            title="Laporan terbaru"
            aria-label="Laporan terbaru"
            style={{ position: 'relative' }}
          >
            <Bell size={18} />
            {bellCount > 0 && (
              <span className="badge-dot" style={{ display: 'inline-block' }}>
                {bellCount > 99 ? '99+' : bellCount}
              </span>
            )}
          </button>

          <Link to="/profil" className="avatar-btn" title="Profil">
            {initials(user?.nama)}
          </Link>
        </div>
      </header>

      {/* Modal Notifikasi Laporan Terbaru */}
      <Modal
        isOpen={bellOpen}
        onClose={() => setBellOpen(false)}
        title="Laporan Terbaru"
        subtitle={`${bellCount} laporan masuk hari ini`}
        icon={Bell}
        size=""
      >
        {loadingBell ? (
          <div className="page-loader">
            <div className="spinner-lg" />
            <span>Memuat laporan…</span>
          </div>
        ) : recentReports.length > 0 ? (
          <div className="list">
            {recentReports.map((r) => (
              <div
                key={r.id}
                className="list-item"
                onClick={() => {
                  setBellOpen(false);
                  navigate(`/laporan/${encodeURIComponent(r.id)}`);
                }}
                role="link"
                tabIndex={0}
                style={{ cursor: 'pointer' }}
              >
                <span className="ic-tile sm">
                  <FileText size={16} />
                </span>
                <div className="li-main">
                  <div className="li-title truncate">{r.namaPel}</div>
                  <div className="li-meta">
                    <span className="pill pill-mono">{r.id}</span>
                    <span>
                      Trainer: <b>{r.trainerNama}</b>
                    </span>
                    <span>• {num(r.jml)} Peserta</span>
                    <span>
                      • {time(r.ts) || date(r.ts)} {tz()}
                    </span>
                  </div>
                </div>
                <StatusPill status={r.status} />
              </div>
            ))}
          </div>
        ) : (
          <div className="empty">
            <span className="ic-tile">
              <FileText size={24} />
            </span>
            <b>Belum ada laporan</b>
            <span className="small">Laporan yang dikirim akan tampil di sini.</span>
          </div>
        )}
      </Modal>
    </>
  );
}
