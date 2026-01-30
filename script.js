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

    // Ensure it's muted to allow autoplay
    video.muted = true;

    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');

    if (menuToggle && nav) {
        menuToggle.addEventListener('click', () => {
            nav.classList.toggle('active');

            // Toggle icon icon? (Optional)
            if (nav.classList.contains('active')) {
                menuToggle.innerHTML = '&times;'; // Close icon
            } else {
                menuToggle.innerHTML = '&#9776;'; // Hamburger icon
            }
        });
    }
});
