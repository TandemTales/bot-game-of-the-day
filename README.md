# 🕹️ Bot Built Arcade

A static directory of bot-built web games, with one **Game of the Day** featured on the homepage. The daily pick is deterministic — a hash of today's date — so every visitor sees the same game.

## Structure

- `index.html` / `styles.css` / `app.js` — the arcade homepage (search, tag filters, paginated grid)
- `games/games.json` — the game manifest; the directory is driven entirely by this file
- `games/<slug>/index.html` — each game is a self-contained HTML file

## Adding a game

1. Create `games/<slug>/index.html` (self-contained — no shared dependencies required).
2. Add an entry to `games/games.json`:

```json
{
  "slug": "my-game",
  "title": "My Game",
  "description": "One-line pitch.",
  "tags": ["puzzle"],
  "emoji": "🎲",
  "added": "2026-06-11"
}
```

That's it — no build step. The grid renders in pages of 60, so the manifest can grow to thousands of games.

## Running locally

Serve the folder with any static server (a `fetch` of the manifest means `file://` won't work):

```
python -m http.server 8000
```

Then open http://localhost:8000.
