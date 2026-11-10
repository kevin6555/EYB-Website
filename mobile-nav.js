/* Phone menu: builds the ☰ button and side panel from the links already in
   each page's header, so every page and language gets it automatically. */
(function(){
  var header = document.querySelector('header');
  var navLeft = header && header.querySelector('.nav-left');
  var links = header && header.querySelector('.links');
  if (!navLeft || !links) return;

  var lang = (document.documentElement.lang || 'en').slice(0, 2);
  var T = {
    en: {open: 'Open menu', close: 'Close menu', menu: 'Menu', lang: 'Language'},
    fr: {open: 'Ouvrir le menu', close: 'Fermer le menu', menu: 'Menu', lang: 'Langue'},
    ar: {open: 'فتح القائمة', close: 'إغلاق القائمة', menu: 'القائمة', lang: 'اللغة'}
  }[lang] || {open: 'Open menu', close: 'Close menu', menu: 'Menu', lang: 'Language'};

  var here = location.pathname.split('/').pop() || 'index.html';
  function isHere(a){
    var h = (a.getAttribute('href') || '').split('#')[0];
    return h && h === here;
  }
  function el(tag, cls, html){
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html) n.innerHTML = html;
    return n;
  }

  /* ☰ button, placed before the logo */
  var btn = el('button', 'mnav-btn',
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>');
  btn.type = 'button';
  btn.setAttribute('aria-label', T.open);
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', 'mnav');
  navLeft.insertBefore(btn, navLeft.firstChild);

  /* panel (lives on <body> so the header's blur effect can't trap it) */
  var scrim = el('div', 'mnav-scrim');
  var panel = el('div', 'mnav');
  panel.id = 'mnav';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('aria-label', T.menu);

  var head = el('div', 'mnav-head');
  var brand = header.querySelector('.brand');
  if (brand){
    var b = brand.cloneNode(true);
    if ((b.getAttribute('href') || '').charAt(0) === '#') b.setAttribute('href', 'index.html');
    head.appendChild(b);
  } else head.appendChild(el('span'));
  var closeBtn = el('button', 'mnav-close',
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>');
  closeBtn.type = 'button';
  closeBtn.setAttribute('aria-label', T.close);
  head.appendChild(closeBtn);
  panel.appendChild(head);

  var main = el('nav', 'mnav-links');
  main.setAttribute('aria-label', T.menu);

  /* "Modules" row that expands to show the modules (copied from the desktop dropdown) */
  var modMenu = document.getElementById('mod-menu');
  var modBtn = links.querySelector('.menu-btn');
  var accBtn = null, mods = null;
  if (modMenu){
    accBtn = el('button', 'mnav-acc');
    accBtn.type = 'button';
    accBtn.setAttribute('aria-expanded', 'false');
    accBtn.setAttribute('aria-controls', 'mnav-mods');
    accBtn.appendChild(el('span')).textContent = modBtn ? modBtn.textContent.trim() : 'Modules';
    accBtn.appendChild(el('span', '', '<svg width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'));
    mods = el('div', 'mnav-mods');
    mods.id = 'mnav-mods';
    mods.hidden = true;
    modMenu.querySelectorAll('a').forEach(function(a){
      var c = a.cloneNode(true);
      if (isHere(c)) c.setAttribute('aria-current', 'page');
      mods.appendChild(c);
    });
    accBtn.addEventListener('click', function(){ setMods(mods.hidden); });
    main.appendChild(accBtn);
    main.appendChild(mods);
  }
  function setMods(o){
    if (!mods) return;
    mods.hidden = !o;
    accBtn.setAttribute('aria-expanded', o ? 'true' : 'false');
  }

  /* the other header links, plus FAQ from the footer */
  var seen = {};
  function addLink(a){
    var href = a.getAttribute('href');
    if (!href || seen[href]) return;
    seen[href] = 1;
    var c = el('a');
    c.href = href;
    c.textContent = a.textContent.trim();
    if (isHere(c)) c.setAttribute('aria-current', 'page');
    main.appendChild(c);
  }
  [].forEach.call(links.children, function(n){ if (n.tagName === 'A') addLink(n); });
  var faq = document.querySelector('footer a[href$="faq.html"]');
  if (faq) addLink(faq);
  if (main.children.length) panel.appendChild(main);

  /* language choice */
  var langMenu = header.querySelector('.lang-menu');
  if (langMenu){
    panel.appendChild(el('span', 'mnav-label')).textContent = T.lang;
    var lw = el('div', 'mnav-lang');
    langMenu.querySelectorAll('a').forEach(function(a){
      var c = a.cloneNode(true);
      var code = c.querySelector('small');
      if (code) c.setAttribute('aria-label', c.textContent.replace(code.textContent, '').trim());
      lw.appendChild(c);
    });
    panel.appendChild(lw);
  }

  /* big "Book a demo" button */
  var cta = header.querySelector('.nav-cta');
  if (cta){
    var cc = cta.cloneNode(true);
    cc.classList.remove('nav-cta');
    cc.classList.add('mnav-cta');
    panel.appendChild(cc);
  }

  document.body.appendChild(scrim);
  document.body.appendChild(panel);
  document.documentElement.classList.add('has-mnav');

  /* open / close */
  var root = document.documentElement;
  var mq = window.matchMedia('(max-width: 860px)');
  function isOpen(){ return root.classList.contains('mnav-open'); }
  function setOpen(o, keepFocus){
    root.classList.toggle('mnav-open', o);
    btn.setAttribute('aria-expanded', o ? 'true' : 'false');
    if (o){
      var dd = header.querySelector('.lang-dd[open]');
      if (dd) dd.removeAttribute('open');
      setTimeout(function(){ closeBtn.focus({preventScroll: true}); }, 30);
    } else {
      setMods(false);
      if (!keepFocus) btn.focus({preventScroll: true});
    }
  }
  btn.addEventListener('click', function(){ setOpen(!isOpen()); });
  closeBtn.addEventListener('click', function(){ setOpen(false); });
  scrim.addEventListener('click', function(){ setOpen(false); });
  panel.addEventListener('click', function(e){
    if (e.target.closest('a')) setOpen(false, true);
  });
  document.addEventListener('keydown', function(e){
    if (!isOpen()) return;
    if (e.key === 'Escape'){ setOpen(false); return; }
    if (e.key === 'Tab'){
      var f = panel.querySelectorAll('a[href],button');
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    }
  });
  /* close if the screen is widened back to desktop */
  var onChange = function(){ if (!mq.matches && isOpen()) setOpen(false, true); };
  if (mq.addEventListener) mq.addEventListener('change', onChange); else if (mq.addListener) mq.addListener(onChange);

  /* "Explore the modules" / "All modules" buttons open this panel on phones */
  document.addEventListener('click', function(e){
    var t = e.target.closest && e.target.closest('[data-open-modules]');
    if (!t || !mq.matches) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    setMods(true);
    setOpen(true);
  }, true);
})();
