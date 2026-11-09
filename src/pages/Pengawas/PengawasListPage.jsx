import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ClipboardPen,
  FilePlus2,
  Search,
  Download,
  Printer,
  Calendar,
  Users,
  RotateCcw,
  Trash2,
  CalendarCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { API } from '../../api/apiClient';
import { num, dateLong, b64ToBlob, saveBlob } from '../../utils/formatters';
import { Pagination } from '../../components/common/Pagination';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';

export function PengawasListPage() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [q, setQ] = useState('');
  const [mine, setMine] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ items: [], summary: { total: 0, bulanIni: 0, trainer: 0 }, pages: 1 });
  const [downloadingId, setDownloadingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    const params = { q, mine, from, to, page, size: 20 };

    async function loadSupReports() {
      setLoading(true);
      try {
        const res = await API.swr('listSupReports', params, (fresh) => {
          if (isCurrent) setData(fresh);
        });
        if (isCurrent) {
          setData(res);
          setLoading(false);
        }
      } catch (err) {
        toast?.bad(err.message, 'Gagal memuat laporan superintendent');
        if (isCurrent) setLoading(false);
      }
    }

    loadSupReports();

    return () => {
      isCurrent = false;
    };
  }, [q, mine, from, to, page]);

  const handleDownloadPdf = async (e, id, mode = 'download') => {
    e.stopPropagation();
    setDownloadingId(id);
    let win = null;
    if (mode === 'print') {
      win = window.open('', '_blank');
      if (win) {
        win.document.write('<p style="font-family:sans-serif;padding:24px">Menyiapkan PDF untuk dicetak…</p>');
      }
    }

    try {
      const d = await API.call('downloadSupPdf', { id });
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
      setDownloadingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await API.call('deleteSupReport', { id: deleteTarget.id });
      toast?.ok(`Laporan ${deleteTarget.id} berhasil dihapus.`, 'Dihapus');
      setData((prev) => ({
        ...prev,
        items: prev.items.filter((item) => item.id !== deleteTarget.id)
      }));
      setDeleteTarget(null);
    } catch (err) {
      toast?.bad(err.message, 'Gagal menghapus laporan');
    } finally {
      setDeleting(false);
    }
  };

  const s = data?.summary || { total: 0, bulanIni: 0, trainer: 0 };

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
            Admin Control <span>›</span> <b>Laporan ke Superintendent</b>
          </div>
          <h1 className="page-title">Laporan Pengawas ke Superintendent</h1>
          <p className="page-desc">
            Laporan penugasan trainer (nama, tugas, lokasi pekerjaan, keterangan) dari pengawas kepada superintendent.
          </p>
        </div>
        <div className="page-actions">
          <Link to="/pengawas/baru" className="btn btn-primary">
            <FilePlus2 size={16} /> Buat Laporan Baru
          </Link>
        </div>
      </div>

      {/* 3 Kartu Statistik */}
      <div className="grid g-3">
        <div className="card" style={{ padding: '18px' }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span className="small" style={{ fontWeight: 700 }}>Total Laporan</span>
            <span className="ic-tile sm"><ClipboardPen size={16} /></span>
          </div>
          <div className="kpi-value mt-1">
            <span>{num(s.total)}</span>
            <small>Laporan</small>
          </div>
          <div className="small muted mt-1">Sesuai filter saat ini</div>
        </div>

        <div className="card" style={{ padding: '18px' }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span className="small" style={{ fontWeight: 700 }}>Laporan Bulan Ini</span>
            <span className="ic-tile sm info"><CalendarCheck size={16} /></span>
          </div>
          <div className="kpi-value mt-1">
            <span>{num(s.bulanIni)}</span>
            <small>Laporan</small>
          </div>
          <div className="small muted mt-1">Dikirim ke superintendent</div>
        </div>

        <div className="card" style={{ padding: '18px' }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span className="small" style={{ fontWeight: 700 }}>Total Penugasan Trainer</span>
            <span className="ic-tile sm praktik"><Users size={16} /></span>
          </div>
          <div className="kpi-value mt-1">
            <span>{num(s.trainer)}</span>
            <small>Baris</small>
          </div>
          <div className="small muted mt-1">Nama • tugas • lokasi</div>
        </div>
      </div>

      {/* Filter Section */}
      <section className="card filter-card">
        <div className="search-row">
          <div className="segmented">
            <button
              type="button"
              className={!mine ? 'active' : ''}
              onClick={() => { setMine(false); setPage(1); }}
            >
              Semua Laporan
            </button>
            <button
              type="button"
              className={mine ? 'active' : ''}
              onClick={() => { setMine(true); setPage(1); }}
            >
              Laporan Saya
            </button>
          </div>

          <span className="input-wrap">
            <Search size={18} />
            <input
              className="input"
              type="search"
              placeholder="Cari nama trainer, tugas, lokasi, superintendent…"
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
            />
          </span>
        </div>

        <div className="filter-grid mt-2">
          <label className="field">
            <span className="field-label tiny">Dari tanggal</span>
            <input
              className="input"
              type="date"
              value={from}
              onChange={(e) => { setFrom(e.target.value); setPage(1); }}
            />
          </label>

          <label className="field">
            <span className="field-label tiny">Sampai tanggal</span>
            <input
              className="input"
              type="date"
              value={to}
              onChange={(e) => { setTo(e.target.value); setPage(1); }}
            />
          </label>

          <div className="field" style={{ justifyContent: 'flex-end', flexDirection: 'row', alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => { setQ(''); setFrom(''); setTo(''); setMine(false); setPage(1); }}
            >
              <RotateCcw size={16} /> Reset Filter
            </button>
          </div>
        </div>
      </section>

      {/* List Section */}
      <section className="card">
        {loading ? (
          <Loader text="Memuat daftar laporan superintendent…" />
        ) : data.items?.length > 0 ? (
          <div className="list">
            {data.items.map((r) => (
              <div
                key={r.id}
                className="list-item"
                onClick={() => navigate(`/pengawas/${encodeURIComponent(r.id)}`)}
                role="link"
                tabIndex={0}
                style={{ cursor: 'pointer' }}
              >
                <span className="ic-tile sm praktik">
                  <ClipboardPen size={16} />
                </span>

                <div className="li-main">
                  <div className="li-title truncate">
                    Laporan Penugasan Tanggal {dateLong(r.tanggal)}
                  </div>
                  <div className="li-meta">
                    <span className="pill pill-mono">{r.id}</span>
                    <span>Kepada: <b>{r.superintendent || 'Superintendent'}</b></span>
                    <span>• Pengawas: {r.pengawasNama || '—'}</span>
                    <span>• {(r.items || []).length} Trainer Ditugaskan</span>
                  </div>
                </div>

                <div className="row" style={{ gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    className="btn-round sm"
                    onClick={(e) => handleDownloadPdf(e, r.id, 'print')}
                    title="Cetak Langsung"
                  >
                    <Printer size={15} />
                  </button>
                  <button
                    type="button"
                    className="btn-round sm"
                    onClick={(e) => handleDownloadPdf(e, r.id, 'download')}
                    title="Unduh PDF"
                  >
                    <Download size={15} />
                  </button>
                  {isAdmin && (
                    <button
                      type="button"
                      className="btn-round sm"
                      onClick={() => setDeleteTarget(r)}
                      title="Hapus Laporan"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Belum ada laporan"
            text="Belum ada laporan pengawas untuk superintendent pada periode ini."
            icon={ClipboardPen}
          />
        )}

        <Pagination
          page={page}
          pages={data.pages || 1}
          total={s.total || 0}
          onPageChange={(p) => setPage(p)}
          label="laporan"
        />
      </section>

      {/* Modal Konfirmasi Hapus */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Hapus Laporan Superintendent?"
        icon={Trash2}
        iconClass="bad"
        footer={
          <>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Batal
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleConfirmDelete}
              disabled={deleting}
            >
              {deleting ? 'Menghapus…' : 'Ya, Hapus'}
            </button>
          </>
        }
      >
        <p className="muted">
          Laporan <b>{deleteTarget?.id}</b> tanggal {deleteTarget && dateLong(deleteTarget.tanggal)} akan
          dihapus dari daftar.
        </p>
      </Modal>
    </motion.div>
  );
}
