# EMS v12.5.1 — Shift Fix

Perbaikan terbatas pada pemuatan shift setelah PIN dimasukkan:

- Endpoint PIN gabungan memakai resolver shift lama yang sudah terbukti bekerja.
- `absen.html` memeriksa bahwa data karyawan dan shift benar-benar tersedia.
- Jika endpoint gabungan belum ter-deploy atau responsnya tidak lengkap, halaman otomatis memakai endpoint lama sebagai fallback.
- Nama shift, jam masuk, dan jam pulang kembali ditampilkan.

Tidak ada perubahan pada dashboard, cache web, halaman admin, database, maupun fitur lain.
