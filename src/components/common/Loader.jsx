import React from 'react';
import { Inbox } from 'lucide-react';

export function Loader({ text = 'Memuat data…' }) {
  return (
    <div className="page-loader">
      <div className="spinner-lg" />
      <span>{text}</span>
    </div>
  );
}

export function EmptyState({ title, text, icon: Icon = Inbox }) {
  return (
    <div className="empty">
      <span className="ic-tile">
        <Icon size={24} />
      </span>
      <b>{title}</b>
      {text && <span className="small">{text}</span>}
    </div>
  );
}
