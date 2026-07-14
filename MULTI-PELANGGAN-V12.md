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
