var cacheName = "classes-v1";
var cacheFiles = [
    "index.html",
    // "subjects.js",
    "class_icons/arts.png",
    "class_icons/english.png",
    "class_icons/history.png",
    "class_icons/icon-192.png",
    "class_icons/icon-512.png",
    "class_icons/it.png",
    "class_icons/math.png",
    "class_icons/music.png",
    "class_icons/science.png"
];
self.addEventListener("install", function (e) {
    console.log("[Service Worker] Install");
    e.waitUntil(
        caches.open(cacheName).then(function (cache) {
            console.log("[Service Worker] Caching files");
            return cache.addAll(cacheFiles);
        })
    );
});
self.addEventListener("fetch", function (e) {
    e.respondWith(
        caches.match(e.request).then(function (cachedFile) {
            //return the file if it is not in the cache
            if (cachedFile) {
                console.log(
                    "[Service Worker] Resource fetched from the cache for: " +
                    e.request.url
                );
                return cachedFile;
            } else {
                return fetch(e.request).then(function (response) {
                    return caches.open(cacheName).then(function (cache) {
                        //add the new file to the cache
                        cache.put(e.request, response.clone());
                        console.log(
                            "[Service Worker] Resource fetched and saved in the cache for: " +
                            e.request.url
                        );
                        return response;
                    });
                });
            }
        })
    );
});