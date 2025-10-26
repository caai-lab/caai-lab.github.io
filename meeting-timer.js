// Meeting times for November 2, 2025 (all in IST)
const meetings = [
    { time: "Nov 2, 2025 16:40:00 GMT+0530", title: "First Meeting" },
    { time: "Nov 2, 2025 19:30:00 GMT+0530", title: "Second Meeting" },
    { time: "Nov 2, 2025 20:10:00 GMT+0530", title: "Third Meeting" }
];

let currentMeetingIndex = 0;

// Function to format time with leading zeros
function formatTime(time) {
    return time < 10 ? '0' + time : time;
}

// Function to update the meeting display
function updateMeetingDisplay(index) {
    const meetingTime = new Date(meetings[index].time);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const options = { hour: 'numeric', minute: '2-digit', hour12: true };
    const timeString = meetingTime.toLocaleTimeString('en-US', options);
    
    document.getElementById('meeting-time').textContent = 
        `${monthNames[meetingTime.getMonth()]} ${meetingTime.getDate()}, ${timeString} IST`;
    countDownDate = meetingTime.getTime();
}

// Initialize the timer
function initTimer() {
    if (document.getElementById('meeting-timer')) {
        updateMeetingDisplay(0);
        
        // Update the count down every 1 second
        const x = setInterval(function() {
            // Get today's date and time
            const now = new Date().getTime();
            
            // Find the distance between now and the count down date
            const distance = countDownDate - now;
            
            // Time calculations for days, hours, minutes and seconds
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            // Output the result
            document.getElementById("days").textContent = formatTime(days);
            document.getElementById("hours").textContent = formatTime(hours);
            document.getElementById("minutes").textContent = formatTime(minutes);
            document.getElementById("seconds").textContent = formatTime(seconds);
            
            // If the count down is over, move to next meeting
            if (distance < 0) {
                currentMeetingIndex++;
                if (currentMeetingIndex < meetings.length) {
                    updateMeetingDisplay(currentMeetingIndex);
                } else {
                    clearInterval(x);
                    document.getElementById("meeting-timer").innerHTML = "<div class='timer-completed'>All meetings completed</div>";
                }
            }
        }, 1000);
    }
}

// Initialize when the page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTimer);
} else {
    initTimer();
}
