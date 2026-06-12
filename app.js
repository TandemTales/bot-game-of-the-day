/* Bot Built Arcade — directory + game of the day */

const PAGE_SIZE = 60; // render in pages so the grid scales to thousands of games

const state = {
  games: [],
  query: "",
  category: "all",
  shown: PAGE_SIZE,
};

const $ = (id) => document.getElementById(id);

async function init() {
  const res = await fetch("games/games.json");
  const data = await res.json();
  state.games = data.games;

  renderFeatured(pickGameOfTheDay(state.games, data.gameOfTheDay));
  renderFilters();
  renderGrid();

  $("search").addEventListener("input", (e) => {
    state.query = e.target.value.trim().toLowerCase();
    state.shown = PAGE_SIZE;
    renderGrid();
  });
  $("load-more").addEventListener("click", () => {
    state.shown += PAGE_SIZE;
    renderGrid();
  });
}

/* The manifest can pin today's pick via "gameOfTheDay"; otherwise fall back to
   a deterministic date hash so every visitor still sees the same game. */
function pickGameOfTheDay(games, pinnedSlug) {
  const pinned = games.find((g) => g.slug === pinnedSlug);
  if (pinned) return pinned;
  const today = new Date();
  const key = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  let hash = 0;
  for (const ch of key) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return games[hash % games.length];
}

function gameUrl(game) {
  return `games/${game.slug}/index.html`;
}

function renderFeatured(game) {
  if (!game) return;
  $("featured-date").textContent = new Date().toLocaleDateString(undefined, {
    weekday: "long", month: "long", day: "numeric",
  });
  $("featured-emoji").textContent = game.emoji;
  $("featured-title").textContent = game.title;
  $("featured-desc").textContent = game.description;
  $("featured-play").href = gameUrl(game);
  $("featured").hidden = false;
}

function renderFilters() {
  const categories = ["all", ...new Set(state.games.map((g) => g.category))].sort(
    (a, b) => (a === "all" ? -1 : b === "all" ? 1 : a.localeCompare(b))
  );
  const container = $("filters");
  container.innerHTML = "";
  for (const cat of categories) {
    const btn = document.createElement("button");
    btn.textContent = cat === "all" ? "All" : cat[0].toUpperCase() + cat.slice(1);
    btn.classList.toggle("active", cat === state.category);
    btn.addEventListener("click", () => {
      state.category = cat;
      state.shown = PAGE_SIZE;
      renderFilters();
      renderGrid();
    });
    container.appendChild(btn);
  }
}

function matches(game) {
  if (state.category !== "all" && game.category !== state.category) return false;
  if (!state.query) return true;
  const haystack = `${game.title} ${game.description} ${game.tags.join(" ")}`.toLowerCase();
  return haystack.includes(state.query);
}

function renderGrid() {
  const filtered = state.games.filter(matches);
  const visible = filtered.slice(0, state.shown);
  const grid = $("grid");
  grid.innerHTML = "";

  if (filtered.length === 0) {
    grid.innerHTML = '<p class="empty">No games match. Try another search.</p>';
  }

  for (const game of visible) {
    const card = document.createElement("a");
    card.className = "card";
    card.href = gameUrl(game);
    card.innerHTML = `
      <div class="emoji">${game.emoji}</div>
      <h2></h2>
      <p></p>
      <div class="meta">
        <span class="tag">${game.category}</span>
        ${game.tags.map((t) => `<span class="tag">${t}</span>`).join("")}
      </div>`;
    card.querySelector("h2").textContent = game.title;
    card.querySelector("p").textContent = game.description;
    grid.appendChild(card);
  }

  $("count").textContent = `${filtered.length} game${filtered.length === 1 ? "" : "s"}`;
  $("load-more").hidden = filtered.length <= state.shown;
}

init();
