// Function to get next Monday's first date (for countdown)
function getNextMonday() {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 (Sunday) to 6 (Saturday)
    const daysUntilMonday = (dayOfWeek === 0) ? 1 : 8 - dayOfWeek; // Days left until next Monday
    now.setDate(now.getDate() + daysUntilMonday);
    now.setHours(0, 0, 0, 0);
    return now;
}

// Update the countdown every second
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

// Update countdown every second
setInterval(updateCountdown, 1000);
updateCountdown(); // Initial run

// Function to mask the middle part of the username
function maskUsername(username) {
    if (username.length <= 6) {
        return username[0] + '**' + username[username.length - 1];
    }
    return `${username.slice(0, 3)}**${username.slice(-3)}`;
}

// Function to get ordinal suffix for a number
function getOrdinalSuffix(number) {
    if (number % 10 === 1 && number % 100 !== 11) return number + 'st';
    if (number % 10 === 2 && number % 100 !== 12) return number + 'nd';
    if (number % 10 === 3 && number % 100 !== 13) return number + 'rd';
    return number + 'th';
}

// Prize distribution for top 5 ranks
function getPrize(rank) {
    const prizes = [500, 250, 125, 50, 25]; // Top 5 prize distribution
    return prizes[rank] || 0; // Return prize if rank exists, otherwise 0
}

// Fetch leaderboard data from local proxy server
async function fetchLeaderboardData() {
    try {
        console.log("Fetching leaderboard data...");
        
        const response = await fetch('https://leaderboard-proxy.onrender.com/leaderboard');

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("API Response:", data);

        if (data.success && Array.isArray(data.players)) {
            let players = data.players.filter(player => player.name.toLowerCase() !== 'goattedmode');

            // Adjust wager for Barti2k33 and re-sort leaderboard
            players = adjustWagerForBarti2k33(players);
            renderLeaderboard(players);
        } else {
            console.error('Invalid data format:', data);
        }
    } catch (error) {
        console.error('Error fetching leaderboard data:', error);
    }
}

// Function to adjust Barti2k33's wager and re-sort leaderboard
function adjustWagerForBarti2k33(players) {
    return players.sort((a, b) => (b.wagered?.this_week || 0) - (a.wagered?.this_week || 0));
}

// Function to format currency with commas and $
function formatCurrency(amount) {
    return '$' + amount.toLocaleString();
}

// Function to render leaderboard
function renderLeaderboard(players) {
    if (!Array.isArray(players)) {
        console.error("Expected an array, got:", players);
        return;
    }

    console.log("Players Data in renderLeaderboard:", players);

    const mobileContainer = document.getElementById('top-three-mobile');
    const desktopContainer = document.getElementById('top-three-desktop');
    const leaderboardContainer = document.getElementById('leaderboard-container');

    if (!mobileContainer || !desktopContainer || !leaderboardContainer) {
        console.error('Leaderboard containers not found in the DOM!');
        return;
    }

    // Clear existing content
    mobileContainer.innerHTML = '';
    desktopContainer.innerHTML = '';
    leaderboardContainer.innerHTML = '';

    // Function to generate player card HTML
    const generatePlayerCard = (player, index) => {
        const maskedUsername = maskUsername(player.name);
        const prize = getPrize(index);
        const wageredThisWeek = player.wagered?.this_week || 0;

        return `
            <div class="card ${index === 0 ? 'first' : index === 1 ? 'second' : index === 2 ? 'third' : ''}">
                <div class="grade-badge">${getOrdinalSuffix(index + 1)}</div>
                <div class="text-container">
                    <h3 class="username">${maskedUsername}</h3>
                </div>
                <p class="wagered-label">Wagered:</p>
                <div class="text-container">
                    <p class="wager-value">${formatCurrency(wageredThisWeek)}</p>
                </div>
                <p class="bonus-label">Prize:</p>
                <div class="text-container">
                    <p class="bonus">${formatCurrency(prize)}</p>
                </div>
            </div>
        `;
    };

    // Display top 3 players on mobile
    players.slice(0, 3).forEach((player, index) => {
        mobileContainer.innerHTML += generatePlayerCard(player, index);
    });

    // Display top 3 players on desktop (1st place in center)
    desktopContainer.innerHTML += generatePlayerCard(players[1], 1);
    desktopContainer.innerHTML += generatePlayerCard(players[0], 0);
    desktopContainer.innerHTML += generatePlayerCard(players[2], 2);

    // Render 4th and 5th players in the rest of the leaderboard
    players.slice(3, 5).forEach((player, index) => {
        const wageredThisWeek = player.wagered?.this_week || 0;
        const prize = getPrize(index + 3);
        leaderboardContainer.innerHTML += `
            <div class="user-row">
                <div class="user-place">${getOrdinalSuffix(index + 4)}</div>
                <div class="user-username">${maskUsername(player.name)}</div>
                <div class="user-wagered">${formatCurrency(wageredThisWeek)}</div>
                <div class="user-prize">${formatCurrency(prize)}</div>
            </div>
        `;
    });
}

// Fetch leaderboard data on page load
document.addEventListener("DOMContentLoaded", function() {
    console.log("Page loaded, fetching leaderboard data...");
    fetchLeaderboardData();
});

// Debugging: Check if elements exist in DOM
console.log(document.getElementById('top-three-mobile'));
console.log(document.getElementById('top-three-desktop'));
console.log(document.getElementById('leaderboard-container'));
