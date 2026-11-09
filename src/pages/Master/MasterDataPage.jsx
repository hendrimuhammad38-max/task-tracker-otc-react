import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Database,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  GraduationCap,
  Wrench,
  Building2,
  MapPin
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { API } from '../../api/apiClient';
import { num } from '../../utils/formatters';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';

export function MasterDataPage() {
  const { masters: authMasters, bootstrap, isAdmin } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('pelatihan');
  const [loading, setLoading] = useState(true);
  const [masters, setMasters] = useState({
    pelatihan: [],
    alat: [],
    departemen: [],
    lokasi: []
  });

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formName, setFormName] = useState('');
  const [formExtra, setFormExtra] = useState('');
  const [formStatus, setFormStatus] = useState('Aktif');
  const [submitting, setSubmitting] = useState(false);

  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadMasters = async () => {
    setLoading(true);
    try {
      const res = await API.swr('listMasters', {});
      setMasters(res || { pelatihan: [], alat: [], departemen: [], lokasi: [] });
    } catch (err) {
      toast?.bad(err.message, 'Gagal memuat data master');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMasters();
  }, []);

  const openAddModal = () => {
    setEditItem(null);
    setFormName('');
    setFormExtra(activeTab === 'pelatihan' ? 'Teori Kelas' : '');
    setFormStatus('Aktif');
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditItem(item);
    setFormName(item.nama || '');
    setFormExtra(item.jenis || item.kategori || '');
    setFormStatus(item.status || 'Aktif');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast?.warn('Nama item wajib diisi.', 'Data Master');
      return;
    }

    setSubmitting(true);
    const payload = {
      type: activeTab,
      id: editItem ? editItem.id : undefined,
      nama: formName.trim(),
      status: formStatus
    };

    if (activeTab === 'pelatihan') payload.jenis = formExtra || 'Teori Kelas';
    if (activeTab === 'alat') payload.kategori = formExtra || 'Heavy Equipment';

    try {
      await API.call('saveMaster', payload);
      toast?.ok(`Data ${formName} berhasil disimpan.`, 'Data Master');
      setModalOpen(false);
      loadMasters();
      bootstrap();
    } catch (err) {
      toast?.bad(err.message, 'Gagal menyimpan data master');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      await API.call('deleteMaster', { type: activeTab, id: deleteModal.id });
      toast?.ok(`Data ${deleteModal.nama} berhasil dihapus.`, 'Data Master');
      setDeleteModal(null);
      loadMasters();
      bootstrap();
    } catch (err) {
      toast?.bad(err.message, 'Gagal menghapus data master');
    } finally {
      setDeleting(false);
    }
  };

  const currentList = masters[activeTab] || [];

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
            Admin Control <span>›</span> <b>Data Master</b>
          </div>
          <h1 className="page-title">Konfigurasi Data Master</h1>
          <p className="page-desc">
            Standarisasi modul pelatihan, armada alat berat, departemen operasional, dan titik training.
          </p>
        </div>
        <div className="page-actions">
          <button type="button" className="btn btn-primary" onClick={openAddModal}>
            <Plus size={16} /> Tambah Data Baru
          </button>
        </div>
      </div>

      {/* 4 Kartu Statistik Master */}
      <div className="grid g-4">
        <div
          className={`card clickable ${activeTab === 'pelatihan' ? 'ring' : ''}`}
          style={{ padding: '16px', cursor: 'pointer' }}
          onClick={() => setActiveTab('pelatihan')}
        >
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span className="small" style={{ fontWeight: 700 }}>Modul Pelatihan</span>
            <span className="ic-tile sm"><GraduationCap size={16} /></span>
          </div>
          <div className="kpi-value mt-1">
            <span>{num(masters.pelatihan?.filter((x) => x.status === 'Aktif').length || 0)}</span>
            <small>Modul Aktif</small>
          </div>
        </div>

        <div
          className={`card clickable ${activeTab === 'alat' ? 'ring' : ''}`}
          style={{ padding: '16px', cursor: 'pointer' }}
          onClick={() => setActiveTab('alat')}
        >
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span className="small" style={{ fontWeight: 700 }}>Armada Alat Berat</span>
            <span className="ic-tile sm praktik"><Wrench size={16} /></span>
          </div>
          <div className="kpi-value mt-1">
            <span>{num(masters.alat?.length || 0)}</span>
            <small>Unit Fleet</small>
          </div>
        </div>

        <div
          className={`card clickable ${activeTab === 'departemen' ? 'ring' : ''}`}
          style={{ padding: '16px', cursor: 'pointer' }}
          onClick={() => setActiveTab('departemen')}
        >
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span className="small" style={{ fontWeight: 700 }}>Departemen</span>
            <span className="ic-tile sm info"><Building2 size={16} /></span>
          </div>
          <div className="kpi-value mt-1">
            <span>{num(masters.departemen?.filter((x) => x.status === 'Aktif').length || 0)}</span>
            <small>Divisi</small>
          </div>
        </div>

        <div
          className={`card clickable ${activeTab === 'lokasi' ? 'ring' : ''}`}
          style={{ padding: '16px', cursor: 'pointer' }}
          onClick={() => setActiveTab('lokasi')}
        >
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span className="small" style={{ fontWeight: 700 }}>Lokasi Training</span>
            <span className="ic-tile sm violet"><MapPin size={16} /></span>
          </div>
          <div className="kpi-value mt-1">
            <span>{num(masters.lokasi?.filter((x) => x.status === 'Aktif').length || 0)}</span>
            <small>Titik Aktif</small>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <section className="card">
        <div className="card-head">
          <div className="segmented">
            <button
              type="button"
              className={activeTab === 'pelatihan' ? 'active' : ''}
              onClick={() => setActiveTab('pelatihan')}
            >
              Modul Pelatihan
            </button>
            <button
              type="button"
              className={activeTab === 'alat' ? 'active' : ''}
              onClick={() => setActiveTab('alat')}
            >
              Armada Alat Berat
            </button>
            <button
              type="button"
              className={activeTab === 'departemen' ? 'active' : ''}
              onClick={() => setActiveTab('departemen')}
            >
              Departemen
            </button>
            <button
              type="button"
              className={activeTab === 'lokasi' ? 'active' : ''}
              onClick={() => setActiveTab('lokasi')}
            >
              Lokasi Training
            </button>
          </div>

          <button type="button" className="btn btn-ghost sm" onClick={openAddModal}>
            <Plus size={16} /> Tambah Data
          </button>
        </div>

        {loading ? (
          <Loader text="Memuat data master…" />
        ) : currentList.length > 0 ? (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>No</th>
                  <th>Nama Data</th>
                  {activeTab === 'pelatihan' && <th>Jenis Pelatihan</th>}
                  {activeTab === 'alat' && <th>Kategori Unit</th>}
                  <th>Status</th>
                  <th style={{ width: 100 }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {currentList.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td>{idx + 1}</td>
                    <td><b>{item.nama}</b></td>
                    {activeTab === 'pelatihan' && <td>{item.jenis || 'Teori Kelas'}</td>}
                    {activeTab === 'alat' && <td>{item.kategori || 'Unit'}</td>}
                    <td>
                      <span className={`pill ${item.status === 'Aktif' ? 'pill-ok' : 'pill-bad'}`}>
                        {item.status || 'Aktif'}
                      </span>
                    </td>
                    <td>
                      <div className="row" style={{ gap: '6px' }}>
                        <button
                          type="button"
                          className="btn-round sm"
                          onClick={() => openEditModal(item)}
                          title="Ubah"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn-round sm"
                          onClick={() => setDeleteModal(item)}
                          title="Hapus"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="Belum ada data"
            text={`Belum ada data master untuk kategori ${activeTab}.`}
            icon={Database}
          />
        )}
      </section>

      {/* Modal Tambah/Ubah Data Master */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? `Ubah Data Master (${activeTab})` : `Tambah Data Master (${activeTab})`}
        subtitle="Pastikan penamaan sesuai dengan standar operasional perusahaan"
        icon={Database}
      >
        <form onSubmit={handleSave} className="stack">
          <label className="field">
            <span className="field-label">Nama Data <span className="req">*</span></span>
            <input
              className="input"
              placeholder="Contoh nama modul, armada, dll."
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
            />
          </label>

          {activeTab === 'pelatihan' && (
            <label className="field">
              <span className="field-label">Kategori / Jenis</span>
              <select
                className="select"
                value={formExtra}
                onChange={(e) => setFormExtra(e.target.value)}
              >
                <option value="Teori Kelas">Teori Kelas</option>
                <option value="Praktik Lapangan">Praktik Lapangan</option>
              </select>
            </label>
          )}

          {activeTab === 'alat' && (
            <label className="field">
              <span className="field-label">Kategori Unit</span>
              <input
                className="input"
                placeholder="Contoh: Excavator, Dump Truck, Dozer"
                value={formExtra}
                onChange={(e) => setFormExtra(e.target.value)}
              />
            </label>
          )}

          <label className="field">
            <span className="field-label">Status</span>
            <select
              className="select"
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value)}
            >
              <option value="Aktif">Aktif</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>
          </label>

          <div className="row mt-2" style={{ justifyContent: 'flex-end', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setModalOpen(false)}
              disabled={submitting}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Menyimpan…' : 'Simpan Data'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Hapus */}
      <Modal
        isOpen={Boolean(deleteModal)}
        onClose={() => setDeleteModal(null)}
        title="Hapus Data Master?"
        icon={Trash2}
        iconClass="bad"
        footer={
          <>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setDeleteModal(null)}
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
          Data <b>{deleteModal?.nama}</b> akan dihapus dari daftar master.
        </p>
      </Modal>
    </motion.div>
  );
}
