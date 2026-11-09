import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IdCard, KeyRound, Eye, EyeOff, LogIn, FileCheck2, ChartColumn, ShieldCheck, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { API } from '../../api/apiClient';
import { BrandLogo } from '../../components/common/BrandLogo';
import { greeting } from '../../utils/formatters';

export function LoginPage() {
  const [badge, setBadge] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const isConfigured = API.isConfigured();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!badge.trim() || !password) {
      setErrorMsg('No. Badge dan kata sandi wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      const loggedUser = await login(badge.trim(), password);
      toast?.ok(`${greeting()}, ${loggedUser?.nama?.split(' ')[0]}!`, 'Berhasil masuk');
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Gagal masuk. Periksa kembali No. Badge dan kata sandi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="login-view" className="login">
      <div className="login-bg" aria-hidden="true">
        <span className="blob b1" />
        <span className="blob b2" />
        <span className="blob b3" />
      </div>

      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        {/* Kolom Kiri: Ilustrasi & Deskripsi */}
        <div className="login-art" aria-hidden="true">
          <div className="art-badge">
            <BrandLogo size="big" />
          </div>
          <h2>
            Dari Kelas ke Lapangan,
            <br />
            Semua Terlaporkan.
          </h2>
          <p>
            Catat penyelesaian pelatihan teori &amp; praktik alat berat, buat PDF otomatis, kirim ke
            pengawas dalam hitungan detik.
          </p>
          <ul className="art-points">
            <li>
              <FileCheck2 size={18} /> PDF laporan otomatis
            </li>
            <li>
              <ChartColumn size={18} /> Dashboard teori vs praktik
            </li>
            <li>
              <ShieldCheck size={18} /> Akses aman per peran
            </li>
          </ul>

          <svg className="art-machine" viewBox="0 0 220 110" fill="none">
            <path
              d="M8 96h204"
              stroke="currentColor"
              strokeOpacity=".25"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <rect x="60" y="56" width="74" height="26" rx="6" fill="currentColor" fillOpacity=".22" />
            <rect x="92" y="34" width="34" height="26" rx="5" fill="currentColor" fillOpacity=".32" />
            <rect x="99" y="40" width="20" height="12" rx="2" fill="#fff" fillOpacity=".55" />
            <rect x="54" y="80" width="88" height="14" rx="7" fill="currentColor" fillOpacity=".38" />
            <circle cx="66" cy="87" r="4" fill="#fff" fillOpacity=".7" />
            <circle cx="130" cy="87" r="4" fill="#fff" fillOpacity=".7" />
            <path
              d="M134 60l34-30 22 10"
              stroke="currentColor"
              strokeOpacity=".45"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M190 40l8 22h-20z" fill="currentColor" fillOpacity=".45" />
          </svg>
        </div>

        {/* Kolom Kanan: Formulir Login */}
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="brand-row">
            <BrandLogo size="" />
            <div>
              <b>Task Tracker OTC</b>
              <small>Laporan Penyelesaian Pelatihan</small>
            </div>
          </div>

          <h1>Masuk ke akun Anda</h1>
          <p className="muted">Gunakan No. Badge dan kata sandi yang diberikan Admin/Pengawas.</p>

          <label className="field">
            <span className="field-label">No. Badge</span>
            <span className="input-wrap">
              <IdCard size={18} />
              <input
                id="login-badge"
                className="input"
                autoComplete="username"
                placeholder="Contoh: BDG-4120"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                required
              />
            </span>
          </label>

          <label className="field">
            <span className="field-label">Kata Sandi</span>
            <span className="input-wrap">
              <KeyRound size={18} />
              <input
                id="login-pass"
                className="input"
                type={showPass ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="input-btn"
                onClick={() => setShowPass(!showPass)}
                aria-label="Tampilkan kata sandi"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </span>
          </label>

          {errorMsg && (
            <div className="alert alert-bad" role="alert">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            id="login-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner" />
                <span>Memeriksa…</span>
              </>
            ) : (
              <>
                <LogIn size={18} />
                <span>Masuk</span>
              </>
            )}
          </button>

          <p className="tiny muted center">
            Akun dibuat oleh Admin/Pengawas. Lupa kata sandi? Hubungi pengawas Anda.
          </p>

          {!isConfigured && (
            <div className="alert alert-warn" role="alert">
              <Settings size={18} />
              <span>
                Backend belum terhubung. Periksa konfigurasi <b>GAS_URL</b> di{' '}
                <code>src/config/appConfig.js</code>.
              </span>
            </div>
          )}
        </form>
      </motion.div>
    </section>
  );
}
