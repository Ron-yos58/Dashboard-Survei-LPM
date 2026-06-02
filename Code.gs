// ============================================================
//  Dasbor Survei LPM — Google Apps Script
//  File: Code.gs
//  Cara deploy: Extensions > Apps Script > Deploy > New deployment
//               Type: Web app | Execute as: Me | Access: Anyone
// ============================================================

var SPREADSHEET_ID = "1HaOmVKEezAsnNs2v5-j1JV4afI2EDQklrO5DFo27QnA";
var SHEET_AKADEMIK  = "Leaderboard Akademik";
var SHEET_PENUNJANG = "Leaderboard Penunjang";
var LAYANAN_UNIT_SPREADSHEET_ID = "1fqgPVZPaxyOx7PzhsbPwcRXKSqphHelv63hNFmHyps4";
var SHEET_LAYANAN_UNIT = "Survei Kualitas Layanan Unit-Unit di UNPAR";
var SHEET_STUDENT_SATISFACTION = "Survei Kepuasan Mahasiswa";
var SURVEY_SUMMARY_SHEETS = [
  { name: "Survei Brand Index", timestampCol: 1 },
  { name: "Survei Kepuasan Layanan UIS Station", timestampCol: 1 },
  { name: "Survei Tracer Study", timestampCol: 1 },
  { name: "Survei Kepuasan Pegawai", timestampCol: 1 },
  { name: "Survei Mitra Kerja Sama", timestampCol: 2 },
  { name: "Survei Entry Study", timestampCol: 1 },
  { name: "Survei User Study", timestampCol: 1 },
  { name: "Survei Kualitas Layanan Unit-Unit di UNPAR", timestampCol: 1 },
  { name: "Survei Kepuasan Mahasiswa", timestampCol: 1 }
];

// ------------------------------------------------------------
// Entry point — serve the HTML page
// ------------------------------------------------------------
function doGet(e) {
  return HtmlService
    .createHtmlOutputFromFile("index")
    .setTitle("Dasbor Survei LPM")
    .setFaviconUrl("https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f4cb.png")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ------------------------------------------------------------
// Helper — baca sheet dan return array of objects
// ------------------------------------------------------------
function getSheetData_(sheetName) {
  var ss   = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    throw new Error("Sheet '" + sheetName + "' tidak ditemukan.");
  }

  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();

  if (lastRow < 2) return [];

  // Baris 1 = header, baris 2 dst = data
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var dataRows = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();

  var result = [];
  dataRows.forEach(function(row) {
    var name = String(row[0] || "").trim();
    if (!name) return;

    var obj = { name: name };
    // Petakan kolom ke key standar berdasarkan posisi
    // Kolom: 0=Nama, 1=MKS, 2=US, 3=TS, 4=SS, 5=KP, 6=Final Score
    var keys = ["name","mks","us","ts","ss","kp","final"];
    for (var i = 1; i < keys.length; i++) {
      var raw = row[i];
      obj[keys[i]] = (raw === "" || raw === null || raw === undefined)
                     ? null
                     : parseFloat(String(raw).replace(',', '.')) || 0;
    }
    result.push(obj);
  });

  // Sort descending by final score (null values go to bottom)
  result.sort(function(a, b) {
    var af = (a.final === null || a.final === undefined) ? -1 : a.final;
    var bf = (b.final === null || b.final === undefined) ? -1 : b.final;
    return bf - af;
  });
  return result;
}

// ------------------------------------------------------------
// Fungsi yang dipanggil dari client-side JS
// ------------------------------------------------------------
function getAkademikData() {
  return getSheetData_(SHEET_AKADEMIK);
}

function getPenunjangData() {
  return getSheetData_(SHEET_PENUNJANG);
}

function getYearFromTimestamp_(value) {
  if (Object.prototype.toString.call(value) === "[object Date]" && !isNaN(value.getTime())) {
    return value.getFullYear();
  }

  var text = String(value || "").trim();
  var match = text.match(/\b(20\d{2}|19\d{2})\b/);
  return match ? parseInt(match[1], 10) : null;
}

function getMonthInfoFromTimestamp_(value) {
  var monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  var year = null;
  var month = null;

  if (Object.prototype.toString.call(value) === "[object Date]" && !isNaN(value.getTime())) {
    year = value.getFullYear();
    month = value.getMonth() + 1;
  } else {
    var text = String(value || "").trim();
    var match = text.match(/^\s*(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (match) {
      year = parseInt(match[3], 10);
      month = parseInt(match[2], 10);
    }
  }

  if (!year || !month || month < 1 || month > 12) {
    return { month: null, monthKey: "", monthLabel: "(Bulan tidak terbaca)" };
  }

  return {
    month: month,
    monthKey: year + "-" + (month < 10 ? "0" + month : month),
    monthLabel: monthNames[month - 1] + " " + year
  };
}

function columnToLetter_(column) {
  var temp = "";
  var letter = "";
  while (column > 0) {
    temp = (column - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    column = (column - temp - 1) / 26;
  }
  return letter;
}

function getSurveySummaryData() {
  var ss = SpreadsheetApp.openById(LAYANAN_UNIT_SPREADSHEET_ID);
  var yearsMap = {};

  var sheets = SURVEY_SUMMARY_SHEETS.map(function(config) {
    var sheet = ss.getSheetByName(config.name);
    var countsByYear = {};
    var total = 0;
    var unreadable = 0;

    if (!sheet) {
      return {
        name: config.name,
        timestampColumn: columnToLetter_(config.timestampCol),
        total: 0,
        countsByYear: countsByYear,
        unreadable: 0,
        missing: true
      };
    }

    var lastRow = sheet.getLastRow();
    if (lastRow >= 2) {
      var timestamps = sheet.getRange(2, config.timestampCol, lastRow - 1, 1).getValues();
      timestamps.forEach(function(row) {
        var timestamp = row[0];
        if (timestamp === "" || timestamp === null || timestamp === undefined) return;

        total++;
        var year = getYearFromTimestamp_(timestamp);
        if (year) {
          yearsMap[year] = true;
          countsByYear[year] = (countsByYear[year] || 0) + 1;
        } else {
          unreadable++;
        }
      });
    }

    return {
      name: config.name,
      timestampColumn: columnToLetter_(config.timestampCol),
      total: total,
      countsByYear: countsByYear,
      unreadable: unreadable,
      missing: false
    };
  });

  return {
    sheets: sheets,
    years: Object.keys(yearsMap).map(function(year) {
      return parseInt(year, 10);
    }).sort(function(a, b) {
      return b - a;
    })
  };
}

function parseLikertScore_(value) {
  if (value === null || value === undefined || value === "") return null;

  if (typeof value === "number") {
    return Math.max(0, Math.min(1, value));
  }

  var text = String(value).trim().toLowerCase();
  var numeric = parseFloat(text.replace(",", "."));
  if (!isNaN(numeric) && text.match(/^[0-9]+([,.][0-9]+)?$/)) {
    return Math.max(0, Math.min(1, numeric));
  }

  if (text.indexOf("sangat buruk") !== -1) return 0;
  if (text.indexOf("buruk") !== -1) return 0.25;
  if (text.indexOf("cukup") !== -1) return 0.5;
  if (text.indexOf("sangat baik") !== -1) return 1;
  if (text.indexOf("baik") !== -1) return 0.75;

  return null;
}

function parseAgreementScore_(value) {
  if (value === null || value === undefined || value === "") return null;

  if (typeof value === "number") {
    return Math.max(0, Math.min(1, value));
  }

  var text = String(value).trim().toLowerCase();
  var numeric = parseFloat(text.replace(",", "."));
  if (!isNaN(numeric) && text.match(/^[0-9]+([,.][0-9]+)?$/)) {
    return Math.max(0, Math.min(1, numeric));
  }

  if (text.indexOf("sangat tidak setuju") !== -1) return 0;
  if (text.indexOf("tidak setuju") !== -1) return 0.25;
  if (text.indexOf("netral") !== -1) return 0.5;
  if (text.indexOf("sangat setuju") !== -1) return 1;
  if (text.indexOf("setuju") !== -1) return 0.75;

  return null;
}

function parseIndexScore_(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") {
    if (value > 1 && value <= 100) return value / 100;
    return Math.max(0, Math.min(1, value));
  }

  var text = String(value).trim().replace("%", "");
  var numeric = parseFloat(text.replace(",", "."));
  if (isNaN(numeric)) return parseAgreementScore_(value);
  if (numeric > 1 && numeric <= 100) return numeric / 100;
  return Math.max(0, Math.min(1, numeric));
}

function getStudentSatisfactionQuestions_() {
  return [
    { col: 5, category: "Pengajaran", question: "Perkuliahan diselenggarakan sesuai jadwal dan tepat waktu." },
    { col: 6, category: "Pengajaran", question: "Materi kuliah diberikan sesuai dengan RPS dan silabus." },
    { col: 7, category: "Pengajaran", question: "Metode pengajaran yang digunakan memudahkan mahasiswa untuk memahami materi kuliah." },
    { col: 8, category: "Pengajaran", question: "Perubahan jadwal dan pembatalan disampaikan kepada mahasiswa secara tepat waktu." },
    { col: 9, category: "Pengajaran", question: "Dosen kompeten dalam menyampaikan materi kuliah." },
    { col: 10, category: "Pembelajaran daring", question: "Prasarana dan sarana yang digunakan dalam pembelajaran daring di Unpar memadai." },
    { col: 11, category: "Pembelajaran daring", question: "Saya memiliki prasarana dan sarana yang memadai untuk mengikuti pembelajaran daring di rumah/tempat tinggal saya." },
    { col: 12, category: "Pembelajaran daring", question: "Metode pengajaran daring yang digunakan memudahkan mahasiswa untuk memahami materi kuliah." },
    { col: 13, category: "Pembelajaran daring", question: "Dosen mampu membawakan kuliah daring dengan efektif." },
    { col: 14, category: "Pembelajaran daring", question: "Pembelajaran daring yang saya ikuti selama pandemi sama efektifnya dengan pembelajaran luring." },
    { col: 15, category: "Kurikulum", question: "Kurikulum program studi memberi saya keleluasaan untuk mengambil mata kuliah yang sesuai minat saya." },
    { col: 16, category: "Kurikulum", question: "Kurikulum dan materi kuliah di Unpar up-to-date." },
    { col: 17, category: "Kurikulum", question: "Saya bisa dengan baik mengikuti pembelajaran sesuai kurikulum." },
    { col: 18, category: "Hubungan dosen - mahasiswa", question: "Saya dengan mudah menghubungi dosen wali jika membutuhkan konsultasi." },
    { col: 19, category: "Hubungan dosen - mahasiswa", question: "Dosen wali saya sangat membantu dalam menghadapi masalah akademik dan kemahasiswaan." },
    { col: 20, category: "Hubungan dosen - mahasiswa", question: "Para dosen terbuka untuk berdiskusi terkait dengan materi kuliah." },
    { col: 21, category: "Hubungan dosen - mahasiswa", question: "Para dosen responsif terhadap permintaan mahasiswa." },
    { col: 22, category: "Layanan administrasi", question: "Staf administrasi bersikap profesional dalam memberikan layanan." },
    { col: 23, category: "Layanan administrasi", question: "Staf administrasi memberikan layanan sesuai dengan standar atau yang dijanjikan." },
    { col: 24, category: "Layanan administrasi", question: "Staf administrasi memberikan layanan dengan sopan dan ramah." },
    { col: 25, category: "Layanan administrasi", question: "Jam operasional layanan administrasi memudahkan mahasiswa." },
    { col: 26, category: "Layanan administrasi", question: "Saya bisa dengan mudah mengakses layanan administrasi jika membutuhkan." },
    { col: 27, category: "Layanan administrasi", question: "Terdapat petunjuk/prosedur yang jelas untuk setiap layanan administrasi yang dibutuhkan mahasiswa." },
    { col: 28, category: "Layanan administrasi", question: "Layanan administrasi diberikan dengan cepat." },
    { col: 29, category: "Fasilitas pendukung", question: "Sumber referensi yang saya butuhkan dalam pembelajaran dapat dengan mudah saya akses dan dapatkan di perpustakaan." },
    { col: 30, category: "Fasilitas pendukung", question: "Unpar menyediakan prasarana dan sarana yang memadai bagi mahasiswa untuk bisa belajar dan mengerjakan tugas di kampus." },
    { col: 31, category: "Fasilitas pendukung", question: "Koneksi internet yang disediakan di kampus Unpar memadai." },
    { col: 32, category: "Fasilitas pendukung", question: "Fasilitas IDE memadai dalam mendukung proses pembelajaran mahasiswa di Unpar." },
    { col: 33, category: "Fasilitas pendukung", question: "Fasilitas Student Portal memadai dalam mendukung proses pembelajaran mahasiswa di Unpar." },
    { col: 34, category: "Fasilitas pendukung", question: "Fasilitas olah raga yang disediakan Unpar (PASAGA) memadai untuk mendukung kegiatan olahraga mahasiswa." },
    { col: 35, category: "Fasilitas pendukung", question: "Fasilitas perpustakaan memadai dalam mendukung proses pembelajaran di Unpar." },
    { col: 36, category: "Fasilitas pendukung", question: "Di Unpar, semua mahasiswa diperlakukan secara setara dan adil." },
    { col: 37, category: "Suasana kampus", question: "Tidak ada isu SARA dalam hubungan akademik, kemahasiswaan, dan pergaulan di Unpar." },
    { col: 38, category: "Suasana kampus", question: "Saya merasa diterima di Unpar." },
    { col: 39, category: "Suasana kampus", question: "Saya memiliki lingkungan pertemanan yang mendukung saya menjadi pribadi yang lebih baik." },
    { col: 40, category: "Biaya perkuliahan dan beasiswa", question: "Biaya kuliah di Unpar sesuai dengan kualitas pendidikan, sarana dan prasarana, serta manfaat lainnya." },
    { col: 41, category: "Biaya perkuliahan dan beasiswa", question: "Unpar memberikan informasi terkait biaya perkuliahan dengan jelas dan transparan kepada mahasiswa." },
    { col: 42, category: "Biaya perkuliahan dan beasiswa", question: "Saya mengetahui informasi adanya program beasiswa yang ditawarkan di Unpar." },
    { col: 43, category: "Biaya perkuliahan dan beasiswa", question: "Proses seleksi dan mekanisme pemberian beasiswa di Unpar dilakukan secara terbuka dan fair." },
    { col: 44, category: "Kepuasan secara keseluruhan", question: "Saya menikmati perkuliahan saya di Unpar." },
    { col: 45, category: "Kepuasan secara keseluruhan", question: "Secara keseluruhan, saya puas dengan penyelenggaraan pendidikan dan layanan yang diberikan UNPAR." }
  ];
}

function getLayananUnitData() {
  var ss = SpreadsheetApp.openById(LAYANAN_UNIT_SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_LAYANAN_UNIT);

  if (!sheet) {
    throw new Error("Sheet '" + SHEET_LAYANAN_UNIT + "' tidak ditemukan.");
  }

  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow < 2) {
    return { rows: [], years: [] };
  }

  var dataRows = sheet.getRange(2, 1, lastRow - 1, Math.max(lastCol, 6)).getValues();
  var yearsMap = {};
  var rows = [];

  dataRows.forEach(function(row, idx) {
    var unit = String(row[1] || "").trim();
    var role = String(row[2] || "").trim();
    var scoreRaw = row[4];
    if (!unit && !role && (scoreRaw === "" || scoreRaw === null || scoreRaw === undefined)) return;

    var timestamp = row[0];
    var year = getYearFromTimestamp_(timestamp);
    var monthInfo = getMonthInfoFromTimestamp_(timestamp);
    if (year) yearsMap[year] = true;

    var score = parseLikertScore_(scoreRaw);
    rows.push({
      rowNo: idx + 2,
      timestamp: timestamp ? String(timestamp) : "",
      year: year,
      month: monthInfo.month,
      monthKey: monthInfo.monthKey,
      monthLabel: monthInfo.monthLabel,
      unit: unit || "(Unit tidak diisi)",
      role: role || "(Peran tidak diisi)",
      service: String(row[3] || "").trim(),
      scoreLabel: String(scoreRaw || "").trim(),
      score: score,
      feedback: String(row[5] || "").trim()
    });
  });

  var years = Object.keys(yearsMap).map(function(y) {
    return parseInt(y, 10);
  }).sort(function(a, b) {
    return b - a;
  });

  return {
    rows: rows,
    years: years
  };
}

function getStudentSatisfactionData() {
  var ss = SpreadsheetApp.openById(LAYANAN_UNIT_SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_STUDENT_SATISFACTION);

  if (!sheet) {
    throw new Error("Sheet '" + SHEET_STUDENT_SATISFACTION + "' tidak ditemukan.");
  }

  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  var questions = getStudentSatisfactionQuestions_();
  var categoriesMap = {};
  questions.forEach(function(q, idx) {
    q.id = idx;
    categoriesMap[q.category] = true;
  });

  if (lastRow < 2) {
    return { rows: [], years: [], entryYears: [], programs: [], categories: Object.keys(categoriesMap), questions: questions };
  }

  var dataRows = sheet.getRange(2, 1, lastRow - 1, Math.max(lastCol, 52)).getValues();
  var yearsMap = {};
  var entryYearsMap = {};
  var programsMap = {};
  var rows = [];

  dataRows.forEach(function(row, idx) {
    var timestamp = row[0];
    var responseYear = getYearFromTimestamp_(timestamp);
    var monthInfo = getMonthInfoFromTimestamp_(timestamp);
    var entryYear = String(row[2] || "").trim();
    var program = String(row[3] || "").trim();
    var responses = questions.map(function(q) {
      return parseAgreementScore_(row[q.col - 1]);
    });
    var hasScore = responses.some(function(score) { return score !== null; });
    if (!program && !entryYear && !hasScore) return;

    if (responseYear) yearsMap[responseYear] = true;
    if (entryYear) entryYearsMap[entryYear] = true;
    if (program) programsMap[program] = true;

    rows.push({
      rowNo: idx + 2,
      year: responseYear,
      month: monthInfo.month,
      monthKey: monthInfo.monthKey,
      monthLabel: monthInfo.monthLabel,
      entryYear: entryYear || "(Tahun masuk tidak diisi)",
      program: program || "(Program studi tidak diisi)",
      responses: responses,
      iks: parseIndexScore_(row[45]),
      recommendation: parseAgreementScore_(row[46])
    });
  });

  return {
    rows: rows,
    years: Object.keys(yearsMap).map(function(y) { return parseInt(y, 10); }).sort(function(a, b) { return b - a; }),
    entryYears: Object.keys(entryYearsMap).sort(function(a, b) { return String(b).localeCompare(String(a)); }),
    programs: Object.keys(programsMap).sort(function(a, b) { return a.localeCompare(b); }),
    categories: Object.keys(categoriesMap),
    questions: questions
  };
}

function getAllData() {
  return {
    akademik:  getSheetData_(SHEET_AKADEMIK),
    penunjang: getSheetData_(SHEET_PENUNJANG),
    visualisasiSummary: getSurveySummaryData(),
    layananUnit: getLayananUnitData(),
    studentSatisfaction: getStudentSatisfactionData()
  };
}
