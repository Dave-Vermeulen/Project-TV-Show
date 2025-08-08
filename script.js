//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const container = document.getElementById("episodes-container");

  // I've taken the logic that was happening here and created a seperate function for it
  episodeList.forEach((episode) => {
    container.appendChild(makeEpisodeCard(episode));
  });
}

// Use some object destructuring so that everything doesn't need to be episode.something
function makeEpisodeCard({ name, season, number, image, summary, url }) {
  const episodeCard = document.createElement("article");
  episodeCard.className = "episode-card";

  const imageUrl = image
    ? image.medium
    : "https://via.placeholder.com/210x295?text=No+Image";

  // Create img tag
  const episodeImg = document.createElement("img");
  episodeImg.className = "episode-image";
  episodeImg.src =
    image?.medium ||
    "https://via.placeholder.com/210x295?text=No+Image";
  episodeImg.alt = `${name || "Episode"} thumbnail`;

  // Create episode content container
  const episodeContent = document.createElement("div");
  episodeContent.className = "episode-content";

  // Create title
  const episodeTitle = document.createElement("h2");
  episodeTitle.className = "episode-title";
  episodeTitle.textContent = name || "Untitled episode";

  // Create episode code
  const episodeCode = document.createElement("span");
  episodeCode.className = "episode-code";
  episodeCode.textContent = `S${pad(season)}E${pad(number)}`;

  // Create episode summary
  const episodeSummary = document.createElement("p");
  episodeSummary.className = "episode-summary";
  episodeSummary.textContent =
    cleanText(summary) || "No summary available";

  // Create episode TV Maze url link
  const tvMazeLink = document.createElement("a");
  tvMazeLink.href = url;
  tvMazeLink.target = "_blank";
  tvMazeLink.rel = "noopener";
  tvMazeLink.textContent = "View on TVMaze";

  //Build episode content
  episodeContent.append(episodeTitle, episodeCode, episodeSummary, tvMazeLink);

  // Build episode card
  episodeCard.append(episodeImg, episodeContent);

  return episodeCard;
}

// Helper functions

// Number padding function
function pad(num) {
  return num.toString().padStart(2, "0");
}

// Function to clean string of html tags
function cleanText(htmlString) {
  return htmlString?.replace(/<[^>]+>/g, "").trim();
}

window.onload = setup;
