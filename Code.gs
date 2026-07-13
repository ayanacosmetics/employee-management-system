const SHEET_TOKO = "Toko";
const SHEET_KARYAWAN = "Karyawan";
const SHEET_SHIFT = "Shift";
const SHEET_JADWAL = "Jadwal";
const SHEET_ABSENSI = "Absensi";
const SHEET_IZIN = "Izin";
const SHEET_LOG = "Log";
const SHEET_PENGATURAN = "Pengaturan";

function doGet(e) {
  const action = String(e.parameter.action || "").trim();

  if (action === "listToko") {
    return json(listToko_());
  }

  if (action === "getToko") {
    return json(getToko_(e.parameter.id));
  }

  if (action === "getKaryawanByBarcode") {
    return json(getKaryawanByBarcode_(e.parameter.barcode));
  }

  if (action === "getKaryawanByPin") {
    return json(getKaryawanByPin_(e.parameter.pin));
  }

  if (action === "getShiftKaryawan") {
    return json(
      getShiftKaryawan_(
        e.parameter.idKaryawan,
        e.parameter.tanggal
      )
    );
  }

  if (action === "getDashboard") {
    return json(
      getDashboard_(
        e.parameter.tanggal,
        e.parameter.idToko
      )
    );
  }

  if (action === "getRiwayatAbsensi") {
    return json(
      getRiwayatAbsensi_(
        e.parameter.idKaryawan,
        e.parameter.bulan,
        e.parameter.tahun
      )
    );
  }

  // Endpoint tambahan untuk halaman admin.
  // Endpoint lama getRiwayatAbsensi tetap dipertahankan agar fitur yang sudah ada tidak berubah.
  if (action === "getRiwayatAbsensiAdmin") {
    return json(
      getRiwayatAbsensiAdmin_({
        idToko: e.parameter.idToko,
        tanggalMulai: e.parameter.tanggalMulai,
        tanggalAkhir: e.parameter.tanggalAkhir,
        jenis: e.parameter.jenis,
        status: e.parameter.status,
        cari: e.parameter.cari
      })
    );
  }

  return json({
    success: true,
    message: "EMS API aktif"
  });
}

function doPost(e) {
  let data;

  try {
    data = JSON.parse(e.postData.contents);
  } catch (error) {
    return json({
      success: false,
      message: "Format JSON tidak valid."
    });
  }

  const action = String(data.action || "").trim();

  if (action === "absen") {
    return json(prosesAbsensi_(data));
  }

  if (action === "saveIzin") {
    return json(saveIzin_(data));
  }

  return json({
    success: false,
    message: "Action tidak dikenal."
  });
}

function getToko_(idToko) {
  const sh = getSheet_(SHEET_TOKO);
  const rows = getRows_(sh, 6);

  const idCari = String(idToko || "")
    .trim()
    .toLowerCase();

  const row = rows.find(r =>
    String(r[0] || "").trim().toLowerCase() === idCari
  );

  if (!row) {
    return {
      success: false,
      message: "Toko tidak ditemukan."
    };
  }

  return {
    success: true,
    toko: {
      id: String(row[0] || "").trim(),
      nama: String(row[1] || "").trim(),
      alamat: String(row[2] || "").trim(),
      latitude: Number(row[3]) || 0,
      longitude: Number(row[4]) || 0,
      radius: Number(row[5]) || 50
    }
  };
}

function getKaryawanByBarcode_(barcode) {
  const sh = getSheet_(SHEET_KARYAWAN);
  const rows = getRows_(sh, 10);

  const barcodeCari = String(barcode || "").trim();

  const row = rows.find(r =>
    String(r[1] || "").trim() === barcodeCari &&
    String(r[6] || "").trim().toLowerCase() === "aktif"
  );

  if (!row) {
    return {
      success: false,
      message: "Karyawan tidak ditemukan atau tidak aktif."
    };
  }

  return {
    success: true,
    karyawan: mapKaryawan_(row)
  };
}

function getKaryawanByPin_(pin) {
  const sh = getSheet_(SHEET_KARYAWAN);
  const rows = getRows_(sh, 10);

  const pinCari = String(pin || "").trim();

  const row = rows.find(r =>
    String(r[3] || "").trim() === pinCari &&
    String(r[6] || "").trim().toLowerCase() === "aktif"
  );

  if (!row) {
    return {
      success: false,
      message: "PIN salah atau karyawan tidak aktif."
    };
  }

  return {
    success: true,
    karyawan: mapKaryawan_(row)
  };
}

function getShiftKaryawan_(idKaryawan, tanggalInput) {
  const id = String(idKaryawan || "").trim();

  if (!id) {
    return {
      success: false,
      message: "ID karyawan wajib diisi."
    };
  }

  const tanggal =
    parseTanggal_(tanggalInput) ||
    todayDate_();

  const shKaryawan = getSheet_(SHEET_KARYAWAN);
  const karyawanRows = getRows_(shKaryawan, 10);

  const karyawanRow = karyawanRows.find(r =>
    String(r[0] || "").trim() === id
  );

  if (!karyawanRow) {
    return {
      success: false,
      message: "Karyawan tidak ditemukan."
    };
  }

  let namaShift = String(
    karyawanRow[5] || ""
  ).trim();

  const shJadwal = getSheet_(SHEET_JADWAL);
  const jadwalRows = getRows_(shJadwal, 3);

  const jadwalHariIni = jadwalRows.find(r => {
    const tanggalRow = normalizeDate_(r[0]);

    return (
      tanggalRow === normalizeDate_(tanggal) &&
      String(r[1] || "").trim() === id
    );
  });

  if (jadwalHariIni) {
    namaShift = String(
      jadwalHariIni[2] || ""
    ).trim();
  }

  const shShift = getSheet_(SHEET_SHIFT);
  const shiftRows = getRows_(shShift, 4);

  const shiftRow = shiftRows.find(r =>
    String(r[0] || "")
      .trim()
      .toLowerCase() === namaShift.toLowerCase()
  );

  if (!shiftRow) {
    return {
      success: false,
      message: "Data shift tidak ditemukan."
    };
  }

  return {
    success: true,
    shift: {
      nama: String(shiftRow[0] || "").trim(),
      masuk: formatJam_(shiftRow[1]),
      pulang: formatJam_(shiftRow[2]),
      telat: formatJam_(shiftRow[3])
    }
  };
}

function prosesAbsensi_(data) {
  const pin = String(data.pin || "").trim();
  const idToko = String(data.idToko || "").trim();
  const latitude = Number(data.latitude);
  const longitude = Number(data.longitude);
  const accuracy = Number(data.accuracy);
  const selfieBase64 = String(
    data.selfieBase64 || ""
  ).trim();

  if (!pin || !idToko) {
    return {
      success: false,
      message: "PIN dan toko wajib diisi."
    };
  }

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return {
      success: false,
      message: "Lokasi tidak valid."
    };
  }

  if (
    !Number.isFinite(accuracy) ||
    accuracy <= 0
  ) {
    return {
      success: false,
      message: "Akurasi GPS tidak valid."
    };
  }

  if (!selfieBase64) {
    return {
      success: false,
      message: "Selfie wajib diambil."
    };
  }

  // KONSEP FINAL:
  // QR menentukan toko.
  // PIN menentukan karyawan.
  // Tidak memakai barcode karyawan ketika absen.
  const hasilKaryawan =
    getKaryawanByPin_(pin);

  if (!hasilKaryawan.success) {
    simpanLog_(
      "",
      "Absensi gagal",
      hasilKaryawan.message
    );

    return hasilKaryawan;
  }

  const karyawan =
    hasilKaryawan.karyawan;

  const hasilToko =
    getToko_(idToko);

  if (!hasilToko.success) {
    return hasilToko;
  }

  const toko =
    hasilToko.toko;

  if (
    String(karyawan.idToko || "").trim() !==
    String(idToko || "").trim()
  ) {
    simpanLog_(
      karyawan.nama,
      "Absensi ditolak",
      `Karyawan terdaftar di ${karyawan.idToko || "-"}, tetapi membuka QR ${idToko}.`
    );

    return {
      success: false,
      message: "Anda tidak terdaftar di toko ini."
    };
  }

  const jarak = hitungJarakMeter_(
    latitude,
    longitude,
    toko.latitude,
    toko.longitude
  );

  if (accuracy > 100) {
    return {
      success: false,
      message:
        "Akurasi GPS terlalu rendah. Coba pindah ke area terbuka lalu periksa lokasi kembali."
    };
  }

  if (jarak > toko.radius) {
    simpanLog_(
      karyawan.nama,
      "Absensi ditolak",
      `Di luar radius: ${Math.round(jarak)} meter`
    );

    return {
      success: false,
      message:
        `Anda berada ${Math.round(jarak)} meter dari toko. Batas maksimal ${toko.radius} meter.`
    };
  }

  const sekarang = new Date();
  const tanggal = todayDate_();

  const hasilShift = getShiftKaryawan_(
    karyawan.id,
    tanggal
  );

  if (!hasilShift.success) {
    return hasilShift;
  }

  const shift = hasilShift.shift;

  const sh = getSheet_(SHEET_ABSENSI);
  const rows = getRows_(sh, 15);

  const rowIndex = rows.findIndex(r =>
    normalizeDate_(r[0]) === normalizeDate_(tanggal) &&
    String(r[1] || "").trim() === karyawan.id &&
    String(r[3] || "").trim() === idToko
  );

  const lokasi =
    `${latitude},${longitude}`;

  if (rowIndex === -1) {
    const statusMasuk = tentukanStatusMasuk_(
      sekarang,
      shift
    );

    const fotoMasuk = simpanSelfie_(
      selfieBase64,
      "Selfie Masuk",
      `${karyawan.id}_${formatFileTime_(sekarang)}_masuk.jpg`
    );

    sh.appendRow([
      tanggal,
      karyawan.id,
      karyawan.nama,
      idToko,
      toko.nama,
      shift.nama,
      sekarang,
      fotoMasuk,
      lokasi,
      statusMasuk,
      "",
      "",
      "",
      "",
      ""
    ]);

    simpanLog_(
      karyawan.nama,
      "Absen Masuk",
      `${toko.nama} | ${statusMasuk}`
    );

    return {
      success: true,
      jenis: "MASUK",
      nama: karyawan.nama,
      waktu: sekarang.toISOString(),
      shift,
      status: statusMasuk,
      jarak: Math.round(jarak),
      accuracy: Math.round(accuracy),
      toko: toko.nama
    };
  }

  const sheetRow = rowIndex + 2;
  const row = rows[rowIndex];

  if (row[10]) {
    return {
      success: false,
      message:
        "Absensi masuk dan pulang hari ini sudah lengkap."
    };
  }

  const statusPulang = tentukanStatusPulang_(
    sekarang,
    shift
  );

  const fotoPulang = simpanSelfie_(
    selfieBase64,
    "Selfie Pulang",
    `${karyawan.id}_${formatFileTime_(sekarang)}_pulang.jpg`
  );

  const jamMasuk = new Date(row[6]);
  const durasi = hitungDurasi_(
    jamMasuk,
    sekarang
  );

  sh.getRange(
    sheetRow,
    11,
    1,
    5
  ).setValues([[
    sekarang,
    fotoPulang,
    lokasi,
    statusPulang,
    durasi
  ]]);

  simpanLog_(
    karyawan.nama,
    "Absen Pulang",
    `${toko.nama} | ${statusPulang}`
  );

  return {
    success: true,
    jenis: "PULANG",
    nama: karyawan.nama,
    waktu: sekarang.toISOString(),
    shift,
    status: statusPulang,
    durasi,
    jarak: Math.round(jarak),
    accuracy: Math.round(accuracy),
    toko: toko.nama
  };
}

function saveIzin_(data) {
  const sh = getSheet_(SHEET_IZIN);

  const tanggal =
    parseTanggal_(data.tanggal) ||
    todayDate_();

  const id = String(
    data.idKaryawan || ""
  ).trim();

  const jenis = String(
    data.jenis || ""
  ).trim();

  const alasan = String(
    data.alasan || ""
  ).trim();

  if (!id || !jenis || !alasan) {
    return {
      success: false,
      message:
        "ID karyawan, jenis, dan alasan wajib diisi."
    };
  }

  const karyawan =
    getKaryawanById_(id);

  if (!karyawan) {
    return {
      success: false,
      message: "Karyawan tidak ditemukan."
    };
  }

  // Tanggal | ID Karyawan | Nama | ID Toko | Jenis | Alasan | Status
  sh.appendRow([
    tanggal,
    id,
    karyawan.nama,
    karyawan.idToko,
    jenis,
    alasan,
    "Menunggu"
  ]);

  simpanLog_(
    karyawan.nama,
    "Mengajukan izin",
    `${jenis}: ${alasan}`
  );

  return {
    success: true,
    message: "Pengajuan izin berhasil disimpan."
  };
}

function getDashboard_(tanggalInput, idTokoInput) {
  const tanggal =
    parseTanggal_(tanggalInput) ||
    todayDate_();

  const idToko = String(
    idTokoInput || ""
  ).trim();

  const shKaryawan =
    getSheet_(SHEET_KARYAWAN);

  let karyawanAktif = getRows_(
    shKaryawan,
    10
  ).filter(row =>
    String(row[6] || "")
      .trim()
      .toLowerCase() === "aktif"
  );

  if (idToko) {
    karyawanAktif = karyawanAktif.filter(
      row =>
        String(row[9] || "").trim() === idToko
    );
  }

  const shAbsensi =
    getSheet_(SHEET_ABSENSI);

  let absensiHariIni = getRows_(
    shAbsensi,
    15
  ).filter(row =>
    normalizeDate_(row[0]) ===
    normalizeDate_(tanggal)
  );

  if (idToko) {
    absensiHariIni = absensiHariIni.filter(
      row =>
        String(row[3] || "").trim() === idToko
    );
  }

  const hadir = absensiHariIni.length;

  const terlambat =
    absensiHariIni.filter(row =>
      String(row[9] || "")
        .toLowerCase()
        .includes("terlambat")
    ).length;

  const pulang =
    absensiHariIni.filter(row =>
      Boolean(row[10])
    ).length;

  const sedangBekerja =
    absensiHariIni.filter(row =>
      Boolean(row[6]) && !row[10]
    ).length;

  const belumHadir = Math.max(
    0,
    karyawanAktif.length - hadir
  );

  return {
    success: true,

    summary: {
      totalKaryawan: karyawanAktif.length,
      hadir,
      terlambat,
      belumHadir,
      sedangBekerja,
      pulang
    },

    terbaru: absensiHariIni
      .slice(-10)
      .reverse()
      .map(row => ({
        id: row[1],
        nama: row[2],
        idToko: row[3],
        namaToko: row[4],
        shift: row[5],
        jamMasuk: formatJam_(row[6]),
        status: row[9]
      }))
  };
}

function getRiwayatAbsensi_(
  idKaryawan,
  bulanInput,
  tahunInput
) {
  const id = String(idKaryawan || "").trim();
  const bulan = Number(bulanInput);
  const tahun = Number(tahunInput);

  const sh = getSheet_(SHEET_ABSENSI);
  const rows = getRows_(sh, 15);

  const items = rows
    .filter(r => {
      const tanggal = new Date(r[0]);

      return (
        String(r[1] || "").trim() === id &&
        (!bulan || tanggal.getMonth() + 1 === bulan) &&
        (!tahun || tanggal.getFullYear() === tahun)
      );
    })
    .map(r => ({
      tanggal: formatTanggal_(r[0]),
      idToko: r[3],
      namaToko: r[4],
      shift: r[5],
      jamMasuk: formatJam_(r[6]),
      statusMasuk: r[9],
      jamPulang: formatJam_(r[10]),
      statusPulang: r[13],
      durasi: r[14]
    }));

  return {
    success: true,
    items
  };
}

function getKaryawanById_(id) {
  const sh = getSheet_(SHEET_KARYAWAN);
  const rows = getRows_(sh, 10);

  const row = rows.find(r =>
    String(r[0] || "").trim() === id
  );

  return row ? mapKaryawan_(row) : null;
}

function mapKaryawan_(row) {
  return {
    id: String(row[0] || "").trim(),
    barcode: String(row[1] || "").trim(),
    nama: String(row[2] || "").trim(),
    jabatan: String(row[4] || "").trim(),
    shiftDefault: String(row[5] || "").trim(),
    status: String(row[6] || "").trim(),
    noHp: String(row[7] || "").trim(),
    foto: String(row[8] || "").trim(),
    idToko: String(row[9] || "").trim()
  };
}

function tentukanStatusMasuk_(sekarang, shift) {
  const batasTelat = gabungTanggalJam_(
    sekarang,
    shift.telat
  );

  return sekarang > batasTelat
    ? `Terlambat ${selisihMenit_(batasTelat, sekarang)} menit`
    : "Tepat waktu";
}

function tentukanStatusPulang_(sekarang, shift) {
  const jamPulang = gabungTanggalJam_(
    sekarang,
    shift.pulang
  );

  if (sekarang < jamPulang) {
    return `Pulang cepat ${selisihMenit_(sekarang, jamPulang)} menit`;
  }

  if (sekarang > jamPulang) {
    return `Lembur ${selisihMenit_(jamPulang, sekarang)} menit`;
  }

  return "Sesuai jadwal";
}

function hitungJarakMeter_(
  lat1,
  lon1,
  lat2,
  lon2
) {
  const R = 6371000;
  const toRad = value => value * Math.PI / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c =
    2 * Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return R * c;
}

function simpanSelfie_(
  dataUrl,
  folderName,
  fileName
) {
  const match = dataUrl.match(
    /^data:image\/([a-zA-Z0-9.+-]+);base64,(.+)$/
  );

  if (!match) {
    throw new Error(
      "Format gambar selfie tidak valid."
    );
  }

  const mimeType = `image/${match[1]}`;
  const bytes = Utilities.base64Decode(
    match[2]
  );

  const blob = Utilities.newBlob(
    bytes,
    mimeType,
    fileName
  );

  const folder = getOrCreateFolder_(folderName);
  const file = folder.createFile(blob);

  return file.getUrl();
}

function getOrCreateFolder_(folderName) {
  const pengaturan = getPengaturanMap_();
  const parentId = String(
    pengaturan.FOLDER_DRIVE_ID || ""
  ).trim();

  let parent;

  if (parentId) {
    parent = DriveApp.getFolderById(parentId);
  } else {
    parent = DriveApp.getRootFolder();
  }

  const folders = parent.getFoldersByName(
    folderName
  );

  return folders.hasNext()
    ? folders.next()
    : parent.createFolder(folderName);
}

function getPengaturanMap_() {
  const sh = getSheet_(SHEET_PENGATURAN);
  const lastRow = sh.getLastRow();
  const lastColumn = sh.getLastColumn();

  if (lastRow < 2 || lastColumn < 2) {
    return {};
  }

  const values = sh
    .getRange(
      1,
      1,
      lastRow,
      lastColumn
    )
    .getDisplayValues();

  const headers = values[0].map(value =>
    String(value || "")
      .trim()
      .toLowerCase()
  );

  const keyIndex =
    headers.indexOf("key");

  const valueIndex =
    headers.indexOf("value");

  if (
    keyIndex === -1 ||
    valueIndex === -1
  ) {
    throw new Error(
      'Sheet "Pengaturan" harus memiliki header "Key" dan "Value".'
    );
  }

  const result = {};

  for (let i = 1; i < values.length; i++) {
    const key = String(
      values[i][keyIndex] || ""
    )
      .trim()
      .toUpperCase();

    if (!key) continue;

    result[key] =
      values[i][valueIndex];
  }

  return result;
}

function simpanLog_(user, aktivitas, keterangan) {
  const sh = getSheet_(SHEET_LOG);

  sh.appendRow([
    new Date(),
    user || "",
    aktivitas || "",
    keterangan || ""
  ]);
}

function getSheet_(name) {
  const sh = SpreadsheetApp
    .getActive()
    .getSheetByName(name);

  if (!sh) {
    throw new Error(
      `Sheet "${name}" tidak ditemukan.`
    );
  }

  return sh;
}

function getRows_(sheet, columnCount) {
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    return [];
  }

  return sheet
    .getRange(
      2,
      1,
      lastRow - 1,
      columnCount
    )
    .getValues();
}

function todayDate_() {
  const now = new Date();

  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
}

function parseTanggal_(value) {
  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? null
    : date;
}

function normalizeDate_(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return Utilities.formatDate(
    date,
    Session.getScriptTimeZone(),
    "yyyy-MM-dd"
  );
}

function formatTanggal_(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return Utilities.formatDate(
    date,
    Session.getScriptTimeZone(),
    "dd/MM/yyyy"
  );
}

function formatJam_(value) {
  if (!value) return "";

  if (value instanceof Date) {
    return Utilities.formatDate(
      value,
      Session.getScriptTimeZone(),
      "HH:mm"
    );
  }

  return String(value).trim();
}

function gabungTanggalJam_(date, jam) {
  const [hour, minute] = String(jam || "00:00")
    .split(":")
    .map(Number);

  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    hour || 0,
    minute || 0,
    0,
    0
  );
}

function selisihMenit_(start, end) {
  return Math.max(
    0,
    Math.round(
      (end.getTime() - start.getTime()) /
      60000
    )
  );
}

function hitungDurasi_(start, end) {
  if (
    !(start instanceof Date) ||
    Number.isNaN(start.getTime())
  ) {
    return "";
  }

  const totalMenit = Math.max(
    0,
    Math.floor(
      (end.getTime() - start.getTime()) /
      60000
    )
  );

  const jam = Math.floor(totalMenit / 60);
  const menit = totalMenit % 60;

  return `${jam} jam ${menit} menit`;
}

function formatFileTime_(date) {
  return Utilities.formatDate(
    date,
    Session.getScriptTimeZone(),
    "yyyyMMdd_HHmmss"
  );
}

function listToko_() {
  const sh = getSheet_(SHEET_TOKO);
  const rows = getRows_(sh, 6);

  const items = rows
    .filter(row => String(row[0] || "").trim())
    .map(row => ({
      id: String(row[0] || "").trim(),
      nama: String(row[1] || "").trim(),
      alamat: String(row[2] || "").trim(),
      latitude: Number(row[3]) || 0,
      longitude: Number(row[4]) || 0,
      radius: Number(row[5]) || 50
    }));

  return {
    success: true,
    items
  };
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(
      ContentService.MimeType.JSON
    );
}

/**
 * Riwayat absensi untuk halaman admin.
 * Tidak mengubah struktur sheet dan tidak menggantikan endpoint riwayat karyawan lama.
 * Setiap baris Absensi diubah menjadi maksimal dua item: MASUK dan PULANG.
 */
function getRiwayatAbsensiAdmin_(filter) {
  filter = filter || {};

  const idToko = String(filter.idToko || "").trim().toLowerCase();
  const jenis = String(filter.jenis || "").trim().toLowerCase();
  const statusCari = String(filter.status || "").trim().toLowerCase();
  const cari = String(filter.cari || "").trim().toLowerCase();

  const tanggalMulai = parseTanggalBatas_(filter.tanggalMulai, false);
  const tanggalAkhir = parseTanggalBatas_(filter.tanggalAkhir, true);

  if (tanggalMulai && tanggalAkhir && tanggalMulai > tanggalAkhir) {
    return {
      success: false,
      message: "Tanggal mulai tidak boleh melebihi tanggal akhir."
    };
  }

  const sh = getSheet_(SHEET_ABSENSI);
  const rows = getRows_(sh, 15);
  const items = [];

  rows.forEach((r, index) => {
    const tanggal = new Date(r[0]);
    if (Number.isNaN(tanggal.getTime())) return;

    const tanggalHari = new Date(
      tanggal.getFullYear(),
      tanggal.getMonth(),
      tanggal.getDate()
    );

    if (tanggalMulai && tanggalHari < tanggalMulai) return;
    if (tanggalAkhir && tanggalHari > tanggalAkhir) return;

    const rowIdToko = String(r[3] || "").trim();
    const idKaryawan = String(r[1] || "").trim();
    const nama = String(r[2] || "").trim();
    const namaToko = String(r[4] || "").trim();
    const shift = String(r[5] || "").trim();

    if (idToko && rowIdToko.toLowerCase() !== idToko) return;

    const searchable = `${idKaryawan} ${nama} ${rowIdToko} ${namaToko}`.toLowerCase();
    if (cari && !searchable.includes(cari)) return;

    if (r[6]) {
      items.push({
        row: index + 2,
        tanggal: normalizeDate_(tanggal),
        idKaryawan,
        nama,
        idToko: rowIdToko,
        namaToko,
        shift,
        jenis: "Masuk",
        waktu: formatDateTimeIso_(r[6]),
        jam: formatJam_(r[6]),
        status: String(r[9] || "").trim(),
        foto: String(r[7] || "").trim(),
        lokasi: String(r[8] || "").trim(),
        durasi: String(r[14] || "").trim()
      });
    }

    if (r[10]) {
      items.push({
        row: index + 2,
        tanggal: normalizeDate_(tanggal),
        idKaryawan,
        nama,
        idToko: rowIdToko,
        namaToko,
        shift,
        jenis: "Pulang",
        waktu: formatDateTimeIso_(r[10]),
        jam: formatJam_(r[10]),
        status: String(r[13] || "").trim(),
        foto: String(r[11] || "").trim(),
        lokasi: String(r[12] || "").trim(),
        durasi: String(r[14] || "").trim()
      });
    }
  });

  const filteredItems = items
    .filter(item => !jenis || item.jenis.toLowerCase() === jenis)
    .filter(item => !statusCari || item.status.toLowerCase().includes(statusCari))
    .sort((a, b) => {
      const waktuA = new Date(a.waktu || `${a.tanggal}T00:00:00`).getTime() || 0;
      const waktuB = new Date(b.waktu || `${b.tanggal}T00:00:00`).getTime() || 0;
      return waktuB - waktuA;
    });

  const idHadir = {};
  let terlambat = 0;
  let masuk = 0;
  let pulang = 0;
  let pulangCepat = 0;
  let lembur = 0;

  filteredItems.forEach(item => {
    if (item.jenis === "Masuk") {
      masuk++;
      idHadir[`${item.tanggal}|${item.idKaryawan}`] = true;
      if (item.status.toLowerCase().includes("terlambat")) terlambat++;
    } else if (item.jenis === "Pulang") {
      pulang++;
      const status = item.status.toLowerCase();
      if (status.includes("pulang cepat")) pulangCepat++;
      if (status.includes("lembur")) lembur++;
    }
  });

  return {
    success: true,
    summary: {
      hadir: Object.keys(idHadir).length,
      terlambat,
      masuk,
      pulang,
      pulangCepat,
      lembur,
      totalData: filteredItems.length
    },
    items: filteredItems
  };
}

function parseTanggalBatas_(value, akhirHari) {
  const text = String(value || "").trim();
  if (!text) return null;

  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  let date;

  if (match) {
    date = new Date(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3]),
      akhirHari ? 23 : 0,
      akhirHari ? 59 : 0,
      akhirHari ? 59 : 0,
      akhirHari ? 999 : 0
    );
  } else {
    date = new Date(text);
    if (!Number.isNaN(date.getTime())) {
      date.setHours(
        akhirHari ? 23 : 0,
        akhirHari ? 59 : 0,
        akhirHari ? 59 : 0,
        akhirHari ? 999 : 0
      );
    }
  }

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDateTimeIso_(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return Utilities.formatDate(
    date,
    Session.getScriptTimeZone(),
    "yyyy-MM-dd'T'HH:mm:ss"
  );
}
