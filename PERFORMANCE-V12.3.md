# EMS Cabang v12.3 Performance

Perubahan utama:

- Cache metadata pelanggan selama 5 menit agar setiap API call tidak membaca registry master berulang kali.
- Cache pemeriksaan schema per pelanggan selama 30 menit.
- Cache dashboard selama 20 detik; tombol **Perbarui** tetap memaksa data terbaru.
- Cache daftar toko selama 5 menit dan otomatis dibersihkan saat cabang berubah.
- Startup dashboard memuat daftar toko dan ringkasan secara paralel.
- Request dashboard lama dibatalkan saat filter berubah agar tidak terjadi respons balapan.
- Auto-refresh berhenti ketika tab tidak terlihat.
- Validasi sesi proaktif dibatasi sekali per 5 menit; setiap endpoint admin tetap divalidasi di server.
- Jadwal Portal Karyawan membaca sheet secara bulk, bukan tiga sheet berulang untuk setiap tanggal.
- Service worker menggunakan cache-first untuk aset statis dan membersihkan cache lama.
- Versi Lucide dipatok agar cache CDN stabil.

## Pemasangan

1. Ganti Apps Script dengan `Code.gs`, lalu buat deployment Web App versi baru.
2. Jika URL deployment berubah, perbarui `js/config.js`.
3. Unggah semua file frontend dari paket ini.
4. Lakukan hard refresh satu kali. Portal PWA akan mengambil service worker versi baru.

Tidak ada perubahan struktur data yang wajib dilakukan.
