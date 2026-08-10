/* CAAI — live AI intelligence feed
   Loaded only on news.html. Three things keep it fast:
     1. it does not fetch until the section is near the viewport
     2. all feeds are requested in parallel, not one after another
     3. results are cached in sessionStorage, so a second visit is instant
   No images are fetched — the list is text, which is what makes it quick. */

(function () {
    'use strict';

    var FEEDS = [
        { name: 'OpenAI', url: 'https://openai.com/news/rss.xml' },
        { name: 'Google DeepMind', url: 'https://deepmind.google/blog/rss.xml' },
        { name: 'Google AI', url: 'https://blog.google/technology/ai/rss/' },
        { name: 'Berkeley AI Research', url: 'https://bair.berkeley.edu/blog/feed.xml' }
    ];

    var PER_FEED = 4;
    var TOTAL = 12;
    var CACHE_KEY = 'caai-ai-feed-v1';
    var CACHE_TTL = 30 * 60 * 1000;   // 30 minutes
    var TIMEOUT = 9000;

    var list = document.getElementById('ai-feed');
    var status = document.getElementById('feed-status');
    if (!list) return;

    /* ---------- helpers ---------- */

    function strip(htmlText, max) {
        var d = document.createElement('div');
        d.innerHTML = htmlText || '';
        var t = (d.textContent || '').replace(/\s+/g, ' ').trim();
        return t.length > max ? t.slice(0, max).replace(/[\s,;:.]+\S*$/, '') + '…' : t;
    }

    function shortDate(value) {
        var d = new Date(value);
        if (isNaN(d)) return '';
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    }

    function fetchFeed(feed) {
        // `count` is a paid parameter on rss2json — we trim client-side instead.
        var endpoint = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(feed.url);

        var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
        var timer = controller && setTimeout(function () { controller.abort(); }, TIMEOUT);

        return fetch(endpoint, controller ? { signal: controller.signal } : undefined)
            .then(function (res) {
                if (timer) clearTimeout(timer);
                if (!res.ok) throw new Error(res.status);
                return res.json();
            })
            .then(function (data) {
                if (!data || data.status !== 'ok' || !data.items) return [];
                return data.items.slice(0, PER_FEED).map(function (item) {
                    return {
                        source: feed.name,
                        title: item.title || 'Untitled',
                        link: item.link || feed.url,
                        date: item.pubDate || '',
                        stamp: new Date(item.pubDate || 0).getTime() || 0,
                        excerpt: strip(item.description || item.content, 150)
                    };
                });
            });
    }

    /* ---------- rendering ---------- */

    function render(items) {
        if (!items.length) {
            list.innerHTML = '<p class="feed-error">The feed could not be reached just now. ' +
                'Try again shortly, or read the sources directly at ' +
                '<a class="link-quiet" href="https://openai.com/news/" target="_blank" rel="noopener">OpenAI</a> ' +
                'and <a class="link-quiet" href="https://deepmind.google/discover/blog/" target="_blank" rel="noopener">Google DeepMind</a>.</p>';
            if (status) status.textContent = 'Unavailable';
            return;
        }

        var frag = document.createDocumentFragment();

        items.forEach(function (item) {
            var a = document.createElement('a');
            a.className = 'feed-item';
            a.href = item.link;
            a.target = '_blank';
            a.rel = 'noopener';

            var src = document.createElement('div');
            src.className = 'feed-item__source';
            src.textContent = item.source;

            var mid = document.createElement('div');
            var title = document.createElement('div');
            title.className = 'feed-item__title';
            title.textContent = item.title;
            mid.appendChild(title);

            if (item.excerpt) {
                var ex = document.createElement('p');
                ex.className = 'feed-item__excerpt';
                ex.textContent = item.excerpt;
                mid.appendChild(ex);
            }

            var when = document.createElement('div');
            when.className = 'feed-item__date';
            when.textContent = shortDate(item.date);

            a.appendChild(src);
            a.appendChild(mid);
            a.appendChild(when);
            frag.appendChild(a);
        });

        list.innerHTML = '';
        list.appendChild(frag);

        if (status) {
            status.textContent = 'Live · updated ' +
                new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
            status.classList.add('is-live');
        }
    }

    /* ---------- cache ---------- */

    function readCache() {
        try {
            var raw = sessionStorage.getItem(CACHE_KEY);
            if (!raw) return null;
            var payload = JSON.parse(raw);
            if (!payload || Date.now() - payload.at > CACHE_TTL) return null;
            return payload.items;
        } catch (e) { return null; }
    }

    function writeCache(items) {
        try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), items: items }));
        } catch (e) { /* storage full or blocked — not worth failing over */ }
    }

    /* ---------- load ---------- */

    var started = false;

    function load() {
        if (started) return;
        started = true;

        var cached = readCache();
        if (cached) { render(cached); return; }

        if (status) status.textContent = 'Fetching';

        Promise.all(FEEDS.map(function (f) {
            return fetchFeed(f).catch(function () { return []; });
        })).then(function (groups) {
            var all = [];
            groups.forEach(function (g) { all = all.concat(g); });
            all.sort(function (a, b) { return b.stamp - a.stamp; });
            all = all.slice(0, TOTAL);
            if (all.length) writeCache(all);
            render(all);
        });
    }

    // Only reach for the network once the section is worth showing.
    if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) { io.disconnect(); load(); }
            });
        }, { rootMargin: '400px 0px' });
        io.observe(list);
    } else {
        load();
    }
})();
