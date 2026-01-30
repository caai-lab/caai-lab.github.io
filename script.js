document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('lab-video');
    if (!video) return;

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
});
