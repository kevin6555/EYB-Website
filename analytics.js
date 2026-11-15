/* Visitor analytics (Cloudflare Web Analytics): free, cookie-free, no consent banner needed.
   To turn it on: create a site in Cloudflare > Analytics & Logs > Web Analytics for eybsystems.com,
   copy the token from the snippet it gives you, and paste it between the quotes below.
   Every page loads this file, so this is the only place to change. */
(function () {
  var TOKEN = 'af43e2413573461fa74c5623a208da78';
  if (!TOKEN || location.protocol === 'file:') return;
  var s = document.createElement('script');
  s.defer = true;
  s.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  s.setAttribute('data-cf-beacon', JSON.stringify({ token: TOKEN }));
  document.head.appendChild(s);
})();
