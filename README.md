# Pemrograman Mobile — Modul Pembelajaran

Website modul pembelajaran mata kuliah **Pemrograman Mobile** untuk Program Studi Teknik Komputer,
Fakultas Teknik dan Perencanaan, Universitas Warmadewa. Dibangun sebagai website statis sehingga
dapat langsung dipublikasikan melalui GitHub Pages.

## Teknologi

- HTML5, CSS3, JavaScript vanilla
- Tanpa framework JavaScript, tanpa backend, tanpa basis data
- Google Fonts: Inter dan JetBrains Mono
- Ikon berupa inline SVG, tidak memerlukan pustaka eksternal

## Fitur

- Navigasi responsif dengan menu hamburger pada layar kecil
- Header lengket dan indikator progres membaca
- Sidebar materi yang lengket di desktop dan dapat dibuka-tutup di mobile
- Breadcrumb serta navigasi materi sebelumnya dan berikutnya
- Pencarian materi berdasarkan nomor minggu, judul, dan kata kunci (pintasan `/` atau `Ctrl/Cmd + K`)
- Mode gelap dengan preferensi tersimpan di `localStorage`
- Daftar isi otomatis beserta penanda bagian aktif
- Syntax highlighting Dart, YAML, Bash, dan JSON tanpa pustaka eksternal
- Tombol salin pada setiap blok kode
- Bagian yang dapat dilipat, checklist tersimpan, dan kolom refleksi tersimpan
- Tombol kembali ke atas, pengguliran halus, dan tata letak ramah cetak
- Navigasi dengan papan ketik serta penerapan dasar aksesibilitas

## Struktur

```
.
├── index.html
├── about.html
├── assets/
│   ├── css/style.css
│   ├── js/main.js
│   ├── js/modules.js
│   ├── img/logo-TKOM.png
│   └── icons/
├── weeks/
│   ├── week-01.html … week-16.html
└── README.md
```

## Menjalankan secara lokal

Buka `index.html` langsung di peramban, atau jalankan server statis:

```bash
python3 -m http.server 8000
# lalu buka http://localhost:8000
```

## Publikasi ke GitHub Pages

1. Buat repository baru di GitHub, lalu unggah seluruh isi folder ini.
2. Buka **Settings → Pages**.
3. Pada bagian **Source**, pilih **Deploy from a branch**.
4. Pilih branch `main` dan folder `/ (root)`, lalu simpan.
5. Website tersedia di `https://<username>.github.io/<nama-repo>/`.

Seluruh path pada website memakai relative path sehingga tetap berfungsi meskipun berada di
subfolder repository.

## Mengganti logo

Berkas `assets/img/logo-TKOM.png` saat ini berisi logo sementara. Timpa berkas tersebut dengan logo
COM asli menggunakan nama berkas yang sama, lalu perbarui `assets/img/favicon.png` bila diperlukan.
Gunakan gambar berlatar transparan dengan rasio persegi agar proporsinya tetap terjaga.

## Daftar materi

| Minggu | Topik |
|--------|-------|
| 01 | Mobile Development Ecosystem & Flutter Refresh |
| 02 | Pemrograman Dasar Dart - Bagian 1 |
| 03 | Pemrograman Dasar Dart - Bagian 2 |
| 04 | Pemrograman Dasar Dart - Bagian 3 |
| 05 | Aplikasi Pertama & Widget Dasar Flutter |
| 06 | Layout dan Navigasi |
| 07 | Manajemen Plugin Flutter |
| 08 | Ujian Tengah Semester (UTS) |
| 09 | Kamera pada Flutter |
| 10 | Dasar State Management |
| 11 | Pemrograman Asynchronous |
| 12 | Streams & BLoC Pattern |
| 13 | Persistensi Data |
| 14 | RESTful API |
| 15 | Progress Project - Bagian 1 |
| 16 | Progress Project Bagian 2 & Final Project Expo |

## Menyunting materi

Setiap pertemuan berada pada satu berkas mandiri di folder `weeks/`. Untuk mengubah materi, sunting
langsung berkas HTML yang bersangkutan. Bila menambahkan atau mengubah judul materi, perbarui juga
`assets/js/modules.js` agar hasil pencarian tetap sesuai.

Menambahkan blok kode baru:

```html
<div class="code-block">
  <div class="code-head">
    <span class="code-file">main.dart</span>
    <button class="copy-btn" type="button"><span>Copy</span></button>
  </div>
  <pre><code class="language-dart">void main() {}</code></pre>
</div>
```

## Lisensi dan atribusi

Materi disusun untuk keperluan pembelajaran internal Program Studi Teknik Komputer, Universitas
Warmadewa. Struktur penyajian terinspirasi oleh codelab Flutter JTI Politeknik Negeri Malang,
dengan desain dan penulisan yang dibuat ulang.

© 2026 Computer Engineering – Universitas Warmadewa
