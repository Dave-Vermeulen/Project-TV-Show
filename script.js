//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const container = document.getElementById("episodes-container");
  //container.innerHTML = ""; //clear?

  episodeList.forEach((episode) => {
    const episodeCard = document.createElement("article");
    episodeCard.className = "episode-card";

    const season = pad(episode.season)
    const number = pad(episode.number)
    const episodeCode = `S${season}E${number}`;

    const imageUrl = episode.image ? episode.image.medium : "https://via.placeholder.com/210x295?text=No+Image";
    
    episodeCard.innerHTML = `
      <img class="episode-image" src="${imageUrl}" alt="${episode.name || 'Untitled episode'}">
      <div class="episode-content">
        <h2 class="episode-title">${episode.name || 'Untitled episode'}</h2>
        <span class="episode-code">${episodeCode}</span>
        <div class="episode-summary">${episode.summary || "No summary available"}</div>
        <a href="${episode.url}" target="_blank" rel="noopener">View on TvMaze</a>
      </div>
    `;

    container.appendChild(episodeCard);
  });
}

// Helper functions

// Number padding function
function pad(num) {
  return num.toString().padStart(2, "0");
}

window.onload = setup;
