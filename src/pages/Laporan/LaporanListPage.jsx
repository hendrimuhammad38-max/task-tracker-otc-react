import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FilePlus2,
  Search,
  Download,
  RotateCcw,
  Truck,
  Presentation,
  FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { API } from '../../api/apiClient';
import { num, time, date, tz, b64ToBlob, saveBlob, saveText, csv } from '../../utils/formatters';
import { StatusPill } from '../../components/common/StatusPill';
import { Pagination } from '../../components/common/Pagination';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } }
};

export function LaporanListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [q, setQ] = useState(searchParams.get('q') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [jenis, setJenis] = useState(searchParams.get('jenis') || '');
  const [mine, setMine] = useState(searchParams.get('mine') === '1');
  const [from, setFrom] = useState(searchParams.get('from') || '');
  const [to, setTo] = useState(searchParams.get('to') || '');
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    const qParam = searchParams.get('q');
    if (qParam !== null && qParam !== q) setQ(qParam);
    const mineParam = searchParams.get('mine');
    if (mineParam === '1' && !mine) setMine(true);
  }, [searchParams]);

  useEffect(() => {
    let isCurrent = true;
    const params = {
      q,
      status,
      jenis,
      mine,
      from,
      to,
      sort: 'ts_desc',
      page,
      size: 15
    };

    async function loadReports() {
      setLoading(true);
      try {
        const res = await API.swr('listReports', params, (fresh) => {
          if (isCurrent) setData(fresh);
        });
        if (isCurrent) {
          setData(res);
          setLoading(false);
        }
      } catch (err) {
        toast?.bad(err.message, 'Gagal memuat laporan');
        if (isCurrent) setLoading(false);
      }
    }

    loadReports();

    return () => {
      isCurrent = false;
    };
  }, [q, status, jenis, mine, from, to, page]);

  const handleReset = () => {
    setQ('');
    setStatus('');
    setJenis('');
    setMine(false);
    setFrom('');
    setTo('');
    setPage(1);
    setSearchParams({});
  };

  const handleDownloadPdf = async (e, id) => {
    e.stopPropagation();
    setDownloadingId(id);
    try {
      const d = await API.call('downloadPdf', { id });
      const blob = b64ToBlob(d.base64, d.mime);
      saveBlob(blob, d.fileName);
      toast?.ok(`PDF ${d.fileName} berhasil diunduh.`, 'Sukses');
    } catch (err) {
      toast?.bad(err.message, 'Gagal mengunduh PDF');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleExportCsv = async () => {
    try {
      const res = await API.call('listReports', {
        q,
        status,
        jenis,
        mine,
        from,
        to,
        page: 1,
        size: 500
      });
      if (!res.items?.length) {
        toast?.warn('Tidak ada data untuk diekspor.', 'Ekspor CSV');
        return;
      }
      const rows = [
        ['ID', 'Modul Pelatihan', 'Jenis', 'Tanggal', 'Trainer', 'Badge', 'Jumlah Peserta', 'Status', 'Lokasi', 'Unit']
      ];
      res.items.forEach((r) => {
        rows.push([
          r.id,
          r.namaPel,
          r.jenis,
          r.tglPel,
          r.trainerNama,
          r.trainerBadge,
          r.jml,
          r.status,
          r.lokasi || '',
          r.alat || ''
        ]);
      });
      saveText(csv(rows), `laporan-otc-${new Date().toISOString().slice(0, 10)}.csv`);
      toast?.ok(`${res.items.length} baris laporan diekspor ke CSV.`, 'Ekspor Sukses');
    } catch (err) {
      toast?.bad(err.message, 'Gagal mengekspor CSV');
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
            Aplikasi <span>›</span> <b>Daftar Laporan</b>
          </div>
          <h1 className="page-title">Laporan Penyelesaian Pelatihan</h1>
          <p className="page-desc">
            Seluruh data riwayat modul kelas teori dan praktik lapangan unit alat berat.
          </p>
        </div>
        <div className="page-actions">
          <motion.button
            type="button"
            className="btn btn-ghost"
            onClick={handleExportCsv}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FileSpreadsheet size={16} />
            Ekspor CSV
          </motion.button>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link to="/laporan-baru" className="btn btn-primary">
              <FilePlus2 size={16} />
              Laporan Baru
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Filter Section */}
      <section className="card filter-card">
        <div className="search-row">
          <span className="input-wrap">
            <Search size={18} />
            <input
              className="input"
              type="search"
              placeholder="Cari modul, trainer, no. badge, unit, atau ID laporan…"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
            />
          </span>

          <div className="segmented">
            <button
              type="button"
              className={status === '' ? 'active' : ''}
              onClick={() => {
                setStatus('');
                setPage(1);
              }}
            >
              Semua
            </button>
            <button
              type="button"
              className={status === 'Selesai' ? 'active' : ''}
              onClick={() => {
                setStatus('Selesai');
                setPage(1);
              }}
            >
              Selesai
            </button>
            <button
              type="button"
              className={status === 'Dalam Proses' ? 'active' : ''}
              onClick={() => {
                setStatus('Dalam Proses');
                setPage(1);
              }}
            >
              Proses
            </button>
          </div>
        </div>

        <div className="filter-grid mt-2">
          <label className="field">
            <span className="field-label tiny">Jenis Pelatihan</span>
            <select
              className="select"
              value={jenis}
              onChange={(e) => {
                setJenis(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Semua Jenis</option>
              <option value="Teori Kelas">Teori Kelas</option>
              <option value="Praktik Lapangan">Praktik Lapangan</option>
            </select>
          </label>

          <label className="field">
            <span className="field-label tiny">Dari tanggal</span>
            <input
              className="input"
              type="date"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                setPage(1);
              }}
            />
          </label>

          <label className="field">
            <span className="field-label tiny">Sampai tanggal</span>
            <input
              className="input"
              type="date"
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                setPage(1);
              }}
            />
          </label>

          <div
            className="field"
            style={{
              justifyContent: 'flex-end',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <label className="check">
              <input
                type="checkbox"
                checked={mine}
                onChange={(e) => {
                  setMine(e.target.checked);
                  setPage(1);
                }}
              />
              Hanya milik saya
            </label>
            <button type="button" className="btn btn-ghost" onClick={handleReset}>
              <RotateCcw size={16} />
              Reset
            </button>
          </div>
        </div>
      </section>

      {/* List Laporan dengan Animasi Stagger */}
      <section className="card mt-2">
        {loading ? (
          <Loader text="Memuat daftar laporan…" />
        ) : data.items?.length > 0 ? (
          <motion.div
            className="list"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {data.items.map((r) => {
              const isPraktik = r.jenis === 'Praktik Lapangan';
              const isDownloading = downloadingId === r.id;

              return (
                <motion.div
                  key={r.id}
                  className="list-item"
                  onClick={() => navigate(`/laporan/${encodeURIComponent(r.id)}`)}
                  role="link"
                  tabIndex={0}
                  style={{ cursor: 'pointer' }}
                  variants={itemVariants}
                  whileHover={{ x: 6, transition: { duration: 0.15 } }}
                >
                  <span className={`ic-tile sm ${isPraktik ? 'praktik' : ''}`}>
                    {isPraktik ? <Truck size={16} /> : <Presentation size={16} />}
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

                  <span className="hide-mobile">
                    <StatusPill status={r.status} />
                  </span>

                  <motion.button
                    type="button"
                    className="btn-round"
                    onClick={(e) => handleDownloadPdf(e, r.id)}
                    title="Unduh PDF"
                    disabled={isDownloading}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {isDownloading ? (
                      <span
                        className="spinner"
                        style={{ width: 14, height: 14, borderWidth: 2 }}
                      />
                    ) : (
                      <Download size={15} />
                    )}
                  </motion.button>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <EmptyState
            title="Tidak ada laporan"
            text="Tidak ada laporan yang sesuai dengan filter atau kata kunci pencarian."
          />
        )}

        <Pagination
          page={page}
          pages={data.pages || 1}
          total={data.total || 0}
          onPageChange={(p) => setPage(p)}
          label="laporan"
        />
      </section>
    </motion.div>
  );
}
