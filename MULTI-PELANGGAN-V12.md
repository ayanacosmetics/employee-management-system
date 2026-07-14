## V12.1.3 – Platform Session Stability

Memperbaiki sesi Owner Platform yang langsung kembali ke login, tanpa mengubah modul pelanggan.

# EMS V12.0 — Multi-Pelanggan Foundation

## Kompatibilitas instalasi lama
- Instalasi yang sudah berjalan otomatis terdaftar sebagai pelanggan `PLG001` dengan kode `DEFAULT`.
- QR dan URL lama yang belum memiliki parameter pelanggan tetap diarahkan ke `DEFAULT`.
- Struktur sheet bisnis lama tidak digeser dan tidak dihapus.

## Struktur identitas
- Pelanggan/Tenant: satu bisnis yang berlangganan EMS.
- Toko/Cabang: lokasi milik pelanggan.
- Satu pelanggan dapat memiliki banyak toko.

## Sheet pusat baru: Pelanggan
Kolom:
1. ID Pelanggan
2. Kode Pelanggan
3. Nama Pelanggan
4. Spreadsheet ID
5. Folder Drive ID
6. Paket
7. Status
8. Tanggal Mulai
9. Tanggal Berakhir
10. Maksimal Toko
11. Maksimal Karyawan
12. Dibuat Pada

## Perubahan akses
- Login admin memiliki kolom Kode Pelanggan.
- Token admin dan token portal membawa ID pelanggan.
- QR baru berbentuk:
  `absen.html?pelanggan=KODE&toko=T001`
- Endpoint tidak mempercayai ID pelanggan dari halaman setelah sesi terbentuk; tenant dibaca dari token bertanda tangan.

## Tahap berikutnya
Panel Owner Platform dan provisioning otomatis pelanggan baru akan dibangun pada V12.1 setelah fondasi routing tenant ini diuji pada instalasi aktif.

## V12.1 — Panel Owner Platform

Halaman baru:

- `platform-login.html`: login khusus pemilik platform.
- `platform.html`: daftar dan provisioning pelanggan.

Owner Platform dapat membuat pelanggan baru. Sistem otomatis membuat spreadsheet terpisah, folder Drive, akun Owner Pelanggan, dan toko pertama opsional. Akun platform sengaja dipisahkan dari akun admin pelanggan.


## V12.1.1 Platform Stability & Wizard

- Perbaikan validasi konfirmasi password Owner Platform.
- Wizard pembuatan akun Owner Platform pertama.
- Wizard penambahan pelanggan bertahap.
- Ringkasan penggunaan toko dan karyawan aktual.
- Audit Log Platform.
- Fitur Login Sebagai pelanggan dengan pencatatan audit.
- Seluruh modul tenant V11/V12 tetap dipertahankan.


## V12.1.5
Perbaikan sesi Owner Platform menggunakan opaque server-side token.


## V12.1.6 Data Integrity
- Spreadsheet EMS awal tetap menjadi database pelanggan DEFAULT sekaligus registry platform.
- Pelanggan baru memperoleh spreadsheet terpisah.
- Duplikasi registry pelanggan dibersihkan otomatis berdasarkan ID/kode pelanggan.
- Penyimpanan pelanggan memakai lock, validasi unik, pesan progres, dan rollback jika provisioning gagal.


## V12.2 Manajemen Cabang
Owner/Admin pelanggan dapat menambah, mengedit, mengaktifkan, dan menonaktifkan cabang sesuai batas paket. Struktur lama Toko tetap dipertahankan dan hanya ditambah kolom Status.
