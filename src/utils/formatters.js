export const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
export const BULAN_PANJANG = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

export const store = {
  get(k, d = null) {
    try {
      const v = localStorage.getItem(k);
      return v === null ? d : JSON.parse(v);
    } catch {
      return d;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch {
      /* abaikan */
    }
  },
  del(k) {
    try {
      localStorage.removeItem(k);
    } catch {
      /* abaikan */
    }
  }
};

export function num(n) {
  return Number(n || 0).toLocaleString('id-ID');
}

export function pad(n) {
  return String(n).padStart(2, '0');
}

export function today() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function addDays(s, n) {
  const d = new Date(s + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function date(s) {
  if (!s || !/^\d{4}-\d{2}-\d{2}/.test(s)) return s || '—';
  return `${Number(s.slice(8, 10))} ${BULAN[Number(s.slice(5, 7)) - 1]} ${s.slice(0, 4)}`;
}

export function dateLong(s) {
  if (!s || !/^\d{4}-\d{2}-\d{2}/.test(s)) return s || '—';
  return `${Number(s.slice(8, 10))} ${BULAN_PANJANG[Number(s.slice(5, 7)) - 1]} ${s.slice(0, 4)}`;
}

export function time(s) {
  return s && s.length >= 16 ? s.slice(11, 16) : '';
}

export function dateTime(s) {
  return s ? `${date(s)} • ${time(s)}` : '—';
}

export function tz() {
  return 'WITA';
}

export function greeting() {
  const h = new Date().getHours();
  return h < 11 ? 'Selamat Pagi' : h < 15 ? 'Selamat Siang' : h < 18 ? 'Selamat Sore' : 'Selamat Malam';
}

export function initials(name) {
  return String(name || '?')
    .replace(/[^A-Za-z\s]/g, ' ')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || '?';
}

export function avatarClass(name) {
  let h = 0;
  String(name || '').split('').forEach((c) => {
    h = (h * 31 + c.charCodeAt(0)) >>> 0;
  });
  return 'c' + ((h % 5) + 1);
}

export function fileSize(bytes) {
  return bytes > 1048576
    ? (bytes / 1048576).toFixed(2) + ' MB'
    : Math.max(1, Math.round(bytes / 1024)) + ' KB';
}

export function b64ToBlob(b64, mime) {
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime || 'application/octet-stream' });
}

export function saveBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function saveText(text, fileName, mime = 'text/csv;charset=utf-8') {
  saveBlob(new Blob(['\ufeff' + text], { type: mime }), fileName);
}

export function waLink(phone, text) {
  let p = String(phone || '').replace(/\D/g, '');
  if (p.startsWith('0')) p = '62' + p.slice(1);
  return `https://wa.me/${p}?text=${encodeURIComponent(text)}`;
}

export function csv(rows) {
  return rows
    .map((r) =>
      r
        .map((v) => {
          let s = String(v === null || v === undefined ? '' : v);
          if (/^[=+\-@]/.test(s)) s = "'" + s;
          return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(',')
    )
    .join('\n');
}

export function roleLabel(r) {
  return (
    {
      TRAINER: 'Trainer / Instruktur',
      PENGAWAS: 'Pengawas / Supervisor',
      ADMIN: 'Administrator'
    }[r] || r
  );
}

export function randomPassword() {
  const a = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz',
    n = '23456789';
  const r = (s) => s[Math.floor(Math.random() * s.length)];
  let p = '';
  for (let i = 0; i < 7; i++) p += r(a);
  return p + r(n) + r(n) + r(n);
}

export function imageToLogo(file) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('Berkas tidak ditemukan'));
    if (!/^image\//i.test(file.type)) return reject(new Error('Pilih berkas gambar (PNG, JPG, atau SVG).'));
    if (file.size > 2 * 1024 * 1024) return reject(new Error('Ukuran berkas maksimal 2 MB.'));

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca gambar.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Gambar tidak valid.'));
      img.onload = () => {
        try {
          const maxDim = 256;
          let w = img.naturalWidth || img.width;
          let h = img.naturalHeight || img.height;
          if (w > maxDim || h > maxDim) {
            if (w >= h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
          const dataUrl = canvas.toDataURL('image/png');
          if (dataUrl.length > 65000) {
            return reject(new Error('Gambar terlalu besar setelah diproses. Gunakan gambar yang lebih sederhana.'));
          }
          resolve(dataUrl);
        } catch (err) {
          reject(err);
        }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
