/* CAAI — landing page interactions */

/* Runs immediately, before anything else in this file. The reveal-on-scroll
   styles hide [data-reveal] behind `html.js`, so if this script ever fails to
   load the page still renders every section instead of a blank column. */
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {

    /* ---------- Header: solid once we leave the hero ---------- */
    const header = document.getElementById('site-header');
    const hero = document.querySelector('.hero');

    if (header && hero) {
        const onScroll = () => {
            const threshold = hero.offsetHeight - header.offsetHeight;
            header.classList.toggle('is-solid', window.scrollY > threshold);
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
    }

    /* ---------- Mobile navigation ---------- */
    const navToggle = document.getElementById('nav-toggle');
    const nav = document.getElementById('nav');

    if (navToggle && nav) {
        navToggle.addEventListener('click', () => {
            const open = nav.classList.toggle('is-open');
            document.body.classList.toggle('nav-open', open);
            navToggle.setAttribute('aria-expanded', String(open));
        });

        nav.addEventListener('click', (e) => {
            if (e.target.closest('a')) {
                nav.classList.remove('is-open');
                document.body.classList.remove('nav-open');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    /* ---------- Hero video: sound toggle ---------- */
    const video = document.getElementById('lab-video');
    const soundBtn = document.getElementById('sound-toggle');

    if (video) {
        video.muted = true;
        const play = video.play();
        if (play && typeof play.catch === 'function') play.catch(() => { });
    }

    if (video && soundBtn) {
        soundBtn.addEventListener('click', () => {
            video.muted = !video.muted;
            video.volume = 1.0;
            video.play();
            soundBtn.textContent = video.muted ? 'Enable sound' : 'Mute';
        });
    }

    /* ---------- Reveal on scroll ---------- */
    const revealables = document.querySelectorAll('[data-reveal]');

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-in');
                    observer.unobserve(entry.target);
                }
            });
            // threshold MUST stay 0. A percentage threshold asks for a share of the
            // element's own area to be on screen, and these grids (19 member cards,
            // 23 alumni) are many times taller than a phone viewport — 12% of them
            // can never be visible at once, so they would never reveal on mobile.
        }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });

        revealables.forEach((el) => observer.observe(el));
    } else {
        revealables.forEach((el) => el.classList.add('is-in'));
    }

    /* ---------- Conference notice ---------- */
    const notice = document.getElementById('conference-notice');
    const noticeClose = document.getElementById('notice-close');

    if (notice && sessionStorage.getItem('caai-notice-dismissed') !== '1') {
        setTimeout(() => notice.classList.add('is-open'), 4000);
    }

    if (noticeClose && notice) {
        noticeClose.addEventListener('click', () => {
            notice.classList.remove('is-open');
            sessionStorage.setItem('caai-notice-dismissed', '1');
        });
    }
});
