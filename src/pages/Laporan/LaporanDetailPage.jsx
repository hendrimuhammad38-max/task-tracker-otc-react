import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Download,
  Share2,
  Edit,
  Trash2,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Truck,
  User,
  Users,
  Send
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { API } from '../../api/apiClient';
import {
  dateLong,
  time,
  date,
  tz,
  num,
  b64ToBlob,
  saveBlob,
  waLink
} from '../../utils/formatters';
import { StatusPill, JenisPill } from '../../components/common/StatusPill';
import { Modal } from '../../components/common/Modal';
import { Loader } from '../../components/common/Loader';

export function LaporanDetailPage() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [waModalOpen, setWaModalOpen] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    async function loadReport() {
      setLoading(true);
      try {
        const d = await API.swr('getReport', { id });
        if (isCurrent) {
          setReport(d);
          setLoading(false);
        }
      } catch (err) {
        toast?.bad(err.message, 'Gagal membuka laporan');
        if (isCurrent) setLoading(false);
      }
    }

    loadReport();

    return () => {
      isCurrent = false;
    };
  }, [id]);

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const d = await API.call('downloadPdf', { id: report.id });
      const blob = b64ToBlob(d.base64, d.mime);
      saveBlob(blob, d.fileName);
      toast?.ok(`PDF ${d.fileName} berhasil diunduh.`, 'Sukses');
    } catch (err) {
      toast?.bad(err.message, 'Gagal mengunduh PDF');
    } finally {
      setDownloading(false);
    }
  };

  const handleOpenWaModal = async () => {
    setWaModalOpen(true);
    setLoadingContacts(true);
    try {
      const res = await API.swr('listContacts', {});
      setContacts(res || []);
    } catch {
      /* abaikan */
    } finally {
      setLoadingContacts(false);
    }
  };

  const generateWaText = (contact) => {
    const sapa = contact ? `Halo ${contact.nama?.split(' ')[0]}, ` : 'Halo, ';
    return (
      `${sapa}berikut laporan penyelesaian pelatihan:\n` +
      `• ID: ${report.id}\n• Pelatihan: ${report.namaPel}\n• Jenis: ${report.jenis}\n• Tanggal: ${dateLong(report.tglPel)}\n` +
      `• Lokasi: ${report.lokasi}${report.alat ? `\n• Unit: ${report.alat}` : ''}\n• Peserta: ${report.jml || (report.peserta || []).length} orang\n• Status: ${report.status}\n\n` +
      `File PDF laporan saya lampirkan setelah pesan ini.\n— ${user?.nama} (${user?.badge})`
    );
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await API.call('deleteReport', { id: report.id });
      toast?.ok(`Laporan ${report.id} berhasil dihapus.`, 'Dihapus');
      navigate('/laporan');
    } catch (err) {
      toast?.bad(err.message, 'Gagal menghapus laporan');
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  if (loading) return <Loader text="Memuat detail laporan…" />;
  if (!report) {
    return (
      <div className="card text-center" style={{ padding: '32px' }}>
        <h3>Laporan tidak ditemukan</h3>
        <p className="muted">Laporan mungkin telah dihapus atau ID tidak valid.</p>
        <Link to="/laporan" className="btn btn-primary mt-2">
          Kembali ke Daftar
        </Link>
      </div>
    );
  }

  const canEdit = isAdmin || (user && report.trainerBadge === user.badge);

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
            <Link to="/laporan">Daftar Laporan</Link> <span>›</span> <b>{report.id}</b>
          </div>
          <div className="row" style={{ alignItems: 'center', gap: '10px', marginTop: '6px' }}>
            <h1 className="page-title" style={{ margin: 0 }}>
              {report.namaPel}
            </h1>
            <StatusPill status={report.status} />
          </div>
          <p className="page-desc">
            ID: <span className="pill pill-mono">{report.id}</span> • Dibuat oleh{' '}
            <b>{report.trainerNama}</b> ({report.trainerBadge}) pada {time(report.ts) || date(report.ts)}{' '}
            {tz()}
          </p>
        </div>

        <div className="page-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleDownloadPdf}
            disabled={downloading}
          >
            {downloading ? (
              <span className="spinner" />
            ) : (
              <Download size={16} />
            )}
            Unduh PDF
          </button>

          <button type="button" className="btn btn-ghost" onClick={handleOpenWaModal}>
            <Share2 size={16} />
            Kirim WhatsApp
          </button>

          {canEdit && (
            <Link to={`/laporan/${encodeURIComponent(report.id)}/ubah`} className="btn btn-ghost">
              <Edit size={16} />
              Ubah
            </Link>
          )}

          {isAdmin && (
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => setDeleteModalOpen(true)}
            >
              <Trash2 size={16} />
              Hapus
            </button>
          )}
        </div>
      </div>

      {/* Grid Informasi Detail */}
      <div className="grid g-main-side">
        {/* Kolom Kiri: Info Utama & Tabel Peserta */}
        <div className="stack">
          <section className="card">
            <div className="card-head">
              <div className="card-title">Informasi Pelatihan</div>
            </div>

            <div className="grid g-2" style={{ gap: '16px' }}>
              <div>
                <span className="tiny muted">Jenis Modul</span>
                <div className="mt-1">
                  <JenisPill jenis={report.jenis} />
                </div>
              </div>

              <div>
                <span className="tiny muted">Tanggal Pelaksanaan</span>
                <div className="row mt-1" style={{ alignItems: 'center', gap: '6px' }}>
                  <Calendar size={15} />
                  <b>{dateLong(report.tglPel)}</b>
                </div>
              </div>

              <div>
                <span className="tiny muted">Waktu / Durasi</span>
                <div className="row mt-1" style={{ alignItems: 'center', gap: '6px' }}>
                  <Clock size={15} />
                  <span>
                    {report.jamMulai || '—'} s.d. {report.jamSelesai || '—'} ({report.totalJam || 0}{' '}
                    Jam)
                  </span>
                </div>
              </div>

              <div>
                <span className="tiny muted">Lokasi Training</span>
                <div className="row mt-1" style={{ alignItems: 'center', gap: '6px' }}>
                  <MapPin size={15} />
                  <span>{report.lokasi || '—'}</span>
                </div>
              </div>

              {report.alat && (
                <div>
                  <span className="tiny muted">Unit Armada Alat Berat</span>
                  <div className="row mt-1" style={{ alignItems: 'center', gap: '6px' }}>
                    <Truck size={15} />
                    <b>{report.alat}</b>
                  </div>
                </div>
              )}
            </div>

            {report.catatan && (
              <div className="mt-3" style={{ borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                <span className="tiny muted">Catatan &amp; Evaluasi Pelaksanaan</span>
                <p style={{ margin: '6px 0 0 0', whiteSpace: 'pre-line' }}>{report.catatan}</p>
              </div>
            )}
          </section>

          {/* Tabel Peserta */}
          <section className="card">
            <div className="card-head">
              <div>
                <div className="card-title">Daftar Hadir &amp; Kelulusan Peserta</div>
                <div className="card-sub">{num(report.jml || (report.peserta || []).length)} Peserta Terdata</div>
              </div>
              <span className="ic-tile sm info">
                <Users size={16} />
              </span>
            </div>

            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>No</th>
                    <th>Nama Peserta</th>
                    <th>No. Badge</th>
                    <th>Departemen</th>
                    <th style={{ width: 90 }}>Nilai</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(report.peserta || []).length > 0 ? (
                    report.peserta.map((p, idx) => (
                      <tr key={p.badge || idx}>
                        <td>{idx + 1}</td>
                        <td>
                          <b>{p.nama}</b>
                        </td>
                        <td>
                          <span className="pill pill-mono">{p.badge}</span>
                        </td>
                        <td>{p.dept || '—'}</td>
                        <td>
                          <b>{p.nilai ?? '—'}</b>
                        </td>
                        <td>
                          <StatusPill status={p.status || report.status} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="center muted">
                        Belum ada peserta yang terdaftar pada modul ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Kolom Kanan: Info Instruktur & Log Singkat */}
        <div className="stack side">
          <section className="card">
            <div className="card-head">
              <div className="card-title">Instruktur / Trainer</div>
              <span className="ic-tile sm violet">
                <User size={16} />
              </span>
            </div>

            <div className="row" style={{ alignItems: 'center', gap: '12px' }}>
              <div className="avatar c1">{report.trainerNama?.slice(0, 2).toUpperCase()}</div>
              <div>
                <b style={{ fontSize: '15px' }}>{report.trainerNama}</b>
                <div className="small muted">Badge: {report.trainerBadge}</div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Modal Kirim WhatsApp */}
      <Modal
        isOpen={waModalOpen}
        onClose={() => setWaModalOpen(false)}
        title="Kirim ke WhatsApp Pengawas"
        subtitle="Pesan ringkasan terformat otomatis — lampirkan PDF secara manual"
        icon={Send}
        size=""
      >
        {loadingContacts ? (
          <Loader text="Memuat daftar kontak pengawas…" />
        ) : (
          <div className="stack">
            <p className="small muted">
              Pilih kontak pengawas tujuan untuk membuka WhatsApp langsung dengan pesan laporan:
            </p>
            <div className="list">
              {contacts.map((c) => (
                <a
                  key={c.phone || c.nama}
                  href={waLink(c.phone, generateWaText(c))}
                  target="_blank"
                  rel="noreferrer"
                  className="list-item"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <span className="ic-tile sm ok">
                    <Send size={16} />
                  </span>
                  <div className="li-main">
                    <b>{c.nama}</b>
                    <small className="muted">{c.jabatan || 'Pengawas'} • {c.phone}</small>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Konfirmasi Hapus */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Hapus Laporan Pelatihan?"
        icon={Trash2}
        iconClass="bad"
        footer={
          <>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleting}
            >
              Batal
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Menghapus…' : 'Ya, Hapus'}
            </button>
          </>
        }
      >
        <p className="muted">
          Laporan <b>{report.id}</b> ({report.namaPel}) akan dihapus permanen dari sistem.
          Tindakan ini tidak dapat dibatalkan.
        </p>
      </Modal>
    </motion.div>
  );
}
