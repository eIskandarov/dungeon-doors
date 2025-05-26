const cacheName = "worker-cache-v1.5";
const assets = [
  "./",
  "./assets/",
  "./index.html",
  "./style.css",
  "./script.js",
  "./images/favicon/android-chrome-192x192.png",
  "./script.js",
  "./assets/Game-background.png",
  "./assets/images/door--big-reward.png",
  "./assets/images/door--small-reward.png",
  "./assets/images/door-lock.png",
  "./assets/images/ghost.png",
  "./assets/images/mummy.png",
  "./assets/images/skeleton.png",
  "./assets/images/vampire.png",
  "./assets/images/zombie.png",
  "./assets/sounds/big-reward-1.mp3",
  "./assets/sounds/big-reward-2.mp3",
  "./assets/sounds/big-reward-3.mp3",
  "./assets/sounds/door-open-1.mp3",
  "./assets/sounds/door-open-2.mp3",
  "./assets/sounds/door-open-3.mp3",
  "./assets/sounds/door-open-4.mp3",
  "./assets/sounds/game-start-1.mp3",
  "./assets/sounds/game-start-2.mp3",
  "./assets/sounds/game-start-3.mp3",
  "./assets/sounds/game-start-4.mp3",
  "./assets/sounds/game-start-5.mp3",
  "./assets/sounds/game-start-6.mp3",
  "./assets/sounds/game-start-7.mp3",
  "./assets/sounds/ghost-1.mp3",
  "./assets/sounds/ghost-2.mp3",
  "./assets/sounds/ghost-3.mp3",
  "./assets/sounds/mummy-1.mp3",
  "./assets/sounds/mummy-2.mp3",
  "./assets/sounds/mummy-3.mp3",
  "./assets/sounds/skeleton-1.mp3",
  "./assets/sounds/skeleton-2.mp3",
  "./assets/sounds/skeleton-3.mp3",
  "./assets/sounds/small-reward-1.mp3",
  "./assets/sounds/small-reward-2.mp3",
  "./assets/sounds/small-reward-3.mp3",
  "./assets/sounds/vampire-1.mp3",
  "./assets/sounds/vampire-2.mp3",
  "./assets/sounds/vampire-3.mp3",
  "./assets/sounds/win-1.mp3",
  "./assets/sounds/win-2.mp3",
  "./assets/sounds/win-3.mp3",
  "./assets/sounds/win-4.mp3",
  "./assets/sounds/win-5.mp3",
  "./assets/sounds/win-6.mp3",
  "./assets/sounds/win-7.mp3",
  "./assets/sounds/zombie-1.mp3",
  "./assets/sounds/zombie-2.mp3",
  "./assets/sounds/zombie-3.mp3",
  "./assets/sounds/zombie-4.mp3",
];

// console.log('Service Worker scope:', self.location);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      return cache.addAll(assets);
    }),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      caches
        .match("./index.html")
        .then((cached) => cached || fetch(event.request)),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }),
  );
});
