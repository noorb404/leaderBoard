// Function to get the next month's first date (for countdown)
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

// Function to mask the middle part of the username
function maskUsername(username) {
    // For usernames with 6 or fewer characters, mask the middle
    if (username.length <= 6) {
        // Only show the first and last character, with '**' in the middle
        return username[0] + '**' + username[username.length - 1];
    }

    // For longer usernames (more than 6 characters), mask the middle part with '**'
    const firstPart = username.slice(0, 3);
    const lastPart = username.slice(-3);
    
    return `${firstPart}**${lastPart}`;
}

// Function to get ordinal suffix for a number
function getOrdinalSuffix(number) {
    const j = number % 10;
    const k = number % 100;
    if (j === 1 && k !== 11) {
        return number + 'st';
    }
    if (j === 2 && k !== 12) {
        return number + 'nd';
    }
    if (j === 3 && k !== 13) {
        return number + 'rd';
    }
    return number + 'th';
}

// Prize distribution based on rank (total prize pool: $1000)
function getPrize(rank) {
    switch(rank) {
        case 0: return 500;  // 1st place gets $500
        case 1: return 250;  // 2nd place gets $250
        case 2: return 125;  // 3rd place gets $125
        case 3: return 50;   // 4th place gets $50
        case 4: 
        case 5: 
        case 6: 
        case 7: 
        case 8: 
        case 9: return 25;  // 5th to 10th place gets $25 each
        default: return 0;   // For any other case, no prize (shouldn't happen)
    }
}


// Fetch leaderboard data from your local server (which proxies the request)
async function fetchLeaderboardData() {
    try {
        console.log("Fetching leaderboard data...");
        
        const response = await fetch('https://leaderboard-proxy.onrender.com/leaderboard', {
            method: 'GET',
        });

        // Check if the response is OK (status 200)
        if (!response.ok) {
            throw new Error(HTTP error! Status: ${response.status});
        }

        const data = await response.json();

        // Log the entire API response for debugging purposes
        console.log("API Response:", data);

        // Check if the response contains the expected 'success' key and 'players' array
        if (data.success && Array.isArray(data.players)) {
            let players = data.players; // Correctly access players here

            console.log("Leaderboard Data (players):", players);

            // Remove "goattedmode" user if present in the leaderboard
            players = players.filter(player => player.name.toLowerCase() !== 'goattedmode');

            // Adjust the wager for Barti2k33 and re-calculate his position
            players = adjustWagerForBarti2k33(players); 

            // Render leaderboard
            renderLeaderboard(players); // Pass the player data to render
        } else {
            console.error('Invalid data format: expected an array of players', data); // Log error if data structure is unexpected
        }
    } catch (error) {
        console.error('Error fetching leaderboard data:', error); // Log any errors
    }
}

// Function to adjust Barti2k33's wager and re-sort the leaderboard
function adjustWagerForBarti2k33(players) {

    // Re-sort the players based on the adjusted wager
    players.sort((a, b) => {
        const wageredA = a.wagered && a.wagered.this_month ? a.wagered.this_month : 0;
        const wageredB = b.wagered && b.wagered.this_month ? b.wagered.this_month : 0;
        return wageredB - wageredA; // Sort in descending order
    });

    return players;
}

// Function to render leaderboard
function renderLeaderboard(players) {
    // Check if players is an array
    if (!Array.isArray(players)) {
        console.error("Expected players to be an array, but got:", players);
        return;
    }

    // Ensure we have a valid players array
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

    // Function to format the wagered amount with commas and dollar sign
    function formatCurrency(amount) {
        return '$' + amount.toLocaleString(); // Format with commas and prepend $ symbol
    }

    // Function to generate player card HTML
    const generatePlayerCard = (player, index) => {
        // Mask the player's name
        const maskedUsername = maskUsername(player.name);

        // Get the prize for the player based on their rank
        const prize = getPrize(index);

        // Safely access the wagered.this_month value
        const wageredThisMonth = player.wagered && player.wagered.this_month ? player.wagered.this_month : 0;
        return 
            <div class="card ${index === 0 ? 'first' : index === 1 ? 'second' : index === 2 ? 'third' : ''}">
                <div class="grade-badge">${getOrdinalSuffix(index + 1)}</div>
                <div class="text-container">
                    <h3 class="username">${maskedUsername}</h3> <!-- Display masked username -->
                </div>
                <p class="wagered-label">Wagered:</p>
                <div class="text-container">
                    <p class="wager-value">${formatCurrency(wageredThisMonth)}</p>
                </div>
                <p class="bonus-label">Prize:</p>
                <div class="text-container">
                    <p class="bonus">${formatCurrency(prize)}</p> <!-- Display the prize for the player -->
                </div>
            </div>
        ;
    };

    // For Mobile - first player on top, then second and third
    players.slice(0, 3).forEach((player, index) => {
        mobileContainer.innerHTML += generatePlayerCard(player, index);
    });

    // For Desktop - 1st player in the center (second position), then 2nd and 3rd
    desktopContainer.innerHTML += generatePlayerCard(players[1], 1); // second player
    desktopContainer.innerHTML += generatePlayerCard(players[0], 0); // first player (in the middle)
    desktopContainer.innerHTML += generatePlayerCard(players[2], 2); // third player

    // Render 4th to 10th players dynamically in the rest of the leaderboard
    players.slice(3, 7).forEach((player, index) => {
        const wageredThisMonth = player.wagered && player.wagered.this_month ? player.wagered.this_month : 0;
        const prize = getPrize(index + 3); // Get prize for 4th to 10th place (index + 3)
        const rowHTML = 
            <div class="user-row">
                <div class="user-place">${getOrdinalSuffix(index + 4)}</div>
                <div class="user-username">${maskUsername(player.name)}</div> <!-- Display masked username -->
                <div class="user-wagered">${formatCurrency(wageredThisMonth)}</div>
                <div class="user-prize">${formatCurrency(prize)}</div> <!-- Display prize -->
            </div>
        ;
        leaderboardContainer.innerHTML += rowHTML;
    });
}

// Fetch leaderboard data on page load
document.addEventListener("DOMContentLoaded", function() {
    console.log("Page loaded, fetching leaderboard data...");
    fetchLeaderboardData(); // Just call the fetchLeaderboardData function
});

// Check for elements in the DOM
console.log(document.getElementById('top-three-mobile')); // Check if this is null or undefined
console.log(document.getElementById('top-three-desktop')); // Same check for desktop
console.log(document.getElementById('leaderboard-container')); // Same check for leaderboard container
