// 【戦績摂理◆解析システム】のオフライン用（ホーム画面に追加したアプリで使う）
// 方針：ページ本体はネットにつながっていれば毎回新しい版を取りに行き、つながらない時だけ保存しておいた版を出す。
// Firebase・Googleのフォント・公式サイトの画像など、別のサイトのものには手を出さない。
const CACHE = 'senseki-v2';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png', './favicon-32.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== location.origin) return;
  const isPage = r.mode === 'navigate' || u.pathname.endsWith('/') || u.pathname.endsWith('/index.html');
  if (isPage) {
    e.respondWith(fetch(r, { cache: 'no-cache' }).then(res => {
      if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put('./index.html', cp)); }
      return res;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(r).then(m => m || fetch(r)));
});
