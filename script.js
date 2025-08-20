// State management
let allEpisodes = [];

// New variables added for feature
let allShows = [];
let episodeCache = {}; // { showId: [episodes] }

const statusMessage = document.getElementById("status-message");

// Fetch all shows from API
function fetchShows() {
  showStatus("Loading shows...", "loading");

  fetch("https://api.tvmaze.com/shows")
    .then((res) => res.json())
    .then((shows) => {
      allShows = shows.sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      );
      populateShowSelector();
      hideStatus();
    })
    .catch((err) => {
      console.error("Error fetching shows:", err);
      showStatus("Failed to load shows. Please try again later.", "error");
    });
}

// Function to populate show selector
function populateShowSelector() {
  const showSelector = document.getElementById("show-selector");
  const resetShowButton = document.getElementById("show-reset-button");

  // Clear existing options
  while (showSelector.options.length > 1) showSelector.remove(1);

  allShows.forEach((show) => {
    const option = new Option(show.name, show.id);
    showSelector.appendChild(option);
  });

  showSelector.addEventListener("change", function () {
    const showId = this.value;
    if (!showId) return;

    resetShowButton.style.display = "inline-block";

    if (episodeCache[showId]) {
      allEpisodes = episodeCache[showId];
      initializeApp();
    } else {
      fetchEpisodesForShow(showId);
    }
  });

  // Select show reset
  resetShowButton.addEventListener("click", () => {
    // Reset show selector
    document.getElementById("show-selector").value = "";

    // Clear episodes and episode-related controls
    allEpisodes = [];
    document.getElementById("episodes-container").innerHTML = "";
    document.getElementById("episode-selector").innerHTML =
      '<option value="">-- Select an episode --</option>';
    document.getElementById("episode-search").value = "";
    document.querySelector("#search-container span").textContent = "";

    // Hide "Show All Shows" button
    resetShowButton.style.display = "none";

    // Hide "Show All Episodes" button
    document.getElementById("reset-button").style.display = "none";
  });
}

// Fetch the episodes from the selected show
function fetchEpisodesForShow(showId) {
  showStatus("Loading episodes...", "loading");

  fetch(`https://api.tvmaze.com/shows/${showId}/episodes`)
    .then((res) => res.json())
    .then((episodes) => {
      episodeCache[showId] = episodes;
      allEpisodes = episodes;
      hideStatus();
      initializeApp();
    })
    .catch((err) => {
      console.error("Error fetching episodes:", err);
      showStatus("Failed to load episodes. Please try again later.", "error");
    });
}


// Show status message with type (loading/error)
function showStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;
}

function hideStatus() {
  statusMessage.textContent = "";
  statusMessage.className = "status-message";
}

// Initialize app with episodes, search, and selector
function initializeApp() {
  renderEpisodes(allEpisodes);
  setupSearch();
  setupEpisodeSelector();
}

// Render episodes list to DOM
function renderEpisodes(episodeList) {
  const container = document.getElementById("episodes-container");
  container.innerHTML = "";

  if (episodeList.length === 0) {
    container.innerHTML = `<p class="no-results">No episodes found</p>`;
    return;
  }

  episodeList.forEach((episode) => {
    container.appendChild(createEpisodeCard(episode));
  });
}

// Create episode card element
function createEpisodeCard(episode) {
  const { name, season, number, image, summary, url } = episode;
  const card = document.createElement("article");
  card.className = "episode-card";

  card.innerHTML = `
    <img class="episode-image" src="${
      image?.medium || "https://via.placeholder.com/210x295?text=No+Image"
    }" alt="${name || "Episode"} thumbnail">
    <div class="episode-content">
      <h2 class="episode-title">${name || "Untitled episode"}</h2>
      <span class="episode-code">S${pad(season)}E${pad(number)}</span>
      <p class="episode-summary">${
        cleanText(summary) || "No summary available"
      }</p>
      <a href="${url}" target="_blank" rel="noopener">View on TVMaze</a>
    </div>
  `;

  return card;
}

// Setup search functionality
function setupSearch() {
  const searchInput = document.getElementById("episode-search");
  const resultsSpan = document.querySelector("#search-container span");
  const resetButton = document.getElementById("reset-button");

  updateResultsCount(allEpisodes.length, allEpisodes.length, resultsSpan);

  // Filter episodes on input
  searchInput.addEventListener("input", function () {
    const term = this.value.toLowerCase().trim();
    const filtered = filterEpisodes(term);

    renderEpisodes(filtered);
    updateResultsCount(filtered.length, allEpisodes.length, resultsSpan);
    resetButton.style.display = term ? "inline-block" : "none";
  });
}

// Filter episodes by search term
function filterEpisodes(term) {
  return term
    ? allEpisodes.filter(
        (episode) =>
          episode.name?.toLowerCase().includes(term) ||
          episode.summary?.toLowerCase().includes(term)
      )
    : [...allEpisodes];
}

// Setup episode selector dropdown
function setupEpisodeSelector() {
  const selector = document.getElementById("episode-selector");
  const resetButton = document.getElementById("reset-button");
  const searchInput = document.getElementById("episode-search");
  const resultsSpan = document.querySelector("#search-container span");

  // Clear existing options except the first
  while (selector.options.length > 1) selector.remove(1);

  // Add episodes to selector
  allEpisodes.forEach((episode) => {
    selector.add(
      new Option(
        `S${pad(episode.season)}E${pad(episode.number)} - ${episode.name}`,
        episode.id
      )
    );
  });

  // Handle episode selection
  selector.addEventListener("change", function () {
    if (!this.value) return;

    const selectedEpisode = allEpisodes.find(
      (ep) => ep.id === parseInt(this.value)
    );
    if (selectedEpisode) {
      renderEpisodes([selectedEpisode]);
      resetButton.style.display = "inline-block";
      searchInput.value = "";
      updateResultsCount(1, allEpisodes.length, resultsSpan);
    }
  });

  resetButton.addEventListener("click", resetFilters);
}

// Reset all filters
function resetFilters() {
  document.getElementById("episode-selector").value = "";
  document.getElementById("episode-search").value = "";
  renderEpisodes(allEpisodes);
  updateResultsCount(
    allEpisodes.length,
    allEpisodes.length,
    document.querySelector("#search-container span")
  );
  document.getElementById("reset-button").style.display = "none";
}

// Update results count display
function updateResultsCount(displayed, total, element) {
  if (element)
    element.textContent = `Showing ${displayed} of ${total} episodes`;
}

// Pad numbers with leading zeros
function pad(num) {
  return num.toString().padStart(2, "0");
}

// Remove HTML tags from text
function cleanText(htmlString) {
  return htmlString?.replace(/<[^>]+>/g, "").trim() || "";
}

// Start app on load
window.onload = () => {
  fetchShows();
};
