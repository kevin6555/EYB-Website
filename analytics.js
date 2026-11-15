/* Visitor analytics, loaded by every page. Two tools:

   1. Cloudflare Web Analytics: cookie-free, always on.
   2. Google Analytics 4: uses cookies, so it only loads after the visitor
      clicks "Accept" on the cookie notice. To turn it on, paste the
      Measurement ID (looks like G-XXXXXXXXXX) into GA_ID below.

   Events sent to Google Analytics (only after consent):
   - whatsapp_click        any WhatsApp link; link_location = the section it was in
   - email_click           any email link
   - questionnaire_submit  the "Answer a few questions" form was sent */
(function () {
  var CF_TOKEN = 'af43e2413573461fa74c5623a208da78';
  var GA_ID = 'G-C4MBEHGV9Q';
  var KEY = 'eyb-analytics-consent';

  if (location.protocol === 'file:') return;

  function addScript(src, attrs) {
    var s = document.createElement('script');
    s.src = src;
    for (var k in attrs) s.setAttribute(k, attrs[k]);
    document.head.appendChild(s);
    return s;
  }
  function getChoice() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function setChoice(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  /* Lets the privacy page offer "Change your cookie choice". */
  window.eybAnalyticsChoice = function () {
    try { localStorage.removeItem(KEY); } catch (e) {}
    location.reload();
  };

  // ---- 1. Cloudflare ----
  if (CF_TOKEN) addScript('https://static.cloudflareinsights.com/beacon.min.js', { defer: '', 'data-cf-beacon': JSON.stringify({ token: CF_TOKEN }) });

  // ---- 2. Google Analytics ----
  if (!GA_ID) return;
  var loaded = false;
  function loadGA() {
    if (loaded) return;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
    addScript('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID), { async: '' });
  }
  function track(name, params) { if (loaded) window.gtag('event', name, params || {}); }

  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    var box = a.closest('section[id], header, footer, aside, .menu');
    var where = box ? (box.id || box.className.split(' ')[0] || box.tagName.toLowerCase()) : 'page';
    if (href.indexOf('wa.me/') !== -1) track('whatsapp_click', { link_location: where });
    else if (href.indexOf('mailto:') === 0) track('email_click', { link_location: where });
  }, true);
  document.addEventListener('submit', function (e) {
    if (e.target && e.target.id === 'qform') track('questionnaire_submit');
  }, true);

  var TEXT = {
    en: { label: 'Cookie choice', text: 'We use Google Analytics cookies to see which pages are useful to visitors. Nothing is sent to Google unless you accept.', more: 'Privacy policy', accept: 'Accept', decline: 'Decline' },
    ar: { label: 'اختيار ملفات تعريف الارتباط', text: 'نستخدم ملفات تعريف الارتباط من Google Analytics لنعرف أي الصفحات تفيد الزوار. لا يُرسَل شيء إلى Google إلا بعد موافقتك.', more: 'سياسة الخصوصية', accept: 'موافق', decline: 'رفض' },
    fr: { label: 'Choix des cookies', text: 'Nous utilisons les cookies de Google Analytics pour savoir quelles pages sont utiles à nos visiteurs. Rien n’est envoyé à Google sans votre accord.', more: 'Politique de confidentialité', accept: 'Accepter', decline: 'Refuser' }
  };
  function banner() {
    var t = TEXT[(document.documentElement.lang || 'en').slice(0, 2)] || TEXT.en;
    var css = document.createElement('style');
    css.textContent =
      '.eyb-cc{position:fixed;z-index:9999;bottom:16px;inset-inline-start:16px;width:min(520px,calc(100vw - 32px));' +
      'background:#0F1E3D;color:#F5F8FC;border:1px solid rgba(245,248,252,.16);border-radius:16px;padding:18px;' +
      'box-shadow:0 24px 48px -16px rgba(0,0,0,.55);font-size:14.5px;line-height:1.55;animation:eybcc .3s ease-out both}' +
      '@keyframes eybcc{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}' +
      '@media (prefers-reduced-motion:reduce){.eyb-cc{animation:none}}' +
      '.eyb-cc p{margin:0;color:#CBD5E1}.eyb-cc a{color:#22D3EE;font-weight:600}' +
      '.eyb-cc-btns{display:flex;gap:10px;margin-top:14px}' +
      '.eyb-cc button{all:unset;box-sizing:border-box;flex:1;cursor:pointer;text-align:center;min-height:44px;padding:0 16px;border-radius:12px;font-weight:700;font-size:15px;border:1.5px solid rgba(245,248,252,.45);color:#F5F8FC}' +
      '.eyb-cc button:hover{background:rgba(245,248,252,.08)}' +
      '.eyb-cc button.eyb-cc-yes{background:#22D3EE;border-color:#22D3EE;color:#0F1E3D}' +
      '.eyb-cc button.eyb-cc-yes:hover{background:#67E8F9}' +
      '.eyb-cc button:focus-visible{outline:3px solid #22D3EE;outline-offset:2px}';
    document.head.appendChild(css);
    var box = document.createElement('div');
    box.className = 'eyb-cc';
    box.setAttribute('role', 'region');
    box.setAttribute('aria-label', t.label);
    box.innerHTML = '<p>' + t.text + ' <a href="/privacy.html#cookies">' + t.more + '</a></p>' +
      '<div class="eyb-cc-btns"><button type="button" data-v="no">' + t.decline + '</button>' +
      '<button type="button" class="eyb-cc-yes" data-v="yes">' + t.accept + '</button></div>';
    box.addEventListener('click', function (e) {
      var v = e.target.getAttribute && e.target.getAttribute('data-v');
      if (!v) return;
      setChoice(v);
      box.remove();
      if (v === 'yes') loadGA();
    });
    document.body.appendChild(box);
  }

  var choice = getChoice();
  if (choice === 'yes') loadGA();
  else if (choice !== 'no') {
    if (document.body) banner();
    else document.addEventListener('DOMContentLoaded', banner);
  }
})();
