// Countdown
function getNextMonday() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysUntilMonday = (dayOfWeek === 0) ? 1 : 8 - dayOfWeek;
    now.setDate(now.getDate() + daysUntilMonday);
    now.setHours(0, 0, 0, 0);
    return now;
}

function updateCountdown() {
    const now = new Date();
    const nextMonday = getNextMonday();
    const timeRemaining = nextMonday - now;

    const format = (n) => n.toString().padStart(2, '0');

    if (timeRemaining <= 0) {
        document.getElementById('days').innerText = '00';
        document.getElementById('hours').innerText = '00';
        document.getElementById('minutes').innerText = '00';
        document.getElementById('seconds').innerText = '00';
        return;
    }

    const days = Math.floor(timeRemaining / (1000*60*60*24));
    const hours = Math.floor((timeRemaining % (1000*60*60*24)) / (1000*60*60));
    const minutes = Math.floor((timeRemaining % (1000*60*60)) / (1000*60));
    const seconds = Math.floor((timeRemaining % (1000*60)) / 1000);

    document.getElementById('days').innerText = format(days);
    document.getElementById('hours').innerText = format(hours);
    document.getElementById('minutes').innerText = format(minutes);
    document.getElementById('seconds').innerText = format(seconds);
}

setInterval(updateCountdown, 1000);
updateCountdown();

// Utilities
function maskUsername(username) { return `${username.slice(-3)}***`; }
const PRIZES = [600, 375, 250, 175, 100]; // custom prizes
function getPrize(rank) { return PRIZES[rank] || 0; }
function formatCurrency(amount) { return '$' + amount.toLocaleString(); }

// Render leaderboard
function renderLeaderboard(players) {
    // Sort by wagered amount descending
    players.sort((a, b) => b.wagered.this_week - a.wagered.this_week);

    // Only top 5
    const topPlayers = players.slice(0, 5);

    const mobileContainer = document.getElementById('top-three-mobile');
    const desktopContainer = document.getElementById('top-three-desktop');
    const leaderboardContainer = document.getElementById('leaderboard-container');

    mobileContainer.innerHTML = '';
    desktopContainer.innerHTML = '';
    leaderboardContainer.innerHTML = '';

    const generateCard = (player, index) => {
        const rank = index + 1;
        const medal = index < 3 ? `<img src="images/${rank}.png" class="medal-img" />` : `<div class="rank-badge">#${rank}</div>`;
        return `
            <div class="card ${index===0?'first':index===1?'second':index===2?'third':''}">
                ${medal}
                <div class="username">${maskUsername(player.name)}<div class="username-underline"></div></div>
                <div class="info-row">
                    <div class="info-block"><div class="label gray-label">Wagered</div><div class="value">${formatCurrency(player.wagered.this_week)}</div></div>
                    <div class="info-block prize-block"><div class="prize label gray-label">Prize</div><div class="value">${formatCurrency(getPrize(index))}</div></div>
                </div>
            </div>
        `;
    };

    // Top 3 for mobile
    topPlayers.slice(0, 3).forEach((p, i) => mobileContainer.innerHTML += generateCard(p, i));

    // Top 3 for desktop (center order)
    if (topPlayers.length >= 3) {
        desktopContainer.innerHTML += generateCard(topPlayers[1], 1);
        desktopContainer.innerHTML += generateCard(topPlayers[0], 0);
        desktopContainer.innerHTML += generateCard(topPlayers[2], 2);
    }

    // 4th and 5th for leaderboard container
    topPlayers.slice(3, 5).forEach((p, i) => {
        leaderboardContainer.innerHTML += `
            <div class="user-row">
                <div class="user-username">${maskUsername(p.name)}</div>
                <div class="user-wagered">${formatCurrency(p.wagered.this_week)}</div>
                <div style="color:#5cf8c3;" class="user-prize">${formatCurrency(getPrize(i + 3))}</div>
            </div>
        `;
    });
}

// Fetch leaderboard from backend
document.addEventListener("DOMContentLoaded", async function() {
    try {
        const now = new Date();
        const lastMonday = new Date(now);
        lastMonday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
        lastMonday.setHours(0, 0, 0, 0);

        const nextMonday = new Date(lastMonday);
        nextMonday.setDate(lastMonday.getDate() + 7);

        const fromDate = lastMonday.toISOString().split("T")[0];
        const toDate = nextMonday.toISOString().split("T")[0];

        console.log(`Fetching leaderboard from ${fromDate} to ${toDate}`);

        const response = await fetch(`https://leaderboard-proxy.onrender.com/leaderboard?fromDate=${fromDate}&toDate=${toDate}`);
        if (!response.ok) throw new Error("Failed to fetch leaderboard");

        const result = await response.json();
        if (result.success && Array.isArray(result.players)) {
            const players = result.players.map(player => ({
                name: player.username,
                wagered: {
                    this_week: Number(player.wager.value) / Math.pow(10, player.wager.decimals)
                }
            }));
            renderLeaderboard(players);
        } else {
            console.error("Invalid leaderboard response:", result);
        }
    } catch (err) {
        console.error("Error loading leaderboard:", err);
    }
});
