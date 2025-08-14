const allEpisodes = getAllEpisodes();
let searchTerm = "";

// Setup function
function setup() {
  renderEpisodes(allEpisodes);
  setupSearch(allEpisodes);
  setupEpisodeSelector(allEpisodes);
}

// Render all episodes
function renderEpisodes(episodes) {
  const container = document.getElementById("episodes-container");
  container.innerHTML = "";
  episodes.forEach((episode) => {
    container.appendChild(createEpisodeCard(episode));
  });
}

// Create episode card
function createEpisodeCard({ name, season, number, image, summary, url }) {
  const card = document.createElement("article");
  card.className = "episode-card";

  const img = document.createElement("img");
  img.className = "episode-image";
  img.src = image?.medium || "https://via.placeholder.com/210x295?text=No+Image";
  img.alt = `${name || "Episode"} thumbnail`;

  const content = document.createElement("div");
  content.className = "episode-content";

  const title = document.createElement("h2");
  title.className = "episode-title";
  title.textContent = name || "Untitled episode";

  const code = document.createElement("span");
  code.className = "episode-code";
  code.textContent = `S${pad(season)}E${pad(number)}`;

  const summaryText = document.createElement("p");
  summaryText.className = "episode-summary";
  summaryText.textContent = cleanText(summary) || "No summary available";

  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener";
  link.textContent = "View on TVMaze";

  content.append(title, code, summaryText, link);
  card.append(img, content);

  return card;
}

// Search setup
function setupSearch(episodes) {
  const input = document.getElementById("episode-search");
  const resultsSpan = document.getElementById("results-count");

  input.addEventListener("keyup", () => {
    searchTerm = input.value.toLowerCase();
    const filtered = episodes.filter((ep) =>
      ep.name.toLowerCase().includes(searchTerm) ||
      cleanText(ep.summary).toLowerCase().includes(searchTerm)
    );
    renderEpisodes(filtered);
    resultsSpan.textContent = `Results: ${filtered.length} of ${episodes.length}`;
  });
}

// Episode selector setup
function setupEpisodeSelector(episodes) {
  const selector = document.getElementById("episode-selector");
  const resetButton = document.getElementById("reset-button");

  episodes.forEach((ep) => {
    const option = document.createElement("option");
    option.value = ep.id;
    option.textContent = `S${pad(ep.season)}E${pad(ep.number)} - ${ep.name}`;
    selector.appendChild(option);
  });

  selector.addEventListener("change", () => {
    const selectedId = parseInt(selector.value);
    if (!selectedId) return;

    const selectedEpisode = episodes.find((ep) => ep.id === selectedId);
    renderEpisodes([selectedEpisode]);
    resetButton.style.display = "inline-block";
  });

  resetButton.addEventListener("click", () => {
    renderEpisodes(episodes);
    selector.value = "";
    resetButton.style.display = "none";
  });
}

// Helpers
function pad(num) {
  return num.toString().padStart(2, "0");
}

function cleanText(htmlString) {
  return htmlString?.replace(/<[^>]+>/g, "").trim();
}

window.onload = setup;
