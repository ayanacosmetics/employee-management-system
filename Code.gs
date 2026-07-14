const SHEET_TOKO = "Toko";
const SHEET_KARYAWAN = "Karyawan";
const SHEET_SHIFT = "Shift";
const SHEET_JADWAL = "Jadwal";
const SHEET_ABSENSI = "Absensi";
const SHEET_IZIN = "Izin";
const SHEET_LOG = "Log";
const SHEET_PENGATURAN = "Pengaturan";
const SHEET_PENGUMUMAN = "Pengumuman";
const SHEET_PAYROLL = "Payroll";
const SHEET_ADMIN = "Admin";

function doGet(e) {
  ensureSystemSchema_();
  const action = String((e && e.parameter && e.parameter.action) || "").trim();

  if (action === "getAdminSetupStatus") {
    return json(getAdminSetupStatus_());
  }

  if (action === "validateAdminSession") {
    return json(validateAdminSession_(e.parameter.adminToken));
  }

  const adminGetActions = [
    "listKaryawanAdmin", "getDashboard", "getRiwayatAbsensiAdmin",
    "getJadwalAdmin", "listIzinAdmin", "listPengumuman",
    "getPayrollAdmin", "getPengaturanAdmin", "getSystemHealth", "listAdminAccounts", "getSelfieAdmin"
  ];
  if (adminGetActions.indexOf(action) !== -1) {
    const auth = requireAdmin_(e.parameter.adminToken);
    if (!auth.success) return json(auth);
  }

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

  // Endpoint administrasi karyawan. Endpoint absensi lama tetap dipertahankan.
  if (action === "listKaryawanAdmin") {
    return json(listKaryawanAdmin_({
      idToko: e.parameter.idToko,
      status: e.parameter.status,
      cari: e.parameter.cari
    }));
  }

  if (action === "listShift") {
    return json(listShift_());
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

  // Mengambil selfie sebagai data URL agar dapat dilihat langsung di web admin.
  // URL Drive lama tetap didukung dan file tidak perlu dibuat publik.
  if (action === "getSelfieAdmin") {
    return json(getSelfieAdmin_(e.parameter.source));
  }

  // Endpoint administrasi jadwal shift. Tidak mengubah endpoint shift karyawan yang dipakai absensi.
  if (action === "getJadwalAdmin") {
    return json(getJadwalAdmin_({
      tanggalMulai: e.parameter.tanggalMulai,
      tanggalAkhir: e.parameter.tanggalAkhir,
      idToko: e.parameter.idToko
    }));
  }

  if (action === "listIzinAdmin") {
    return json(listIzinAdmin_({
      idToko: e.parameter.idToko,
      status: e.parameter.status,
      tanggalMulai: e.parameter.tanggalMulai,
      tanggalAkhir: e.parameter.tanggalAkhir,
      cari: e.parameter.cari
    }));
  }

  if (action === "listPengumuman") {
    return json(listPengumuman_({ aktifSaja: e.parameter.aktifSaja }));
  }

  if (action === "getPayrollAdmin") {
    return json(getPayrollAdmin_({
      bulan: e.parameter.bulan,
      tahun: e.parameter.tahun,
      idToko: e.parameter.idToko,
      includePaid: e.parameter.includePaid
    }));
  }

  if (action === "getPengaturanAdmin") {
    return json(getPengaturanAdmin_());
  }

  if (action === "getSystemHealth") {
    return json(getSystemHealth_());
  }

  if (action === "listAdminAccounts") {
    return json(listAdminAccounts_(e.parameter.adminToken));
  }

  // Portal Karyawan V7 - endpoint tambahan, tidak mengganti endpoint lama.
  if (action === "getPortalHome") {
    return json(getPortalHome_(e.parameter.token));
  }

  if (action === "getPortalJadwal") {
    return json(getPortalJadwal_(e.parameter.token, e.parameter.tanggalMulai, e.parameter.tanggalAkhir));
  }

  if (action === "getPortalRiwayat") {
    return json(getPortalRiwayat_(e.parameter.token, e.parameter.bulan, e.parameter.tahun));
  }

  if (action === "getPortalIzin") {
    return json(getPortalIzin_(e.parameter.token));
  }

  if (action === "getPortalPayroll") {
    return json(getPortalPayroll_(e.parameter.token, e.parameter.bulan, e.parameter.tahun));
  }

  if (action === "getPortalPengumuman") {
    return json(getPortalPengumuman_(e.parameter.token));
  }

  return json({
    success: true,
    message: "EMS API aktif"
  });
}

function doPost(e) {
  ensureSystemSchema_();
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

  if (action === "setupAdmin") {
    return json(setupAdmin_(data));
  }

  if (action === "loginAdmin") {
    return json(loginAdmin_(data));
  }

  const adminPostActions = [
    "saveKaryawan", "setStatusKaryawan", "saveJadwalBatch",
    "updateStatusIzin", "savePengumuman", "deletePengumuman",
    "savePayrollBatch", "savePengaturanAdmin", "testWhatsApp",
    "notifyPayroll", "sendPayrollEmail", "saveAdminAccount"
  ];
  if (adminPostActions.indexOf(action) !== -1) {
    const auth = requireAdmin_(data.adminToken);
    if (!auth.success) return json(auth);
    data.adminUser = auth.admin.username;
  }

  if (action === "absen") {
    return json(prosesAbsensi_(data));
  }

  if (action === "saveIzin") {
    return json(saveIzin_(data));
  }

  if (action === "saveKaryawan") {
    return json(saveKaryawan_(data));
  }

  if (action === "setStatusKaryawan") {
    return json(setStatusKaryawan_(data));
  }

  if (action === "saveJadwalBatch") {
    return json(saveJadwalBatch_(data));
  }

  if (action === "updateStatusIzin") {
    return json(updateStatusIzin_(data));
  }

  if (action === "savePengumuman") {
    return json(savePengumuman_(data));
  }

  if (action === "deletePengumuman") {
    return json(deletePengumuman_(data));
  }

  if (action === "savePayrollBatch") {
    return json(savePayrollBatch_(data));
  }

  if (action === "savePengaturanAdmin") {
    return json(savePengaturanAdmin_(data));
  }

  if (action === "testWhatsApp") {
    return json(testWhatsApp_(data));
  }

  // Portal Karyawan V7.
  if (action === "loginPortal") {
    return json(loginPortal_(data));
  }

  if (action === "saveIzinPortal") {
    return json(saveIzinPortal_(data));
  }

  if (action === "updateProfilPortal") {
    return json(updateProfilPortal_(data));
  }

  if (action === "sendPayrollEmail") {
    return json(sendPayrollEmail_(data));
  }

  if (action === "notifyPayroll") {
    return json(notifyPayroll_(data));
  }

  if (action === "saveAdminAccount") {
    return json(saveAdminAccount_(data));
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
  const rows = getRows_(sh, 11);

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
  const rows = getRows_(sh, 11);

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
  const portalToken = String(data.portalToken || "").trim();
  const idToko = String(data.idToko || "").trim();
  const latitude = Number(data.latitude);
  const longitude = Number(data.longitude);
  const accuracy = Number(data.accuracy);
  const selfieBase64 = String(
    data.selfieBase64 || ""
  ).trim();

  if ((!pin && !portalToken) || !idToko) {
    return {
      success: false,
      message: "Identitas karyawan dan toko wajib tersedia."
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

  // QR tetap menentukan toko. Identitas dapat dikonfirmasi dengan PIN lama
  // atau token Portal V11 yang masih valid. GPS dan selfie tetap wajib.
  let karyawan = null;
  if (portalToken) {
    karyawan = verifyPortalToken_(portalToken);
    if (!karyawan) {
      return { success: false, sessionExpired: true, message: "Sesi Portal Karyawan tidak valid. Masukkan PIN kembali." };
    }
  } else {
    const hasilKaryawan = getKaryawanByPin_(pin);
    if (!hasilKaryawan.success) {
      simpanLog_("", "Absensi gagal", hasilKaryawan.message);
      return hasilKaryawan;
    }
    karyawan = hasilKaryawan.karyawan;
  }

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
  const tanggal = parseTanggal_(tanggalInput) || todayDate_();
  const idToko = String(idTokoInput || "").trim();

  const tokoMap = {};
  getRows_(getSheet_(SHEET_TOKO), 6).forEach(row => {
    const id = String(row[0] || "").trim();
    if (id) tokoMap[id] = String(row[1] || "").trim();
  });

  let karyawanAktif = getRows_(getSheet_(SHEET_KARYAWAN), 10)
    .filter(row => String(row[6] || "").trim().toLowerCase() === "aktif");

  if (idToko) {
    karyawanAktif = karyawanAktif.filter(row =>
      String(row[9] || "").trim() === idToko
    );
  }

  let absensiHariIni = getRows_(getSheet_(SHEET_ABSENSI), 15)
    .filter(row => normalizeDate_(row[0]) === normalizeDate_(tanggal));

  if (idToko) {
    absensiHariIni = absensiHariIni.filter(row =>
      String(row[3] || "").trim() === idToko
    );
  }

  let izinHariIni = getRows_(getSheet_(SHEET_IZIN), 7)
    .filter(row => normalizeDate_(row[0]) === normalizeDate_(tanggal));

  if (idToko) {
    izinHariIni = izinHariIni.filter(row =>
      String(row[3] || "").trim() === idToko
    );
  }

  const hadirIds = new Set(absensiHariIni.map(row => String(row[1] || "").trim()));
  const hadir = hadirIds.size;
  const terlambat = absensiHariIni.filter(row =>
    String(row[9] || "").toLowerCase().includes("terlambat")
  ).length;
  const pulang = absensiHariIni.filter(row => Boolean(row[10])).length;
  const sedangBekerja = absensiHariIni.filter(row => Boolean(row[6]) && !row[10]).length;
  const belumHadirItems = karyawanAktif
    .filter(row => !hadirIds.has(String(row[0] || "").trim()))
    .map(row => ({
      id: String(row[0] || "").trim(),
      nama: String(row[2] || "").trim(),
      jabatan: String(row[4] || "").trim(),
      shift: String(row[5] || "").trim(),
      idToko: String(row[9] || "").trim(),
      namaToko: tokoMap[String(row[9] || "").trim()] || ""
    }));

  const izinMenunggu = izinHariIni.filter(row =>
    String(row[6] || "").trim().toLowerCase() === "menunggu"
  ).length;
  const sakit = izinHariIni.filter(row =>
    String(row[4] || "").trim().toLowerCase().includes("sakit") &&
    String(row[6] || "").trim().toLowerCase() !== "ditolak"
  ).length;

  const aktivitasTerbaru = [];
  absensiHariIni.forEach(row => {
    if (row[6]) {
      aktivitasTerbaru.push({
        id: String(row[1] || "").trim(),
        nama: String(row[2] || "").trim(),
        idToko: String(row[3] || "").trim(),
        namaToko: String(row[4] || "").trim(),
        shift: String(row[5] || "").trim(),
        jenis: "MASUK",
        jam: formatJam_(row[6]),
        status: String(row[9] || "").trim(),
        waktuSort: new Date(row[6]).getTime() || 0
      });
    }
    if (row[10]) {
      aktivitasTerbaru.push({
        id: String(row[1] || "").trim(),
        nama: String(row[2] || "").trim(),
        idToko: String(row[3] || "").trim(),
        namaToko: String(row[4] || "").trim(),
        shift: String(row[5] || "").trim(),
        jenis: "PULANG",
        jam: formatJam_(row[10]),
        status: String(row[13] || "").trim(),
        waktuSort: new Date(row[10]).getTime() || 0
      });
    }
  });

  aktivitasTerbaru.sort((a, b) => b.waktuSort - a.waktuSort);

  return {
    success: true,
    tanggal: normalizeDate_(tanggal),
    summary: {
      totalKaryawan: karyawanAktif.length,
      hadir,
      terlambat,
      belumHadir: belumHadirItems.length,
      sedangBekerja,
      pulang,
      izinMenunggu,
      sakit
    },
    aktivitasTerbaru: aktivitasTerbaru.slice(0, 12).map(item => {
      delete item.waktuSort;
      return item;
    }),
    belumHadirItems: belumHadirItems.slice(0, 20),

    // Tetap dipertahankan agar halaman lama yang memakai `terbaru` tidak rusak.
    terbaru: absensiHariIni.slice(-10).reverse().map(row => ({
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
  const rows = getRows_(sh, 11);

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
    idToko: String(row[9] || "").trim(),
    email: String(row[10] || "").trim()
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
function getSelfieAdmin_(source) {
  try {
    const raw = String(source || "").trim();
    if (!raw) {
      return { success: false, message: "Referensi foto tidak tersedia." };
    }

    const fileId = extractDriveFileId_(raw);
    if (!fileId) {
      return {
        success: false,
        message: "Format tautan selfie tidak dikenali.",
        driveUrl: raw
      };
    }

    const file = DriveApp.getFileById(fileId);
    const blob = file.getBlob();
    const mimeType = String(blob.getContentType() || "image/jpeg");

    if (!mimeType.toLowerCase().startsWith("image/")) {
      return { success: false, message: "File selfie bukan gambar yang valid." };
    }

    // Mencegah respons JSON terlalu besar dan menjaga performa Apps Script.
    const maxBytes = 5 * 1024 * 1024;
    if (blob.getBytes().length > maxBytes) {
      return {
        success: false,
        message: "Ukuran foto terlalu besar untuk ditampilkan langsung.",
        driveUrl: file.getUrl()
      };
    }

    return {
      success: true,
      name: file.getName(),
      mimeType,
      dataUrl: `data:${mimeType};base64,${Utilities.base64Encode(blob.getBytes())}`
    };
  } catch (error) {
    return {
      success: false,
      message: "Foto tidak dapat dibuka. Pastikan file masih tersedia di Google Drive.",
      detail: String(error && error.message ? error.message : error)
    };
  }
}

function extractDriveFileId_(value) {
  const text = String(value || "").trim();
  if (!text) return "";

  // Mendukung ID langsung serta berbagai bentuk URL Google Drive lama.
  if (/^[a-zA-Z0-9_-]{20,}$/.test(text)) return text;

  const patterns = [
    /\/d\/([a-zA-Z0-9_-]{20,})/,
    /[?&]id=([a-zA-Z0-9_-]{20,})/,
    /\/file\/d\/([a-zA-Z0-9_-]{20,})/,
    /open\?id=([a-zA-Z0-9_-]{20,})/
  ];

  for (let i = 0; i < patterns.length; i++) {
    const match = text.match(patterns[i]);
    if (match && match[1]) return match[1];
  }

  return "";
}

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


// ============================================================
// MODUL ADMINISTRASI KARYAWAN
// Ditambahkan tanpa mengubah endpoint absensi yang sudah berjalan.
// Struktur sheet tetap:
// ID | Barcode | Nama | PIN | Jabatan | Shift Default | Status | No HP | Foto | ID Toko
// ============================================================
function listKaryawanAdmin_(filter) {
  const idToko = String((filter && filter.idToko) || "").trim().toLowerCase();
  const status = String((filter && filter.status) || "").trim().toLowerCase();
  const cari = String((filter && filter.cari) || "").trim().toLowerCase();

  const tokoMap = {};
  listToko_().items.forEach(toko => tokoMap[String(toko.id).trim()] = toko.nama);

  const rows = getRows_(getSheet_(SHEET_KARYAWAN), 11);
  const items = rows
    .filter(row => String(row[0] || "").trim())
    .map(row => {
      const item = mapKaryawan_(row);
      item.pin = String(row[3] || "").trim();
      item.namaToko = tokoMap[item.idToko] || item.idToko || "-";
      return item;
    })
    .filter(item => !idToko || item.idToko.toLowerCase() === idToko)
    .filter(item => !status || item.status.toLowerCase() === status)
    .filter(item => {
      if (!cari) return true;
      return [item.id, item.barcode, item.nama, item.jabatan, item.noHp, item.namaToko]
        .some(value => String(value || "").toLowerCase().includes(cari));
    })
    .sort((a, b) => a.nama.localeCompare(b.nama, "id"));

  const aktif = items.filter(item => item.status.toLowerCase() === "aktif").length;
  const nonaktif = items.length - aktif;

  return { success: true, summary: { total: items.length, aktif, nonaktif }, items };
}

function listShift_() {
  const rows = getRows_(getSheet_(SHEET_SHIFT), 4);
  const items = rows
    .filter(row => String(row[0] || "").trim())
    .map(row => ({
      nama: String(row[0] || "").trim(),
      masuk: formatJam_(row[1]),
      pulang: formatJam_(row[2]),
      telat: formatJam_(row[3])
    }));
  return { success: true, items };
}

function saveKaryawan_(data) {
  const sh = getSheet_(SHEET_KARYAWAN);
  ensureKaryawanEmailColumn_();
  const rows = getRows_(sh, 11);

  let id = String(data.id || "").trim();
  const isEdit = Boolean(id);
  const nama = String(data.nama || "").trim();
  const barcodeInput = String(data.barcode || "").trim();
  const pin = String(data.pin || "").trim();
  const jabatan = String(data.jabatan || "").trim();
  const shiftDefault = String(data.shiftDefault || "").trim();
  const status = String(data.status || "Aktif").trim() || "Aktif";
  const noHp = String(data.noHp || "").trim();
  const foto = String(data.foto || "").trim();
  const idToko = String(data.idToko || "").trim();
  const email = String(data.email || "").trim().toLowerCase();

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, message: "Format email karyawan tidak valid." };
  }
  if (!nama || !pin || !jabatan || !shiftDefault || !idToko) {
    return { success: false, message: "Nama, PIN, jabatan, shift, dan toko wajib diisi." };
  }
  if (!/^\d{4,8}$/.test(pin)) {
    return { success: false, message: "PIN harus berupa 4 sampai 8 digit angka." };
  }
  if (!getToko_(idToko).success) {
    return { success: false, message: "Toko yang dipilih tidak ditemukan." };
  }
  const shiftValid = listShift_().items.some(item => item.nama.toLowerCase() === shiftDefault.toLowerCase());
  if (!shiftValid) {
    return { success: false, message: "Shift default tidak ditemukan." };
  }

  const rowIndex = isEdit ? rows.findIndex(row => String(row[0] || "").trim() === id) : -1;
  if (isEdit && rowIndex === -1) {
    return { success: false, message: "Data karyawan yang akan diedit tidak ditemukan." };
  }

  const duplicatePin = rows.find((row, index) =>
    index !== rowIndex && String(row[3] || "").trim() === pin
  );
  if (duplicatePin) {
    return { success: false, message: "PIN sudah digunakan oleh karyawan lain." };
  }

  if (!id) id = generateKaryawanId_(rows);
  const barcode = barcodeInput || generateBarcodeKaryawan_(rows, id);
  const duplicateBarcode = rows.find((row, index) =>
    index !== rowIndex && String(row[1] || "").trim() === barcode
  );
  if (duplicateBarcode) {
    return { success: false, message: "Barcode sudah digunakan oleh karyawan lain." };
  }

  const values = [[id, barcode, nama, pin, jabatan, shiftDefault, status, noHp, foto, idToko, email]];
  if (isEdit) {
    sh.getRange(rowIndex + 2, 1, 1, 11).setValues(values);
    simpanLog_(nama, "Memperbarui karyawan", `${id} | ${idToko} | ${status}`);
  } else {
    sh.appendRow(values[0]);
    simpanLog_(nama, "Menambah karyawan", `${id} | ${idToko}`);
  }

  return {
    success: true,
    message: isEdit ? "Data karyawan berhasil diperbarui." : "Karyawan berhasil ditambahkan.",
    karyawan: { id, barcode, nama, jabatan, shiftDefault, status, noHp, foto, idToko, email }
  };
}

function setStatusKaryawan_(data) {
  const id = String(data.id || "").trim();
  const status = String(data.status || "").trim();
  if (!id || !["aktif", "nonaktif"].includes(status.toLowerCase())) {
    return { success: false, message: "ID dan status karyawan tidak valid." };
  }

  const sh = getSheet_(SHEET_KARYAWAN);
  const rows = getRows_(sh, 10);
  const index = rows.findIndex(row => String(row[0] || "").trim() === id);
  if (index === -1) return { success: false, message: "Karyawan tidak ditemukan." };

  sh.getRange(index + 2, 7).setValue(status);
  simpanLog_(String(rows[index][2] || ""), "Mengubah status karyawan", `${id} menjadi ${status}`);
  return { success: true, message: `Status karyawan berhasil diubah menjadi ${status}.` };
}

function generateKaryawanId_(rows) {
  let max = 0;
  rows.forEach(row => {
    const match = String(row[0] || "").trim().match(/^(?:K|EMP)?(\d+)$/i);
    if (match) max = Math.max(max, Number(match[1]) || 0);
  });
  return `K${String(max + 1).padStart(3, "0")}`;
}

function generateBarcodeKaryawan_(rows, id) {
  const used = new Set(rows.map(row => String(row[1] || "").trim()));
  const baseNumber = Number(String(id || "").replace(/\D/g, "")) || rows.length + 1;
  let candidate = `89990${String(baseNumber).padStart(5, "0")}`;
  let counter = baseNumber;
  while (used.has(candidate)) {
    counter += 1;
    candidate = `89990${String(counter).padStart(5, "0")}`;
  }
  return candidate;
}


// ===== MODUL JADWAL SHIFT ADMIN =====
// Sheet Jadwal tetap memakai struktur lama: Tanggal | ID Karyawan | Shift.
function getJadwalAdmin_(params) {
  params = params || {};
  const mulai = parseTanggal_(params.tanggalMulai);
  const akhir = parseTanggal_(params.tanggalAkhir);
  const idToko = String(params.idToko || "").trim();

  if (!mulai || !akhir) {
    return { success: false, message: "Tanggal mulai dan tanggal akhir wajib diisi." };
  }
  if (normalizeDate_(mulai) > normalizeDate_(akhir)) {
    return { success: false, message: "Rentang tanggal jadwal tidak valid." };
  }

  const tokoMap = {};
  listToko_().items.forEach(item => tokoMap[item.id] = item.nama);

  const karyawan = getRows_(getSheet_(SHEET_KARYAWAN), 10)
    .filter(row => String(row[6] || "").trim().toLowerCase() === "aktif")
    .filter(row => !idToko || String(row[9] || "").trim() === idToko)
    .map(row => ({
      id: String(row[0] || "").trim(),
      nama: String(row[2] || "").trim(),
      jabatan: String(row[4] || "").trim(),
      shiftDefault: String(row[5] || "").trim(),
      idToko: String(row[9] || "").trim(),
      namaToko: tokoMap[String(row[9] || "").trim()] || String(row[9] || "").trim()
    }))
    .sort((a, b) => a.namaToko.localeCompare(b.namaToko) || a.nama.localeCompare(b.nama));

  const allowedIds = new Set(karyawan.map(item => item.id));
  const startKey = normalizeDate_(mulai);
  const endKey = normalizeDate_(akhir);
  const items = getRows_(getSheet_(SHEET_JADWAL), 3)
    .map(row => ({
      tanggal: normalizeDate_(row[0]),
      idKaryawan: String(row[1] || "").trim(),
      shift: String(row[2] || "").trim()
    }))
    .filter(item => item.tanggal && item.tanggal >= startKey && item.tanggal <= endKey)
    .filter(item => allowedIds.has(item.idKaryawan));

  return {
    success: true,
    periode: { tanggalMulai: startKey, tanggalAkhir: endKey },
    karyawan,
    shifts: listShift_().items,
    items
  };
}

function saveJadwalBatch_(data) {
  data = data || {};
  const mulai = parseTanggal_(data.tanggalMulai);
  const akhir = parseTanggal_(data.tanggalAkhir);
  const idToko = String(data.idToko || "").trim();
  const items = Array.isArray(data.items) ? data.items : [];

  if (!mulai || !akhir || normalizeDate_(mulai) > normalizeDate_(akhir)) {
    return { success: false, message: "Rentang tanggal jadwal tidak valid." };
  }

  const startKey = normalizeDate_(mulai);
  const endKey = normalizeDate_(akhir);
  const shiftNames = new Set(listShift_().items.map(item => item.nama.toLowerCase()));
  const employeeRows = getRows_(getSheet_(SHEET_KARYAWAN), 10);
  const employeeMap = {};
  employeeRows.forEach(row => {
    const id = String(row[0] || "").trim();
    if (id) employeeMap[id] = {
      nama: String(row[2] || "").trim(),
      idToko: String(row[9] || "").trim()
    };
  });

  const submitted = new Map();
  for (const raw of items) {
    const idKaryawan = String(raw.idKaryawan || "").trim();
    const tanggal = normalizeDate_(raw.tanggal);
    const shift = String(raw.shift || "").trim();
    const employee = employeeMap[idKaryawan];

    if (!employee || !tanggal || tanggal < startKey || tanggal > endKey) continue;
    if (idToko && employee.idToko !== idToko) continue;
    if (shift && !shiftNames.has(shift.toLowerCase())) {
      return { success: false, message: `Shift "${shift}" tidak ditemukan.` };
    }
    submitted.set(`${tanggal}|${idKaryawan}`, { tanggal, idKaryawan, shift, nama: employee.nama });
  }

  const sh = getSheet_(SHEET_JADWAL);
  const rows = getRows_(sh, 3);
  const existingByKey = new Map();
  rows.forEach((row, index) => {
    const tanggal = normalizeDate_(row[0]);
    const id = String(row[1] || "").trim();
    if (tanggal && id) existingByKey.set(`${tanggal}|${id}`, index + 2);
  });

  const deleteRows = [];
  const updates = [];
  const appends = [];
  submitted.forEach((item, key) => {
    const sheetRow = existingByKey.get(key);
    if (!item.shift) {
      if (sheetRow) deleteRows.push(sheetRow);
      return;
    }
    const values = [parseTanggal_(item.tanggal), item.idKaryawan, item.shift];
    if (sheetRow) updates.push({ row: sheetRow, values });
    else appends.push(values);
  });

  updates.forEach(item => sh.getRange(item.row, 1, 1, 3).setValues([item.values]));
  deleteRows.sort((a, b) => b - a).forEach(row => sh.deleteRow(row));
  if (appends.length) sh.getRange(sh.getLastRow() + 1, 1, appends.length, 3).setValues(appends);

  simpanLog_("Admin", "Memperbarui jadwal shift", `${startKey} s.d. ${endKey} | ${idToko || "Semua toko"}`);
  return {
    success: true,
    message: `${updates.length + appends.length} jadwal khusus disimpan dan ${deleteRows.length} jadwal dikembalikan ke shift default.`,
    summary: { diperbarui: updates.length, ditambahkan: appends.length, dihapus: deleteRows.length }
  };
}


// ============================================================
// MODUL IZIN & CUTI ADMIN
// Kolom lama 1-7 dipertahankan. Kolom 8-10 hanya tambahan:
// Diproses Pada | Diproses Oleh | Catatan Admin
// ============================================================
function listIzinAdmin_(filter) {
  const sh = getSheet_(SHEET_IZIN);
  const rows = getRows_(sh, Math.max(10, sh.getLastColumn()));
  const mulai = parseTanggal_(filter.tanggalMulai);
  const akhir = parseTanggal_(filter.tanggalAkhir);
  const cari = String(filter.cari || "").trim().toLowerCase();
  const status = String(filter.status || "").trim().toLowerCase();
  const idToko = String(filter.idToko || "").trim();

  const items = rows.map((r, i) => ({
    row: i + 2,
    tanggal: normalizeDate_(r[0]),
    idKaryawan: String(r[1] || "").trim(),
    nama: String(r[2] || "").trim(),
    idToko: String(r[3] || "").trim(),
    jenis: String(r[4] || "").trim(),
    alasan: String(r[5] || "").trim(),
    status: String(r[6] || "Menunggu").trim(),
    diprosesPada: r[7] ? formatDateTime_(r[7]) : "",
    diprosesOleh: String(r[8] || "").trim(),
    catatanAdmin: String(r[9] || "").trim(),
    tanggalSelesai: normalizeDate_(r[10]),
    bukti: String(r[11] || "").trim(),
    diajukanPada: r[12] ? formatDateTime_(r[12]) : ""
  })).filter(x => {
    const d = parseTanggal_(x.tanggal);
    return (!idToko || x.idToko === idToko) &&
      (!status || x.status.toLowerCase() === status) &&
      (!mulai || d >= startOfDay_(mulai)) &&
      (!akhir || d <= endOfDay_(akhir)) &&
      (!cari || `${x.nama} ${x.idKaryawan} ${x.jenis} ${x.alasan}`.toLowerCase().includes(cari));
  }).reverse();

  return { success: true, items, summary: {
    total: items.length,
    menunggu: items.filter(x => x.status.toLowerCase() === "menunggu").length,
    disetujui: items.filter(x => x.status.toLowerCase() === "disetujui").length,
    ditolak: items.filter(x => x.status.toLowerCase() === "ditolak").length
  }};
}

function updateStatusIzin_(data) {
  const row = Number(data.row);
  const status = String(data.status || "").trim();
  if (!Number.isInteger(row) || row < 2) return {success:false,message:"Baris izin tidak valid."};
  if (!["Menunggu","Disetujui","Ditolak"].includes(status)) return {success:false,message:"Status izin tidak valid."};
  const sh = getSheet_(SHEET_IZIN);
  if (row > sh.getLastRow()) return {success:false,message:"Data izin tidak ditemukan."};
  sh.getRange(row, 7, 1, 4).setValues([[
    status,
    new Date(),
    String(data.diprosesOleh || "Admin").trim(),
    String(data.catatanAdmin || "").trim()
  ]]);
  const id = String(sh.getRange(row,2).getValue() || "").trim();
  const nama = String(sh.getRange(row,3).getValue() || "").trim();
  const jenis = String(sh.getRange(row,5).getValue() || "").trim();
  const k = getKaryawanById_(id);
  let wa = null;
  if (data.kirimWA !== false && k && k.noHp) {
    wa = kirimNotifikasiIzin_(k.noHp, nama, jenis, status, String(data.catatanAdmin || ""));
  }
  simpanLog_(String(data.diprosesOleh || "Admin"), `Izin ${status}`, `${nama} | ${jenis}`);
  return {success:true,message:`Izin berhasil ${status.toLowerCase()}.`,whatsapp:wa};
}

// ============================================================
// MODUL PENGUMUMAN
// ============================================================
function listPengumuman_(filter) {
  const sh = getOrCreateDataSheet_(SHEET_PENGUMUMAN,["ID","Judul","Isi","Target Toko","Tanggal Mulai","Tanggal Selesai","Aktif","Dibuat Pada","Dibuat Oleh"]);
  const rows = getRows_(sh,9);
  const now = todayDate_();
  let items = rows.map((r,i)=>({
    row:i+2,id:String(r[0]||""),judul:String(r[1]||""),isi:String(r[2]||""),idToko:String(r[3]||""),
    tanggalMulai:normalizeDate_(r[4]),tanggalSelesai:normalizeDate_(r[5]),aktif:String(r[6]||"Ya"),
    dibuatPada:formatDateTime_(r[7]),dibuatOleh:String(r[8]||"")
  }));
  if (String(filter.aktifSaja||"") === "1") items=items.filter(x=>x.aktif.toLowerCase()!=="tidak" && (!x.tanggalMulai||parseTanggal_(x.tanggalMulai)<=now) && (!x.tanggalSelesai||parseTanggal_(x.tanggalSelesai)>=now));
  return {success:true,items:items.reverse()};
}
function savePengumuman_(data){
  const sh=getOrCreateDataSheet_(SHEET_PENGUMUMAN,["ID","Judul","Isi","Target Toko","Tanggal Mulai","Tanggal Selesai","Aktif","Dibuat Pada","Dibuat Oleh"]);
  const id=String(data.id||`PGM-${Date.now()}`); const judul=String(data.judul||"").trim(); const isi=String(data.isi||"").trim();
  if(!judul||!isi)return{success:false,message:"Judul dan isi pengumuman wajib diisi."};
  const row=[id,judul,isi,String(data.idToko||""),parseTanggal_(data.tanggalMulai)||todayDate_(),parseTanggal_(data.tanggalSelesai)||"",String(data.aktif||"Ya"),new Date(),String(data.dibuatOleh||"Admin")];
  const rows=getRows_(sh,9); const idx=rows.findIndex(r=>String(r[0])===id);
  if(idx>=0) sh.getRange(idx+2,1,1,9).setValues([row]); else sh.appendRow(row);
  return{success:true,message:"Pengumuman berhasil disimpan.",id};
}
function deletePengumuman_(data){
  const sh=getOrCreateDataSheet_(SHEET_PENGUMUMAN,["ID","Judul","Isi","Target Toko","Tanggal Mulai","Tanggal Selesai","Aktif","Dibuat Pada","Dibuat Oleh"]);
  const id=String(data.id||""); const rows=getRows_(sh,9); const idx=rows.findIndex(r=>String(r[0])===id);
  if(idx<0)return{success:false,message:"Pengumuman tidak ditemukan."}; sh.deleteRow(idx+2); return{success:true,message:"Pengumuman dihapus."};
}

// ============================================================
// MODUL PAYROLL DASAR
// Sheet Payroll: Periode | ID | Nama | Toko | Hadir | Terlambat | Durasi | Gaji Pokok | Tunjangan | Potongan | Gaji Bersih | Status | Catatan | Disimpan Pada
// ============================================================
function normalizePayrollPeriod_(value) {
  if (!value) return "";
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), "yyyy-MM");
  }
  const text = String(value).trim();
  const direct = text.match(/^(\d{4})[-\/](\d{1,2})$/);
  if (direct) return `${direct[1]}-${String(Number(direct[2])).padStart(2, "0")}`;
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, Session.getScriptTimeZone(), "yyyy-MM");
  }
  return text;
}

function getPayrollAdmin_(filter){
  const bulan=Number(filter.bulan)||todayDate_().getMonth()+1;
  const tahun=Number(filter.tahun)||todayDate_().getFullYear();
  const periode=`${tahun}-${String(bulan).padStart(2,"0")}`;
  const idToko=String(filter.idToko||"");
  const includePaid=String(filter.includePaid||"")==="1";
  ensureKaryawanEmailColumn_();
  const karyawan=getRows_(getSheet_(SHEET_KARYAWAN),11).filter(r=>String(r[6]||"").toLowerCase()==="aktif"&&(!idToko||String(r[9]||"")===idToko));
  const abs=getRows_(getSheet_(SHEET_ABSENSI),15).filter(r=>{const d=new Date(r[0]);return !isNaN(d)&&d.getMonth()+1===bulan&&d.getFullYear()===tahun;});
  const sh=getOrCreateDataSheet_(SHEET_PAYROLL,["Periode","ID Karyawan","Nama","ID Toko","Hadir","Terlambat","Total Durasi","Gaji Pokok","Tunjangan","Potongan","Gaji Bersih","Status","Catatan","Disimpan Pada"]);
  const saved=getRows_(sh,14).filter(r=>normalizePayrollPeriod_(r[0])===periode);
  const smap={}; saved.forEach(r=>smap[String(r[1]||"").trim()]=r);
  const allItems=karyawan.map(k=>{
    const id=String(k[0]||"").trim();
    const a=abs.filter(r=>String(r[1]||"").trim()===id);
    const s=smap[id]||[];
    const pokok=Number(s[7])||0,tunj=Number(s[8])||0,pot=Number(s[9])||0;
    return {
      periode,idKaryawan:id,nama:String(k[2]||""),idToko:String(k[9]||""),email:String(k[10]||""),hadir:a.length,
      terlambat:a.filter(r=>String(r[9]||"").toLowerCase().includes("terlambat")).length,
      totalDurasi:a.reduce((n,r)=>n+parseDurasiMenit_(r[14]),0),gajiPokok:pokok,tunjangan:tunj,potongan:pot,
      gajiBersih:pokok+tunj-pot,status:String(s[11]||"Draft"),catatan:String(s[12]||"")
    };
  });
  const paidItems=allItems.filter(x=>x.status==="Dibayar");
  const items=includePaid?allItems:allItems.filter(x=>x.status!=="Dibayar");
  return {
    success:true,periode,items,paidItems,
    summary:{
      jumlahKaryawan:items.length,
      totalGaji:items.reduce((n,x)=>n+x.gajiBersih,0),
      sudahDibayar:paidItems.length,
      totalSemuaKaryawan:allItems.length
    }
  };
}

function savePayrollBatch_(data){
  const items=Array.isArray(data.items)?data.items:[];
  if(!items.length)return{success:false,message:"Tidak ada data payroll untuk disimpan."};
  const sh=getOrCreateDataSheet_(SHEET_PAYROLL,["Periode","ID Karyawan","Nama","ID Toko","Hadir","Terlambat","Total Durasi","Gaji Pokok","Tunjangan","Potongan","Gaji Bersih","Status","Catatan","Disimpan Pada"]);
  sh.getRange("A:A").setNumberFormat("@");
  const existing=getRows_(sh,14);
  const emailResults=[];
  items.forEach(x=>{
    const periode=normalizePayrollPeriod_(x.periode);
    const idx=existing.findIndex(r=>normalizePayrollPeriod_(r[0])===periode&&String(r[1]||"").trim()===String(x.idKaryawan||"").trim());
    const previousStatus=idx>=0?String(existing[idx][11]||"Draft"):"";
    const status=String(x.status||"Draft");
    const row=[periode,x.idKaryawan,x.nama,x.idToko,Number(x.hadir)||0,Number(x.terlambat)||0,Number(x.totalDurasi)||0,Number(x.gajiPokok)||0,Number(x.tunjangan)||0,Number(x.potongan)||0,(Number(x.gajiPokok)||0)+(Number(x.tunjangan)||0)-(Number(x.potongan)||0),status,String(x.catatan||""),new Date()];
    if(idx>=0)sh.getRange(idx+2,1,1,14).setValues([row]);else sh.appendRow(row);
    if(status==="Dibayar"&&previousStatus!=="Dibayar"){
      const result=sendPayrollEmail_({idKaryawan:x.idKaryawan,periode:periode,automatic:true});
      emailResults.push({idKaryawan:x.idKaryawan,nama:x.nama,success:result.success,message:result.message});
    }
  });
  const sent=emailResults.filter(x=>x.success).length;
  const skipped=emailResults.length-sent;
  return{success:true,message:`${items.length} data payroll berhasil disimpan.${emailResults.length?` Email slip: ${sent} terkirim, ${skipped} belum terkirim.`:""}`,emailResults};
}

// ============================================================
// PENGATURAN & WHATSAPP
// Pengiriman otomatis memakai WhatsApp Cloud API milik Meta.
// ============================================================
function getPengaturanAdmin_(){const map=getPengaturanMap_(); return{success:true,settings:{WA_MODE:map.WA_MODE||"MANUAL",WA_PHONE_NUMBER_ID:map.WA_PHONE_NUMBER_ID||"",WA_GRAPH_VERSION:map.WA_GRAPH_VERSION||"v23.0",WA_TEMPLATE_IZIN:map.WA_TEMPLATE_IZIN||"",WA_TEMPLATE_LANGUAGE:map.WA_TEMPLATE_LANGUAGE||"id",WA_ACCESS_TOKEN:map.WA_ACCESS_TOKEN?"••••••••":""}};}
function savePengaturanAdmin_(data){const allowed=["WA_MODE","WA_PHONE_NUMBER_ID","WA_GRAPH_VERSION","WA_TEMPLATE_IZIN","WA_TEMPLATE_LANGUAGE","WA_ACCESS_TOKEN"]; const current=getPengaturanMap_(); allowed.forEach(k=>{if(data.settings&&Object.prototype.hasOwnProperty.call(data.settings,k)){const v=String(data.settings[k]??"").trim(); if(k!=="WA_ACCESS_TOKEN"||v&&v!=="••••••••") current[k]=v;}}); writePengaturanMap_(current); return{success:true,message:"Pengaturan berhasil disimpan."};}
function testWhatsApp_(data){const no=String(data.noHp||"").trim(); if(!no)return{success:false,message:"Nomor WhatsApp wajib diisi."}; return kirimWhatsApp_(no,"Tes notifikasi EMS berhasil. Sistem WhatsApp sudah terhubung.",null,[]);}
function kirimNotifikasiIzin_(no,nama,jenis,status,catatan){const msg=`Halo ${nama}, pengajuan ${jenis} Anda berstatus *${status}*.${catatan?` Catatan: ${catatan}`:""}`; const p=getPengaturanMap_(); const template=String(p.WA_TEMPLATE_IZIN||"").trim(); return kirimWhatsApp_(no,msg,template,[nama,jenis,status,catatan||"-"]);}
function kirimWhatsApp_(noHp,text,templateName,params){const p=getPengaturanMap_(); const mode=String(p.WA_MODE||"MANUAL").toUpperCase(); const no=normalizePhone_(noHp); const manualUrl=`https://wa.me/${no}?text=${encodeURIComponent(text)}`; if(mode!=="CLOUD_API")return{success:true,mode:"MANUAL",manualUrl,message:"Tautan WhatsApp manual tersedia."};
  const token=String(p.WA_ACCESS_TOKEN||"").trim(), phoneId=String(p.WA_PHONE_NUMBER_ID||"").trim(), version=String(p.WA_GRAPH_VERSION||"v23.0").trim(); if(!token||!phoneId)return{success:false,mode:"CLOUD_API",manualUrl,message:"Token atau Phone Number ID WhatsApp belum diisi."};
  let payload={messaging_product:"whatsapp",to:no,type:"text",text:{body:text}}; if(templateName){payload={messaging_product:"whatsapp",to:no,type:"template",template:{name:templateName,language:{code:String(p.WA_TEMPLATE_LANGUAGE||"id")},components:[{type:"body",parameters:(params||[]).map(v=>({type:"text",text:String(v)}))}]}};}
  try{const res=UrlFetchApp.fetch(`https://graph.facebook.com/${version}/${phoneId}/messages`,{method:"post",contentType:"application/json",headers:{Authorization:`Bearer ${token}`},payload:JSON.stringify(payload),muteHttpExceptions:true}); const obj=JSON.parse(res.getContentText()||"{}"); if(res.getResponseCode()>=200&&res.getResponseCode()<300)return{success:true,mode:"CLOUD_API",message:"Notifikasi WhatsApp berhasil dikirim.",response:obj}; return{success:false,mode:"CLOUD_API",manualUrl,message:(obj.error&&obj.error.message)||"WhatsApp API menolak pesan.",response:obj};}catch(e){return{success:false,mode:"CLOUD_API",manualUrl,message:e.message};}}

function normalizePhone_(value){let s=String(value||"").replace(/\D/g,""); if(s.startsWith("0"))s="62"+s.slice(1); return s;}
function writePengaturanMap_(map){const sh=getSheet_(SHEET_PENGATURAN); const keys=Object.keys(map); if(sh.getLastRow()>1)sh.getRange(2,1,sh.getLastRow()-1,Math.max(2,sh.getLastColumn())).clearContent(); if(keys.length)sh.getRange(2,1,keys.length,2).setValues(keys.map(k=>[k,map[k]]));}
function getOrCreateDataSheet_(name,headers){const ss=SpreadsheetApp.getActive(); let sh=ss.getSheetByName(name); if(!sh){sh=ss.insertSheet(name); sh.getRange(1,1,1,headers.length).setValues([headers]); sh.setFrozenRows(1);} return sh;}
function formatDateTime_(v){if(!v)return"";const d=new Date(v);return isNaN(d)?String(v):Utilities.formatDate(d,Session.getScriptTimeZone(),"dd/MM/yyyy HH:mm");}
function startOfDay_(d){return new Date(d.getFullYear(),d.getMonth(),d.getDate());}
function endOfDay_(d){return new Date(d.getFullYear(),d.getMonth(),d.getDate(),23,59,59,999);}
function parseDurasiMenit_(v){if(typeof v==="number")return v;const s=String(v||"");const j=Number((s.match(/(\d+)\s*jam/)||[])[1])||0,m=Number((s.match(/(\d+)\s*menit/)||[])[1])||0;return j*60+m;}


// ============================================================
// PORTAL KARYAWAN V7
// Seluruh fungsi di bawah bersifat tambahan dan tidak mengubah alur absensi lama.
// ============================================================
const PORTAL_SESSION_HOURS = 0; // V11: sesi portal aktif sampai logout, PIN berubah, atau akun dinonaktifkan

function getPortalSecret_() {
  const props = PropertiesService.getScriptProperties();
  let secret = props.getProperty("EMS_PORTAL_SECRET");
  if (!secret) {
    secret = Utilities.getUuid() + Utilities.getUuid();
    props.setProperty("EMS_PORTAL_SECRET", secret);
  }
  return secret;
}

function base64UrlEncode_(value) {
  return Utilities.base64EncodeWebSafe(String(value), Utilities.Charset.UTF_8).replace(/=+$/g, "");
}

function portalPinVersion_(karyawan) {
  const id = String((karyawan && karyawan.id) || karyawan || "").trim();
  const rows = getRows_(getSheet_(SHEET_KARYAWAN), 11);
  const row = rows.find(r => String(r[0] || "").trim() === id);
  const pin = row ? String(row[3] || "").trim() : "";
  const raw = `${id}|${pin}`;
  return Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, raw)).replace(/=+$/g, "");
}

function makePortalToken_(idKaryawan) {
  const karyawan = getKaryawanById_(idKaryawan);
  if (!karyawan) throw new Error("Karyawan tidak ditemukan.");
  const payload = {
    id: String(idKaryawan || "").trim(),
    pv: portalPinVersion_(karyawan),
    issuedAt: Date.now(),
    nonce: Utilities.getUuid()
  };
  const body = base64UrlEncode_(JSON.stringify(payload));
  const sig = Utilities.base64EncodeWebSafe(
    Utilities.computeHmacSha256Signature(body, getPortalSecret_())
  ).replace(/=+$/g, "");
  return body + "." + sig;
}

function verifyPortalToken_(token) {
  try {
    const parts = String(token || "").split(".");
    if (parts.length !== 2) return null;
    const expected = Utilities.base64EncodeWebSafe(
      Utilities.computeHmacSha256Signature(parts[0], getPortalSecret_())
    ).replace(/=+$/g, "");
    if (expected !== parts[1]) return null;
    const decoded = Utilities.newBlob(Utilities.base64DecodeWebSafe(parts[0])).getDataAsString();
    const payload = JSON.parse(decoded);
    if (!payload.id) return null;
    // Token V7–V10 tetap didukung sampai waktu kedaluwarsanya.
    if (payload.exp && Number(payload.exp) < Date.now()) return null;
    const karyawan = getKaryawanById_(payload.id);
    if (!karyawan || String(karyawan.status || "").toLowerCase() !== "aktif") return null;
    // Token V11 otomatis tidak berlaku saat PIN diubah.
    if (payload.pv && payload.pv !== portalPinVersion_(karyawan)) return null;
    return karyawan;
  } catch (error) {
    return null;
  }
}

function portalAuthError_() {
  return { success: false, sessionExpired: true, message: "Sesi portal tidak valid atau sudah berakhir. Silakan masuk kembali." };
}

function loginPortal_(data) {
  const pin = String(data.pin || "").trim();
  const portalToken = String(data.portalToken || "").trim();
  const idToko = String(data.idToko || "").trim();
  const result = getKaryawanByPin_(pin);
  if (!result.success) return result;
  const k = result.karyawan;
  if (idToko && String(k.idToko || "") !== idToko) {
    return { success: false, message: "Anda tidak terdaftar di toko ini." };
  }
  return {
    success: true,
    token: makePortalToken_(k.id),
    persistent: true,
    expiresInHours: 0,
    karyawan: sanitizePortalEmployee_(k)
  };
}

function sanitizePortalEmployee_(k) {
  return {
    id: k.id, nama: k.nama, jabatan: k.jabatan, shiftDefault: k.shiftDefault,
    noHp: k.noHp, email: k.email, foto: k.foto, idToko: k.idToko, status: k.status
  };
}

function getPortalHome_(token) {
  const k = verifyPortalToken_(token);
  if (!k) return portalAuthError_();
  const today = todayDate_();
  const shift = getShiftKaryawan_(k.id, normalizeDate_(today));
  const rows = getRows_(getSheet_(SHEET_ABSENSI), 15);
  const attendance = rows.find(r => normalizeDate_(r[0]) === normalizeDate_(today) && String(r[1] || "").trim() === k.id);
  const toko = getToko_(k.idToko);
  return {
    success: true,
    karyawan: sanitizePortalEmployee_(k),
    toko: toko.success ? toko.toko : null,
    shift: shift.success ? shift.shift : null,
    hariIni: attendance ? {
      jamMasuk: formatJam_(attendance[6]), statusMasuk: String(attendance[9] || ""),
      jamPulang: formatJam_(attendance[10]), statusPulang: String(attendance[13] || ""), durasi: String(attendance[14] || "")
    } : null
  };
}

function getPortalJadwal_(token, tanggalMulai, tanggalAkhir) {
  const k = verifyPortalToken_(token);
  if (!k) return portalAuthError_();
  const mulai = parseTanggal_(tanggalMulai) || todayDate_();
  const akhir = parseTanggal_(tanggalAkhir) || new Date(mulai.getFullYear(), mulai.getMonth(), mulai.getDate() + 13);
  const items = [];
  for (let d = startOfDay_(mulai); d <= endOfDay_(akhir); d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) {
    const result = getShiftKaryawan_(k.id, normalizeDate_(d));
    items.push({ tanggal: normalizeDate_(d), shift: result.success ? result.shift : null });
  }
  return { success: true, items };
}

function getPortalRiwayat_(token, bulan, tahun) {
  const k = verifyPortalToken_(token);
  if (!k) return portalAuthError_();
  return getRiwayatAbsensi_(k.id, bulan, tahun);
}

function getPortalIzin_(token) {
  const k = verifyPortalToken_(token);
  if (!k) return portalAuthError_();
  const sh = getSheet_(SHEET_IZIN);
  const rows = getRows_(sh, Math.max(13, sh.getLastColumn()));
  const items = rows.map((r, i) => ({
    row: i + 2, tanggalMulai: normalizeDate_(r[0]), tanggalSelesai: normalizeDate_(r[10]) || normalizeDate_(r[0]),
    jenis: String(r[4] || ""), alasan: String(r[5] || ""), status: String(r[6] || "Menunggu"),
    catatanAdmin: String(r[9] || ""), bukti: String(r[11] || ""), diajukanPada: r[12] ? formatDateTime_(r[12]) : ""
  })).filter(x => String(rows[x.row - 2][1] || "").trim() === k.id).reverse();
  return { success: true, items };
}

function saveIzinPortal_(data) {
  const k = verifyPortalToken_(data.token);
  if (!k) return portalAuthError_();
  const jenis = String(data.jenis || "").trim();
  const alasan = String(data.alasan || "").trim();
  const mulai = parseTanggal_(data.tanggalMulai);
  const selesai = parseTanggal_(data.tanggalSelesai) || mulai;
  if (!jenis || !alasan || !mulai || !selesai) return { success:false, message:"Jenis, tanggal, dan alasan wajib diisi." };
  if (endOfDay_(selesai) < startOfDay_(mulai)) return { success:false, message:"Tanggal selesai tidak boleh sebelum tanggal mulai." };
  let buktiUrl = "";
  const buktiBase64 = String(data.buktiBase64 || "").trim();
  if (buktiBase64) buktiUrl = simpanBuktiIzin_(buktiBase64, `${k.id}_${formatFileTime_(new Date())}_izin`);
  const sh = getSheet_(SHEET_IZIN);
  sh.appendRow([mulai, k.id, k.nama, k.idToko, jenis, alasan, "Menunggu", "", "", "", selesai, buktiUrl, new Date()]);
  simpanLog_(k.nama, "Mengajukan izin portal", `${jenis}: ${normalizeDate_(mulai)} s.d. ${normalizeDate_(selesai)}`);
  return { success:true, message:"Pengajuan berhasil dikirim dan menunggu persetujuan admin." };
}

function simpanBuktiIzin_(dataUrl, filePrefix) {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error("Format bukti tidak valid.");
  const mime = match[1];
  const ext = mime.indexOf("pdf") >= 0 ? "pdf" : (mime.indexOf("png") >= 0 ? "png" : "jpg");
  const blob = Utilities.newBlob(Utilities.base64Decode(match[2]), mime, `${filePrefix}.${ext}`);
  return getOrCreateFolder_("Bukti Izin").createFile(blob).getUrl();
}

function getPortalPayroll_(token, bulan, tahun) {
  const k = verifyPortalToken_(token);
  if (!k) return portalAuthError_();
  const m = Number(bulan) || todayDate_().getMonth() + 1;
  const y = Number(tahun) || todayDate_().getFullYear();
  const sh = getOrCreateDataSheet_(SHEET_PAYROLL,["Periode","ID Karyawan","Nama","ID Toko","Hadir","Terlambat","Total Durasi","Gaji Pokok","Tunjangan","Potongan","Gaji Bersih","Status","Catatan","Disimpan Pada"]);
  const periode = `${y}-${String(m).padStart(2,"0")}`;
  const row = getRows_(sh,14).find(r => normalizePayrollPeriod_(r[0]) === periode && String(r[1] || "").trim() === k.id);
  if (!row) return { success:true, payroll:null, message:"Slip gaji periode ini belum tersedia." };
  return { success:true, payroll:{ periode, nama:String(row[2]||""), hadir:Number(row[4])||0, terlambat:Number(row[5])||0, totalDurasi:Number(row[6])||0, gajiPokok:Number(row[7])||0, tunjangan:Number(row[8])||0, potongan:Number(row[9])||0, gajiBersih:Number(row[10])||0, status:String(row[11]||"Draft"), catatan:String(row[12]||"") } };
}

function getPortalPengumuman_(token) {
  const k = verifyPortalToken_(token);
  if (!k) return portalAuthError_();
  const data = listPengumuman_({aktifSaja:"1"});
  data.items = (data.items || []).filter(x => !x.idToko || x.idToko === k.idToko);
  return data;
}

function updateProfilPortal_(data) {
  const k = verifyPortalToken_(data.token);
  if (!k) return portalAuthError_();
  const noHp = String(data.noHp || "").trim();
  const email = String(data.email || "").trim().toLowerCase();
  const pinBaru = String(data.pinBaru || "").trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return {success:false,message:"Format email tidak valid."};
  if (pinBaru && !/^\d{4}$/.test(pinBaru)) return {success:false,message:"PIN baru harus 4 digit."};
  const sh = getSheet_(SHEET_KARYAWAN);
  ensureKaryawanEmailColumn_();
  const rows = getRows_(sh,11);
  const idx = rows.findIndex(r => String(r[0] || "").trim() === k.id);
  if (idx < 0) return {success:false,message:"Karyawan tidak ditemukan."};
  if (pinBaru) {
    const duplicate = rows.some((r,i) => i !== idx && String(r[3] || "").trim() === pinBaru);
    if (duplicate) return {success:false,message:"PIN sudah digunakan karyawan lain."};
    sh.getRange(idx+2,4).setValue(pinBaru);
  }
  sh.getRange(idx+2,8).setValue(noHp);
  sh.getRange(idx+2,11).setValue(email);
  simpanLog_(k.nama,"Memperbarui profil portal", pinBaru ? "Kontak dan PIN diperbarui" : "Kontak diperbarui");
  return {success:true,message:"Profil berhasil diperbarui.",token:pinBaru ? makePortalToken_(k.id) : String(data.token)};
}

function notifyPayroll_(data) {
  const id = String(data.idKaryawan || "").trim();
  const periode = String(data.periode || "").trim();
  const k = getKaryawanById_(id);
  if (!k) return {success:false,message:"Karyawan tidak ditemukan."};
  if (!k.noHp) return {success:false,message:"Nomor WhatsApp karyawan belum diisi."};
  const msg = `Halo ${k.nama}, slip gaji periode ${periode} sudah tersedia di Portal Karyawan EMS. Silakan login untuk melihat rinciannya.`;
  return kirimWhatsApp_(k.noHp, msg, null, []);
}


// ============================================================
// ADMIN AUTH V9
// Perlindungan server-side untuk seluruh endpoint administrasi.
// ============================================================
const ADMIN_SESSION_HOURS = 12;

function adminProps_(){ return PropertiesService.getScriptProperties(); }
function adminHash_(value){
  return Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(value||""))).replace(/=+$/g,"");
}
function getAdminSecret_(){
  const p=adminProps_(); let s=p.getProperty("EMS_ADMIN_SECRET");
  if(!s){s=Utilities.getUuid()+Utilities.getUuid();p.setProperty("EMS_ADMIN_SECRET",s);} return s;
}
function getAdminSheet_(){
  return ensureSheetHeader_(SHEET_ADMIN,["Username","Password Hash","Salt","Nama","Role","Status","Version","Dibuat Pada","Login Terakhir"]);
}
function migrateLegacyAdmin_(){
  const sh=getAdminSheet_();
  const rows=getRows_(sh,9);
  if(rows.some(r=>String(r[0]||"").trim())) return;
  const p=adminProps_();
  const username=String(p.getProperty("EMS_ADMIN_USERNAME")||"").trim();
  if(!username) return;
  sh.appendRow([username,p.getProperty("EMS_ADMIN_PASSWORD_HASH")||"",p.getProperty("EMS_ADMIN_SALT")||"",username,"Owner","Aktif",1,new Date(),""]);
}
function adminRows_(){ migrateLegacyAdmin_(); return getRows_(getAdminSheet_(),9); }
function findAdmin_(username){
  const key=String(username||"").trim().toLowerCase();
  const rows=adminRows_();
  const index=rows.findIndex(r=>String(r[0]||"").trim().toLowerCase()===key);
  if(index<0)return null;
  const r=rows[index];
  return {row:index+2,username:String(r[0]||"").trim(),hash:String(r[1]||""),salt:String(r[2]||""),nama:String(r[3]||r[0]||"").trim(),role:String(r[4]||"Admin").trim(),status:String(r[5]||"Aktif").trim(),version:Number(r[6])||1,dibuatPada:r[7],loginTerakhir:r[8]};
}
function getAdminSetupStatus_(){
  return {success:true,configured:adminRows_().some(r=>String(r[0]||"").trim()&&String(r[5]||"Aktif").toLowerCase()==="aktif")};
}
function setupAdmin_(data){
  if(getAdminSetupStatus_().configured)return{success:false,message:"Akun admin sudah dikonfigurasi."};
  const username=String(data.username||"").trim(); const password=String(data.password||"");
  if(username.length<4)return{success:false,message:"Username minimal 4 karakter."};
  if(password.length<8)return{success:false,message:"Password minimal 8 karakter."};
  const salt=Utilities.getUuid();
  getAdminSheet_().appendRow([username,adminHash_(salt+":"+password),salt,username,"Owner","Aktif",1,new Date(),""]);
  simpanLog_(username,"Membuat akun admin","Akun Owner pertama");
  return loginAdmin_({username,password});
}
function makeAdminToken_(admin){
  const payload={username:admin.username,role:admin.role,version:admin.version,iat:Date.now()};
  const body=Utilities.base64EncodeWebSafe(JSON.stringify(payload)).replace(/=+$/g,"");
  const sig=Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(body,getAdminSecret_())).replace(/=+$/g,"");
  return body+"."+sig;
}
function loginAdmin_(data){
  const username=String(data.username||"").trim(); const password=String(data.password||"");
  const admin=findAdmin_(username);
  if(!admin)return{success:false,setupRequired:!getAdminSetupStatus_().configured,message:"Username atau password salah."};
  if(admin.status.toLowerCase()!=="aktif")return{success:false,message:"Akun admin sedang nonaktif."};
  if(adminHash_(admin.salt+":"+password)!==admin.hash){simpanLog_(username,"Login admin gagal","Username atau password salah");return{success:false,message:"Username atau password salah."};}
  getAdminSheet_().getRange(admin.row,9).setValue(new Date());
  simpanLog_(admin.username,"Login admin","Berhasil");
  return{success:true,token:makeAdminToken_(admin),username:admin.username,nama:admin.nama,role:admin.role,persistent:true};
}
function verifyAdminToken_(token){
  try{
    const parts=String(token||"").split(".");if(parts.length!==2)return null;
    const expected=Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(parts[0],getAdminSecret_())).replace(/=+$/g,"");
    if(expected!==parts[1])return null;
    const payload=JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(parts[0])).getDataAsString());
    if(!payload.username)return null;
    const admin=findAdmin_(payload.username);
    if(!admin||admin.status.toLowerCase()!=="aktif")return null;
    if((Number(payload.version)||1)!==admin.version)return null;
    return {username:admin.username,nama:admin.nama,role:admin.role,version:admin.version};
  }catch(e){return null;}
}
function requireAdmin_(token){const admin=verifyAdminToken_(token);return admin?{success:true,admin}:{success:false,sessionExpired:true,message:"Sesi admin tidak valid. Silakan login kembali."};}
function validateAdminSession_(token){const r=requireAdmin_(token);return r.success?{success:true,username:r.admin.username,nama:r.admin.nama,role:r.admin.role}:r;}
function listAdminAccounts_(token){
  const auth=requireAdmin_(token); if(!auth.success)return auth;
  if(auth.admin.role.toLowerCase()!=="owner")return{success:false,message:"Hanya Owner yang dapat mengelola akun admin."};
  const items=adminRows_().filter(r=>String(r[0]||"").trim()).map(r=>({username:String(r[0]||""),nama:String(r[3]||r[0]||""),role:String(r[4]||"Admin"),status:String(r[5]||"Aktif"),dibuatPada:r[7]?formatDateTime_(r[7]):"",loginTerakhir:r[8]?formatDateTime_(r[8]):""}));
  return{success:true,items,currentUser:auth.admin.username};
}
function saveAdminAccount_(data){
  const auth=requireAdmin_(data.adminToken); if(!auth.success)return auth;
  if(auth.admin.role.toLowerCase()!=="owner")return{success:false,message:"Hanya Owner yang dapat mengelola akun admin."};
  const original=String(data.originalUsername||"").trim();
  const username=String(data.username||"").trim();
  const nama=String(data.nama||username).trim();
  const role=["Owner","Admin","Supervisor"].includes(String(data.role||""))?String(data.role):"Admin";
  const status=String(data.status||"Aktif")==="Nonaktif"?"Nonaktif":"Aktif";
  const password=String(data.password||"");
  if(username.length<4)return{success:false,message:"Username minimal 4 karakter."};
  const existing=findAdmin_(original||username);
  const duplicate=findAdmin_(username);
  if(duplicate&&(!existing||duplicate.row!==existing.row))return{success:false,message:"Username sudah digunakan."};
  const sh=getAdminSheet_();
  if(!existing){
    if(password.length<8)return{success:false,message:"Password akun baru minimal 8 karakter."};
    const salt=Utilities.getUuid();
    sh.appendRow([username,adminHash_(salt+":"+password),salt,nama,role,status,1,new Date(),""]);
    simpanLog_(auth.admin.username,"Menambah akun admin",username+" | "+role);
    return{success:true,message:"Akun admin berhasil ditambahkan."};
  }
  const rows=adminRows_();
  const activeOwners=rows.filter(r=>String(r[4]||"").toLowerCase()==="owner"&&String(r[5]||"Aktif").toLowerCase()==="aktif").length;
  if(existing.role.toLowerCase()==="owner"&&existing.status.toLowerCase()==="aktif"&&(role.toLowerCase()!=="owner"||status.toLowerCase()!=="aktif")&&activeOwners<=1)return{success:false,message:"Minimal harus ada satu akun Owner aktif."};
  let hash=existing.hash,salt=existing.salt,version=existing.version;
  if(password){if(password.length<8)return{success:false,message:"Password minimal 8 karakter."};salt=Utilities.getUuid();hash=adminHash_(salt+":"+password);version+=1;}
  if(status.toLowerCase()!==existing.status.toLowerCase())version+=1;
  sh.getRange(existing.row,1,1,7).setValues([[username,hash,salt,nama,role,status,version]]);
  simpanLog_(auth.admin.username,"Memperbarui akun admin",username+" | "+role+" | "+status);
  return{success:true,message:"Akun admin berhasil diperbarui.",currentSessionInvalidated:existing.username===auth.admin.username&&(password||status!==existing.status)};
}

// ============================================================
// EMAIL SLIP GAJI V9
// Kolom K pada sheet Karyawan digunakan sebagai Email, tanpa menggeser kolom lama.
// ============================================================
function ensureKaryawanEmailColumn_(){
  const sh=getSheet_(SHEET_KARYAWAN); if(sh.getMaxColumns()<11)sh.insertColumnsAfter(sh.getMaxColumns(),11-sh.getMaxColumns());
  if(!String(sh.getRange(1,11).getDisplayValue()||"").trim())sh.getRange(1,11).setValue("Email");
}
function findPayrollRow_(idKaryawan,periode){
  const sh=getOrCreateDataSheet_(SHEET_PAYROLL,["Periode","ID Karyawan","Nama","ID Toko","Hadir","Terlambat","Total Durasi","Gaji Pokok","Tunjangan","Potongan","Gaji Bersih","Status","Catatan","Disimpan Pada"]);
  return getRows_(sh,14).find(r=>normalizePayrollPeriod_(r[0])===normalizePayrollPeriod_(periode)&&String(r[1]||"").trim()===String(idKaryawan||"").trim())||null;
}
function payrollEmailHtml_(k,row,periode){
  const rup=n=>"Rp"+Number(n||0).toLocaleString("id-ID");
  return `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#111827"><h2>Slip Gaji ${periode}</h2><p>Halo <b>${escapeHtmlEmail_(k.nama)}</b>,</p><p>Berikut rincian slip gaji Anda.</p><table style="width:100%;border-collapse:collapse"><tr><td style="padding:8px;border-bottom:1px solid #ddd">Hadir</td><td style="text-align:right;border-bottom:1px solid #ddd">${Number(row[4])||0} hari</td></tr><tr><td style="padding:8px;border-bottom:1px solid #ddd">Terlambat</td><td style="text-align:right;border-bottom:1px solid #ddd">${Number(row[5])||0} kali</td></tr><tr><td style="padding:8px;border-bottom:1px solid #ddd">Gaji Pokok</td><td style="text-align:right;border-bottom:1px solid #ddd">${rup(row[7])}</td></tr><tr><td style="padding:8px;border-bottom:1px solid #ddd">Tunjangan</td><td style="text-align:right;border-bottom:1px solid #ddd">${rup(row[8])}</td></tr><tr><td style="padding:8px;border-bottom:1px solid #ddd">Potongan</td><td style="text-align:right;border-bottom:1px solid #ddd">${rup(row[9])}</td></tr><tr><td style="padding:12px 8px;font-weight:bold">Gaji Bersih</td><td style="padding:12px 0;text-align:right;font-size:20px;font-weight:bold">${rup(row[10])}</td></tr></table><p>Status: <b>${escapeHtmlEmail_(String(row[11]||"Draft"))}</b></p>${row[12]?`<p>Catatan: ${escapeHtmlEmail_(String(row[12]))}</p>`:""}<p>Slip ini juga tersedia di Portal Karyawan EMS.</p></div>`;
}
function escapeHtmlEmail_(s){return String(s||"").replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));}
function sendPayrollEmail_(data){
  ensureKaryawanEmailColumn_();
  const id=String(data.idKaryawan||"").trim(); const periode=normalizePayrollPeriod_(data.periode);
  const k=getKaryawanById_(id); if(!k)return{success:false,message:"Karyawan tidak ditemukan."};
  if(!k.email)return{success:false,message:"Email karyawan belum diisi."};
  const row=findPayrollRow_(id,periode); if(!row)return{success:false,message:"Data payroll tidak ditemukan."};
  if(String(row[11]||"").trim().toLowerCase()!=="dibayar")return{success:false,message:"Slip hanya dapat dikirim setelah status payroll Dibayar."};
  if(MailApp.getRemainingDailyQuota()<=0)return{success:false,message:"Kuota pengiriman email Google hari ini sudah habis. Coba kembali besok."};
  const html=payrollEmailHtml_(k,row,periode);
  const pdf=HtmlService.createHtmlOutput(html).getBlob().getAs(MimeType.PDF).setName(`Slip_Gaji_${k.id}_${periode}.pdf`);
  try{
    MailApp.sendEmail({to:String(k.email).trim(),subject:`Slip Gaji ${periode} - ${k.nama}`,htmlBody:html,body:`Slip gaji ${periode} tersedia.`,attachments:[pdf],name:"EMS Payroll"});
    simpanLog_(String(data.adminUser||"Admin"),"Mengirim slip gaji email",`${k.nama} | ${k.email} | ${periode}`);
    return{success:true,message:`Slip gaji berhasil dikirim ke ${k.email}.`};
  }catch(error){return{success:false,message:`Gagal mengirim email: ${error.message}`};}
}


// ============================================================
// EMS V11 SMART ENTRY & UNIFIED PORTAL
// Migrasi ringan dan pemeriksaan struktur tanpa menghapus data lama.
// ============================================================
function ensureSystemSchema_() {
  const cache = CacheService.getScriptCache();
  if (cache.get("EMS_SCHEMA_V11_OK") === "1") return;

  const lock = LockService.getScriptLock();
  try {
    lock.tryLock(5000);
    if (cache.get("EMS_SCHEMA_V11_OK") === "1") return;

    ensureKaryawanEmailColumn_();
    ensureSheetHeader_(SHEET_PAYROLL, ["Periode","ID Karyawan","Nama","ID Toko","Hadir","Terlambat","Total Durasi","Gaji Pokok","Tunjangan","Potongan","Gaji Bersih","Status","Catatan","Disimpan Pada"]);
    ensureSheetHeader_(SHEET_PENGUMUMAN, ["ID","Judul","Isi","Target Toko","Tanggal Mulai","Tanggal Selesai","Status","Dibuat Pada"]);
    ensureSheetHeader_(SHEET_IZIN, ["Tanggal","ID Karyawan","Nama","ID Toko","Jenis","Alasan","Status","Tanggal Selesai","Bukti","Catatan Admin","Diproses Pada"]);
    ensureSheetHeader_(SHEET_LOG, ["Waktu","User","Aktivitas","Keterangan"]);
    ensureSheetHeader_(SHEET_ADMIN, ["Username","Password Hash","Salt","Nama","Role","Status","Version","Dibuat Pada","Login Terakhir"]);
    migrateLegacyAdmin_();

    cache.put("EMS_SCHEMA_V11_OK", "1", 300);
  } catch (error) {
    console.error("Migrasi schema V9.1 dilewati:", error);
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function ensureSheetHeader_(sheetName, headers) {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(sheetName);
  if (!sh) sh = ss.insertSheet(sheetName);

  if (sh.getMaxColumns() < headers.length) {
    sh.insertColumnsAfter(sh.getMaxColumns(), headers.length - sh.getMaxColumns());
  }

  const current = sh.getRange(1, 1, 1, headers.length).getDisplayValues()[0];
  const output = current.slice();
  let changed = false;

  headers.forEach((header, index) => {
    if (!String(output[index] || "").trim()) {
      output[index] = header;
      changed = true;
    }
  });

  if (changed) sh.getRange(1, 1, 1, headers.length).setValues([output]);
  return sh;
}

function getSystemHealth_() {
  ensureSystemSchema_();
  const ss = SpreadsheetApp.getActive();
  const required = [
    SHEET_TOKO, SHEET_KARYAWAN, SHEET_SHIFT, SHEET_JADWAL,
    SHEET_ABSENSI, SHEET_IZIN, SHEET_LOG, SHEET_PENGATURAN,
    SHEET_PENGUMUMAN, SHEET_PAYROLL, SHEET_ADMIN
  ];

  const sheets = required.map(name => {
    const sh = ss.getSheetByName(name);
    return {
      name,
      exists: Boolean(sh),
      rows: sh ? Math.max(0, sh.getLastRow() - 1) : 0,
      columns: sh ? sh.getLastColumn() : 0
    };
  });

  let emailQuota = null;
  try { emailQuota = MailApp.getRemainingDailyQuota(); } catch (_) {}

  return {
    success: true,
    version: "11.0",
    timezone: Session.getScriptTimeZone(),
    adminConfigured: getAdminSetupStatus_().configured,
    emailQuota,
    sheets,
    checkedAt: new Date().toISOString()
  };
}

// Jalankan manual satu kali bila Google perlu meminta izin pengiriman email.
function authorizeEmailAccess() {
  const quota = MailApp.getRemainingDailyQuota();
  Logger.log("Sisa kuota email: " + quota);
  return quota;
}
