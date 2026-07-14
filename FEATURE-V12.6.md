# EMS v12.6 — Face Liveness

Perubahan hanya pada proses selfie absensi:

- Kamera depan tampil mirror seperti kamera selfie.
- Sistem wajib mendeteksi tepat satu wajah.
- Pengguna diminta menatap kamera dengan ekspresi netral lalu tersenyum.
- Tombol selfie baru aktif setelah perubahan ekspresi terverifikasi selama beberapa frame.
- Backend menolak absensi yang tidak membawa hasil liveness.
- Foto di-center-crop ke rasio 3:4 sebelum disimpan, bukan diregangkan, sehingga wajah tidak memanjang.
- Selfie tersimpan mirror agar sama dengan preview.
- Tidak ada pencocokan identitas wajah dan tidak memerlukan foto referensi karyawan.
- Fitur GPS, PIN, shift, portal, dashboard, cache, dan modul lainnya tetap dipertahankan.

Catatan: deteksi wajah memakai MediaPipe Face Mesh dari jsDelivr, sehingga perangkat membutuhkan koneksi internet saat modul pertama kali dimuat.
