import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Download,
  Printer,
  Edit,
  Trash2,
  Calendar,
  Users,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { API } from '../../api/apiClient';
import { dateLong, b64ToBlob, saveBlob } from '../../utils/formatters';
import { Loader } from '../../components/common/Loader';
import { Modal } from '../../components/common/Modal';

export function PengawasDetailPage() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    async function loadDetail() {
      setLoading(true);
      try {
        const d = await API.swr('getSupReport', { id });
        if (isCurrent) {
          setReport(d);
          setLoading(false);
        }
      } catch (err) {
        toast?.bad(err.message, 'Gagal memuat detail laporan');
        if (isCurrent) setLoading(false);
      }
    }

    loadDetail();

    return () => {
      isCurrent = false;
    };
  }, [id]);

  const handleDownloadPdf = async (mode = 'download') => {
    setDownloading(true);
    let win = null;
    if (mode === 'print') {
      win = window.open('', '_blank');
      if (win) {
        win.document.write('<p style="font-family:sans-serif;padding:24px">Menyiapkan PDF untuk dicetak…</p>');
      }
    }

    try {
      const d = await API.call('downloadSupPdf', { id: report.id });
      const blob = b64ToBlob(d.base64, d.mime);

      if (mode === 'print' && win) {
        win.location.href = URL.createObjectURL(blob);
        toast?.ok('Gunakan Ctrl + P di tab baru untuk mencetak.', 'Siap Dicetak');
      } else {
        saveBlob(blob, d.fileName);
        toast?.ok(`PDF ${d.fileName} berhasil diunduh.`, 'Sukses');
      }
    } catch (err) {
      if (win) win.close();
      toast?.bad(err.message, 'Gagal memproses PDF');
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await API.call('deleteSupReport', { id: report.id });
      toast?.ok(`Laporan ${report.id} berhasil dihapus.`, 'Sukses');
      navigate('/pengawas');
    } catch (err) {
      toast?.bad(err.message, 'Gagal menghapus laporan');
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  if (loading) return <Loader text="Memuat laporan superintendent…" />;
  if (!report) {
    return (
      <div className="card text-center" style={{ padding: '32px' }}>
        <h3>Laporan tidak ditemukan</h3>
        <Link to="/pengawas" className="btn btn-primary mt-2">
          Kembali ke Daftar
        </Link>
      </div>
    );
  }

  const canEdit = isAdmin || (user && report.pengawasId === user.id);

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
            <Link to="/pengawas">Laporan Superintendent</Link> <span>›</span> <b>{report.id}</b>
          </div>
          <h1 className="page-title">Laporan Penugasan Trainer</h1>
          <p className="page-desc">
            ID: <span className="pill pill-mono">{report.id}</span> • Tanggal {dateLong(report.tanggal)} •
            Pengawas: <b>{report.pengawasNama}</b>
          </p>
        </div>

        <div className="page-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => handleDownloadPdf('print')}
            disabled={downloading}
          >
            <Printer size={16} /> Cetak Langsung
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleDownloadPdf('download')}
            disabled={downloading}
          >
            {downloading ? <span className="spinner" /> : <Download size={16} />}
            Unduh PDF
          </button>

          {canEdit && (
            <Link to={`/pengawas/${encodeURIComponent(report.id)}/ubah`} className="btn btn-ghost">
              <Edit size={16} /> Ubah
            </Link>
          )}

          {isAdmin && (
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => setDeleteModalOpen(true)}
            >
              <Trash2 size={16} /> Hapus
            </button>
          )}
        </div>
      </div>

      <div className="grid g-main-side">
        <div className="stack">
          {/* Card Penugasan */}
          <section className="card">
            <div className="card-head">
              <div className="card-title">Daftar Penugasan Instruktur</div>
              <span className="ic-tile sm praktik">
                <Users size={16} />
              </span>
            </div>

            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>No</th>
                    <th>Nama Trainer</th>
                    <th>Tugas / Modul Pekerjaan</th>
                    <th>Lokasi Penugasan</th>
                    <th>Keterangan Tambahan</th>
                  </tr>
                </thead>
                <tbody>
                  {(report.items || []).map((it, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>
                        <b>{it.trainerNama}</b>
                      </td>
                      <td>{it.tugas}</td>
                      <td>{it.lokasi || '—'}</td>
                      <td>{it.keterangan || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {report.catatan && (
              <div className="mt-3" style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                <span className="tiny muted">Catatan Khusus untuk Superintendent:</span>
                <p style={{ margin: '6px 0 0 0', whiteSpace: 'pre-line' }}>{report.catatan}</p>
              </div>
            )}
          </section>
        </div>

        <div className="stack side">
          <section className="card">
            <div className="card-head">
              <div className="card-title">Penerima &amp; Pengirim</div>
              <span className="ic-tile sm info">
                <UserCheck size={16} />
              </span>
            </div>

            <div className="stack" style={{ gap: '14px' }}>
              <div>
                <span className="tiny muted">Ditujukan Kepada</span>
                <div className="mt-1">
                  <b>{report.superintendent || 'Superintendent'}</b>
                </div>
              </div>

              <div>
                <span className="tiny muted">Dibuat Oleh (Pengawas)</span>
                <div className="mt-1">
                  <b>{report.pengawasNama}</b>
                  <div className="small muted">Badge: {report.pengawasBadge}</div>
                </div>
              </div>

              <div>
                <span className="tiny muted">Tanggal Laporan</span>
                <div className="row mt-1" style={{ alignItems: 'center', gap: '6px' }}>
                  <Calendar size={15} />
                  <span>{dateLong(report.tanggal)}</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Modal Konfirmasi Hapus */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Hapus Laporan Superintendent?"
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
          Laporan <b>{report.id}</b> tanggal {dateLong(report.tanggal)} akan dihapus.
        </p>
      </Modal>
    </motion.div>
  );
}
