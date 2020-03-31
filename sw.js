
var cacheName = 'js13kPWA-v1';
var appShellFiles = [
  '/',
  '/index.html',
  '/audiotracks.html',
  '/contents.html',
  '/living-the-vision.html',
  '/videolist.html',
  '/./amplitudejs-5.0.3/playlist/blue-playlist/index.html',
 
 
  // END of html files

  // web fonts
  './fonts/googleFonts/moserat/Montserrat-Light.ttf',
  './fonts/googleFonts/Roboto/Roboto-Bold.ttf',
  // fonts end

  //css files
  '/styles/music-list.css',
  '/styles/style.css',
  './styles/tutorial.css',
  '/styles/videojscite.css',
  '/styles/videoJS.css',
  '/styles/music-details.css',
  '/styles/book-list.css',
  '/styles/readbook.css',
  '/styles/framework.css',
  // Scripts
  '/scripts/custom.js',
  '/scripts/jquery.js',
  '/scripts/plugins.js',
  '/scripts/charts.js',
  '/scripts/downloadVideoJS.js',
  '/scripts/videoJS.js',

  // IMAGES
  './images/tracklist.jpeg',
  './images/song.jpg',
];


self.addEventListener('install', function(e) {
  console.log('[Service Worker] Install');
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[Service Worker] Caching all: app shell and content');
      return cache.addAll(appShellFiles);
    })
  );
});


self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(r) {
      console.log('[Service Worker] Fetching resource: '+e.request.url);
      return r || fetch(e.request).then(function(response) {
        return caches.open(cacheName).then(function(cache) {
          console.log('[Service Worker] Caching new resource: '+e.request.url);
          cache.put(e.request, response.clone());
          return response;
        });
      });
    })
  );
});

self.addEventListener('install', (e) => {
  console.log('[Service Worker] Install');
  e.waitUntil(
    caches.open(cacheName).then((cache) => {
          console.log('[Service Worker] Caching all: app shell and content');
      return cache.addAll(appShellFiles);
    })
  );
});


self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((r) => {
          console.log('[Service Worker] Fetching resource: '+e.request.url);
      return r || fetch(e.request).then((response) => {
                return caches.open(cacheName).then((cache) => {
          console.log('[Service Worker] Caching new resource: '+e.request.url);
          cache.put(e.request, response.clone());
          return response;
        });
      });
    })
  );
});

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('js13kPWA-v2').then((cache) => {
      return cache.addAll(appShellFiles);
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
          return Promise.all(keyList.map((key) => {
        if(key !== cacheName) {
          return caches.delete(key);
        }
      }));
    })
  );
});



self.addEventListener('fetch', evt => {
  evt.respondWith(
    caches.match(evt.request).then(cacheRes => {
      return cacheRes || fetch(evt.request);
    })
  );
});



