function getNextMonthFirstDate() {
    const now = new Date();
    const currentMonth = now.getMonth(); // Current month (0-11)
    const currentYear = now.getFullYear();
    let nextMonth = currentMonth + 1;

    if (nextMonth > 11) { // If it's December, move to January of next year
        nextMonth = 0;
    }

    // Set the next month's first day at 00:00:00
    return new Date(currentYear, nextMonth, 1, 0, 0, 0, 0);
}

// Update the countdown every second
function updateCountdown() {
    const now = new Date();
    const nextMonthFirst = getNextMonthFirstDate();
    const timeRemaining = nextMonthFirst - now;

    if (timeRemaining <= 0) {
        document.getElementById('days').innerText = '00';
        document.getElementById('hours').innerText = '00';
        document.getElementById('minutes').innerText = '00';
        document.getElementById('seconds').innerText = '00';
        return;
    }

    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

    document.getElementById('days').innerText = days < 10 ? '0' + days : days;
    document.getElementById('hours').innerText = hours < 10 ? '0' + hours : hours;
    document.getElementById('minutes').innerText = minutes < 10 ? '0' + minutes : minutes;
    document.getElementById('seconds').innerText = seconds < 10 ? '0' + seconds : seconds;
}

// Update countdown every second
setInterval(updateCountdown, 1000);

// Run the countdown initially
updateCountdown();