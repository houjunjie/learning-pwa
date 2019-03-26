(function() {

    // 注册 service worker  service worker脚本文件为sw.js
    if('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js').then(function () {
            console.log('service worker 注册成功')
        })
    }
    /**
     * 生成书籍列表卡片（dom元素）
     * @param {Object} book 书籍相关数据
     */
    function createCard(song) {
        var li = document.createElement('li');
        var img = document.createElement('img');
        var title = document.createElement('div');
        var author = document.createElement('div');
        // var desc = document.createElement('div');
        // var publisher = document.createElement('span');
        // var price = document.createElement('span');
        const al = song.al;
        const ar = song.ar;
        // debugger
        title.className = 'title';
        author.className = 'author';
        img.className = 'img';
        img.src = al.picUrl;
        title.innerText = song.name;
        let authorText = ''
        ar.map((n) => {authorText += n.name});
        authorText += ` - ${al.name}`
        author.innerText = authorText
        // publisher.innerText = song.publisher;
        // price.innerText = song.price;

        // song.publisher && desc.appendChild(publisher);
        // song.price && desc.appendChild(price);
        li.appendChild(img);
        li.appendChild(title);
        li.appendChild(author);
        // li.appendChild(desc);

        return li;
    }

    /**
     * 根据获取的数据列表，生成书籍展示列表
     * @param {Array} list 书籍列表数据
     */
    function fillList(list) {
        list.forEach(function (song) {
            var node = createCard(song);
            document.querySelector('#js-list').innerHTML(node);
        });
    }

    /**
     * 控制tip展示与显示的内容
     * @param {string | undefined} text tip的提示内容
     */
    function tip(text) {
        if (text === undefined) {
            document.querySelector('#js-tip').style = 'display: none';
        }
        else {
            document.querySelector('#js-tip').innerHTML = text;
            document.querySelector('#js-tip').style = 'display: block';
        }
    }

    /**
     * 控制loading动画的展示
     * @param {boolean | undefined} isloading 是否展示loading
     */
    function loading(isloading) {
        if (isloading) {
            tip();
            document.querySelector('#js-loading').style = 'display: block';
        }
        else {
            document.querySelector('#js-loading').style = 'display: none';
        }
    }
    function getApiDataFromCache(url) {
    if ('caches' in window) {
        return caches.match(url).then(function (cache) {
            if (!cache) {
                return;
            }
            return cache.json();
        });
    }
    else {
        return Promise.resolve();
    }
}
    /**
     * 获取该请求的缓存数据
     * @param {string} url 请求的url
     * @return {Promise}
     */
    function getApiDataFromCache(url) {
        console.log(222)
        if ('caches' in window) {
            console.log(111)
            return caches.match(url).then(function (cache) {
                if (!cache) {
                    return;
                }
                console.log(111,cache)
                return cache.json();
            });
        }
        else {
            return Promise.resolve();
        }
    }

    function getApiDataRemote(url) {
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.timeout = 60000;
            xhr.onreadystatechange = function () {
                var response = {};
                if (xhr.readyState === 4 && xhr.status === 200) {
                    try {
                        response = JSON.parse(xhr.responseText);
                    }
                    catch (e) {
                        response = xhr.responseText;
                    }
                    resolve(response);
                }
                else if (xhr.readyState === 4) {
                    resolve();
                }
            };
            xhr.onabort = reject;
            xhr.onerror = reject;
            xhr.ontimeout = reject;
            xhr.open('GET', url, true);
            xhr.send(null);
        });
    }
    /**
     * 根据用户输入结果
     * 使用XMLHttpRequest查询并展示数据列表
     */
    function queryBook() {
        var input = document.querySelector('#js-search-input');
        var query = input.value;
        var xhr = new XMLHttpRequest();
        var url = '/songs?s=' + query ;
        if (query === '') {
            tip('请输入关键词');
            return;
        }
        document.querySelector('#js-list').innerHTML = '';
        document.querySelector('#js-thanks').style = 'display: none';
        loading(true);
        var remotePromise = getApiDataRemote(url);
        getApiDataFromCache(url).then(function (data) {
            if (data) {
                loading(false);
                input.blur();         
                console.log(data)
                fillList(data.result.songs);
                document.querySelector('#js-thanks').style = 'display: block';
            }
            cacheData = data || {};
            return remotePromise;
        }).then(function (data) {
            if (JSON.stringify(data) != JSON.stringify(cacheData)) {
                loading(false);                
                input.blur();
                fillList(data.result.songs);
                document.querySelector('#js-thanks').style = 'display: block';
            }
        });
        
    }

    /**
     * 监听“搜索”按钮点击事件
     */
    document.querySelector('#js-search-btn').addEventListener('click', function () {
        queryBook();
    });

    /**
     * 监听“回车”事件
     */
    window.addEventListener('keypress', function (e) {
        if (e.keyCode === 13) {
            queryBook();
        }
    });
    
})();