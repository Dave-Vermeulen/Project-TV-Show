// =============================
// State management
// =============================
let allEpisodes = [];
let allShows = [];
let episodeCache = {}; // { showId: [episodes] }
let currentShowId = null; // null => shows view, number => episodes view
let searchBound = false; // prevent duplicate search listener binding

const statusMessage = document.getElementById("status-message");

// =============================
// Boot
// =============================
window.onload = () => {
  fetchShows(); // fetch once; subsequent interactions are in-memory
};

// =============================
// Fetch: Shows (once)
// =============================
function fetchShows() {
  showStatus("Loading shows...", "loading");
  fetch("https://api.tvmaze.com/shows")
    .then((res) => res.json())
    .then((shows) => {
      allShows = shows.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
      populateShowSelector();
      renderShows(allShows);
      setupSearch();
      showShowsView();
      hideStatus();
    })
    .catch((err) => {
      console.error("Error fetching shows:", err);
      showStatus("Failed to load shows. Please try again later.", "error");
    });
}

// =============================
// Status helpers
// =============================
function showStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;
}
function hideStatus() {
  statusMessage.textContent = "";
  statusMessage.className = "status-message";
}

// =============================
// View toggles
// =============================
function showShowsView() {
  currentShowId = null;
  // Containers
  const showsEl = document.getElementById("shows-container");
  const epsEl = document.getElementById("episodes-container");
  showsEl.style.display = "grid";
  epsEl.style.display = "none";

  // Controls
  document.getElementById("episode-selector-container").style.display = "none";
  document.getElementById("reset-button").style.display = "none";
  document.getElementById("show-reset-button").style.display = "none";

  // Search placeholder & count
  const searchInput = document.getElementById("episode-search");
  searchInput.placeholder = "Search shows...";
  const span = document.querySelector("#search-container span");
  updateResultsCount(allShows.length, allShows.length, span, "shows");
}

function showEpisodesView() {
  // Containers
  document.getElementById("shows-container").style.display = "none";
  document.getElementById("episodes-container").style.display = "grid";

  // Controls
  document.getElementById("episode-selector-container").style.display = "inline-block";
  document.getElementById("show-reset-button").style.display = "inline-block";

  // Search placeholder & count
  const searchInput = document.getElementById("episode-search");
  searchInput.placeholder = "Search episodes...";
  const span = document.querySelector("#search-container span");
  updateResultsCount(allEpisodes.length, allEpisodes.length, span, "episodes");
}

// =============================
// Shows: render & card factory
// =============================
function renderShows(showList) {
  const container = document.getElementById("shows-container");
  container.innerHTML = "";

  if (!showList || showList.length === 0) {
    container.innerHTML = `<p class="no-results">No shows found</p>`;
    return;
  }

  showList.forEach((show) => container.appendChild(createShowCard(show)));

  // Update result count for shows
  const span = document.querySelector("#search-container span");
  updateResultsCount(showList.length, allShows.length, span, "shows");
}

function createShowCard(show) {
  const { id, name, image, summary, genres = [], status, rating = {}, runtime, url } = show;

  const card = document.createElement("article");
  card.className = "show-card";
  card.innerHTML = `
    <img class="show-image" src="${image?.medium || "https://via.placeholder.com/210x295?text=No+Image"}" alt="${name || "Show"} thumbnail">
    <div class="show-content">
      <h2 class="show-title"><a class="show-link" href="#" data-show-id="${id}">${name || "Untitled show"}</a></h2>
      <div class="show-meta">
        <div><strong>Genres:</strong> ${genres.length ? genres.join(", ") : "—"}</div>
        <div><strong>Status:</strong> ${status || "—"}</div>
        <div><strong>Rating:</strong> ${rating?.average ?? "N/A"}</div>
        <div><strong>Runtime:</strong> ${runtime ?? "N/A"} min</div>
      </div>
      <p class="show-summary">${truncateText(cleanText(summary) || "No summary available", 200)}</p>
      <a href="${url}" target="_blank" rel="noopener">View on TVMaze</a>
    </div>
  `;

  // Entire card navigates to episodes, except the external TVMaze link
  card.addEventListener("click", (e) => {
    const anchor = e.target.closest("a");
    if (anchor && anchor.getAttribute("href") && anchor.getAttribute("href").startsWith("http")) {
      // External link to TVMaze — allow default behavior
      return;
    }
    selectShow(id);
  });

  // Also wire title link explicitly (prevent default #)
  const titleLink = card.querySelector("a.show-link");
  titleLink.addEventListener("click", (e) => { e.preventDefault(); selectShow(id); });

  return card;
}

function selectShow(showId) {
  // Sync dropdown & show back button
  document.getElementById("show-selector").value = String(showId);
  document.getElementById("show-reset-button").style.display = "inline-block";

  if (episodeCache[showId]) {
    currentShowId = showId;
    allEpisodes = episodeCache[showId];
    showEpisodesView();
    renderEpisodes(allEpisodes);
    setupEpisodeSelector();
  } else {
    fetchEpisodesForShow(showId);
  }
}

// =============================
// Episodes: render & card factory
// =============================
function initializeApp() {
  renderEpisodes(allEpisodes);
  setupEpisodeSelector();
  showEpisodesView();
}

function renderEpisodes(episodeList) {
  const container = document.getElementById("episodes-container");
  container.innerHTML = "";

  if (!episodeList || episodeList.length === 0) {
    container.innerHTML = `<p class="no-results">No episodes found</p>`;
    return;
  }

  episodeList.forEach((episode) => container.appendChild(createEpisodeCard(episode)));

  // Update result count for episodes
  const span = document.querySelector("#search-container span");
  updateResultsCount(episodeList.length, allEpisodes.length, span, "episodes");
}

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

// =============================
// Search (contextual: shows OR episodes)
// =============================
function setupSearch() {
  const searchInput = document.getElementById("episode-search");
  const resultsSpan = document.querySelector("#search-container span");
  const resetButton = document.getElementById("reset-button");

  if (searchBound) return; // avoid duplicates
  searchBound = true;

  // Initial count in shows view
  updateResultsCount(allShows.length, allShows.length, resultsSpan, "shows");

  searchInput.addEventListener("input", function () {
    const term = this.value.toLowerCase().trim();

    if (!currentShowId) {
      // SHOWS CONTEXT
      const filtered = filterShows(term);
      renderShows(filtered);
      updateResultsCount(filtered.length, allShows.length, resultsSpan, "shows");
    } else {
      // EPISODES CONTEXT
      const filtered = filterEpisodes(term);
      renderEpisodes(filtered);
      updateResultsCount(filtered.length, allEpisodes.length, resultsSpan, "episodes");
      resetButton.style.display = term ? "inline-block" : "none";
    }
  });
}

function filterShows(term) {
  if (!term) return [...allShows];
  const t = term.toLowerCase();
  return allShows.filter((show) =>
    show.name?.toLowerCase().includes(t) ||
    (show.genres || []).some((g) => g.toLowerCase().includes(t)) ||
    cleanText(show.summary)?.toLowerCase().includes(t)
  );
}

function filterEpisodes(term) {
  return term
    ? allEpisodes.filter(
        (episode) =>
          episode.name?.toLowerCase().includes(term) ||
          episode.summary?.toLowerCase().includes(term)
      )
    : [...allEpisodes];
}

// =============================
// Episode selector
// =============================
function setupEpisodeSelector() {
  const selector = document.getElementById("episode-selector");
  const resetButton = document.getElementById("reset-button");
  const searchInput = document.getElementById("episode-search");
  const resultsSpan = document.querySelector("#search-container span");

  // Clear existing options except the first
  while (selector.options.length > 1) selector.remove(1);

  // Populate episodes
  allEpisodes.forEach((episode) => {
    selector.add(new Option(`S${pad(episode.season)}E${pad(episode.number)} - ${episode.name}`, episode.id));
  });

  // Assign handlers (overwrite to avoid duplicates)
  selector.onchange = function () {
    if (!this.value) return;
    const selectedEpisode = allEpisodes.find((ep) => ep.id === parseInt(this.value));
    if (selectedEpisode) {
      renderEpisodes([selectedEpisode]);
      resetButton.style.display = "inline-block";
      searchInput.value = "";
      updateResultsCount(1, allEpisodes.length, resultsSpan, "episodes");
    }
  };

  resetButton.onclick = resetFilters;
}

function resetFilters() {
  document.getElementById("episode-selector").value = "";
  document.getElementById("episode-search").value = "";
  renderEpisodes(allEpisodes);
  updateResultsCount(
    allEpisodes.length,
    allEpisodes.length,
    document.querySelector("#search-container span"),
    "episodes"
  );
  document.getElementById("reset-button").style.display = "none";
}

// =============================
// Show selector & Back to shows
// =============================
function populateShowSelector() {
  const showSelector = document.getElementById("show-selector");
  const resetShowButton = document.getElementById("show-reset-button");

  // Clear options (keep placeholder)
  while (showSelector.options.length > 1) showSelector.remove(1);

  allShows.forEach((show) => showSelector.appendChild(new Option(show.name, show.id)));

  showSelector.onchange = function () {
    const showId = this.value;
    if (!showId) return;
    selectShow(parseInt(showId));
  };

  resetShowButton.onclick = () => {
    // Reset UI to shows view
    showSelector.value = "";
    allEpisodes = [];
    document.getElementById("episodes-container").innerHTML = "";
    document.getElementById("episode-selector").innerHTML = '<option value="">-- Select an episode --</option>';
    document.getElementById("episode-search").value = "";
    document.querySelector("#search-container span").textContent = "";

    renderShows(allShows);
    showShowsView();
  };
}

// =============================
// Fetch: Episodes (per show, cached)
// =============================
function fetchEpisodesForShow(showId) {
  showStatus("Loading episodes...", "loading");
  fetch(`https://api.tvmaze.com/shows/${showId}/episodes`)
    .then((res) => res.json())
    .then((episodes) => {
      episodeCache[showId] = episodes; // cache to avoid re-fetching
      allEpisodes = episodes;
      currentShowId = showId;
      hideStatus();
      initializeApp();
    })
    .catch((err) => {
      console.error("Error fetching episodes:", err);
      showStatus("Failed to load episodes. Please try again later.", "error");
    });
}

// =============================
// Utilities
// =============================
function updateResultsCount(displayed, total, element, label = "episodes") {
  if (element) element.textContent = `Showing ${displayed} of ${total} ${label}`;
}
function pad(num) { return num?.toString().padStart(2, "0") ?? "00"; }
function cleanText(htmlString) { return htmlString?.replace(/<[^>]+>/g, "").trim() || ""; }
function truncateText(str, max = 200) { return str.length > max ? `${str.slice(0, max)}…` : str; }