/* ==========================================================================
   PEMROGRAMAN MOBILE — main.js
   Vanilla JavaScript. Tanpa dependency eksternal.
   ========================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  var BASE = root.getAttribute("data-base") || "";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- 1. Tema terang / gelap ------------------------------------- */
  var THEME_KEY = "pm-theme";

  function applyTheme(mode) {
    root.setAttribute("data-theme", mode);
    $$("[data-theme-toggle]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(mode === "dark"));
      btn.setAttribute("aria-label", mode === "dark" ? "Ganti ke tema terang" : "Ganti ke tema gelap");
    });
  }

  function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
    var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(saved || (prefersDark ? "dark" : "light"));

    $$("[data-theme-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        applyTheme(next);
        try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
      });
    });
  }

  /* ---------- 2. Navigasi mobile ----------------------------------------- */
  function initNav() {
    var toggle = $("[data-nav-toggle]");
    var nav = $("#main-nav");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });

    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 860) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- 3. Sidebar materi (mobile) ---------------------------------- */
  function initSidebar() {
    var sidebar = $("#materi-sidebar");
    if (!sidebar) return;

    var backdrop = $(".sidebar-backdrop");
    var openers = $$("[data-sidebar-open]");
    var closers = $$("[data-sidebar-close]");

    function setOpen(open) {
      sidebar.classList.toggle("is-open", open);
      if (backdrop) backdrop.classList.toggle("is-open", open);
      openers.forEach(function (b) { b.setAttribute("aria-expanded", String(open)); });
      document.body.style.overflow = open && window.innerWidth <= 860 ? "hidden" : "";
      if (open) {
        var first = sidebar.querySelector("a, button");
        if (first) first.focus();
      }
    }

    openers.forEach(function (b) { b.addEventListener("click", function () { setOpen(true); }); });
    closers.forEach(function (b) { b.addEventListener("click", function () { setOpen(false); }); });
    if (backdrop) backdrop.addEventListener("click", function () { setOpen(false); });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && sidebar.classList.contains("is-open")) setOpen(false);
    });

    // pastikan materi aktif terlihat di sidebar
    var active = sidebar.querySelector('[aria-current="page"]');
    if (active && window.innerWidth > 860) {
      var top = active.offsetTop - sidebar.clientHeight / 2;
      if (top > 0) sidebar.scrollTop = top;
    }
  }

  /* ---------- 4. Pencarian materi ---------------------------------------- */
  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function highlightMatch(text, query) {
    var safe = escapeHtml(text);
    if (!query) return safe;
    var terms = query.split(/\s+/).filter(Boolean).map(function (t) {
      return t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    });
    if (!terms.length) return safe;
    return safe.replace(new RegExp("(" + terms.join("|") + ")", "gi"), "<mark>$1</mark>");
  }

  function scoreEntry(entry, query) {
    var q = query.toLowerCase().trim();
    if (!q) return 0;
    var terms = q.split(/\s+/).filter(Boolean);
    var hay = {
      week: String(entry.week),
      weekPad: ("0" + entry.week).slice(-2),
      title: entry.title.toLowerCase(),
      desc: entry.desc.toLowerCase(),
      keys: entry.keywords.join(" ").toLowerCase()
    };
    var total = 0;
    for (var i = 0; i < terms.length; i++) {
      var t = terms[i];
      var s = 0;
      if (hay.week === t || hay.weekPad === t || ("minggu " + hay.week).indexOf(t) === 0) s += 60;
      if (hay.title.indexOf(t) === 0) s += 40;
      else if (hay.title.indexOf(t) > -1) s += 28;
      if (hay.keys.indexOf(t) > -1) s += 18;
      if (hay.desc.indexOf(t) > -1) s += 10;
      if (s === 0) return 0; // semua kata harus cocok
      total += s;
    }
    return total;
  }

  function initSearch() {
    var overlay = $("#search-overlay");
    if (!overlay || typeof window.MODULES === "undefined") return;

    var input = $("#search-input");
    var results = $("#search-results");
    var empty = $("#search-empty");
    var lastFocus = null;

    function open() {
      lastFocus = document.activeElement;
      overlay.classList.add("is-open");
      overlay.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      input.focus();
      input.select();
      if (!input.value) render("");
    }

    function close() {
      overlay.classList.remove("is-open");
      overlay.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (lastFocus) lastFocus.focus();
    }

    function render(query) {
      var list = window.MODULES;
      var items;

      if (!query.trim()) {
        items = list.slice(0, 6);
      } else {
        items = list
          .map(function (m) { return { m: m, s: scoreEntry(m, query) }; })
          .filter(function (o) { return o.s > 0; })
          .sort(function (a, b) { return b.s - a.s || a.m.week - b.m.week; })
          .map(function (o) { return o.m; });
      }

      results.innerHTML = items.map(function (m) {
        return '<li><a class="result-item" href="' + BASE + m.url + '">' +
          '<span class="result-week">MINGGU ' + ("0" + m.week).slice(-2) + "</span>" +
          '<span class="result-title">' + highlightMatch(m.title, query) + "</span>" +
          '<span class="result-desc">' + highlightMatch(m.desc, query) + "</span>" +
          "</a></li>";
      }).join("");

      empty.hidden = items.length > 0;
      if (!items.length) {
        empty.textContent = 'Tidak ada materi yang cocok dengan "' + query.trim() +
          '". Coba kata kunci lain seperti Flutter, Dart, widget, state, API, atau kamera.';
      }
    }

    $$("[data-search-open]").forEach(function (b) {
      b.addEventListener("click", open);
    });
    $$("[data-search-close]").forEach(function (b) { b.addEventListener("click", close); });

    overlay.addEventListener("mousedown", function (e) {
      if (e.target === overlay) close();
    });

    input.addEventListener("input", function () { render(input.value); });

    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        var first = results.querySelector(".result-item");
        if (first) first.focus();
      }
    });

    results.addEventListener("keydown", function (e) {
      var items = $$(".result-item", results);
      var idx = items.indexOf(document.activeElement);
      if (e.key === "ArrowDown") { e.preventDefault(); (items[idx + 1] || items[0]).focus(); }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (idx <= 0) input.focus(); else items[idx - 1].focus();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && overlay.classList.contains("is-open")) { close(); return; }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); open(); return; }
      if (e.key === "/" && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) {
        e.preventDefault();
        open();
      }
    });
  }

  /* ---------- 5. Syntax highlighting (Dart, YAML, Bash, JSON) ------------- */
  var DART_KEYWORDS = ("abstract as assert async await break case catch class const continue covariant default deferred do " +
    "dynamic else enum export extends extension external factory false final finally for get hide if implements import in " +
    "interface is late library mixin new null on operator part required rethrow return sealed set show static super switch " +
    "sync this throw true try typedef var void while with yield").split(" ");

  var BASH_KEYWORDS = ["flutter", "dart", "git", "cd", "mkdir", "code", "adb", "python3", "echo", "pub"];

  function wrap(cls, text) {
    return '<span class="' + cls + '">' + escapeHtml(text) + "</span>";
  }

  // Menyorot bagian kode yang berada di luar string dan komentar.
  function highlightPlain(text, lang) {
    var re;
    if (lang === "yaml") {
      re = /([A-Za-z_][\w.$-]*)(?=\s*:)|(\b\d[\w.+-]*)|\b(true|false|null)\b/g;
    } else if (lang === "bash") {
      re = /(^|\n)([ \t]*)([a-z][\w.-]*)|(--?[A-Za-z][\w-]*)|(\b\d+\b)/g;
    } else if (lang === "json") {
      re = /\b(true|false|null)\b|(-?\b\d+(?:\.\d+)?\b)/g;
    } else {
      re = /(@[A-Za-z_]\w*)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)/g;
    }

    var out = "";
    var last = 0;
    var m;

    while ((m = re.exec(text)) !== null) {
      if (m.index === re.lastIndex) { re.lastIndex++; continue; }
      out += escapeHtml(text.slice(last, m.index));

      if (lang === "yaml") {
        if (m[1]) out += wrap("tok-cls", m[1]);
        else if (m[2]) out += wrap("tok-num", m[2]);
        else out += wrap("tok-key", m[0]);
      } else if (lang === "bash") {
        if (m[3]) {
          out += escapeHtml(m[1] + m[2]);
          out += BASH_KEYWORDS.indexOf(m[3]) > -1 ? wrap("tok-key", m[3]) : escapeHtml(m[3]);
        } else if (m[4]) {
          out += wrap("tok-ann", m[4]);
        } else {
          out += wrap("tok-num", m[0]);
        }
      } else if (lang === "json") {
        out += m[1] ? wrap("tok-key", m[1]) : wrap("tok-num", m[0]);
      } else {
        if (m[1]) {
          out += wrap("tok-ann", m[1]);
        } else if (m[2]) {
          out += wrap("tok-num", m[2]);
        } else {
          var kata = m[3];
          var sesudah = text.charAt(re.lastIndex);
          if (DART_KEYWORDS.indexOf(kata) > -1) out += wrap("tok-key", kata);
          else if (/^[A-Z]/.test(kata)) out += wrap("tok-cls", kata);
          else if (sesudah === "(") out += wrap("tok-fn", kata);
          else out += escapeHtml(kata);
        }
      }
      last = re.lastIndex;
    }

    return out + escapeHtml(text.slice(last));
  }

  function highlightCode(source, lang) {
    var re;
    if (lang === "yaml" || lang === "bash") {
      re = /#[^\n]*|<!--[\s\S]*?-->|'[^'\n]*'|"[^"\n]*"/g;
    } else {
      re = new RegExp(
        "'''[\\s\\S]*?'''|\\/\\*[\\s\\S]*?\\*\\/|\\/\\/[^\\n]*|<!--[\\s\\S]*?-->|" +
        "'(?:\\\\.|[^'\\\\\\n])*'|\"(?:\\\\.|[^\"\\\\\\n])*\"", "g");
    }

    var out = "";
    var last = 0;
    var m;

    while ((m = re.exec(source)) !== null) {
      out += highlightPlain(source.slice(last, m.index), lang);
      var awal = m[0].charAt(0);
      var kelas = (awal === "'" || awal === '"') ? "tok-str" : "tok-com";
      out += wrap(kelas, m[0]);
      last = re.lastIndex;
    }

    return out + highlightPlain(source.slice(last), lang);
  }

  function initCodeBlocks() {
    $$(".code-block").forEach(function (block) {
      var code = block.querySelector("code");
      if (!code) return;

      var raw = code.textContent.replace(/^\n/, "").replace(/\s+$/, "");
      var lang = (code.className.match(/language-(\w+)/) || [, "dart"])[1];
      code.setAttribute("data-raw", raw);
      code.innerHTML = highlightCode(raw, lang);

      var btn = block.querySelector(".copy-btn");
      if (!btn) return;

      btn.addEventListener("click", function () {
        var text = code.getAttribute("data-raw");
        var done = function () {
          var label = btn.querySelector("span");
          btn.classList.add("copied");
          if (label) label.textContent = "Copied!";
          setTimeout(function () {
            btn.classList.remove("copied");
            if (label) label.textContent = "Copy";
          }, 1800);
        };

        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(text).then(done, fallback);
        } else {
          fallback();
        }

        function fallback() {
          var ta = document.createElement("textarea");
          ta.value = text;
          ta.setAttribute("readonly", "");
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand("copy"); done(); } catch (e) {}
          document.body.removeChild(ta);
        }
      });
    });
  }

  /* ---------- 6. Daftar isi + scrollspy ---------------------------------- */
  function slugify(text) {
    return text.toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 60);
  }

  function initToc() {
    var content = $("#lesson-content");
    var toc = $("#toc-list");
    if (!content) return;

    var headings = $$("h2, h3", content).filter(function (h) {
      return !h.closest(".objectives") && !h.hasAttribute("data-no-toc");
    });

    headings.forEach(function (h, i) {
      if (!h.id) h.id = slugify(h.textContent) || "bagian-" + (i + 1);
      var a = document.createElement("a");
      a.className = "anchor-link";
      a.href = "#" + h.id;
      a.setAttribute("aria-label", "Tautan ke bagian " + h.textContent);
      a.textContent = "#";
      h.appendChild(a);
    });

    if (!toc) return;
    toc.innerHTML = headings.map(function (h) {
      return '<li><a href="#' + h.id + '" class="' + (h.tagName === "H3" ? "toc-h3" : "") + '">' +
        escapeHtml(h.textContent.replace(/#$/, "")) + "</a></li>";
    }).join("");

    var links = $$("a", toc);
    if (!links.length || !("IntersectionObserver" in window)) return;

    var visible = {};
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        visible[entry.target.id] = entry.isIntersecting;
      });
      var currentId = null;
      for (var i = 0; i < headings.length; i++) {
        if (visible[headings[i].id]) { currentId = headings[i].id; break; }
      }
      if (!currentId) return;
      links.forEach(function (l) {
        l.classList.toggle("is-active", l.getAttribute("href") === "#" + currentId);
      });
    }, { rootMargin: "-90px 0px -70% 0px", threshold: 0 });

    headings.forEach(function (h) { observer.observe(h); });
  }

  /* ---------- 7. Progress baca + tombol ke atas -------------------------- */
  function initScrollUi() {
    var bar = $("#progress-bar");
    var toTop = $("#to-top");

    function onScroll() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var ratio = max > 0 ? window.scrollY / max : 0;
      if (bar) bar.style.width = (ratio * 100).toFixed(2) + "%";
      if (toTop) toTop.classList.toggle("show", window.scrollY > 500);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();

    if (toTop) {
      toTop.addEventListener("click", function () {
        var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      });
    }
  }

  /* ---------- 8. Checklist & refleksi tersimpan --------------------------- */
  function initPersistence() {
    var page = document.body.getAttribute("data-page") || location.pathname;

    $$(".checklist input[type=checkbox]").forEach(function (box, i) {
      var key = "pm-check:" + page + ":" + (box.id || i);
      try {
        if (localStorage.getItem(key) === "1") box.checked = true;
      } catch (e) {}
      box.addEventListener("change", function () {
        try { localStorage.setItem(key, box.checked ? "1" : "0"); } catch (e) {}
      });
    });

    $$("[data-persist-note]").forEach(function (area, i) {
      var key = "pm-note:" + page + ":" + i;
      try {
        var saved = localStorage.getItem(key);
        if (saved) area.value = saved;
      } catch (e) {}
      var timer;
      area.addEventListener("input", function () {
        clearTimeout(timer);
        timer = setTimeout(function () {
          try { localStorage.setItem(key, area.value); } catch (e) {}
        }, 400);
      });
    });
  }

  /* ---------- 9. Init ----------------------------------------------------- */
  function init() {
    initTheme();
    initNav();
    initSidebar();
    initSearch();
    initCodeBlocks();
    initToc();
    initScrollUi();
    initPersistence();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
