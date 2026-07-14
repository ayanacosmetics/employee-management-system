# EMS v12.6.2 — Automatic Smile Capture

Perubahan terbatas pada kamera absensi:

- Setelah satu wajah terdeteksi dan senyum lulus verifikasi liveness, foto langsung diambil otomatis.
- Pengambilan dilakukan pada frame yang baru terverifikasi agar pengguna tidak sempat menggeser kamera.
- Tombol menampilkan status **Menunggu Senyum** dan **Mengambil Foto**.
- Ada pengaman agar foto otomatis tidak diproses dua kali.
- Jika frame kamera belum siap, tombol manual diaktifkan sebagai fallback.
- Kamera mirror, center-crop 3:4, PIN, shift, GPS, portal, dashboard, dan semua optimasi lain tetap dipertahankan.
