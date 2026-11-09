import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChartPie,
  Wrench,
  Building2,
  GraduationCap,
  ArrowRight,
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
import { AnimatedKpiCard } from '../../components/common/AnimatedKpiCard';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } }
};

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
          animation: {
            duration: 900,
            easing: 'easeOutQuart'
          },
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

      donutInstance.current = new Chart(donutChartRef.current, {
        type: 'doughnut',
        data: {
          labels: ['Selesai', 'Dalam Proses', 'Belum Selesai'],
          datasets: [
            {
              data: [selesai, proses, belum],
              backgroundColor: ['#1d9a66', '#c98e0c', '#d34848'],
              borderWidth: 0,
              hoverOffset: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '76%',
          animation: {
            animateRotate: true,
            animateScale: true,
            duration: 1000
          },
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
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Header */}
      <motion.section
        className="hero"
        id="hero"
        variants={itemVariants}
        whileHover={{ scale: 1.005 }}
        transition={{ duration: 0.2 }}
      >
        <div className="hero-content">
          <motion.h1
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {greeting()}, {user?.nama?.split(' ')[0]}!
          </motion.h1>
          <p>
            Ringkasan evaluasi penyelesaian pelatihan dan operasional unit tambang terkini.
          </p>
        </div>
      </motion.section>

      {/* Filter Row */}
      <motion.div
        className="row-wrap on-bg"
        style={{ justifyContent: 'space-between', alignItems: 'center' }}
        variants={itemVariants}
      >
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
      </motion.div>

      {/* 4 Kartu KPI Utama dengan Animasi Count-Up & Stagger */}
      <div className="grid g-4" id="kpis">
        <AnimatedKpiCard
          label="Total Laporan"
          value={s.totalLaporan || 0}
          unit="Laporan"
          sub={`${s.totalTeori || 0} Teori • ${s.totalPraktik || 0} Praktik`}
          icon={FileCheck2}
          iconClass="info"
          delay={0.05}
        />

        <AnimatedKpiCard
          label="Total Peserta Dilatih"
          value={s.totalPeserta || 0}
          unit="Orang"
          sub={`Rata-rata ${s.avgPeserta || 0} peserta / modul`}
          icon={Users}
          iconClass="praktik"
          delay={0.12}
        />

        <AnimatedKpiCard
          label="Jam Pelatihan"
          value={s.totalJam || 0}
          unit="Jam"
          sub={`Teori ${s.jamTeori || 0}j • Praktik ${s.jamPraktik || 0}j`}
          icon={Clock}
          iconClass="violet"
          delay={0.19}
        />

        <AnimatedKpiCard
          label="Tingkat Kelulusan"
          value={pctSelesai}
          unit="% Selesai"
          sub={`${selesaiCount} Selesai • ${prosesCount} Proses`}
          icon={CheckCircle2}
          iconClass="ok"
          delay={0.26}
        />
      </div>

      {/* Main & Side Grid: Grafik Batang & Donut */}
      <div className="grid g-main-side">
        {/* Grafik Batang Ringkasan Laporan */}
        <motion.section className="card" variants={itemVariants}>
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
        </motion.section>

        {/* Grafik Donat Status Penyelesaian */}
        <motion.section className="card" variants={itemVariants}>
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
              <motion.b
                key={pctSelesai}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              >
                {pctSelesai}%
              </motion.b>
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
        </motion.section>
      </div>

      {/* Main & Side Grid: Laporan Terbaru & Top Alat Berat */}
      <div className="grid g-main-side">
        {/* Laporan Terbaru dengan Hover Lift */}
        <motion.section className="card" variants={itemVariants}>
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
              data.latestReports.map((r, idx) => {
                const isPraktik = r.jenis === 'Praktik Lapangan';
                return (
                  <motion.div
                    key={r.id}
                    className="list-item"
                    onClick={() => navigate(`/laporan/${encodeURIComponent(r.id)}`)}
                    role="link"
                    tabIndex={0}
                    style={{ cursor: 'pointer' }}
                    whileHover={{ x: 4, transition: { duration: 0.15 } }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
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
                  </motion.div>
                );
              })
            ) : (
              <div className="empty">
                <span className="small">Belum ada laporan pada periode ini.</span>
              </div>
            )}
          </div>
        </motion.section>

        {/* Top Alat Berat dengan Animated Bar */}
        <motion.section className="card" variants={itemVariants}>
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
                      <motion.span
                        initial={{ width: 0 }}
                        animate={{ width: `${barPct}%` }}
                        transition={{ duration: 1, delay: i * 0.1, ease: 'easeOut' }}
                        style={{ background: 'var(--praktik)' }}
                      />
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
        </motion.section>
      </div>

      {/* Grid 2 Kolom: Peserta per Departemen & Laporan per Trainer */}
      <div className="grid g-2 keep-1">
        <motion.section className="card" variants={itemVariants}>
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
                      <motion.span
                        initial={{ width: 0 }}
                        animate={{ width: `${pctD}%` }}
                        transition={{ duration: 1, delay: idx * 0.08, ease: 'easeOut' }}
                        style={{ background: 'var(--info)' }}
                      />
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
        </motion.section>

        <motion.section className="card" variants={itemVariants}>
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
                      <motion.span
                        initial={{ width: 0 }}
                        animate={{ width: `${pctT}%` }}
                        transition={{ duration: 1, delay: idx * 0.08, ease: 'easeOut' }}
                        style={{ background: 'var(--violet)' }}
                      />
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
        </motion.section>
      </div>
    </motion.div>
  );
}
