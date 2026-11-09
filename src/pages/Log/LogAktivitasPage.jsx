import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  History,
  ShieldAlert,
  Search,
  ListChecks,
  FileText,
  ShieldCheck,
  UserCog,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import Chart from 'chart.js/auto';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { API } from '../../api/apiClient';
import { num, time, date, tz, saveText, csv } from '../../utils/formatters';
import { Pagination } from '../../components/common/Pagination';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';

const AKSI_MAP = {
  login: ['Masuk', 'log-in', 'pill-ok'],
  login_gagal: ['Gagal Masuk', 'shield-alert', 'pill-bad'],
  logout: ['Keluar', 'log-out', 'pill-gray'],
  buat_laporan: ['Buat Laporan', 'file-plus', 'pill-teori'],
  ubah_laporan: ['Ubah Laporan', 'file-edit', 'pill-warn'],
  hapus_laporan: ['Hapus Laporan', 'trash-2', 'pill-bad'],
  unduh_pdf: ['Unduh PDF', 'download', 'pill-info'],
  tambah_pengguna: ['Tambah User', 'user-plus', 'pill-teori'],
  ubah_pengguna: ['Ubah User', 'user-cog', 'pill-warn'],
  reset_password: ['Reset Sandi', 'key-round', 'pill-violet'],
  ubah_master: ['Ubah Master', 'database', 'pill-praktik']
};

export function LogAktivitasPage() {
  const { user } = useAuth();
  const toast = useToast();

  const [q, setQ] = useState('');
  const [days, setDays] = useState(30);
  const [status, setStatus] = useState('SEMUA');
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ items: [], summary: {}, kritisHariIni: [], perJam: [], pages: 1 });

  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    let isCurrent = true;
    const params = { q, days, status, page, size: 25 };

    async function loadLogs() {
      setLoading(true);
      try {
        const res = await API.swr('listLogs', params, (fresh) => {
          if (isCurrent) setData(fresh);
        });
        if (isCurrent) {
          setData(res);
          setLoading(false);
        }
      } catch (err) {
        toast?.bad(err.message, 'Gagal memuat log aktivitas');
        if (isCurrent) setLoading(false);
      }
    }

    loadLogs();

    return () => {
      isCurrent = false;
    };
  }, [q, days, status, page]);

  // Hourly Line Chart
  useEffect(() => {
    if (!data.perJam?.length || !chartRef.current) return;

    if (chartInstance.current) chartInstance.current.destroy();

    const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

    chartInstance.current = new Chart(chartRef.current, {
      type: 'line',
      data: {
        labels: hours,
        datasets: [
          {
            label: 'Aktivitas per Jam',
            data: data.perJam,
            borderColor: '#17707a',
            backgroundColor: 'rgba(23, 112, 122, 0.14)',
            fill: true,
            tension: 0.45,
            borderWidth: 2.5
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { maxTicksLimit: 8 }
          },
          y: {
            beginAtZero: true,
            ticks: { precision: 0 }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [data.perJam]);

  const handleExportCsv = () => {
    if (!data.items?.length) return;
    const rows = [['Timestamp', 'Aksi', 'Aktor', 'No. Badge', 'Target', 'Status', 'Keterangan']];
    data.items.forEach((l) => {
      rows.push([
        l.ts,
        l.aksi,
        l.userNama || '',
        l.userBadge || '',
        l.target || '',
        l.status || '',
        l.detail || ''
      ]);
    });
    saveText(csv(rows), `audit-log-otc-${new Date().toISOString().slice(0, 10)}.csv`);
    toast?.ok(`${data.items.length} log diekspor ke CSV.`, 'Ekspor Log');
  };

  const s = data.summary || { total: 0, hariIni: 0, buat: 0, ubah: 0, loginOk: 0, loginGagal: 0, master: 0, pengguna: 0 };

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
            Admin Control <span>›</span> <b>Log Aktivitas &amp; Audit</b>
          </div>
          <h1 className="page-title">Audit Trail &amp; Log Keamanan</h1>
          <p className="page-desc">
            Rekam jejak seluruh transaksi pelaporan, otentikasi login, serta perubahan data master.
          </p>
        </div>
        <div className="page-actions">
          <button type="button" className="btn btn-ghost" onClick={handleExportCsv}>
            <FileSpreadsheet size={16} /> Ekspor Log CSV
          </button>
        </div>
      </div>

      {/* 4 Kartu Statistik Log */}
      <div className="grid g-4">
        <div className="card" style={{ padding: '18px' }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span className="small" style={{ fontWeight: 700 }}>Total Aktivitas Terdata</span>
            <span className="ic-tile sm"><ListChecks size={16} /></span>
          </div>
          <div className="kpi-value mt-1">
            <span>{num(s.total)}</span>
            <small>Event</small>
          </div>
          <div className="small mt-1">
            <span className="pill pill-teori">
              <TrendingUp size={12} style={{ marginRight: 4 }} /> +{s.hariIni || 0} hari ini
            </span>
          </div>
        </div>

        <div className="card" style={{ padding: '18px' }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span className="small" style={{ fontWeight: 700 }}>Aktivitas Laporan OTC</span>
            <span className="ic-tile sm info"><FileText size={16} /></span>
          </div>
          <div className="kpi-value mt-1">
            <span>{num((s.buat || 0) + (s.ubah || 0))}</span>
            <small>Transaksi</small>
          </div>
          <div className="small muted mt-1">
            {s.buat || 0} dibuat • {s.ubah || 0} diubah
          </div>
        </div>

        <div className="card" style={{ padding: '18px' }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span className="small" style={{ fontWeight: 700 }}>Login &amp; Keamanan</span>
            <span className={`ic-tile sm ${s.loginGagal ? 'bad' : 'ok'}`}>
              <ShieldCheck size={16} />
            </span>
          </div>
          <div className="kpi-value mt-1">
            <span>{num(s.loginOk)}</span>
            <small>Login Sukses</small>
          </div>
          <div className="small mt-1">
            <span className={`pill ${s.loginGagal ? 'pill-bad' : 'pill-ok'}`}>
              {s.loginGagal || 0} gagal / diblokir
            </span>
          </div>
        </div>

        <div className="card" style={{ padding: '18px' }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span className="small" style={{ fontWeight: 700 }}>Modifikasi Master &amp; User</span>
            <span className="ic-tile sm praktik"><UserCog size={16} /></span>
          </div>
          <div className="kpi-value mt-1">
            <span>{num((s.master || 0) + (s.pengguna || 0))}</span>
            <small>Perubahan</small>
          </div>
          <div className="small muted mt-1">
            {s.master || 0} master • {s.pengguna || 0} user
          </div>
        </div>
      </div>

      {/* Event Kritis Hari Ini */}
      {data.kritisHariIni?.length > 0 && (
        <section className="card" style={{ padding: '14px 18px', borderLeft: '4px solid var(--bad)' }}>
          <div className="row" style={{ alignItems: 'center', gap: '10px' }}>
            <span className="ic-tile sm bad"><ShieldAlert size={16} /></span>
            <div>
              <b>{data.kritisHariIni.length} Event Kritis Hari Ini:</b>
              <div className="small muted">
                {data.kritisHariIni.slice(0, 3).map((l, idx) => (
                  <span key={idx} className="mr-2">
                    • {l.aksi} ({l.target})
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Grafik Intensitas per Jam */}
      <section className="card">
        <div className="card-head">
          <div>
            <div className="card-title">Intensitas Aktivitas Hari Ini (per Jam)</div>
            <div className="card-sub">Distribusi waktu transaksi pelatihan dan login pengguna</div>
          </div>
        </div>
        <div style={{ height: '200px', position: 'relative' }}>
          <canvas ref={chartRef} aria-label="Grafik aktivitas per jam" />
        </div>
      </section>

      {/* Filter Row */}
      <section className="card filter-card">
        <div className="search-row">
          <span className="input-wrap">
            <Search size={18} />
            <input
              className="input"
              type="search"
              placeholder="Cari aktor, No. Badge, target, atau aksi…"
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
            />
          </span>

          <div className="segmented">
            <button
              type="button"
              className={status === 'SEMUA' ? 'active' : ''}
              onClick={() => { setStatus('SEMUA'); setPage(1); }}
            >
              Semua Status
            </button>
            <button
              type="button"
              className={status === 'SUKSES' ? 'active' : ''}
              onClick={() => { setStatus('SUKSES'); setPage(1); }}
            >
              Sukses
            </button>
            <button
              type="button"
              className={status === 'GAGAL' ? 'active' : ''}
              onClick={() => { setStatus('GAGAL'); setPage(1); }}
            >
              Gagal
            </button>
          </div>
        </div>
      </section>

      {/* Tabel Log Aktivitas */}
      <section className="card">
        {loading ? (
          <Loader text="Memuat riwayat log aktivitas…" />
        ) : data.items?.length > 0 ? (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Waktu</th>
                  <th>Aksi</th>
                  <th>Pengguna / Aktor</th>
                  <th>Target / Dokumen</th>
                  <th>Status</th>
                  <th>Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((l, idx) => {
                  const aInfo = AKSI_MAP[l.aksi] || [l.aksi, 'activity', 'pill-gray'];
                  return (
                    <tr key={l.id || idx}>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <b>{time(l.ts)}</b> <span className="small muted">{date(l.ts)}</span>
                      </td>
                      <td>
                        <span className={`pill ${aInfo[2]}`}>
                          {aInfo[0]}
                        </span>
                      </td>
                      <td>
                        <b>{l.userNama || '—'}</b>
                        {l.userBadge && <div className="tiny muted">{l.userBadge}</div>}
                      </td>
                      <td>
                        <span className="pill pill-mono">{l.target || '—'}</span>
                      </td>
                      <td>
                        <span className={`pill ${l.status === 'SUKSES' ? 'pill-ok' : 'pill-bad'}`}>
                          {l.status}
                        </span>
                      </td>
                      <td className="small muted">{l.detail || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="Tidak ada log aktivitas"
            text="Tidak ada log yang sesuai dengan kriteria pencarian."
            icon={History}
          />
        )}

        <Pagination
          page={page}
          pages={data.pages || 1}
          total={s.total || 0}
          onPageChange={(p) => setPage(p)}
          label="aktivitas"
        />
      </section>
    </motion.div>
  );
}
