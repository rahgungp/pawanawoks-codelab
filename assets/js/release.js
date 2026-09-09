/* =========================================================================
   KONTROL RILIS MATERI
   -------------------------------------------------------------------------
   Ubah daftar di bawah ini untuk menentukan minggu mana yang sudah dibuka.
   Minggu yang tidak terdaftar otomatis tampil sebagai "Segera hadir":
   kartunya tidak bisa diklik, item sidebar terkunci, dan halamannya
   menampilkan panel pemberitahuan alih-alih materi.

   Contoh:
     [1]              -> hanya Minggu 01 yang terbuka
     [1, 2, 3]        -> Minggu 01 sampai 03 terbuka
     [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]  -> semua terbuka

   Simpan berkas ini, commit, lalu push. Tidak ada berkas lain yang
   perlu diubah.
   ========================================================================= */

window.RELEASED_WEEKS = [1];

/* ------------------------------------------------------------------------
   Di bawah baris ini tidak perlu diubah.
   ------------------------------------------------------------------------ */
(function () {
  "use strict";

  var TOTAL = 16;
  var released = window.RELEASED_WEEKS || [];
  var locked = [];
  var i;

  for (i = 1; i <= TOTAL; i++) {
    if (released.indexOf(i) === -1) locked.push(i);
  }

  window.LOCKED_WEEKS = locked;

  var root = document.documentElement;
  var current = parseInt(root.getAttribute("data-week"), 10);

  // Halaman minggu yang belum dirilis: tandai agar CSS menukar isinya.
  if (current && locked.indexOf(current) > -1) {
    root.setAttribute("data-locked", "");
  }

  if (!locked.length) return;

  // Aturan CSS disuntikkan sebelum <body> dirender supaya kartu terkunci
  // tidak sempat berkedip dalam keadaan terbuka.
  var cards = [];
  var links = [];
  var ctas = [];
  for (i = 0; i < locked.length; i++) {
    cards.push('.week-card[data-week="' + locked[i] + '"]');
    links.push('[data-week-link="' + locked[i] + '"]');
    ctas.push('[data-week-cta="' + locked[i] + '"]');
  }

  var css =
    cards.join(",") + "{background:var(--bg-alt);box-shadow:none}" +
    cards.map(function (s) { return s + ":hover"; }).join(",") +
      "{transform:none;border-color:var(--border);box-shadow:none}" +
    cards.map(function (s) { return s + " .week-icon"; }).join(",") + "{opacity:.45}" +
    cards.map(function (s) { return s + " h3"; }).join(",") + "{color:var(--text-muted)}" +
    ctas.join(",") +
      "{pointer-events:none;border-style:dashed;color:var(--text-muted);background:transparent}" +
    ctas.map(function (s) { return s + " .cta-open"; }).join(",") + "{display:none}" +
    ctas.map(function (s) { return s + " .cta-lock"; }).join(",") + "{display:inline-flex}" +
    links.join(",") + "{pointer-events:none;opacity:.5}" +
    links.map(function (s) { return s + " .lock-mark"; }).join(",") + "{display:inline-flex}";

  var style = document.createElement("style");
  style.setAttribute("data-release-gate", "");
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);
})();
