let cacheName = 'bs-0-1-4';
let cacheFiles = [
	'/',
	'./index.html',
	'./index.js',
	'./style.css',
	'./img/book.png',
	'./img/loading.svg'
];


// 监听activate事件，激活后通过cache的key来判断是否更新cache中的静态资源
console.log(self,222)
self.addEventListener('activate', function (e) {
	console.log('Service Worker 状态： activate 1');
	var cachePromise = caches.keys().then(function (keys) {
			return Promise.all(keys.map(function (key) {
					debugger
					if (key !== cacheName) {
							return caches.delete(key);
					}
			}));
	})
	e.waitUntil(cachePromise);
	return self.clients.claim();
});

// 监听install 事件，安装完成后，进行文件缓存
self.addEventListener('install',function (e) {
	console.log('Service Worker 状态： install');
	let cacheOpenPromise = caches.open(cacheName).then(function (cache) {
		return cache.addAll(cacheFiles);
	})
	e.waitUntil(cacheOpenPromise)
})

var apiCacheName = 'api-0-1-1';
// 监听浏览器发起的请求，进行缓存的读取或想服务器发起请求
self.addEventListener('fetch', function (e) {
	// 需要缓存的xhr请求
	let cacheRequestUrls = [
		'/songs?'
	]
	console.log('现在正在请求：' + e.request.url);
	let needCache = cacheRequestUrls.some(function (url) {
		return e.request.url.indexOf(url) > -1;
	})
	/**** 这里是对XHR数据缓存的相关操作 ****/
	if(needCache) {
		// 需要缓存
		// 使用fetch请求数据，并将请求结果clone一份缓存到cache
		// 此部分缓存后在browser中使用全局变量caches获取
		console.log('needCache')
		caches.open(apiCacheName).then(function (cache) {
			return fetch(e.request).then(function (response) {
				cache.put(e.request.url, response.clone());
        return response;
			})
		})
	}else {
		e.respondWith(
			caches.match(e.request).then(function(cache) {
				return cache || fetch(e.request);
			}).catch(function (err) {
				console.log(err);
				return fetch(e.request);
			})
		)
	}
})

