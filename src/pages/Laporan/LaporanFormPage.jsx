import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FilePlus2,
  Save,
  Plus,
  Trash2,
  Eye,
  ArrowLeft,
  Users,
  HardHat,
  Presentation,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { API } from '../../api/apiClient';
import { today, b64ToBlob, saveBlob } from '../../utils/formatters';
import { Loader } from '../../components/common/Loader';
import { Modal } from '../../components/common/Modal';

export function LaporanFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { user, masters, refreshBootstrap } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [loadingInitial, setLoadingInitial] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [previewBlobUrl, setPreviewBlobUrl] = useState(null);

  // Form Fields
  const [namaPel, setNamaPel] = useState('');
  const [jenis, setJenis] = useState('Teori Kelas');
  const [tglPel, setTglPel] = useState(today());
  const [jamMulai, setJamMulai] = useState('08:00');
  const [jamSelesai, setJamSelesai] = useState('16:00');
  const [totalJam, setTotalJam] = useState(8);
  const [lokasi, setLokasi] = useState('');
  const [alat, setAlat] = useState('');
  const [status, setStatus] = useState('Selesai');
  const [catatan, setCatatan] = useState('');
  const [peserta, setPeserta] = useState([
    { nama: '', badge: '', dept: '', nilai: '', status: 'Selesai' }
  ]);

  // Load existing data if edit mode
  useEffect(() => {
    if (!isEdit) {
      if (masters?.lokasi?.length && !lokasi) setLokasi(masters.lokasi[0].nama);
      return;
    }

    async function loadDetail() {
      try {
        const d = await API.call('getReport', { id });
        setNamaPel(d.namaPel || '');
        setJenis(d.jenis || 'Teori Kelas');
        setTglPel(d.tglPel ? d.tglPel.slice(0, 10) : today());
        setJamMulai(d.jamMulai || '08:00');
        setJamSelesai(d.jamSelesai || '16:00');
        setTotalJam(d.totalJam || 8);
        setLokasi(d.lokasi || '');
        setAlat(d.alat || '');
        setStatus(d.status || 'Selesai');
        setCatatan(d.catatan || '');
        if (d.peserta?.length) setPeserta(d.peserta);
      } catch (err) {
        toast?.bad(err.message, 'Gagal memuat data laporan');
        navigate('/laporan');
      } finally {
        setLoadingInitial(false);
      }
    }

    loadDetail();
  }, [id, isEdit]);

  // Hitung total jam otomatis
  const calculateHours = (start, end) => {
    if (!start || !end) return 0;
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    const diff = h2 * 60 + m2 - (h1 * 60 + m1);
    return diff > 0 ? Number((diff / 60).toFixed(1)) : 0;
  };

  const handleJamChange = (start, end) => {
    setJamMulai(start);
    setJamSelesai(end);
    const h = calculateHours(start, end);
    if (h > 0) setTotalJam(h);
  };

  // Peserta table handlers
  const handleAddPeserta = () => {
    setPeserta([...peserta, { nama: '', badge: '', dept: '', nilai: '', status: 'Selesai' }]);
  };

  const handleRemovePeserta = (index) => {
    if (peserta.length <= 1) {
      setPeserta([{ nama: '', badge: '', dept: '', nilai: '', status: 'Selesai' }]);
      return;
    }
    setPeserta(peserta.filter((_, idx) => idx !== index));
  };

  const handlePesertaChange = (index, field, value) => {
    const updated = [...peserta];
    updated[index][field] = value;
    setPeserta(updated);
  };

  // Validasi form
  const validateForm = () => {
    if (!namaPel.trim()) {
      toast?.warn('Nama / modul pelatihan wajib diisi.', 'Validasi Form');
      return false;
    }
    if (!tglPel) {
      toast?.warn('Tanggal pelatihan wajib diisi.', 'Validasi Form');
      return false;
    }
    if (jenis === 'Praktik Lapangan' && !alat) {
      toast?.warn('Unit alat berat wajib dipilih untuk praktik lapangan.', 'Validasi Form');
      return false;
    }
    const validPeserta = peserta.filter((p) => p.nama.trim() || p.badge.trim());
    if (!validPeserta.length) {
      toast?.warn('Minimal 1 data peserta harus diisi.', 'Validasi Form');
      return false;
    }
    return true;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    const payload = {
      namaPel: namaPel.trim(),
      jenis,
      tglPel,
      jamMulai,
      jamSelesai,
      totalJam: Number(totalJam) || 0,
      lokasi,
      alat: jenis === 'Praktik Lapangan' ? alat : '',
      status,
      catatan,
      peserta: peserta.filter((p) => p.nama.trim() || p.badge.trim())
    };

    try {
      if (isEdit) {
        await API.call('updateReport', { id, ...payload });
        toast?.ok(`Laporan ${id} berhasil diperbarui.`, 'Tersimpan');
        navigate(`/laporan/${encodeURIComponent(id)}`);
      } else {
        const res = await API.call('createReport', payload);
        toast?.ok(`Laporan ${res.id || ''} berhasil dibuat.`, 'Berhasil');
        navigate('/laporan');
      }
    } catch (err) {
      toast?.bad(err.message, 'Gagal menyimpan laporan');
    } finally {
      setSubmitting(false);
    }
  };

  // Preview PDF
  const handlePreviewPdf = async () => {
    if (!validateForm()) return;
    setPreviewing(true);
    const payload = {
      namaPel: namaPel.trim(),
      jenis,
      tglPel,
      jamMulai,
      jamSelesai,
      totalJam: Number(totalJam) || 0,
      lokasi,
      alat: jenis === 'Praktik Lapangan' ? alat : '',
      status,
      catatan,
      peserta: peserta.filter((p) => p.nama.trim() || p.badge.trim())
    };

    try {
      const res = await API.call('previewPdf', payload);
      const blob = b64ToBlob(res.base64, res.mime || 'application/pdf');
      const url = URL.createObjectURL(blob);
      setPreviewBlobUrl(url);
    } catch (err) {
      toast?.bad(err.message, 'Gagal membuat pratinjau PDF');
    } finally {
      setPreviewing(false);
    }
  };

  if (loadingInitial) return <Loader text="Menyiapkan formulir laporan…" />;

  const pelatihanList = masters?.pelatihan || [];
  const alatList = masters?.alat || [];
  const departemenList = masters?.departemen || [];
  const lokasiList = masters?.lokasi || [];

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
            <Link to="/laporan">Daftar Laporan</Link> <span>›</span>{' '}
            <b>{isEdit ? `Ubah Laporan (${id})` : 'Laporan Baru'}</b>
          </div>
          <h1 className="page-title">{isEdit ? 'Ubah Laporan Pelatihan' : 'Input Laporan Pelatihan Baru'}</h1>
          <p className="page-desc">
            Lengkapi detail modul pelatihan, durasi kelas/lapangan, dan daftar hadir peserta.
          </p>
        </div>
        <div className="page-actions">
          <Link to="/laporan" className="btn btn-ghost">
            <ArrowLeft size={16} /> Batal
          </Link>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={handlePreviewPdf}
            disabled={previewing}
          >
            {previewing ? <span className="spinner" /> : <Eye size={16} />}
            Pratinjau PDF
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? <span className="spinner" /> : <Save size={16} />}
            {isEdit ? 'Simpan Perubahan' : 'Kirim Laporan'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="stack">
        {/* Card 1: Data Modul & Pelatihan */}
        <section className="card">
          <div className="card-head">
            <div className="card-title">Informasi Modul Pelatihan</div>
          </div>

          <div className="grid g-2">
            <label className="field">
              <span className="field-label">
                Modul Pelatihan <span className="req">*</span>
              </span>
              <input
                className="input"
                list="pelatihan-options"
                placeholder="Pilih atau ketik modul pelatihan…"
                value={namaPel}
                onChange={(e) => setNamaPel(e.target.value)}
                required
              />
              <datalist id="pelatihan-options">
                {pelatihanList.map((p, idx) => (
                  <option key={idx} value={p.nama} />
                ))}
              </datalist>
            </label>

            <label className="field">
              <span className="field-label">Jenis Pelatihan</span>
              <div className="segmented">
                <button
                  type="button"
                  className={jenis === 'Teori Kelas' ? 'active' : ''}
                  onClick={() => setJenis('Teori Kelas')}
                >
                  <Presentation size={15} style={{ marginRight: 6 }} />
                  Teori Kelas
                </button>
                <button
                  type="button"
                  className={jenis === 'Praktik Lapangan' ? 'active' : ''}
                  onClick={() => setJenis('Praktik Lapangan')}
                >
                  <HardHat size={15} style={{ marginRight: 6 }} />
                  Praktik Lapangan
                </button>
              </div>
            </label>

            <label className="field">
              <span className="field-label">
                Tanggal Pelaksanaan <span className="req">*</span>
              </span>
              <input
                className="input"
                type="date"
                value={tglPel}
                onChange={(e) => setTglPel(e.target.value)}
                required
              />
            </label>

            <div className="grid g-2">
              <label className="field">
                <span className="field-label">Jam Mulai</span>
                <input
                  className="input"
                  type="time"
                  value={jamMulai}
                  onChange={(e) => handleJamChange(e.target.value, jamSelesai)}
                />
              </label>

              <label className="field">
                <span className="field-label">Jam Selesai</span>
                <input
                  className="input"
                  type="time"
                  value={jamSelesai}
                  onChange={(e) => handleJamChange(jamMulai, e.target.value)}
                />
              </label>
            </div>

            <label className="field">
              <span className="field-label">Lokasi Training</span>
              <select
                className="select"
                value={lokasi}
                onChange={(e) => setLokasi(e.target.value)}
              >
                <option value="">Pilih Lokasi Training</option>
                {lokasiList.map((l, idx) => (
                  <option key={idx} value={l.nama}>
                    {l.nama}
                  </option>
                ))}
              </select>
            </label>

            {jenis === 'Praktik Lapangan' ? (
              <label className="field">
                <span className="field-label">
                  Unit Alat Berat <span className="req">*</span>
                </span>
                <select
                  className="select"
                  value={alat}
                  onChange={(e) => setAlat(e.target.value)}
                  required
                >
                  <option value="">Pilih Unit Armada</option>
                  {alatList.map((a, idx) => (
                    <option key={idx} value={a.nama}>
                      {a.nama}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <label className="field">
                <span className="field-label">Status Penyelesaian Modul</span>
                <select
                  className="select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Selesai">Selesai</option>
                  <option value="Dalam Proses">Dalam Proses</option>
                  <option value="Belum Selesai">Belum Selesai</option>
                </select>
              </label>
            )}
          </div>

          <label className="field mt-3">
            <span className="field-label">Catatan &amp; Evaluasi Pelaksanaan</span>
            <textarea
              className="textarea"
              rows={3}
              placeholder="Catatan tambahan hasil pelatihan, kendala lapangan, atau rekomendasi tindak lanjut…"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
            />
          </label>
        </section>

        {/* Card 2: Tabel Peserta */}
        <section className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Daftar Peserta Pelatihan</div>
              <div className="card-sub">{peserta.length} Peserta Terdaftar</div>
            </div>
            <button
              type="button"
              className="btn btn-ghost sm"
              onClick={handleAddPeserta}
            >
              <Plus size={16} /> Tambah Baris
            </button>
          </div>

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>No</th>
                  <th>
                    Nama Lengkap <span className="req">*</span>
                  </th>
                  <th>
                    No. Badge <span className="req">*</span>
                  </th>
                  <th>Departemen</th>
                  <th style={{ width: 100 }}>Nilai</th>
                  <th style={{ width: 150 }}>Status</th>
                  <th style={{ width: 50 }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {peserta.map((p, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>
                      <input
                        className="input sm"
                        placeholder="Nama Peserta"
                        value={p.nama}
                        onChange={(e) => handlePesertaChange(idx, 'nama', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        className="input sm"
                        placeholder="No. Badge"
                        value={p.badge}
                        onChange={(e) => handlePesertaChange(idx, 'badge', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        className="input sm"
                        list="dept-options"
                        placeholder="Departemen"
                        value={p.dept}
                        onChange={(e) => handlePesertaChange(idx, 'dept', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        className="input sm"
                        type="number"
                        placeholder="0-100"
                        value={p.nilai}
                        onChange={(e) => handlePesertaChange(idx, 'nilai', e.target.value)}
                      />
                    </td>
                    <td>
                      <select
                        className="select sm"
                        value={p.status || 'Selesai'}
                        onChange={(e) => handlePesertaChange(idx, 'status', e.target.value)}
                      >
                        <option value="Selesai">Selesai</option>
                        <option value="Dalam Proses">Proses</option>
                        <option value="Belum Selesai">Belum</option>
                      </select>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-round sm"
                        onClick={() => handleRemovePeserta(idx)}
                        title="Hapus baris"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <datalist id="dept-options">
            {departemenList.map((d, idx) => (
              <option key={idx} value={d.nama} />
            ))}
          </datalist>

          <div className="row mt-2" style={{ justifyContent: 'space-between' }}>
            <button
              type="button"
              className="btn btn-ghost sm"
              onClick={handleAddPeserta}
            >
              <Plus size={16} /> Tambah Baris Peserta
            </button>
          </div>
        </section>
      </form>

      {/* Modal Pratinjau PDF */}
      <Modal
        isOpen={Boolean(previewBlobUrl)}
        onClose={() => {
          if (previewBlobUrl) URL.revokeObjectURL(previewBlobUrl);
          setPreviewBlobUrl(null);
        }}
        title="Pratinjau PDF Laporan"
        subtitle="Verifikasi format dokumen sebelum dikirimkan ke pengawas"
        icon={Eye}
        size="lg"
        footer={
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              if (previewBlobUrl) URL.revokeObjectURL(previewBlobUrl);
              setPreviewBlobUrl(null);
            }}
          >
            Tutup Pratinjau
          </button>
        }
      >
        {previewBlobUrl && (
          <div style={{ height: '70vh', width: '100%' }}>
            <iframe
              src={previewBlobUrl}
              title="Pratinjau PDF"
              style={{ width: '100%', height: '100%', border: 'none', borderRadius: '8px' }}
            />
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
