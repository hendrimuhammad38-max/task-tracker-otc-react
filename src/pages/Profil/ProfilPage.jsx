import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  KeyRound,
  Eye,
  EyeOff,
  Upload,
  RotateCcw,
  Shield,
  Save,
  CheckCircle2,
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { API } from '../../api/apiClient';
import { initials, roleLabel, imageToLogo } from '../../utils/formatters';
import { RolePill } from '../../components/common/StatusPill';
import { BrandLogo } from '../../components/common/BrandLogo';

export function ProfilPage() {
  const { user, isAdmin, brand, setBrand } = useAuth();
  const toast = useToast();

  // Form Ganti Kata Sandi
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [submittingPass, setSubmittingPass] = useState(false);

  // Logo Branding (Admin Only)
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(brand?.logo || '');
  const [savingLogo, setSavingLogo] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast?.warn('Semua field kata sandi wajib diisi.', 'Ganti Kata Sandi');
      return;
    }
    if (newPassword.length < 8) {
      toast?.warn('Kata sandi baru minimal 8 karakter.', 'Ganti Kata Sandi');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast?.warn('Konfirmasi kata sandi baru tidak cocok.', 'Ganti Kata Sandi');
      return;
    }

    setSubmittingPass(true);
    try {
      await API.call('changePassword', {
        oldPassword,
        newPassword
      });
      toast?.ok('Kata sandi Anda berhasil diperbarui.', 'Sukses');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast?.bad(err.message, 'Gagal mengganti kata sandi');
    } finally {
      setSubmittingPass(false);
    }
  };

  const handleLogoFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await imageToLogo(file);
      setLogoPreview(dataUrl);
      setLogoFile(dataUrl);
    } catch (err) {
      toast?.bad(err.message, 'Format Gambar Tidak Valid');
    }
  };

  const handleSaveLogo = async () => {
    if (!logoFile) return;
    setSavingLogo(true);
    try {
      const res = await API.call('updateBranding', { logo: logoFile });
      setBrand({ ver: res.ver || Date.now().toString(), logo: logoFile });
      toast?.ok('Logo branding instansi berhasil disimpan.', 'Sukses');
      setLogoFile(null);
    } catch (err) {
      toast?.bad(err.message, 'Gagal menyimpan logo branding');
    } finally {
      setSavingLogo(false);
    }
  };

  const handleResetLogo = async () => {
    setSavingLogo(true);
    try {
      const res = await API.call('updateBranding', { logo: '' });
      setBrand({ ver: res.ver || Date.now().toString(), logo: '' });
      setLogoPreview('');
      setLogoFile(null);
      toast?.ok('Logo dikembalikan ke default aplikasi.', 'Sukses');
    } catch (err) {
      toast?.bad(err.message, 'Gagal mereset logo');
    } finally {
      setSavingLogo(false);
    }
  };

  return (
    <motion.div
      className="stack"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="page-head">
        <div>
          <div className="crumbs">
            Aplikasi <span>›</span> <b>Profil &amp; Preferensi</b>
          </div>
          <h1 className="page-title">Pengaturan Akun &amp; Profil</h1>
          <p className="page-desc">
            Informasi akun pengguna, pembaruan kata sandi, dan identitas visual aplikasi.
          </p>
        </div>
      </div>

      <div className="grid g-main-side">
        {/* Kolom Kiri: Form Ganti Password & Branding */}
        <div className="stack">
          {/* Card Ganti Kata Sandi */}
          <section className="card">
            <div className="card-head">
              <div>
                <div className="card-title">Ganti Kata Sandi</div>
                <div className="card-sub">Perbarui kata sandi akun Anda secara berkala</div>
              </div>
              <span className="ic-tile sm">
                <KeyRound size={16} />
              </span>
            </div>

            <form onSubmit={handleChangePassword} className="stack">
              <label className="field">
                <span className="field-label">Kata Sandi Saat Ini</span>
                <div className="input-wrap">
                  <input
                    className="input"
                    type={showPass ? 'text' : 'password'}
                    placeholder="Masukkan kata sandi saat ini"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="input-btn"
                    onClick={() => setShowPass(!showPass)}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </label>

              <label className="field">
                <span className="field-label">Kata Sandi Baru</span>
                <input
                  className="input"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Minimal 8 karakter"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </label>

              <label className="field">
                <span className="field-label">Konfirmasi Kata Sandi Baru</span>
                <input
                  className="input"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Ulangi kata sandi baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </label>

              <div className="row mt-1" style={{ justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submittingPass}
                >
                  {submittingPass ? <span className="spinner" /> : <Save size={16} />}
                  Perbarui Kata Sandi
                </button>
              </div>
            </form>
          </section>

          {/* Logo Branding (Admin Only) */}
          {isAdmin && (
            <section className="card">
              <div className="card-head">
                <div>
                  <div className="card-title">Identitas Visual &amp; Logo Instansi</div>
                  <div className="card-sub">Logo kustom yang tampil di header dan dokumen PDF</div>
                </div>
                <span className="ic-tile sm praktik">
                  <Upload size={16} />
                </span>
              </div>

              <div className="row-wrap" style={{ alignItems: 'center', gap: '20px' }}>
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '16px',
                    border: '2px dashed var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--surface-2)',
                    overflow: 'hidden'
                  }}
                >
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Logo Preview"
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <BrandLogo size="big" />
                  )}
                </div>

                <div className="stack" style={{ gap: '8px', flex: 1, minWidth: '220px' }}>
                  <label className="btn btn-ghost sm" style={{ width: 'fit-content' }}>
                    <Upload size={15} /> Pilih Berkas Gambar…
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml"
                      style={{ display: 'none' }}
                      onChange={handleLogoFileChange}
                    />
                  </label>
                  <span className="tiny muted">
                    Format PNG atau JPG disarankan. Gambar akan dioptimasi otomatis ke ukuran proporsional.
                  </span>
                </div>
              </div>

              <div className="row mt-3" style={{ justifyContent: 'flex-end', gap: '8px' }}>
                {brand?.logo && (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={handleResetLogo}
                    disabled={savingLogo}
                  >
                    <RotateCcw size={15} /> Reset ke Bawaan
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveLogo}
                  disabled={!logoFile || savingLogo}
                >
                  {savingLogo ? <span className="spinner" /> : <Save size={15} />}
                  Simpan Logo
                </button>
              </div>
            </section>
          )}
        </div>

        {/* Kolom Kanan: Info Akun & Sistem */}
        <div className="stack side">
          <section className="card">
            <div className="card-head">
              <div className="card-title">Kartu Pengguna</div>
              <span className="ic-tile sm info">
                <User size={16} />
              </span>
            </div>

            <div className="stack" style={{ alignItems: 'center', textAlign: 'center', padding: '10px 0' }}>
              <div
                className="sb-avatar"
                style={{ width: '64px', height: '64px', fontSize: '24px', margin: '0 auto' }}
              >
                {initials(user?.nama)}
              </div>
              <h3 style={{ margin: '12px 0 2px 0', fontSize: '18px' }}>{user?.nama}</h3>
              <div className="mb-2">
                <RolePill role={user?.role} />
              </div>
              <span className="pill pill-mono">{user?.badge}</span>
            </div>

            <div className="stat-rows mt-2" style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
              <div className="row" style={{ justifyContent: 'space-between', padding: '6px 0' }}>
                <span className="small muted">Peran:</span>
                <b>{roleLabel(user?.role)}</b>
              </div>
              <div className="row" style={{ justifyContent: 'space-between', padding: '6px 0' }}>
                <span className="small muted">Departemen:</span>
                <b>{user?.dept || 'Operasional'}</b>
              </div>
              <div className="row" style={{ justifyContent: 'space-between', padding: '6px 0' }}>
                <span className="small muted">Status Akun:</span>
                <span className="pill pill-ok">Aktif</span>
              </div>
            </div>
          </section>

          {/* Info Sistem */}
          <section className="card">
            <div className="card-head">
              <div className="card-title">Informasi Versi</div>
              <span className="ic-tile sm">
                <Info size={16} />
              </span>
            </div>
            <div className="stack" style={{ gap: '8px', fontSize: '13px' }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span className="muted">Framework:</span>
                <b>React 18 + Vite</b>
              </div>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span className="muted">Versi Rilis:</span>
                <b>v1.3.0</b>
              </div>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span className="muted">Backend Sync:</span>
                <span className="pill pill-ok" style={{ fontSize: '11px' }}>Google Apps Script</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
}
