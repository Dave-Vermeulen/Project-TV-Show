// State management
let allEpisodes = [];
const statusMessage = document.getElementById("status-message");
const url = "https://api.tvmaze.com/shows/82/episodes";

// Fetch episodes from API
function fetchEpisodes() {
  showStatus("Loading episodes...", "loading");
  
  fetch(url)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      return response.json();
    })
    .then(episodes => {
      allEpisodes = episodes;
      hideStatus();
      initializeApp();
    })
    .catch(error => {
      console.error("Fetch error:", error);
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
  
  episodeList.forEach(episode => {
    container.appendChild(createEpisodeCard(episode));
  });
}

// Create episode card element
function createEpisodeCard(episode) {
  const { name, season, number, image, summary, url } = episode;
  const card = document.createElement("article");
  card.className = "episode-card";

  card.innerHTML = `
    <img class="episode-image" src="${image?.medium || "https://via.placeholder.com/210x295?text=No+Image"}" alt="${name || "Episode"} thumbnail">
    <div class="episode-content">
      <h2 class="episode-title">${name || "Untitled episode"}</h2>
      <span class="episode-code">S${pad(season)}E${pad(number)}</span>
      <p class="episode-summary">${cleanText(summary) || "No summary available"}</p>
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
  searchInput.addEventListener("input", function() {
    const term = this.value.toLowerCase().trim();
    const filtered = filterEpisodes(term);
    
    renderEpisodes(filtered);
    updateResultsCount(filtered.length, allEpisodes.length, resultsSpan);
    resetButton.style.display = term ? "inline-block" : "none";
  });
}

// Filter episodes by search term
function filterEpisodes(term) {
  return term ? allEpisodes.filter(episode => 
    episode.name?.toLowerCase().includes(term) ||
    episode.summary?.toLowerCase().includes(term)
  ) : [...allEpisodes];
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
  allEpisodes.forEach(episode => {
    selector.add(new Option(
      `S${pad(episode.season)}E${pad(episode.number)} - ${episode.name}`,
      episode.id
    ));
  });
  
  // Handle episode selection
  selector.addEventListener("change", function() {
    if (!this.value) return;
    
    const selectedEpisode = allEpisodes.find(ep => ep.id === parseInt(this.value));
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
  updateResultsCount(allEpisodes.length, allEpisodes.length, 
                   document.querySelector("#search-container span"));
  document.getElementById("reset-button").style.display = "none";
}

// Update results count display
function updateResultsCount(displayed, total, element) {
  if (element) element.textContent = `Showing ${displayed} of ${total} episodes`;
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
window.onload = fetchEpisodes;