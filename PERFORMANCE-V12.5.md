# EMS Cabang v12.5 — Web Fast

Versi ini mempercepat halaman admin saat menampilkan data.

- Objek Spreadsheet tenant dibuka sekali dan dipakai ulang selama satu eksekusi API.
- Referensi objek Sheet disimpan di memori eksekusi sehingga `getSheetByName` tidak dipanggil berulang.
- Konteks tenant yang sama tidak diselesaikan ulang di dalam request yang sama.
- Daftar shift di-cache 10 menit; daftar toko tetap di-cache 5 menit.
- Daftar toko dan shift juga disimpan di `sessionStorage`, sehingga berpindah halaman admin tidak perlu memanggil Apps Script lagi.
- Cache daftar toko otomatis dibersihkan setelah cabang ditambah atau statusnya diubah.
- Dashboard, halaman karyawan, dan rekap menjalankan request independen secara paralel.
- Halaman jadwal sekarang memakai satu endpoint untuk karyawan, toko, shift, dan jadwal; sebelumnya tiga request.
- Service worker juga didaftarkan dari halaman admin agar CSS dan JavaScript lokal dibuka dari cache.
- Jalur PIN cepat dan seluruh optimasi v12.4 tetap dipertahankan.

## Pemasangan

1. Ganti Apps Script dengan `Code.gs`, kemudian buat deployment Web App baru.
2. Unggah seluruh frontend v12.5.
3. Jika deployment URL berubah, sesuaikan `js/config.js`.
4. Lakukan hard refresh sekali pada setiap perangkat.
