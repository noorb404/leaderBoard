// Function to get the next month's first date (for countdown)
function getNextMonthFirstDate() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    let nextMonth = currentMonth + 1;
    if (nextMonth > 11) {
        nextMonth = 0;
    }
    return new Date(currentYear + (nextMonth === 0 ? 1 : 0), nextMonth, 1, 0, 0, 0, 0);
}

// Update the countdown every second
function updateCountdown() {
    const now = new Date();
    const nextMonthFirst = getNextMonthFirstDate();
    const timeRemaining = nextMonthFirst - now;
    if (timeRemaining <= 0) {
        ['days', 'hours', 'minutes', 'seconds'].forEach(id => document.getElementById(id).innerText = '00');
        return;
    }
    document.getElementById('days').innerText = String(Math.floor(timeRemaining / (1000 * 60 * 60 * 24))).padStart(2, '0');
    document.getElementById('hours').innerText = String(Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
    document.getElementById('minutes').innerText = String(Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
    document.getElementById('seconds').innerText = String(Math.floor((timeRemaining % (1000 * 60)) / 1000)).padStart(2, '0');
}
setInterval(updateCountdown, 1000);
updateCountdown();

function maskUsername(username) {
    return username.length <= 6 ? username[0] + '**' + username.slice(-1) : username.slice(0, 3) + '**' + username.slice(-3);
}

function getOrdinalSuffix(number) {
    const j = number % 10, k = number % 100;
    if (j === 1 && k !== 11) return number + 'st';
    if (j === 2 && k !== 12) return number + 'nd';
    if (j === 3 && k !== 13) return number + 'rd';
    return number + 'th';
}

function getPrize(rank) {
    return [200, 100, 50, 25, 25][rank] || 0;
}

async function fetchLeaderboardData() {
    try {
        const response = await fetch('https://leaderboard-proxy.onrender.com/leaderboard');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        if (data.success && Array.isArray(data.players)) {
            let players = data.players.filter(p => p.name.toLowerCase() !== 'goattedmode');
            players.sort((a, b) => (b.wagered?.this_week || 0) - (a.wagered?.this_week || 0));
            renderLeaderboard(players.slice(0, 5));
        }
    } catch (error) {
        console.error('Error fetching leaderboard data:', error);
    }
}

document.addEventListener("DOMContentLoaded", fetchLeaderboardData);

function renderLeaderboard(players) {
    const mobileContainer = document.getElementById('top-three-mobile');
    const desktopContainer = document.getElementById('top-three-desktop');
    const leaderboardContainer = document.getElementById('leaderboard-container');
    if (!mobileContainer || !desktopContainer || !leaderboardContainer) return;
    
    [mobileContainer, desktopContainer, leaderboardContainer].forEach(el => el.innerHTML = '');
    function formatCurrency(amount) { return '$' + amount.toLocaleString(); }
    
    const generatePlayerCard = (player, index) => {
        return `
            <div class="card ${['first', 'second', 'third'][index] || ''}">
                <div class="grade-badge">${getOrdinalSuffix(index + 1)}</div>
                <h3 class="username">${maskUsername(player.name)}</h3>
                <p class="wagered-label">Wagered: ${formatCurrency(player.wagered?.this_week || 0)}</p>
                <p class="bonus-label">Prize: ${formatCurrency(getPrize(index))}</p>
            </div>`;
    };
    players.slice(0, 3).forEach((p, i) => mobileContainer.innerHTML += generatePlayerCard(p, i));
    desktopContainer.innerHTML += generatePlayerCard(players[1], 1) + generatePlayerCard(players[0], 0) + generatePlayerCard(players[2], 2);
    players.slice(3, 5).forEach((p, i) => {
        leaderboardContainer.innerHTML += `
            <div class="user-row">
                <div class="user-place">${getOrdinalSuffix(i + 4)}</div>
                <div class="user-username">${maskUsername(p.name)}</div>
                <div class="user-wagered">${formatCurrency(p.wagered?.this_week || 0)}</div>
                <div class="user-prize">${formatCurrency(getPrize(i + 3))}</div>
            </div>`;
    });
}
