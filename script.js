document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('lab-video');
    if (video) {
        // Stop video after 1 minute (60 seconds)
        const stopTime = 60;

        video.addEventListener('timeupdate', () => {
            if (video.currentTime >= stopTime) {
                video.pause();
            }
        });

        // Required for autoplay
        video.muted = true;

        // 🔊 Sound toggle
        const soundBtn = document.getElementById('sound-toggle');

        if (soundBtn) {
            soundBtn.addEventListener('click', () => {
                video.muted = false;
                video.volume = 1.0;
                video.play();

                soundBtn.style.display = 'none'; // Hide after enabling sound
            });
        }
    }

    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');

    if (menuToggle && nav) {
        menuToggle.addEventListener('click', () => {
            nav.classList.toggle('active');

            menuToggle.innerHTML = nav.classList.contains('active')
                ? '&times;'
                : '&#9776;';
        });
    }

    // AI News Feed Implementation
    const autoNewsContainer = document.getElementById('auto-news');
    if (autoNewsContainer) {
        loadAINews();
    }

    // --- Conference Popup Logic ---
    const popup = document.getElementById('conference-popup');
    if (popup) {
        const closeBtn = popup.querySelector('.popup-close');

        // Show popup after 3 seconds
        setTimeout(() => {
            popup.classList.add('show');
        }, 3000);

        // Close on 'X' click
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                popup.classList.remove('show');
            });
        }

        // Close on clicking outside the content
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                popup.classList.remove('show');
            }
        });
    }
});

async function loadAINews() {
    const container = document.getElementById('auto-news');
    if (!container) return;

    const feeds = [
        "https://blog.google/technology/ai/rss/",
        "https://www.deepmind.com/blog/rss.xml",
        "https://openai.com/blog/rss"
    ];

    const proxy = "https://api.allorigins.win/raw?url=";
    let allItems = [];

    // Helper to strip HTML and truncate
    const cleanText = (html, length = 150) => {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        const text = temp.textContent || temp.innerText || "";
        return text.length > length ? text.substring(0, length) + "..." : text;
    };

    // Helper to extract image from various RSS formats
    const findImage = (item) => {
        // 1. media:content (DeepMind/Google)
        const mediaContent = item.getElementsByTagName("media:content")[0];
        if (mediaContent && mediaContent.getAttribute("url")) return mediaContent.getAttribute("url");

        // 2. enclosure
        const enclosure = item.getElementsByTagName("enclosure")[0];
        if (enclosure && enclosure.getAttribute("url")) return enclosure.getAttribute("url");

        // 3. Search in description or content:encoded for <img> tag
        const content = item.querySelector("description")?.textContent || "";
        const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
        if (imgMatch) return imgMatch[1];

        return "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800"; // Fallback AI image
    };

    for (let feed of feeds) {
        try {
            const res = await fetch(proxy + encodeURIComponent(feed));
            if (!res.ok) continue;

            const text = await res.text();
            const xml = new window.DOMParser().parseFromString(text, "text/xml");
            const items = xml.querySelectorAll("item");

            items.forEach((item, index) => {
                if (index > 5) return; // limit per feed

                const title = item.querySelector("title")?.textContent;
                const link = item.querySelector("link")?.textContent;
                const dateText = item.querySelector("pubDate")?.textContent;
                const date = dateText ? new Date(dateText) : new Date();
                const description = cleanText(item.querySelector("description")?.textContent || "");
                const image = findImage(item);

                allItems.push({ title, link, date, description, image });
            });
        } catch (e) {
            console.error("Feed error:", e);
        }
    }

    // Sort by date descending
    allItems.sort((a, b) => b.date - a.date);

    if (allItems.length > 0) {
        container.innerHTML = "";
        container.classList.add('news-grid'); // Modern grid class

        allItems.forEach(item => {
            const card = document.createElement("div");
            card.className = "news-card auto-fade-in";
            card.innerHTML = `
                <div class="news-card-image">
                    <img src="${item.image}" alt="${item.title}" loading="lazy">
                </div>
                <div class="news-card-content">
                    <div class="news-date">${item.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                    <h4 class="news-card-title">${item.title}</h4>
                    <p class="news-card-description">${item.description}</p>
                    <a href="${item.link}" target="_blank" class="news-read-more">
                        Read Story <span class="external-icon">↗</span>
                    </a>
                </div>
            `;
            container.appendChild(card);
        });
    } else {
        container.innerHTML = "<p class='error-message'>Unable to load news right now. Please check back later.</p>";
    }
}
