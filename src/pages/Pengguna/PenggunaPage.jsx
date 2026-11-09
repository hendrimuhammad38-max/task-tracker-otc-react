import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  UserPlus,
  Search,
  ShieldCheck,
  ShieldHalf,
  KeyRound,
  RotateCcw,
  Sparkles,
  Copy,
  Check,
  FileSpreadsheet,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { API } from '../../api/apiClient';
import { num, randomPassword, saveText, csv } from '../../utils/formatters';
import { RolePill } from '../../components/common/StatusPill';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';

export function PenggunaPage() {
  const { user: currentUser, masters, isAdmin } = useAuth();
  const toast = useToast();

  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [showNonaktif, setShowNonaktif] = useState(false);

  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({ users: [], stats: {} });

  // Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [targetUser, setTargetUser] = useState(null);
  const [newPass, setNewPass] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form New User
  const [newNama, setNewNama] = useState('');
  const [newBadge, setNewBadge] = useState('');
  const [newRole, setNewRole] = useState('TRAINER');
  const [newDept, setNewDept] = useState('');
  const [newUserPass, setNewUserPass] = useState('');

  // Credential Result Modal
  const [credModal, setCredModal] = useState(null);
  const [copied, setCopied] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await API.swr('listUsers', {});
      setUserData(res);
    } catch (err) {
      toast?.bad(err.message, 'Gagal memuat pengguna');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newNama.trim() || !newBadge.trim() || !newUserPass.trim()) {
      toast?.warn('Nama, No. Badge, dan kata sandi awal wajib diisi.', 'Form Belum Lengkap');
      return;
    }

    setSubmitting(true);
    try {
      await API.call('createUser', {
        nama: newNama.trim(),
        badge: newBadge.trim(),
        role: newRole,
        dept: newDept,
        password: newUserPass
      });

      toast?.ok(`Pengguna ${newNama} berhasil ditambahkan.`, 'Sukses');
      setAddModalOpen(false);
      setCredModal({
        badge: newBadge.trim(),
        pass: newUserPass,
        nama: newNama.trim()
      });
      setNewNama('');
      setNewBadge('');
      setNewUserPass('');
      loadUsers();
    } catch (err) {
      toast?.bad(err.message, 'Gagal menambah pengguna');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPass.trim()) {
      toast?.warn('Kata sandi baru tidak boleh kosong.', 'Reset Sandi');
      return;
    }

    setSubmitting(true);
    try {
      await API.call('resetPassword', {
        badge: targetUser.badge,
        newPassword: newPass.trim()
      });
      toast?.ok(`Kata sandi untuk ${targetUser.nama} berhasil direset.`, 'Sukses');
      setResetModalOpen(false);
      setCredModal({
        badge: targetUser.badge,
        pass: newPass.trim(),
        nama: targetUser.nama,
        isReset: true
      });
      setNewPass('');
      setTargetUser(null);
    } catch (err) {
      toast?.bad(err.message, 'Gagal mereset kata sandi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (u) => {
    const act = u.status === 'Aktif' ? 'nonaktifkan' : 'aktifkan';
    try {
      await API.call('updateUserStatus', {
        badge: u.badge,
        status: u.status === 'Aktif' ? 'Nonaktif' : 'Aktif'
      });
      toast?.ok(`Status pengguna ${u.nama} berhasil diubah.`, 'Sukses');
      loadUsers();
    } catch (err) {
      toast?.bad(err.message, `Gagal ${act} akun`);
    }
  };

  const handleExportUsers = () => {
    if (!userData.users?.length) return;
    const rows = [['Nama', 'No. Badge', 'Role', 'Departemen', 'Status']];
    userData.users.forEach((u) => {
      rows.push([u.nama, u.badge, u.role, u.dept || '', u.status]);
    });
    saveText(csv(rows), `pengguna-otc-${new Date().toISOString().slice(0, 10)}.csv`);
    toast?.ok(`${userData.users.length} akun diekspor ke CSV.`, 'Ekspor Akun');
  };

  // Filter list
  const filteredUsers = (userData.users || []).filter((u) => {
    if (!showNonaktif && u.status === 'Nonaktif') return false;
    if (roleFilter && u.role !== roleFilter) return false;
    if (deptFilter && u.dept !== deptFilter) return false;
    if (q) {
      const qLower = q.toLowerCase();
      const match =
        (u.nama && u.nama.toLowerCase().includes(qLower)) ||
        (u.badge && u.badge.toLowerCase().includes(qLower)) ||
        (u.dept && u.dept.toLowerCase().includes(qLower)) ||
        (u.role && u.role.toLowerCase().includes(qLower));
      if (!match) return false;
    }
    return true;
  });

  const st = userData.stats || { total: 0, aktif: 0, nonaktif: 0, TRAINER: 0, PENGAWAS: 0, ADMIN: 0 };
  const departemenList = masters?.departemen || [];

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
            Modul F-09 <span>•</span> <b>Role-Based Access Control</b>
          </div>
          <h1 className="page-title">Kelola Pengguna &amp; Hak Akses</h1>
          <p className="page-desc">
            Manajemen akun trainer, pengawas, dan admin: peran, status aktivasi, dan kredensial login.
          </p>
        </div>
        <div className="page-actions">
          <button type="button" className="btn btn-ghost" onClick={handleExportUsers}>
            <FileSpreadsheet size={16} /> Ekspor Akun
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setNewUserPass(randomPassword());
              setAddModalOpen(true);
            }}
          >
            <UserPlus size={16} /> Tambah Pengguna Baru
          </button>
        </div>
      </div>

      {/* 4 Kartu Ringkasan Pengguna */}
      <div className="grid g-4">
        <div className="card" style={{ padding: '18px' }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span className="small" style={{ fontWeight: 700 }}>Total Terdaftar</span>
            <span className="ic-tile sm info"><Users size={16} /></span>
          </div>
          <div className="kpi-value mt-1">
            <span>{num(st.total)}</span>
            <small>Pengguna</small>
          </div>
          <div className="small mt-1">
            <span className="pill pill-ok">{st.aktif || 0} Aktif</span>{' '}
            <span className="pill pill-bad">{st.nonaktif || 0} Nonaktif</span>
          </div>
        </div>

        <div className="card" style={{ padding: '18px' }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span className="small" style={{ fontWeight: 700 }}>Trainer / Instruktur</span>
            <span className="ic-tile sm"><Users size={16} /></span>
          </div>
          <div className="kpi-value mt-1">
            <span>{num(st.TRAINER || 0)}</span>
            <small>Akun Lapangan</small>
          </div>
          <div className="small muted mt-1">Input laporan &amp; unduh PDF</div>
        </div>

        <div className="card" style={{ padding: '18px' }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span className="small" style={{ fontWeight: 700 }}>Pengawas Lapangan</span>
            <span className="ic-tile sm praktik"><ShieldCheck size={16} /></span>
          </div>
          <div className="kpi-value mt-1">
            <span>{num(st.PENGAWAS || 0)}</span>
            <small>Akun Verifikator</small>
          </div>
          <div className="small muted mt-1">Monitoring &amp; koreksi data</div>
        </div>

        <div className="card" style={{ padding: '18px' }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span className="small" style={{ fontWeight: 700 }}>Administrator Sistem</span>
            <span className="ic-tile sm violet"><ShieldHalf size={16} /></span>
          </div>
          <div className="kpi-value mt-1">
            <span>{num(st.ADMIN || 0)}</span>
            <small>Full Access</small>
          </div>
          <div className="small muted mt-1">Konfigurasi master &amp; RBAC</div>
        </div>
      </div>

      {/* Protokol Keamanan Bar */}
      <section className="card" style={{ padding: '14px 18px' }}>
        <div className="row-wrap" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="row" style={{ alignItems: 'center', gap: '12px' }}>
            <span className="ic-tile sm"><ShieldCheck size={18} /></span>
            <div>
              <b className="small">Protokol Keamanan &amp; Sesi Karyawan</b>
              <div className="tiny muted">
                Sandi di-hash SHA-256 + salt • Sesi login 8 jam • Akun terkunci 15 menit setelah 5x gagal • Validasi peran di server
              </div>
            </div>
          </div>
          <span className="pill pill-ok pill-dot">Layanan Sehat</span>
        </div>
      </section>

      {/* Filter Section */}
      <section className="card filter-card">
        <div className="search-row">
          <span className="input-wrap">
            <Search size={18} />
            <input
              className="input"
              type="search"
              placeholder="Cari nama, No. Badge, departemen, atau peran…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </span>

          <select
            className="select"
            style={{ width: 'auto', minWidth: '200px' }}
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="">Semua Departemen</option>
            {departemenList.map((d, idx) => (
              <option key={idx} value={d.nama}>{d.nama}</option>
            ))}
          </select>
        </div>

        <div className="chips mt-2 row" style={{ gap: '8px', alignItems: 'center' }}>
          <div className="segmented">
            <button
              type="button"
              className={roleFilter === '' ? 'active' : ''}
              onClick={() => setRoleFilter('')}
            >
              Semua Peran
            </button>
            <button
              type="button"
              className={roleFilter === 'TRAINER' ? 'active' : ''}
              onClick={() => setRoleFilter('TRAINER')}
            >
              Trainer
            </button>
            <button
              type="button"
              className={roleFilter === 'PENGAWAS' ? 'active' : ''}
              onClick={() => setRoleFilter('PENGAWAS')}
            >
              Pengawas
            </button>
            <button
              type="button"
              className={roleFilter === 'ADMIN' ? 'active' : ''}
              onClick={() => setRoleFilter('ADMIN')}
            >
              Admin
            </button>
          </div>

          <label className="check" style={{ marginLeft: 'auto' }}>
            <input
              type="checkbox"
              checked={showNonaktif}
              onChange={(e) => setShowNonaktif(e.target.checked)}
            />
            Tampilkan akun nonaktif
          </label>
        </div>
      </section>

      {/* Grid: Tabel Pengguna & Matriks RBAC */}
      <div className="grid g-table-side">
        <section className="card">
          <div className="card-head">
            <div className="card-title">Daftar Pengguna ({filteredUsers.length})</div>
          </div>

          {loading ? (
            <Loader text="Memuat daftar pengguna…" />
          ) : filteredUsers.length > 0 ? (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Pengguna</th>
                    <th>No. Badge</th>
                    <th>Peran</th>
                    <th>Departemen</th>
                    <th>Status</th>
                    <th style={{ width: 120 }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.badge}>
                      <td>
                        <b>{u.nama}</b>
                        {u.badge === currentUser?.badge && (
                          <span className="pill pill-teori ml-1" style={{ fontSize: 10 }}>Anda</span>
                        )}
                      </td>
                      <td>
                        <span className="pill pill-mono">{u.badge}</span>
                      </td>
                      <td>
                        <RolePill role={u.role} />
                      </td>
                      <td>{u.dept || '—'}</td>
                      <td>
                        <span className={`pill ${u.status === 'Aktif' ? 'pill-ok' : 'pill-bad'}`}>
                          {u.status}
                        </span>
                      </td>
                      <td>
                        <div className="row" style={{ gap: '6px' }}>
                          <button
                            type="button"
                            className="btn-round sm"
                            onClick={() => {
                              setTargetUser(u);
                              setNewPass(randomPassword());
                              setResetModalOpen(true);
                            }}
                            title="Reset Kata Sandi"
                          >
                            <KeyRound size={14} />
                          </button>
                          {u.badge !== currentUser?.badge && (
                            <button
                              type="button"
                              className="btn btn-ghost sm"
                              onClick={() => handleToggleStatus(u)}
                            >
                              {u.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="Tidak ada pengguna"
              text="Tidak ada akun yang cocok dengan filter."
              icon={Users}
            />
          )}
        </section>

        {/* Kolom Kanan: Matriks RBAC */}
        <div className="stack side">
          <section className="card">
            <div className="card-head">
              <div className="card-title">
                <span className="ic-tile sm"><ShieldHalf size={16} /></span> Matriks Hak Akses (RBAC)
              </div>
            </div>
            <p className="small muted">
              Setiap peran memiliki batas wewenang yang diperiksa di server untuk menjaga integritas data pelatihan.
            </p>
            <div className="table-wrap mt-2">
              <table className="table" style={{ fontSize: '12.5px' }}>
                <thead>
                  <tr>
                    <th>Fungsi</th>
                    <th>TRN</th>
                    <th>PGW</th>
                    <th>ADM</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Buat laporan & unduh PDF', 1, 1, 1],
                    ['Lihat semua laporan', 1, 1, 1],
                    ['Ubah / hapus laporan', 0, 1, 1],
                    ['Kelola pengguna', 0, 1, 1],
                    ['Beri peran Admin', 0, 0, 1],
                    ['Kelola data master', 0, 1, 1],
                    ['Lihat log aktivitas', 0, 1, 1]
                  ].map((row, idx) => (
                    <tr key={idx}>
                      <td>{row[0]}</td>
                      {row.slice(1).map((val, i) => (
                        <td key={i}>
                          {val ? (
                            <span style={{ color: 'var(--ok)' }}><CheckCircle2 size={14} /></span>
                          ) : (
                            <span className="faint">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="tiny faint mt-1">TRN: Trainer • PGW: Pengawas • ADM: Administrator</p>
          </section>
        </div>
      </div>

      {/* Modal Tambah Pengguna */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Tambah Pengguna Baru"
        subtitle="Buat akun untuk instruktur, pengawas, atau administrator"
        icon={UserPlus}
        size=""
      >
        <form onSubmit={handleAddUser} className="stack">
          <label className="field">
            <span className="field-label">Nama Lengkap <span className="req">*</span></span>
            <input
              className="input"
              placeholder="Contoh: Ahmad Fauzi"
              value={newNama}
              onChange={(e) => setNewNama(e.target.value)}
              required
            />
          </label>

          <label className="field">
            <span className="field-label">No. Badge <span className="req">*</span></span>
            <input
              className="input"
              placeholder="Contoh: BDG-4120"
              value={newBadge}
              onChange={(e) => setNewBadge(e.target.value)}
              required
            />
          </label>

          <label className="field">
            <span className="field-label">Peran (Role)</span>
            <select
              className="select"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
            >
              <option value="TRAINER">Trainer / Instruktur</option>
              <option value="PENGAWAS">Pengawas / Supervisor</option>
              {currentUser?.role === 'ADMIN' && <option value="ADMIN">Administrator</option>}
            </select>
          </label>

          <label className="field">
            <span className="field-label">Departemen</span>
            <input
              className="input"
              list="dept-options-user"
              placeholder="Pilih departemen…"
              value={newDept}
              onChange={(e) => setNewDept(e.target.value)}
            />
            <datalist id="dept-options-user">
              {departemenList.map((d, idx) => (
                <option key={idx} value={d.nama} />
              ))}
            </datalist>
          </label>

          <label className="field">
            <span className="field-label">Kata Sandi Awal <span className="req">*</span></span>
            <div className="input-wrap">
              <input
                className="input"
                type="text"
                value={newUserPass}
                onChange={(e) => setNewUserPass(e.target.value)}
                required
              />
              <button
                type="button"
                className="input-btn"
                onClick={() => setNewUserPass(randomPassword())}
                title="Buat kata sandi acak"
              >
                <Sparkles size={16} />
              </button>
            </div>
          </label>

          <div className="row mt-2" style={{ justifyContent: 'flex-end', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setAddModalOpen(false)}
              disabled={submitting}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Menyimpan…' : 'Simpan Akun'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Reset Kata Sandi */}
      <Modal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title="Reset Kata Sandi"
        subtitle={`Atur ulang kata sandi untuk ${targetUser?.nama} (${targetUser?.badge})`}
        icon={KeyRound}
        size=""
      >
        <form onSubmit={handleResetPassword} className="stack">
          <label className="field">
            <span className="field-label">Kata Sandi Baru</span>
            <div className="input-wrap">
              <input
                className="input"
                type="text"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                required
              />
              <button
                type="button"
                className="input-btn"
                onClick={() => setNewPass(randomPassword())}
                title="Buat otomatis"
              >
                <Sparkles size={16} />
              </button>
            </div>
          </label>

          <div className="row mt-2" style={{ justifyContent: 'flex-end', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setResetModalOpen(false)}
              disabled={submitting}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Memproses…' : 'Simpan Sandi Baru'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Hasil Kredensial */}
      <Modal
        isOpen={Boolean(credModal)}
        onClose={() => { setCredModal(null); setCopied(false); }}
        title={credModal?.isReset ? 'Kata Sandi Berhasil Direset' : 'Pengguna Berhasil Ditambahkan'}
        subtitle="Salin dan berikan kredensial berikut kepada pengguna"
        icon={KeyRound}
        iconClass="ok"
      >
        {credModal && (
          <div className="stack">
            <div className="card" style={{ background: 'var(--surface-2)', padding: '16px' }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span className="small muted">Nama Pengguna:</span>
                <b>{credModal.nama}</b>
              </div>
              <div className="row mt-1" style={{ justifyContent: 'space-between' }}>
                <span className="small muted">No. Badge:</span>
                <span className="pill pill-mono">{credModal.badge}</span>
              </div>
              <div className="row mt-1" style={{ justifyContent: 'space-between' }}>
                <span className="small muted">Kata Sandi:</span>
                <b style={{ fontFamily: 'var(--mono)', color: 'var(--primary)' }}>{credModal.pass}</b>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={() => {
                const text = `Halo ${credModal.nama},\nBerikut akun Task Tracker OTC Anda:\n• No. Badge: ${credModal.badge}\n• Kata Sandi: ${credModal.pass}\nSilakan ganti kata sandi setelah masuk.`;
                navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Kredensial Disalin!' : 'Salin Info Akun'}
            </button>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
