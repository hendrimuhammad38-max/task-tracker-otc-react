import React from 'react';
import { CheckCircle, AlertTriangle, Loader, Circle, HardHat, Presentation } from 'lucide-react';

export function StatusPill({ status }) {
  if (status === 'Selesai') {
    return (
      <span className="pill pill-ok">
        <CheckCircle size={14} />
        {status}
      </span>
    );
  }
  if (status === 'Dalam Proses') {
    return (
      <span className="pill pill-warn">
        <Loader size={14} />
        {status}
      </span>
    );
  }
  if (status === 'Belum Selesai') {
    return (
      <span className="pill pill-bad">
        <AlertTriangle size={14} />
        {status}
      </span>
    );
  }
  return (
    <span className="pill pill-gray">
      <Circle size={14} />
      {status || '-'}
    </span>
  );
}

export function JenisPill({ jenis }) {
  return jenis === 'Praktik Lapangan' ? (
    <span className="pill pill-praktik">
      <HardHat size={14} />
      Praktik
    </span>
  ) : (
    <span className="pill pill-teori">
      <Presentation size={14} />
      Teori
    </span>
  );
}

export function RolePill({ role }) {
  const map = {
    TRAINER: 'pill-teori',
    PENGAWAS: 'pill-praktik',
    ADMIN: 'pill-violet'
  };
  return <span className={`pill ${map[role] || 'pill-gray'}`}>{role}</span>;
}
