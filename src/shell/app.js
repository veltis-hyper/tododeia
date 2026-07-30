/* Runtime de la guía — router, progreso, búsqueda, copiado */
(function () {
  'use strict';

  var NAV = window.NAV; // { parts: [{key,label,for,items:[{id,num,title}]}] }
  var FLAT = [];
  NAV.parts.forEach(function (p) { p.items.forEach(function (it) { it.part = p; FLAT.push(it); }); });

  var LS_KEY = 'cdcac-progress-v1';

  function loadState() {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function saveState(s) { try { localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch (e) {} }
  var state = loadState(); // { [id]: 'done'|'skip', lastVisited: id }

  function statusOf(id) { var v = state[id]; return v === 'done' || v === 'skip' ? v : 'todo'; }
  function setStatus(id, st) {
    if (st === 'todo') delete state[id]; else state[id] = st;
    saveState(state); renderSidebar(); renderTopProgress();
  }
  function doneCount() {
    return FLAT.filter(function (it) { return statusOf(it.id) !== 'todo'; }).length;
  }
  function nextPending(fromIdx) {
    for (var i = fromIdx + 1; i < FLAT.length; i++) if (statusOf(FLAT[i].id) === 'todo') return FLAT[i];
    for (var j = fromIdx + 1; j < FLAT.length; j++) return FLAT[j];
    return null;
  }
  function firstPending() {
    for (var i = 0; i < FLAT.length; i++) if (statusOf(FLAT[i].id) === 'todo') return FLAT[i];
    return FLAT[0];
  }

  /* ---------- iconos ---------- */
  function stIcon(st) {
    if (st === 'done') return '<span class="st st-done"><svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M1.5 5.5l2.3 2.3L8.5 2.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';
    if (st === 'skip') return '<span class="st st-skip"><svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 2l3 3-3 3M6 2l3 3-3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';
    return '<span class="st st-todo"></span>';
  }
  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------- sidebar ---------- */
  var sidebarInner = document.getElementById('sidebarInner');
  function renderSidebar() {
    var cur = currentId();
    var html = NAV.parts.map(function (p) {
      var done = p.items.filter(function (it) { return statusOf(it.id) !== 'todo'; }).length;
      var rows = p.items.map(function (it) {
        return '<a class="nav-item' + (it.id === cur ? ' active' : '') + '" href="#/' + it.id + '">' +
          stIcon(statusOf(it.id)) +
          (it.num ? '<span class="nav-num">' + it.num + '</span>' : '') +
          '<span>' + esc(it.title) + '</span></a>';
      }).join('');
      return '<div class="nav-part"><div class="nav-part-head">' +
        '<span class="nav-part-title">' + esc(p.label) + '</span>' +
        '<span class="nav-part-count' + (done === p.items.length ? ' done' : '') + '">' + done + '/' + p.items.length + '</span>' +
        '</div>' + rows + '</div>';
    }).join('');
    sidebarInner.innerHTML = html;
  }

  function renderTopProgress() {
    var pct = Math.round(doneCount() / FLAT.length * 100);
    document.getElementById('tpFill').style.width = pct + '%';
    document.getElementById('tpLabel').textContent = pct + '%';
  }

  /* ---------- router ---------- */
  var content = document.getElementById('content');
  var pagenav = document.getElementById('pagenav');

  function currentId() {
    var h = location.hash.replace(/^#\//, '');
    return h.split('?')[0] || '';
  }

  function route() {
    var id = currentId();
    closeSidebarMobile();
    var isGuide = false;
    if (!id) { renderLanding(); }
    else if (id === 'inicio') { isGuide = true; renderHome(); }
    else if (id === 'boveda') { renderBoveda(); }
    else {
      var it = FLAT.find(function (x) { return x.id === id; });
      if (it) { isGuide = true; renderChapter(it); } else renderLanding();
    }
    document.body.classList.toggle('no-chrome', !isGuide);
    renderSidebar();
    renderTopProgress();
  }

  /* ---------- landing ---------- */
  function renderLanding() {
    pagenav.innerHTML = '';
    var pct = Math.round(doneCount() / FLAT.length * 100);
    var started = doneCount() > 0;
    var nG = BV.filter(function (d) { return d.type === 'guia'; }).length;
    var nR = BV.filter(function (d) { return d.type === 'repo'; }).length;
    content.innerHTML = '<div class="landing">' +
      '<div class="landing-hero">' +
      '<p class="landing-kicker">Edición Junio 2026 · v1.3</p>' +
      '<h1>Todo Claude.<br>En un solo lugar.</h1>' +
      '<p class="landing-sub">La guía completa en español y la bóveda de recursos, juntas.</p>' +
      '</div>' +
      '<div class="landing-choices">' +
      '<section class="choice">' +
      '<p class="choice-kicker">Guía interactiva</p>' +
      '<h2>Claude, de cero a cien.</h2>' +
      '<p class="choice-desc">La guía completa de Claude en español, de principiante a experto: Claude.ai, Claude Code, la API y todo lo que hay en medio.</p>' +
      '<p class="choice-meta">4 partes · 25 capítulos · 3 apéndices de referencia · Glosario</p>' +
      '<div class="choice-cta"><a class="btn btn-primary" href="#/inicio">' + (started ? 'Continuar la Guía' : 'Ir a la Guía') + '</a>' +
      (started ? '<span class="choice-progress">' + pct + '% completado</span>' : '') + '</div>' +
      '</section>' +
      '<section class="choice">' +
      '<p class="choice-kicker">Bóveda · tododeia.com</p>' +
      '<h2>La bóveda de Claude.</h2>' +
      '<p class="choice-desc">Guías y repos para exprimir Claude: todo el contenido de la bóveda, íntegro y buscable. Filtra por tipo, nivel o etiqueta.</p>' +
      '<p class="choice-meta">' + BV.length + ' elementos · ' + nG + ' guías · ' + nR + ' repos</p>' +
      '<div class="choice-cta"><a class="btn btn-ghost" href="#/boveda">Explorar la Bóveda</a></div>' +
      '</section>' +
      '</div>' +
      '</div>';
    window.scrollTo(0, 0);
  }

  /* ---------- bóveda ---------- */
  var BV = [];
  try {
    BV = JSON.parse(document.getElementById('boveda-data').textContent);
    BV.forEach(function (it, i) {
      it._i = i;
      it._search = bnorm(it.title + ' ' + it.desc + ' ' + (it.tags || []).join(' ') + ' ' + (it.license || '') + ' ' + (it.lang || ''));
    });
  } catch (e) { BV = []; }
  var bvState = { q: '', type: '', level: '', tag: '' };
  function bnorm(s) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }

  function bvBadgeRow(it) {
    var h = '';
    if (it.type === 'repo') {
      h += '<span class="badge b-repo">repo</span>';
      if (it.license) h += '<span class="badge b-lic">' + esc(it.license) + '</span>';
      if (it.lang) h += '<span class="badge b-lic">' + esc(it.lang) + '</span>';
    } else {
      h += '<span class="badge b-guia">guía</span>';
      if (it.level) h += '<span class="badge b-lvl">' + esc(it.level) + '</span>';
    }
    return h;
  }

  function bvCardHTML(it) {
    var h = '<article class="bcard" data-i="' + it._i + '">';
    h += '<div class="badges">' + bvBadgeRow(it) + '</div>';
    if (it.type === 'repo') h += '<a class="gh" href="' + esc(it.url) + '" target="_blank" rel="noopener" aria-label="GitHub"><svg width="17" height="17" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z"/></svg></a>';
    h += '<h2><a href="' + esc(it.url) + '" target="_blank" rel="noopener">' + esc(it.title) + '</a></h2>';
    h += '<p class="bdesc">' + esc(it.desc) + '</p>';
    h += '<button class="more" type="button">Leer más ↓</button>';
    h += '<div class="foot-meta">';
    if (it.tags && it.tags.length) {
      h += '<div class="tags">' + it.tags.map(function (t) {
        return '<button class="tag' + (bvState.tag === t ? ' on' : '') + '" data-tag="' + esc(t) + '">#' + esc(t) + '</button>';
      }).join('') + '</div>';
    }
    if (it.aparece_en && it.aparece_en.length) {
      h += '<div class="apar"><p class="apar-label">Aparece en</p><div class="apar-links">' +
        it.aparece_en.map(function (a) { return '<a href="' + esc(a.u) + '" target="_blank" rel="noopener">' + esc(a.t) + '</a>'; }).join('') + '</div></div>';
    }
    h += '</div></article>';
    return h;
  }

  function renderBoveda() {
    pagenav.innerHTML = '';
    var nG = BV.filter(function (d) { return d.type === 'guia'; }).length;
    var nR = BV.filter(function (d) { return d.type === 'repo'; }).length;
    content.innerHTML = '<div class="boveda">' +
      '<header class="bv-hero">' +
      '<p class="landing-kicker">Bóveda · tododeia.com</p>' +
      '<h1>La bóveda de Claude.</h1>' +
      '<p class="landing-sub">Guías y repos para exprimir Claude: todo el contenido de la bóveda, íntegro y buscable. Filtra por tipo, nivel o etiqueta.</p>' +
      '<p class="bv-stats"><b>' + BV.length + '</b> elementos · <b>' + nG + '</b> guías · <b>' + nR + '</b> repos</p>' +
      '</header>' +
      '<div class="bv-controls">' +
      '<input type="text" id="bvq" placeholder="Buscar en los ' + BV.length + ' elementos…" autocomplete="off" spellcheck="false">' +
      '<div class="seg" id="segType">' +
      '<button data-type="" class="on">Todo <span>' + BV.length + '</span></button>' +
      '<button data-type="guia">Guías <span>' + nG + '</span></button>' +
      '<button data-type="repo">Repos <span>' + nR + '</span></button></div>' +
      '<div class="seg" id="segLevel">' +
      '<button data-level="" class="on">Todos los niveles</button>' +
      '<button data-level="Principiante">Principiante</button>' +
      '<button data-level="Intermedio">Intermedio</button>' +
      '<button data-level="Avanzado">Avanzado</button></div>' +
      '<p class="bv-count" id="bvCount"></p>' +
      '</div>' +
      '<div class="bv-grid" id="bvGrid"></div>' +
      '<p class="landing-foot">' + BV.length + ' elementos · Contenido íntegro de la Bóveda de tododeia.com</p>' +
      '</div>';
    window.scrollTo(0, 0);

    var grid = document.getElementById('bvGrid');
    var bq = document.getElementById('bvq');
    var countLine = document.getElementById('bvCount');
    bq.value = bvState.q;

    function setSeg(id, key) {
      document.querySelectorAll('#' + id + ' button').forEach(function (b) {
        b.classList.toggle('on', b.getAttribute('data-' + key) === bvState[key]);
      });
    }

    function apply() {
      var nq = bnorm(bvState.q.trim());
      var hits = BV.filter(function (it) {
        if (bvState.type && it.type !== bvState.type) return false;
        if (bvState.level && it.level !== bvState.level) return false;
        if (bvState.tag && (!it.tags || it.tags.indexOf(bvState.tag) === -1)) return false;
        if (nq && it._search.indexOf(nq) === -1) return false;
        return true;
      });
      grid.innerHTML = hits.length
        ? hits.map(bvCardHTML).join('')
        : '<div class="bv-empty"><p>Sin resultados</p><p>Prueba con otra búsqueda o limpia los filtros.</p></div>';

      countLine.innerHTML = '<b>' + hits.length + '</b> de ' + BV.length + ' elementos' +
        (bvState.tag ? ' <button class="tagpill" id="bvTagClear">#' + esc(bvState.tag) + ' <span>×</span></button>' : '') +
        ((bvState.q || bvState.type || bvState.level || bvState.tag) ? ' <button class="clear-btn" id="bvClearAll">limpiar todo</button>' : '');

      var tc = document.getElementById('bvTagClear');
      if (tc) tc.addEventListener('click', function () { bvState.tag = ''; apply(); });
      var ca = document.getElementById('bvClearAll');
      if (ca) ca.addEventListener('click', function () {
        bvState.q = ''; bvState.type = ''; bvState.level = ''; bvState.tag = ''; bq.value = '';
        setSeg('segType', 'type'); setSeg('segLevel', 'level'); apply();
      });

      grid.querySelectorAll('.bcard').forEach(function (card) {
        var d = card.querySelector('.bdesc');
        if (d && d.scrollHeight > d.clientHeight + 2) card.classList.add('clamped');
      });
    }

    setSeg('segType', 'type'); setSeg('segLevel', 'level');

    document.getElementById('segType').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      bvState.type = b.getAttribute('data-type'); setSeg('segType', 'type'); apply();
    });
    document.getElementById('segLevel').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      bvState.level = b.getAttribute('data-level'); setSeg('segLevel', 'level'); apply();
    });
    var bt = null;
    bq.addEventListener('input', function () {
      clearTimeout(bt);
      bt = setTimeout(function () { bvState.q = bq.value; apply(); }, 120);
    });
    grid.addEventListener('click', function (e) {
      var tg = e.target.closest('.tag');
      if (tg) { bvState.tag = bvState.tag === tg.getAttribute('data-tag') ? '' : tg.getAttribute('data-tag'); apply(); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
      var m = e.target.closest('.more');
      if (m) {
        var card = m.closest('.bcard');
        card.classList.toggle('open');
        m.textContent = card.classList.contains('open') ? 'Leer menos ↑' : 'Leer más ↓';
      }
    });

    apply();
  }

  /* ---------- home ---------- */
  function renderHome() {
    pagenav.innerHTML = '';
    var cont = firstPending();
    var started = doneCount() > 0;
    var pct = Math.round(doneCount() / FLAT.length * 100);
    var partsHtml = NAV.parts.map(function (p) {
      var done = p.items.filter(function (it) { return statusOf(it.id) !== 'todo'; }).length;
      var rows = p.items.map(function (it) {
        return '<a class="home-row" href="#/' + it.id + '">' +
          (it.num ? '<span class="nav-num">' + it.num + '</span>' : '<span class="nav-num"></span>') +
          '<span class="t">' + esc(it.title) + '</span>' + stIcon(statusOf(it.id)) + '</a>';
      }).join('');
      return '<section class="home-part"><div class="home-part-head"><h2>' + esc(p.label) + '</h2>' +
        (p.for ? '<span class="for">' + esc(p.for) + '</span>' : '') +
        '<span class="home-part-progress">' + done + ' / ' + p.items.length + '</span></div>' +
        '<div class="home-list">' + rows + '</div></section>';
    }).join('');

    content.innerHTML = '<div class="home">' +
      '<div class="home-hero">' +
      '<p class="home-kicker">Guía interactiva · Edición Junio 2026 · v1.3</p>' +
      '<h1>Claude, de cero a cien.</h1>' +
      '<p class="home-sub">La guía completa de Claude en español, de principiante a experto: Claude.ai, Claude Code, la API y todo lo que hay en medio. Avanza en orden, marca lo que completes y salta lo que ya dominas.</p>' +
      '<div class="home-meta"><span>4 partes</span><span>25 capítulos</span><span>3 apéndices de referencia</span><span>Glosario</span></div>' +
      '</div>' +
      '<div class="continue-card"><div class="continue-info">' +
      '<p class="continue-label">' + (started ? 'Continuar donde ibas · ' + pct + '% completado' : 'Empieza aquí') + '</p>' +
      '<p class="continue-title">' + esc(cont.title) + '</p></div>' +
      '<a class="btn btn-primary" href="#/' + cont.id + '">' + (started ? 'Continuar' : 'Empezar la guía') + ' →</a>' +
      '</div>' + partsHtml + '</div>';
    window.scrollTo(0, 0);
  }

  /* ---------- capítulo ---------- */
  function renderChapter(it) {
    var tpl = document.getElementById('tpl-' + it.id);
    if (!tpl) { content.innerHTML = '<div class="content-inner"><p>Capítulo no encontrado.</p></div>'; return; }
    var idx = FLAT.indexOf(it);
    var prev = idx > 0 ? FLAT[idx - 1] : null;
    var next = idx < FLAT.length - 1 ? FLAT[idx + 1] : null;
    var st = statusOf(it.id);

    var wrap = document.createElement('div');
    wrap.className = 'content-inner';
    wrap.appendChild(tpl.content.cloneNode(true));

    var footer = document.createElement('footer');
    footer.className = 'ch-footer';
    var stNote = '';
    if (st === 'done') stNote = '<span class="ch-state-note">✓ Capítulo completado</span>';
    if (st === 'skip') stNote = '<span class="ch-state-note skipped">Saltado (ya lo dominabas)</span>';
    footer.innerHTML = '<div class="ch-actions">' +
      (prev ? '<a class="btn btn-ghost btn-back" href="#/' + prev.id + '">← Anterior</a>' : '<span class="btn-back"></span>') +
      stNote +
      (st === 'todo'
        ? '<button class="btn btn-ghost" data-act="skip">Ya domino esto · saltar</button>' +
          '<button class="btn btn-primary" data-act="done">Completar y continuar →</button>'
        : '<button class="btn btn-ghost" data-act="reset">Marcar como pendiente</button>' +
          (next ? '<a class="btn btn-primary" href="#/' + next.id + '">Siguiente →</a>' : '<a class="btn btn-primary" href="#/inicio">Volver al índice</a>')) +
      '</div>';
    wrap.appendChild(footer);

    content.innerHTML = '';
    content.appendChild(wrap);
    window.scrollTo(0, 0);

    footer.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]'); if (!b) return;
      var act = b.getAttribute('data-act');
      if (act === 'done' || act === 'skip') {
        setStatus(it.id, act === 'done' ? 'done' : 'skip');
        if (next) location.hash = '#/' + next.id; else location.hash = '#/inicio';
      } else if (act === 'reset') {
        setStatus(it.id, 'todo'); renderChapter(it);
      }
    });

    addCopyButtons(wrap);
    renderPagenav(it, wrap);
    scrollSpy(wrap);
  }

  /* ---------- índice del capítulo ---------- */
  function renderPagenav(it, wrap) {
    var hs = wrap.querySelectorAll('h2[id]');
    if (!hs.length) { pagenav.innerHTML = ''; return; }
    var html = '<p class="pagenav-title">En este capítulo</p>';
    hs.forEach(function (h) {
      html += '<a href="#/' + it.id + '?s=' + h.id + '" data-target="' + h.id + '">' + esc(h.textContent) + '</a>';
    });
    pagenav.innerHTML = html;
    pagenav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var el = document.getElementById(a.getAttribute('data-target'));
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  var spyHandler = null;
  function scrollSpy(wrap) {
    if (spyHandler) window.removeEventListener('scroll', spyHandler);
    var hs = Array.prototype.slice.call(wrap.querySelectorAll('h2[id]'));
    if (!hs.length) return;
    spyHandler = function () {
      var y = window.scrollY + 90, cur = hs[0];
      hs.forEach(function (h) { if (h.offsetTop <= y) cur = h; });
      pagenav.querySelectorAll('a').forEach(function (a) {
        a.classList.toggle('current', a.getAttribute('data-target') === cur.id);
      });
    };
    window.addEventListener('scroll', spyHandler, { passive: true });
    spyHandler();
  }

  /* ---------- copiar código ---------- */
  function addCopyButtons(scope) {
    scope.querySelectorAll('pre').forEach(function (pre) {
      var btn = document.createElement('button');
      btn.className = 'copy-btn'; btn.type = 'button'; btn.textContent = 'Copiar';
      btn.addEventListener('click', function () {
        var code = pre.querySelector('code');
        var txt = code ? code.textContent : pre.textContent;
        navigator.clipboard.writeText(txt).then(function () {
          btn.textContent = 'Copiado ✓'; btn.classList.add('copied');
          setTimeout(function () { btn.textContent = 'Copiar'; btn.classList.remove('copied'); }, 1600);
        });
      });
      pre.appendChild(btn);
    });
  }

  /* ---------- búsqueda ---------- */
  var overlay = document.getElementById('searchOverlay');
  var input = document.getElementById('searchInput');
  var resultsEl = document.getElementById('searchResults');
  var index = null;

  function buildIndex() {
    index = [];
    FLAT.forEach(function (it) {
      var tpl = document.getElementById('tpl-' + it.id);
      if (!tpl) return;
      var frag = tpl.content;
      var curH2 = null;
      frag.querySelectorAll('h2[id], h3, p, li, dt, dd, td').forEach(function (el) {
        if (el.tagName === 'H2') curH2 = { id: el.id, t: el.textContent };
        var txt = el.textContent.replace(/\s+/g, ' ').trim();
        if (txt.length > 2) index.push({ it: it, h2: curH2, txt: txt, low: txt.toLowerCase() });
      });
    });
  }
  function norm(s) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }

  function doSearch(q) {
    if (!index) buildIndex();
    q = q.trim();
    if (q.length < 2) { resultsEl.innerHTML = '<p class="search-hint">Escribe al menos 2 caracteres.</p>'; return; }
    var nq = norm(q);
    var hits = [], seen = {};
    for (var i = 0; i < index.length && hits.length < 40; i++) {
      var e = index[i];
      var pos = norm(e.low).indexOf(nq);
      if (pos === -1) continue;
      var key = e.it.id + '|' + (e.h2 ? e.h2.id : '') + '|' + e.txt.slice(0, 40);
      if (seen[key]) continue; seen[key] = 1;
      hits.push({ e: e, pos: pos });
    }
    if (!hits.length) { resultsEl.innerHTML = '<p class="search-hint">Sin resultados para «' + esc(q) + '».</p>'; return; }
    var html = '', lastCh = null;
    hits.forEach(function (h) {
      var e = h.e;
      if (e.it.id !== lastCh) { html += '<p class="sr-group">' + esc((e.it.num ? e.it.num + ' · ' : '') + e.it.title) + '</p>'; lastCh = e.it.id; }
      var start = Math.max(0, h.pos - 40);
      var snip = (start > 0 ? '…' : '') + e.txt.slice(start, h.pos) +
        '<mark>' + esc(e.txt.substr(h.pos, q.length)) + '</mark>' +
        esc(e.txt.slice(h.pos + q.length, h.pos + q.length + 110)) + '…';
      var target = e.h2 ? '#/' + e.it.id + '?s=' + e.h2.id : '#/' + e.it.id;
      html += '<a class="sr-item" href="' + target + '" data-sec="' + (e.h2 ? e.h2.id : '') + '" data-ch="' + e.it.id + '">' +
        '<p class="sr-title">' + (e.h2 ? esc(e.h2.t) : esc(e.it.title)) + '</p>' +
        '<p class="sr-snippet">' + (start > 0 ? esc(e.txt.slice(start, h.pos)) : esc(e.txt.slice(0, h.pos))) +
        '<mark>' + esc(e.txt.substr(h.pos, q.length)) + '</mark>' +
        esc(e.txt.slice(h.pos + q.length, h.pos + q.length + 110)) + '</p></a>';
    });
    resultsEl.innerHTML = html;
  }

  function openSearch() { overlay.hidden = false; input.value = ''; resultsEl.innerHTML = '<p class="search-hint">Escribe para buscar en los 25 capítulos, apéndices y glosario.</p>'; setTimeout(function () { input.focus(); }, 30); }
  function closeSearch() { overlay.hidden = true; }

  document.getElementById('searchBtn').addEventListener('click', openSearch);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeSearch(); });
  input.addEventListener('input', function () { doSearch(input.value); });
  resultsEl.addEventListener('click', function (e) {
    var a = e.target.closest('.sr-item'); if (!a) return;
    e.preventDefault(); closeSearch();
    var ch = a.getAttribute('data-ch'), sec = a.getAttribute('data-sec');
    location.hash = '#/' + ch;
    if (sec) setTimeout(function () {
      var el = document.getElementById(sec);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  });
  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); overlay.hidden ? openSearch() : closeSearch(); }
    if (e.key === 'Escape' && !overlay.hidden) closeSearch();
  });

  /* ---------- sidebar móvil ---------- */
  var sidebar = document.getElementById('sidebar');
  var scrim = document.getElementById('scrim');
  document.getElementById('navToggle').addEventListener('click', function () {
    sidebar.classList.toggle('open');
    scrim.classList.toggle('show', sidebar.classList.contains('open'));
  });
  scrim.addEventListener('click', closeSidebarMobile);
  function closeSidebarMobile() { sidebar.classList.remove('open'); scrim.classList.remove('show'); }

  /* ---------- arranque ---------- */
  window.addEventListener('hashchange', route);
  route();
  // scroll a sección si viene en la URL (#/capX?s=slug)
  var m = location.hash.match(/\?s=([\w-]+)/);
  if (m) setTimeout(function () {
    var el = document.getElementById(m[1]);
    if (el) el.scrollIntoView({ block: 'start' });
  }, 120);
})();
