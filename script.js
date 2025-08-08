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

    const imageUrl = episode.image
      ? episode.image.medium
      : "https://via.placeholder.com/210x295?text=No+Image";

    // Create img tag
    const episodeImg = document.createElement("img");
    episodeImg.className = "episode-image";
    episodeImg.src =
      episode.image?.medium ||
      "https://via.placeholder.com/210x295?text=No+Image";
    episodeImg.alt = `${episode.name || "Episode"} thumbnail`;

    // Create episode content div
    const episodeContent = document.createElement("div");

    // Create title
    const episodeTitle = document.createElement("h2");
    episodeTitle.className = "episode-title";
    episodeTitle.textContent = episode.name || "Untitled episode";

    // Create ep code
    const episodeCode = document.createElement("span");
    episodeCode.className = "episode-code";
    episodeCode.textContent = `S${pad(episode.season)}E${pad(episode.number)}`;

    episodeContent.append(episodeTitle, episodeCode);

    // episodeCard.innerHTML = `

    //   <div class="episode-content">
    //     <h2 class="episode-title">${episode.name || "Untitled episode"}</h2>
    //     <span class="episode-code">${episodeCode}</span>
    //     <div class="episode-summary">${
    //       episode.summary || "No summary available"
    //     }</div>
    //     <a href="${
    //       episode.url
    //     }" target="_blank" rel="noopener">View on TvMaze</a>
    //   </div>
    // `;

    episodeCard.append(episodeImg, episodeContent);
    container.appendChild(episodeCard);
  });
}

// Helper functions

// Number padding function
function pad(num) {
  return num.toString().padStart(2, "0");
}

window.onload = setup;
