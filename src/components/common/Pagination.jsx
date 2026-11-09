import React from 'react';
import { num } from '../../utils/formatters';

export function Pagination({ page, pages, total, onPageChange, label = 'data' }) {
  if (!total || pages <= 1) return null;

  const range = new Set(
    [1, pages, page - 1, page, page + 1].filter((p) => p >= 1 && p <= pages)
  );
  const pageNumbers = Array.from(range).sort((a, b) => a - b);

  return (
    <div className="pager">
      <span>
        Halaman {page} dari {pages} • {num(total)} {label}
      </span>
      <div className="pager-btns">
        <button
          className="wide"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Sebelumnya
        </button>
        {pageNumbers.map((p, idx) => {
          const prev = pageNumbers[idx - 1];
          const hasGap = prev && p - prev > 1;
          return (
            <React.Fragment key={p}>
              {hasGap && <span className="faint">…</span>}
              <button
                className={p === page ? 'active' : ''}
                onClick={() => onPageChange(p)}
              >
                {p}
              </button>
            </React.Fragment>
          );
        })}
        <button
          className="wide"
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
        >
          Selanjutnya
        </button>
      </div>
    </div>
  );
}
