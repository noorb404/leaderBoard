// Countdown functions remain unchanged
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

    document.getElementById('days').innerText = days.toString().padStart(2, '0');
    document.getElementById('hours').innerText = hours.toString().padStart(2, '0');
    document.getElementById('minutes').innerText = minutes.toString().padStart(2, '0');
    document.getElementById('seconds').innerText = seconds.toString().padStart(2, '0');
}

setInterval(updateCountdown, 1000);
updateCountdown();

// Utility functions
function maskUsername(username) {
    return `**${username.slice(-3)}`;
}

function getOrdinalSuffix(number) {
    if (number % 10 === 1 && number % 100 !== 11) return number + 'st';
    if (number % 10 === 2 && number % 100 !== 12) return number + 'nd';
    if (number % 10 === 3 && number % 100 !== 13) return number + 'rd';
    return number + 'th';
}

function getPrize(rank) {
    const prizes = [1000, 600, 400, 300, 200,150,125,100,75,50];
    return prizes[rank] || 0;
}

function formatCurrency(amount) {
    return '$' + amount.toLocaleString();
}

// Dummy leaderboard data
const dummyPlayers = [
    { name: "PlayerOne", wagered: { this_week: 2540000 } },
    { name: "SecondGuy", wagered: { this_week: 1420056 } },
    { name: "ThirdPlace", wagered: { this_week: 925015 } },
    { name: "FourthStar", wagered: { this_week: 350845 } },
    { name: "ThirdPlace", wagered: { this_week: 230421 } },
    { name: "FourthStar", wagered: { this_week: 120421 } },
    { name: "ThirdPlace", wagered: { this_week: 110025 } },
    { name: "FourthStar", wagered: { this_week: 90421 } },
    { name: "FourthStar", wagered: { this_week: 67201 } },
    { name: "FifthAce", wagered: { this_week: 45007 } }
];
// Render leaderboard dynamically
function renderLeaderboard(players) {
    const mobileContainer = document.getElementById('top-three-mobile');
    const desktopContainer = document.getElementById('top-three-desktop');
    const leaderboardContainer = document.getElementById('leaderboard-container');

    // Clear existing content
    mobileContainer.innerHTML = '';
    desktopContainer.innerHTML = '';
    leaderboardContainer.innerHTML = '';

    // Insert the header row with titles
    leaderboardContainer.innerHTML = `
    <div class="leaderboard-container" id="leaderboard-container">
        <div class="title-row">
        <div>Place</div>
        <div>Username</div>
        <div>Wagered</div>
        <div>Prize</div>
        </div>
        <!-- User rows dynamically added here -->
    </div>
    `;

    // Function to generate the player cards for top 3
    const generatePlayerCard = (player, index) => {
        const rankNumber = index + 1; // 1-based rank for badge
        const medalImage = index < 3 ? `images/${rankNumber}.png` : null; // assuming medals are in /assets/

        const badgeOrMedal = medalImage
            ? `<img src="${medalImage}" alt="Medal" class="medal-img" />`
            : `<div class="rank-badge">#${rankNumber}</div>`;

        return `
            <div class="card ${index === 0 ? 'first' : index === 1 ? 'second' : index === 2 ? 'third' : ''}">
                ${badgeOrMedal}
                <div class="username">
                    ${maskUsername(player.name)}
                    <div class="username-underline"></div>
                </div>
                <div class="info-row">
                    <div class="info-block">
                        <div class="label gray-label">Wagered</div>
                        <div class="value">${formatCurrency(player.wagered.this_week)}</div>
                    </div>
                    <div class="info-block prize-block">
                        <div class="label gray-label">Prize</div>
                        <div class="value">${formatCurrency(getPrize(index))}</div>
                    </div>
                </div>
            </div>
        `;
    };

    // Render top 3 players for mobile view
    players.slice(0, 3).forEach((player, index) => {
        mobileContainer.innerHTML += generatePlayerCard(player, index);
    });

    // Render top 3 players for desktop view in center order
    desktopContainer.innerHTML += generatePlayerCard(players[1], 1);
    desktopContainer.innerHTML += generatePlayerCard(players[0], 0);
    desktopContainer.innerHTML += generatePlayerCard(players[2], 2);

    // Render players ranked 4 to 10 in the leaderboard container
    players.slice(3, 10).forEach((player, index) => {
        leaderboardContainer.innerHTML += `
            <div class="user-row">
                <div class="user-place">${getOrdinalSuffix(index + 4)}</div>
                <div class="user-username">${maskUsername(player.name)}</div>
                <div class="user-wagered">${formatCurrency(player.wagered.this_week)}</div>
                <div class="user-prize">${formatCurrency(getPrize(index + 3))}</div>
            </div>
        `;
    });
}



document.addEventListener("DOMContentLoaded", function() {
    renderLeaderboard(dummyPlayers);
});
