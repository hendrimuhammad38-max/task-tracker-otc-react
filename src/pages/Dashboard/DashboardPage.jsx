import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChartPie,
  Wrench,
  Building2,
  GraduationCap,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  Users,
  Clock,
  CheckCircle2,
  Truck,
  Presentation
} from 'lucide-react';
import Chart from 'chart.js/auto';
import { useAuth } from '../../context/AuthContext';
import { API } from '../../api/apiClient';
import { num, time, date, tz, store, greeting } from '../../utils/formatters';
import { StatusPill } from '../../components/common/StatusPill';

export function DashboardPage() {
  const { user, masters, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [period, setPeriod] = useState(() => store.get('tto_period', 'week'));
  const [jenis, setJenis] = useState('');
  const [dept, setDept] = useState('');
  const [mine, setMine] = useState(false);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const barChartRef = useRef(null);
  const donutChartRef = useRef(null);
  const barInstance = useRef(null);
  const donutInstance = useRef(null);

  const depts = (masters?.departemen || []).filter((d) => d.status !== 'Nonaktif');

  // Load Dashboard Data
  useEffect(() => {
    let isCurrent = true;
    const params = { period, jenis, dept, mine };
    store.set('tto_period', period);

    async function fetchData() {
      setLoading(true);
      try {
        const res = await API.swr(
          'dashboard',
          params,
          (fresh) => {
            if (isCurrent) setData(fresh);
          }
        );
        if (isCurrent) {
          setData(res);
          setLoading(false);
        }
      } catch (err) {
        console.error('Gagal mengambil data dashboard', err);
        if (isCurrent) setLoading(false);
      }
    }

    fetchData();

    return () => {
      isCurrent = false;
    };
  }, [period, jenis, dept, mine]);

  // Render Charts saat data berubah
  useEffect(() => {
    if (!data) return;

    // 1. Bar Chart
    if (barChartRef.current) {
      if (barInstance.current) barInstance.current.destroy();

      const labels = (data.chartData || []).map((x) => x.label);
      const teoriData = (data.chartData || []).map((x) => x.teori || 0);
      const praktikData = (data.chartData || []).map((x) => x.praktik || 0);

      barInstance.current = new Chart(barChartRef.current, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Teori',
              data: teoriData,
              backgroundColor: '#17707a',
              borderRadius: 6
            },
            {
              label: 'Praktik',
              data: praktikData,
              backgroundColor: '#e3992c',
              borderRadius: 6
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
              stacked: true,
              grid: { display: false }
            },
            y: {
              stacked: true,
              beginAtZero: true,
              ticks: { precision: 0 }
            }
          }
        }
      });
    }

    // 2. Donut Chart
    if (donutChartRef.current) {
      if (donutInstance.current) donutInstance.current.destroy();

      const selesai = data.summary?.statusCounts?.['Selesai'] || 0;
      const proses = data.summary?.statusCounts?.['Dalam Proses'] || 0;
      const belum = data.summary?.statusCounts?.['Belum Selesai'] || 0;
      const total = selesai + proses + belum || 1;

      donutInstance.current = new Chart(donutChartRef.current, {
        type: 'doughnut',
        data: {
          labels: ['Selesai', 'Dalam Proses', 'Belum Selesai'],
          datasets: [
            {
              data: [selesai, proses, belum],
              backgroundColor: ['#1d9a66', '#c98e0c', '#d34848'],
              borderWidth: 0,
              hoverOffset: 4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '76%',
          plugins: {
            legend: { display: false }
          }
        }
      });
    }

    return () => {
      if (barInstance.current) barInstance.current.destroy();
      if (donutInstance.current) donutInstance.current.destroy();
    };
  }, [data]);

  const s = data?.summary || {};
  const selesaiCount = s.statusCounts?.['Selesai'] || 0;
  const prosesCount = s.statusCounts?.['Dalam Proses'] || 0;
  const belumCount = s.statusCounts?.['Belum Selesai'] || 0;
  const totalLaporan = s.totalLaporan || 0;
  const pctSelesai = totalLaporan ? Math.round((selesaiCount / totalLaporan) * 100) : 0;

  return (
    <motion.div
      className="stack"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
    >
      {/* Hero Header */}
      <section className="hero" id="hero">
        <div className="hero-content">
          <h1>
            {greeting()}, {user?.nama?.split(' ')[0]}!
          </h1>
          <p>
            Ringkasan evaluasi penyelesaian pelatihan dan operasional unit tambang terkini.
          </p>
        </div>
      </section>

      {/* Filter Row */}
      <div className="row-wrap on-bg" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '17px', fontWeight: 800, margin: 0 }}>
            Ringkasan Kinerja Pelatihan
          </h3>
          <p className="small muted" style={{ margin: '4px 0 0 0' }}>
            {data?.rangeLabel || (loading ? 'Memuat rentang waktu…' : 'Periode aktif')}
          </p>
        </div>

        <div className="row-wrap" style={{ gap: '10px' }}>
          <div className="segmented">
            <button
              type="button"
              className={jenis === '' ? 'active' : ''}
              onClick={() => setJenis('')}
            >
              Semua
            </button>
            <button
              type="button"
              className={jenis === 'Teori Kelas' ? 'active' : ''}
              onClick={() => setJenis('Teori Kelas')}
            >
              Teori
            </button>
            <button
              type="button"
              className={jenis === 'Praktik Lapangan' ? 'active' : ''}
              onClick={() => setJenis('Praktik Lapangan')}
            >
              Praktik
            </button>
          </div>

          <select
            className="select"
            style={{ width: 'auto', height: '38px', minWidth: '170px' }}
            value={dept}
            onChange={(e) => setDept(e.target.value)}
            aria-label="Filter departemen"
          >
            <option value="">Semua Departemen</option>
            {depts.map((d) => (
              <option key={d.id || d.nama} value={d.nama}>
                {d.nama}
              </option>
            ))}
          </select>

          {!isAdmin && (
            <label className="check" style={{ userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={mine}
                onChange={(e) => setMine(e.target.checked)}
              />
              Hanya laporan saya
            </label>
          )}
        </div>
      </div>

      {/* 4 Kartu KPI Utama */}
      <div className="grid g-4" id="kpis">
        {/* KPI 1 */}
        <div className="card" style={{ padding: '18px' }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span className="small" style={{ fontWeight: 700 }}>
              Total Laporan
            </span>
            <span className="ic-tile sm info">
              <FileCheck2 size={16} />
            </span>
          </div>
          <div className="kpi-value mt-1">
            <span>{num(s.totalLaporan || 0)}</span>
            <small>Laporan</small>
          </div>
          <div className="small muted mt-1">
            {s.totalTeori || 0} Teori • {s.totalPraktik || 0} Praktik
          </div>
        </div>

        {/* KPI 2 */}
        <div className="card" style={{ padding: '18px' }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span className="small" style={{ fontWeight: 700 }}>
              Total Peserta Dilatih
            </span>
            <span className="ic-tile sm praktik">
              <Users size={16} />
            </span>
          </div>
          <div className="kpi-value mt-1">
            <span>{num(s.totalPeserta || 0)}</span>
            <small>Orang</small>
          </div>
          <div className="small muted mt-1">
            Rata-rata {s.avgPeserta || 0} peserta / modul
          </div>
        </div>

        {/* KPI 3 */}
        <div className="card" style={{ padding: '18px' }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span className="small" style={{ fontWeight: 700 }}>
              Jam Pelatihan
            </span>
            <span className="ic-tile sm violet">
              <Clock size={16} />
            </span>
          </div>
          <div className="kpi-value mt-1">
            <span>{num(s.totalJam || 0)}</span>
            <small>Jam</small>
          </div>
          <div className="small muted mt-1">
            Teori {s.jamTeori || 0}j • Praktik {s.jamPraktik || 0}j
          </div>
        </div>

        {/* KPI 4 */}
        <div className="card" style={{ padding: '18px' }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span className="small" style={{ fontWeight: 700 }}>
              Tingkat Kelulusan
            </span>
            <span className="ic-tile sm ok">
              <CheckCircle2 size={16} />
            </span>
          </div>
          <div className="kpi-value mt-1">
            <span>{pctSelesai}%</span>
            <small>Selesai</small>
          </div>
          <div className="small muted mt-1">
            {selesaiCount} Selesai • {prosesCount} Proses
          </div>
        </div>
      </div>

      {/* Main & Side Grid: Grafik Batang & Donut */}
      <div className="grid g-main-side">
        {/* Grafik Batang Ringkasan Laporan */}
        <section className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Ringkasan Laporan</div>
              <div className="card-sub">Aktivitas pelaporan modul kelas &amp; praktik unit</div>
            </div>
            <div className="segmented">
              <button
                type="button"
                className={period === 'today' ? 'active' : ''}
                onClick={() => setPeriod('today')}
              >
                Hari Ini
              </button>
              <button
                type="button"
                className={period === 'week' ? 'active' : ''}
                onClick={() => setPeriod('week')}
              >
                Minggu Ini
              </button>
              <button
                type="button"
                className={period === 'month' ? 'active' : ''}
                onClick={() => setPeriod('month')}
              >
                Bulan Ini
              </button>
              <button
                type="button"
                className={period === 'year' ? 'active' : ''}
                onClick={() => setPeriod('year')}
              >
                Tahun Ini
              </button>
            </div>
          </div>

          <div className="chart-box" style={{ height: '260px', position: 'relative' }}>
            <canvas ref={barChartRef} aria-label="Grafik jumlah laporan" />
          </div>

          <div
            className="legend mt-2 row"
            style={{ justifyContent: 'center', gap: '20px', fontSize: '13px' }}
          >
            <span className="row" style={{ alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: '#17707a' }} />
              Teori Kelas
            </span>
            <span className="row" style={{ alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: '#e3992c' }} />
              Praktik Lapangan
            </span>
          </div>
        </section>

        {/* Grafik Donat Status Penyelesaian */}
        <section className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Status Penyelesaian</div>
              <div className="card-sub">Efektivitas penyelesaian pelatihan</div>
            </div>
            <span className="ic-tile sm">
              <ChartPie size={16} />
            </span>
          </div>

          <div className="donut-wrap" style={{ position: 'relative', height: '170px' }}>
            <canvas ref={donutChartRef} aria-label="Grafik status penyelesaian" />
            <div className="donut-center">
              <b>{pctSelesai}%</b>
              <small>Tingkat Selesai</small>
            </div>
          </div>

          <div className="stat-rows mt-2">
            <div className="row" style={{ justifyContent: 'space-between', padding: '6px 0' }}>
              <span className="row" style={{ alignItems: 'center', gap: '6px' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1d9a66' }} />
                Selesai
              </span>
              <b>{selesaiCount}</b>
            </div>
            <div className="row" style={{ justifyContent: 'space-between', padding: '6px 0' }}>
              <span className="row" style={{ alignItems: 'center', gap: '6px' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#c98e0c' }} />
                Dalam Proses
              </span>
              <b>{prosesCount}</b>
            </div>
            <div className="row" style={{ justifyContent: 'space-between', padding: '6px 0' }}>
              <span className="row" style={{ alignItems: 'center', gap: '6px' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#d34848' }} />
                Belum Selesai
              </span>
              <b>{belumCount}</b>
            </div>
          </div>
        </section>
      </div>

      {/* Main & Side Grid: Laporan Terbaru & Top Alat Berat */}
      <div className="grid g-main-side">
        {/* Laporan Terbaru */}
        <section className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Laporan Terbaru</div>
              <div className="card-sub">Laporan terkini dari tim pengajar</div>
            </div>
            <Link to="/laporan" className="link-btn">
              Lihat Semua <ArrowRight size={14} />
            </Link>
          </div>

          <div className="list">
            {(data?.latestReports || []).length > 0 ? (
              data.latestReports.map((r) => {
                const isPraktik = r.jenis === 'Praktik Lapangan';
                return (
                  <div
                    key={r.id}
                    className="list-item"
                    onClick={() => navigate(`/laporan/${encodeURIComponent(r.id)}`)}
                    role="link"
                    tabIndex={0}
                    style={{ cursor: 'pointer' }}
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
                    <StatusPill status={r.status} />
                  </div>
                );
              })
            ) : (
              <div className="empty">
                <span className="small">Belum ada laporan pada periode ini.</span>
              </div>
            )}
          </div>
        </section>

        {/* Top Alat Berat */}
        <section className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Top Alat Berat</div>
              <div className="card-sub">Unit terbanyak dilatih pada periode ini</div>
            </div>
            <span className="ic-tile sm praktik">
              <Wrench size={16} />
            </span>
          </div>

          <div className="stack" style={{ gap: '10px' }}>
            {(data?.topAlat || []).length > 0 ? (
              data.topAlat.map((a, i) => {
                const maxVal = data.topAlat[0]?.count || 1;
                const barPct = Math.round((a.count / maxVal) * 100);
                return (
                  <div key={a.name || i}>
                    <div
                      className="row"
                      style={{ justifyContent: 'space-between', fontSize: '13px', marginBottom: 4 }}
                    >
                      <b>{a.name}</b>
                      <span>{a.count} Kali</span>
                    </div>
                    <div className="progress">
                      <span style={{ width: `${barPct}%`, background: 'var(--praktik)' }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty">
                <span className="small">Belum ada pelatihan unit alat berat.</span>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Grid 2 Kolom: Peserta per Departemen & Laporan per Trainer */}
      <div className="grid g-2 keep-1">
        <section className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Peserta per Departemen</div>
              <div className="card-sub">Jumlah peserta terlatih pada periode ini</div>
            </div>
            <span className="ic-tile sm info">
              <Building2 size={16} />
            </span>
          </div>

          <div className="stack" style={{ gap: '12px' }}>
            {(data?.perDept || []).length > 0 ? (
              data.perDept.map((d, idx) => {
                const maxP = data.perDept[0]?.count || 1;
                const pctD = Math.round((d.count / maxP) * 100);
                return (
                  <div key={d.name || idx}>
                    <div
                      className="row"
                      style={{ justifyContent: 'space-between', fontSize: '13px', marginBottom: 4 }}
                    >
                      <b>{d.name}</b>
                      <span>{num(d.count)} Peserta</span>
                    </div>
                    <div className="progress">
                      <span style={{ width: `${pctD}%`, background: 'var(--info)' }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty">
                <span className="small">Belum ada data departemen.</span>
              </div>
            )}
          </div>
        </section>

        <section className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Laporan per Trainer</div>
              <div className="card-sub">Kontribusi pelaporan tiap instruktur</div>
            </div>
            <span className="ic-tile sm violet">
              <GraduationCap size={16} />
            </span>
          </div>

          <div className="stack" style={{ gap: '12px' }}>
            {(data?.perTrainer || []).length > 0 ? (
              data.perTrainer.map((t, idx) => {
                const maxT = data.perTrainer[0]?.count || 1;
                const pctT = Math.round((t.count / maxT) * 100);
                return (
                  <div key={t.name || idx}>
                    <div
                      className="row"
                      style={{ justifyContent: 'space-between', fontSize: '13px', marginBottom: 4 }}
                    >
                      <b>{t.name}</b>
                      <span>{t.count} Laporan</span>
                    </div>
                    <div className="progress">
                      <span style={{ width: `${pctT}%`, background: 'var(--violet)' }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty">
                <span className="small">Belum ada data trainer.</span>
              </div>
            )}
          </div>
        </section>
      </div>
    </motion.div>
  );
}
