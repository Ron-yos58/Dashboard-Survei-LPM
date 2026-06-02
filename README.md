# Dasbor Survei LPM

Dasbor Survei LPM adalah aplikasi web berbasis Google Apps Script untuk menampilkan dan mengolah data survei LPM dari Google Spreadsheet. Aplikasi ini dipakai untuk memantau hasil survei akademik, penunjang, dan rangkuman survei layanan/mahasiswa dalam satu tampilan dashboard.

## Fitur Utama

- Menampilkan dashboard survei dalam bentuk web app.
- Menyajikan data leaderboard Akademik dan Penunjang.
- Menampilkan ringkasan berbagai survei layanan unit berdasarkan tahun.
- Mengolah data Survei Kualitas Layanan Unit-Unit di UNPAR.
- Mengolah data Survei Kepuasan Mahasiswa.
- Mengurutkan data berdasarkan nilai akhir atau skor tertinggi.
- Menyediakan tampilan responsif untuk desktop dan mobile.
- Memakai antarmuka yang dirancang langsung di file `index.html`.

## Fungsi Utama Aplikasi

### 1. `doGet(e)`
Entry point web app. Fungsi ini menampilkan halaman `index.html` sebagai antarmuka utama dashboard.

### 2. `getSheetData_(sheetName)`
Membaca data leaderboard dari spreadsheet utama, memetakan kolom ke struktur data standar, lalu mengurutkan hasil berdasarkan nilai final score.

### 3. `getAkademikData()`
Mengambil data leaderboard Akademik.

### 4. `getPenunjangData()`
Mengambil data leaderboard Penunjang.

### 5. `getSurveySummaryData()`
Mengambil ringkasan jumlah respons dari beberapa sheet survei, termasuk rekap per tahun dan deteksi data yang tidak terbaca.

### 6. `getLayananUnitData()`
Mengambil data Survei Kualitas Layanan Unit-Unit di UNPAR, termasuk tahun, bulan, unit, peran, skor, dan feedback.

### 7. `getStudentSatisfactionData()`
Mengambil data Survei Kepuasan Mahasiswa, memproses jawaban per pertanyaan, serta menyiapkan filter tahun, tahun masuk, program studi, dan kategori pertanyaan.

### 8. `getAllData()`
Menggabungkan seluruh dataset yang dibutuhkan dashboard dalam satu response agar mudah dipakai dari sisi client.

### 9. Fungsi bantu parsing data
- `getYearFromTimestamp_()` untuk membaca tahun dari timestamp.
- `getMonthInfoFromTimestamp_()` untuk membaca informasi bulan dan label bulan.
- `columnToLetter_()` untuk mengubah nomor kolom menjadi huruf kolom Spreadsheet.
- `parseLikertScore_()` untuk mengubah jawaban Likert ke skor numerik.
- `parseAgreementScore_()` untuk mengubah jawaban setuju/tidak setuju ke skor.
- `parseIndexScore_()` untuk mengubah nilai indeks ke format skor seragam.

## Sumber Data

Aplikasi membaca data dari dua spreadsheet utama:

- Spreadsheet leaderboard utama untuk data Akademik dan Penunjang.
- Spreadsheet survei layanan untuk data ringkasan survei, layanan unit, dan kepuasan mahasiswa.

## Struktur File

- `Code.gs` - logika server Google Apps Script dan pengolahan data.
- `index.html` - tampilan dashboard, gaya visual, dan logika client-side.

## Cara Menjalankan

1. Buka project ini di Google Apps Script.
2. Pastikan `SPREADSHEET_ID` dan `LAYANAN_UNIT_SPREADSHEET_ID` sudah sesuai.
3. Jalankan `Deploy > New deployment`.
4. Pilih tipe `Web app`.
5. Atur akses sesuai kebutuhan, misalnya `Anyone` jika dashboard ingin dibuka umum.

## Catatan

- Data leaderboard diasumsikan memiliki kolom nama, beberapa komponen skor, dan nilai final pada urutan kolom yang sudah dipetakan di `Code.gs`.
- Jika nama sheet berubah, fungsi pengambilan data juga perlu disesuaikan.
- Halaman UI dirancang langsung di `index.html`, jadi perubahan tampilan dilakukan di file tersebut.