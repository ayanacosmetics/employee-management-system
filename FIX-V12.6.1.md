# EMS v12.6.1 — PIN Controls Fix

Perbaikan terbatas pada kontrol setelah selfie:

- Tombol **Lanjut ke PIN** menggunakan event listener langsung.
- Keypad PIN menggunakan `data-pin-digit` dan event listener, bukan inline handler.
- Semua tombol PIN diberi `type="button"` agar tidak dianggap sebagai tombol submit.
- Area keypad diberi prioritas klik/touch dan `touch-action: manipulation` untuk perangkat mobile.
- Ditambahkan umpan balik saat tombol ditekan dan fokus keyboard yang terlihat.
- Fitur liveness, kamera mirror, center-crop 3:4, shift, GPS, dashboard, portal, dan optimasi lain tidak diubah.
