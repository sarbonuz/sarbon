/* Sarbon service worker: eski keshlash kodi sw-base.js ga ko'chiriladi, bu fayl esa push qo'shadi */
try { importScripts("sw-base.js"); } catch (e) { /* sw-base.js yo'q bo'lsa ham push ishlaydi */ }

self.addEventListener("install", function () { self.skipWaiting(); });
self.addEventListener("activate", function (e) { e.waitUntil(self.clients.claim()); });

self.addEventListener("push", function (e) {
  var d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) { d = {}; }
  var oid = d.oid || "gen", kind = d.t || "chat";
  e.waitUntil(Promise.all([
    self.registration.showNotification(d.title || "Sarbon", {
      body: d.text || d.body || "Yangi xabar",
      tag: "sb-" + kind + "-" + oid,
      renotify: true,
      icon: "logo-180.png",
      badge: "logo-180.png",
      data: { oid: oid, t: kind }
    }),
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (cs) {
      cs.forEach(function (c) { c.postMessage({ sb: "push", d: d }); });
    })
  ]));
});

self.addEventListener("notificationclick", function (e) {
  e.notification.close();
  var dt = e.notification.data || {}, oid = dt.oid || "gen";
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (cs) {
    for (var i = 0; i < cs.length; i++) {
      if ("focus" in cs[i]) { cs[i].postMessage({ sb: "open", oid: oid, t: dt.t }); return cs[i].focus(); }
    }
    return self.clients.openWindow("./?chat=" + encodeURIComponent(oid));
  }));
});
