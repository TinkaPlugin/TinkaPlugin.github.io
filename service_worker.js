const cacheName = "tinka_pwa_v1";
var cachedResources = [
	"/wiki.html",
	"/icon_192.png",
	"/icon_512.png",
	"/manifest.webmanifest"
];


/*
 * This is the backend service-worker for the simple
 * TiddlyWiki5 pwa app. Since TW5 uses localstorage
 * directly, we are letting TW5 save tiddlers itself, 
 * instead of emulating a tiddlyweb server backend via the
 * fetch api. This might change in the future.
 */
self.addEventListener("install", function(e) {
		console.log("[TinkaPWA] Service worker installed.");
		e.waitUntil(caches.open(cacheName).then(function(cache) {
			console.log("[TinkaPWA] Caching all static resources.");
			return cache.addAll(cachedResources);
		}));
});

self.addEventListener("fetch", function(e) {
	// If resource is in cache, return from cache, else fire network request
	let request = e.request;
	if (request.method === "GET") {
		e.respondWith(
			caches.open(cacheName).then(function(cache) {
				return cache.match(request).then(function(match) {
					if (match !== undefined) {
						console.log("Serving from cache");
						return match;
					}
					else {
						return fetch(request).then(function(response) {
							cache.put(request, response.clone());
							console.log("Registered in cache");
							return response;
						});
					}
				});
			})
		);
	}
});

self.addEventListener("activate", function(e) {
	// Clean all cache entries
	e.waitUntil(
		caches.open(cacheName).then(function(cache) {
			return cache.keys().then(function(keyList) {
				return Promise.all(keyList.map((key) => {return cache.delete(key)}));
			});
		})
	);
});
