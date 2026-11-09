import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AppLayout } from './components/layout/AppLayout';
import { Loader } from './components/common/Loader';

// Pages
import { LoginPage } from './pages/Login/LoginPage';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { LaporanListPage } from './pages/Laporan/LaporanListPage';
import { LaporanDetailPage } from './pages/Laporan/LaporanDetailPage';
import { LaporanFormPage } from './pages/Laporan/LaporanFormPage';
import { PengawasListPage } from './pages/Pengawas/PengawasListPage';
import { PengawasDetailPage } from './pages/Pengawas/PengawasDetailPage';
import { PengawasFormPage } from './pages/Pengawas/PengawasFormPage';
import { PenggunaPage } from './pages/Pengguna/PenggunaPage';
import { MasterDataPage } from './pages/Master/MasterDataPage';
import { LogAktivitasPage } from './pages/Log/LogAktivitasPage';
import { ProfilPage } from './pages/Profil/ProfilPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="boot" role="status">
        <div className="boot-logo" />
        <div className="boot-text">Memuat Task Tracker OTC…</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AdminRoute({ children }) {
  const { isAdmin, loading } = useAuth();

  if (loading) return <Loader />;
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <HashRouter>
            <Routes>
              {/* Rute Publik */}
              <Route path="/login" element={<LoginPage />} />

              {/* Rute Terproteksi dengan AppLayout */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />

                {/* Modul Laporan OTC */}
                <Route path="laporan" element={<LaporanListPage />} />
                <Route path="laporan-baru" element={<LaporanFormPage />} />
                <Route path="laporan/:id" element={<LaporanDetailPage />} />
                <Route path="laporan/:id/ubah" element={<LaporanFormPage />} />

                {/* Modul Pengawas & Admin */}
                <Route
                  path="pengawas"
                  element={
                    <AdminRoute>
                      <PengawasListPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="pengawas/baru"
                  element={
                    <AdminRoute>
                      <PengawasFormPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="pengawas/:id"
                  element={
                    <AdminRoute>
                      <PengawasDetailPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="pengawas/:id/ubah"
                  element={
                    <AdminRoute>
                      <PengawasFormPage />
                    </AdminRoute>
                  }
                />

                <Route
                  path="pengguna"
                  element={
                    <AdminRoute>
                      <PenggunaPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="master"
                  element={
                    <AdminRoute>
                      <MasterDataPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="log"
                  element={
                    <AdminRoute>
                      <LogAktivitasPage />
                    </AdminRoute>
                  }
                />

                {/* Pengaturan Profil */}
                <Route path="profil" element={<ProfilPage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </HashRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
