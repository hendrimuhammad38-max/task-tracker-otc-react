import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Save,
  Plus,
  Trash2,
  ArrowLeft,
  Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { API } from '../../api/apiClient';
import { today } from '../../utils/formatters';
import { Loader } from '../../components/common/Loader';

export function PengawasFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { user, masters } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [loadingInitial, setLoadingInitial] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  const [tanggal, setTanggal] = useState(today());
  const [superintendent, setSuperintendent] = useState('');
  const [catatan, setCatatan] = useState('');
  const [items, setItems] = useState([
    { trainerNama: '', tugas: '', lokasi: '', keterangan: '' }
  ]);

  useEffect(() => {
    if (!isEdit) return;

    async function loadReport() {
      try {
        const d = await API.call('getSupReport', { id });
        setTanggal(d.tanggal ? d.tanggal.slice(0, 10) : today());
        setSuperintendent(d.superintendent || '');
        setCatatan(d.catatan || '');
        if (d.items?.length) setItems(d.items);
      } catch (err) {
        toast?.bad(err.message, 'Gagal memuat laporan');
        navigate('/pengawas');
      } finally {
        setLoadingInitial(false);
      }
    }

    loadReport();
  }, [id, isEdit]);

  const handleAddItem = () => {
    setItems([...items, { trainerNama: '', tugas: '', lokasi: '', keterangan: '' }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) {
      setItems([{ trainerNama: '', tugas: '', lokasi: '', keterangan: '' }]);
      return;
    }
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tanggal) {
      toast?.warn('Tanggal wajib diisi.', 'Validasi Form');
      return;
    }

    const validItems = items.filter((it) => it.trainerNama.trim() || it.tugas.trim());
    if (!validItems.length) {
      toast?.warn('Minimal 1 data penugasan trainer harus diisi.', 'Validasi Form');
      return;
    }

    setSubmitting(true);
    const payload = {
      tanggal,
      superintendent: superintendent.trim() || 'Superintendent Operasional',
      items: validItems,
      catatan: catatan.trim()
    };

    try {
      if (isEdit) {
        await API.call('updateSupReport', { id, ...payload });
        toast?.ok(`Laporan ${id} berhasil diperbarui.`, 'Tersimpan');
        navigate(`/pengawas/${encodeURIComponent(id)}`);
      } else {
        const res = await API.call('createSupReport', payload);
        toast?.ok(`Laporan superintendent ${res.id || ''} berhasil dibuat.`, 'Berhasil');
        navigate('/pengawas');
      }
    } catch (err) {
      toast?.bad(err.message, 'Gagal menyimpan laporan superintendent');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingInitial) return <Loader text="Menyiapkan data laporan…" />;

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
            <Link to="/pengawas">Laporan Superintendent</Link> <span>›</span>{' '}
            <b>{isEdit ? `Ubah Laporan (${id})` : 'Buat Laporan Baru'}</b>
          </div>
          <h1 className="page-title">
            {isEdit ? 'Ubah Laporan Superintendent' : 'Laporan Penugasan ke Superintendent'}
          </h1>
          <p className="page-desc">
            Catat penugasan harian seluruh trainer, area kerja, dan evaluasi operasional.
          </p>
        </div>
        <div className="page-actions">
          <Link to="/pengawas" className="btn btn-ghost">
            <ArrowLeft size={16} /> Batal
          </Link>
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
        <section className="card">
          <div className="card-head">
            <div className="card-title">Informasi Laporan</div>
          </div>

          <div className="grid g-2">
            <label className="field">
              <span className="field-label">
                Tanggal Penugasan <span className="req">*</span>
              </span>
              <input
                className="input"
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                required
              />
            </label>

            <label className="field">
              <span className="field-label">Ditujukan Kepada (Superintendent)</span>
              <input
                className="input"
                placeholder="Contoh: Bpk. Bambang / Superintendent Training"
                value={superintendent}
                onChange={(e) => setSuperintendent(e.target.value)}
              />
            </label>
          </div>

          <label className="field mt-2">
            <span className="field-label">Catatan Tambahan untuk Superintendent</span>
            <textarea
              className="textarea"
              rows={3}
              placeholder="Kondisi lapangan, kendala cuaca, ketersediaan unit alat berat…"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
            />
          </label>
        </section>

        {/* Tabel Penugasan Trainer */}
        <section className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Daftar Penugasan Trainer</div>
              <div className="card-sub">{items.length} Baris Penugasan</div>
            </div>
            <button
              type="button"
              className="btn btn-ghost sm"
              onClick={handleAddItem}
            >
              <Plus size={16} /> Tambah Trainer
            </button>
          </div>

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>No</th>
                  <th>
                    Nama Trainer <span className="req">*</span>
                  </th>
                  <th>
                    Tugas / Modul Pekerjaan <span className="req">*</span>
                  </th>
                  <th>Lokasi Penugasan</th>
                  <th>Keterangan Tambahan</th>
                  <th style={{ width: 50 }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>
                      <input
                        className="input sm"
                        placeholder="Nama Trainer"
                        value={it.trainerNama}
                        onChange={(e) => handleItemChange(idx, 'trainerNama', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        className="input sm"
                        placeholder="Contoh: Training Excavator PC2000"
                        value={it.tugas}
                        onChange={(e) => handleItemChange(idx, 'tugas', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        className="input sm"
                        list="lokasi-options"
                        placeholder="Area / Pit Training"
                        value={it.lokasi}
                        onChange={(e) => handleItemChange(idx, 'lokasi', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        className="input sm"
                        placeholder="Catatan shift, jam, dll."
                        value={it.keterangan}
                        onChange={(e) => handleItemChange(idx, 'keterangan', e.target.value)}
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-round sm"
                        onClick={() => handleRemoveItem(idx)}
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

          <datalist id="lokasi-options">
            {lokasiList.map((l, idx) => (
              <option key={idx} value={l.nama} />
            ))}
          </datalist>

          <div className="row mt-2" style={{ justifyContent: 'space-between' }}>
            <button
              type="button"
              className="btn btn-ghost sm"
              onClick={handleAddItem}
            >
              <Plus size={16} /> Tambah Baris Penugasan
            </button>
          </div>
        </section>
      </form>
    </motion.div>
  );
}
