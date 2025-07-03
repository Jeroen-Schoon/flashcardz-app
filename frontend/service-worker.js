const urlsToCache = [
    '/',
    '/index.html',
    '/app.css',
    '/App.svelte',
    '/components/Categories.svelte',
    '/components/Category.svelte',
    '/components/Flashcard.svelte',
    '/components/Flashcards.svelte',
    '/components/Titlebar.svelte',
    '/components/Modal.svelte',
    '/assets/svg/flashcardz-favicon-color.svg',
    "/assets/icons/icon-144x144.png",
    "/assets/png/logo-no-background.png",
    '/main.js',
    '/manifest.json',
]

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open("cache_1")
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('activate', event => {
    console.log('Service Worker activating...');
});

self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return caches.open("cache_1").then(cache => {
                    cache.put(event.request, response.clone()); // Cache the new response
                    return response;
                });
            })
            .catch(() => {
                return caches.match(event.request).then(cachedResponse => {
                    if (cachedResponse) return cachedResponse;
                    return caches.match('/index.html'); // fallback if no match
                });
            })
    );
});

// Push Notifications
self.addEventListener('push', function(event) {
    const data = event.data ? event.data.json() : { title: 'New notification', body: 'This is a notification' };

    const title = data.title || 'Push Notification';
    const options = {
        body: data.body,
        icon: 'assets/svg/flashcardz-favicon-color.svg',
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});
