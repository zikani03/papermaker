self.addEventListener('install', function(event) {
    let cacheKey = "papermaker.labs.zikani.me:Cache"

    event.waitUntil(caches.open(cacheKey).then((cache) => {
        return cache.addAll([
            '/js/wasm_exec.js',
            '/main.wasm',
        ])
    }))
});