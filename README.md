# Dasbor Survei LPM

Aplikasi ini adalah dashboard berbasis Google Apps Script untuk memantau performa survei LPM secara terpusat. Data ditarik dari Google Spreadsheet, lalu divisualisasikan dalam beberapa halaman analitik interaktif.

## Ringkasan Fungsi Aplikasi

- Menampilkan ringkasan capaian survei Unit Akademik dan Unit Penunjang.
- Menampilkan visualisasi jumlah responden lintas sheet survei per tahun.
- Menyediakan analisis kualitas layanan unit (berdasarkan nilai Likert dan peran responden).
- Menyediakan analisis Student Satisfaction per kategori, program studi, dan butir pertanyaan.
- Memungkinkan pencarian, filter, sorting, perbandingan tahun, dan unduh klasemen.

## Fitur Utama

1. Survei Serentak (Overview)
- Statistik total unit akademik, total unit penunjang, dan rata-rata score keseluruhan.
- Top 3 unit terbaik untuk akademik dan penunjang.

2. Unit Akademik
- Tampilan Top 3 terbaik.
- Tabel detail semua unit dengan metrik: MKS, US, TS, SS, KP, dan Final Score.
- Fitur cari unit, sorting berdasarkan metrik, dan badge warna kategori nilai.
- Download klasemen ke gambar PNG (format story 1080 x 1920) dengan pilihan kolom.

3. Unit Penunjang
- Fitur setara dengan halaman Unit Akademik:
- Top 3, tabel detail, pencarian, sorting, indikator warna, dan download klasemen PNG.

4. Visualisasi Data Survei Terpusat
- Rekap jumlah responden per sheet survei.
- Filter tahun utama dan pembanding tahun.
- Perhitungan selisih dan tren antar tahun.
- Indikator sheet paling banyak responden dan proporsi kontribusi per sheet.

5. Layanan Unit
- Filter berdasarkan tahun, unit, peran, serta keyword pencarian.
- KPI: total responden, rata-rata nilai, jumlah unit dinilai, peran terbanyak.
- Distribusi peran dan distribusi nilai (Sangat Buruk sampai Sangat Baik).
- Tabel peringkat kualitas layanan per unit.
- Tabel jumlah responden per bulan.

6. Student Satisfaction
- Filter berdasarkan tahun survei, tahun masuk, program studi, dan kategori.
- KPI: total responden, prodi terbanyak, IKS rata-rata, kategori terendah.
- Rata-rata per kategori.
- Distribusi jawaban kepuasan keseluruhan.
- Tabel program studi paling banyak mengisi.
- Tabel prioritas butir pertanyaan (jumlah jawaban, rata-rata, persentase setuju+sangat setuju).

## Fungsi Backend (Google Apps Script)

Fungsi utama pada sisi server:

- `doGet()`
  - Menyajikan halaman web dari file HTML.

- `getAkademikData()`
  - Mengambil data leaderboard unit akademik.

- `getPenunjangData()`
  - Mengambil data leaderboard unit penunjang.

- `getSurveySummaryData()`
  - Menghitung ringkasan jumlah responden dari beberapa sheet survei berdasarkan tahun.

- `getLayananUnitData()`
  - Mengambil dan menormalisasi data Survei Kualitas Layanan Unit.

- `getStudentSatisfactionData()`
  - Mengambil dan menormalisasi data Survei Kepuasan Mahasiswa, termasuk daftar kategori dan pertanyaan.

- `getAllData()`
  - Mengembalikan seluruh dataset sekaligus (disediakan sebagai helper agregasi).

Fungsi helper penting:

- Parsing tahun dan bulan dari timestamp.
- Konversi nilai teks ke skor numerik (Likert, agreement, index).
- Mapping kolom ke struktur data standar untuk dipakai di UI.

## Teknologi yang Digunakan

- Google Apps Script (backend + hosting web app)
- Google Spreadsheet (data source)
- HTML, CSS, JavaScript vanilla (frontend dashboard)

## Struktur Halaman

- Sidebar desktop + bottom navigation mobile.
- Halaman:
  - Overview
  - Unit Akademik
  - Unit Penunjang
  - Visualisasi Data
  - Layanan Unit
  - Student Satisfaction

## Cara Menjalankan (Deploy)

1. Buka project di Google Apps Script.
2. Pastikan file `Code.gs` dan `index.html` sudah sesuai.
3. Klik Deploy -> New deployment.
4. Pilih type: Web app.
5. Execute as: Me.
6. Access: sesuai kebutuhan (contoh: Anyone with the link).
7. Deploy dan buka URL web app.

## Catatan Konfigurasi

- Aplikasi mengambil data dari Spreadsheet ID yang didefinisikan di `Code.gs`.
- Nama sheet harus sama persis dengan konfigurasi variabel.
- Jika ada sheet tidak ditemukan, aplikasi tetap berjalan dan menandai status sheet tersebut.

## Catatan Interpretasi Nilai

- Skala umum dashboard dinormalisasi ke rentang 0 sampai 1.
- Kategori visual default:
  - High: >= 0.67
  - Medium: 0.33 sampai 0.66
  - Low: < 0.33

## Struktur File

- `Code.gs` -> logika backend Apps Script dan akses data Spreadsheet.
- `index.html` -> tampilan dashboard, style, interaksi UI, dan render data.
