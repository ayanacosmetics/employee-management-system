# EMS Cabang v12.4 — PIN Fast Path

Fokus versi ini adalah mempercepat respons setelah karyawan mengetik PIN.

- Browser sekarang hanya mengirim **1 request** untuk validasi PIN dan shift; sebelumnya 2 request berurutan.
- Backend membaca seluruh **kolom PIN saja**, lalu membaca hanya satu baris karyawan yang cocok.
- Pencarian jadwal membaca kolom ID Karyawan saja dan hanya mengambil baris kandidat.
- Pencarian shift membaca kolom nama shift saja dan hanya mengambil satu baris shift.
- Hasil PIN + shift disimpan di cache selama 45 detik menggunakan kunci PIN yang sudah di-hash.
- Optimasi cache tenant, schema, toko, dashboard, portal, dan service worker dari v12.3 tetap dipertahankan.

## Pemasangan

1. Ganti Apps Script dengan `Code.gs` dan buat deployment Web App versi baru.
2. Jika URL deployment berubah, perbarui `js/config.js`.
3. Unggah frontend versi ini, terutama `absen.html`.
4. Lakukan hard refresh pada perangkat absensi.

Tidak ada perubahan struktur sheet untuk optimasi PIN ini.
