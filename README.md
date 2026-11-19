# Uchaf

An Observable Notebook Kit project. *Uchaf* is two verses by John Cayley, laid out one over the other and
read, shuffled and re-paired in a loop. Playback uses the shared engine
[observable2/scoringthespeltair](https://github.com/observable2/scoringthespeltair).

It refactors the earlier site (`shadoof.github.io/uchaf`, a page around the Observable notebook
`@shadoof/uchaf-app`) onto the engine and its conventions. Copies of the original page and notebook are in
`raw/` (untracked).

## Commands

- `npm run preview` — local preview at http://localhost:5173 (the player at `/`, the notebook at `/scoring-uchaf`)
- `npm run build` — build to `../dist`

## Making the piece

1. Open `nbks/scoring-uchaf.html`. The verses and their layout are in the `galley` cell (two `ofld`/`para`),
   the recorded timings in `timings`, the sequence of scores in `scores`, the settings in `config`.
2. Download `spels.json`, `paras.json`, `scores.json`, `config.json` and `measured.json` from the Export cell
   into `nbks/data/`. `nbks/index.html` (the player) reads them; `nbks/data/generators.js` is the player's code
   for the scores that are generated anew each time round.

## Where the original's parts went

| Original (`@shadoof/uchaf-app`, `index.html`) | Here |
|---|---|
| `draft`, `draft2` (the two verses, `<div class="set">` with whitespace layout) | the `galley` cell: the same text and whitespace, as two `ofld`/`para` |
| `addSpansTo`, `buildSpels`, `buildVerseSpels`, `pxToVw` (`offsetLeft`/`offsetTop`, whole pixels) | the template's measuring cells (bounding boxes, `getBoundingClientRect`, in vw) |
| the five extra spels (`know?`, `knowing`, `reading`, `ear`, `eye`) added in `buildVerseSpels` | `alternates` in the `layout` cell: each takes the box of the spel it stands in for |
| `uchafTemporal`, `alignedSpels`, `config.slower` | `timings` (seconds, as recorded), the engine's `scoreFromTimings`, `extraMs: 200` |
| `scores` (the list), `pause`, `toggle`, `toggleScr`, `concatFade` | `scores` (now `scores.json`), with the engine's `pauseItem` and `toggleItems` |
| `s1jjnn`, `vshuffle`, `schorus` (made when the score came round) | `nbks/data/generators.js` as `jjnn`, `vshuffle`, `chorus`, called by the engine (`options.generators`) |
| `play()` (`config.interScore`, `interCycle`, `scoredPause`) | the engine's `play()` with `cycleScores`, `fadeWords: -1`, `interScoreMs`, `interCycleMs` |
| `style.css`, `#display` (hand-calculated width) | `nbks/index.html`: the type from `typeCss(config)`, the field centred on the extent of its spels (`centerField`, through `mount`) |
| the Play / Stop buttons of the notebook (not on the page) | not carried over: the notebook has no live preview yet (a To do in the template) |

## What the engine gained for this

Both are additive, and documented in the engine's README ("Generated scores and timed scores"):

- **Generated scores:** an entry of `scores.json` may name a generator (`"chorus"`, or
  `{ "generator": "vshuffle", "args": [2, true] }`); the page passes `{ generators }` to `play()` as a sixth argument.
- **Score helpers:** `pauseItem`, `toggleItems`, `scoreFromTimings` (and `resolveScore`) in `score.js`.

## Differences from the original

- **Positions.** Measured as the template does, in the bounding boxes of the spans, at weight 400, `lineHeight` 1.5
  (the original: the font's own) and the optical size fixed at 14 (the original's followed the font size, about 21 in
  the 906px window the original was measured in). The type is a little wider, so spels sit up to 1.6 vw further right
  than in the original (most by less) and about 0.1 vw higher. Both verses and the alternates are measured together, so
  they still line up with one another.
- **Ids.** `low-0`, `see-17`, `know-50` (a slug and the index) instead of `low_0`, `see?_17`, `know?_50`.
- **Timing.** The same recorded durations plus 200 ms, in milliseconds. The original waited 1.5 s before the first
  score and then played forever; the engine waits `interCycleMs` (3 s) first. The original's `play()` first
  switched off any visible spel; the player starts with every spel hidden, so the engine has no need to.
- **Page.** The field is centred by the engine, not by a fixed width; the page colour (`#001f3f`) and cursor are the original's.
- **The score sequence** is the original's, in the same order (`scores` cell), and so are the generators' rules (the
  forbidden pairings in `NOT_PAIRED`, the 200 ms the last word of the chorus lingers).
- **Not checked:** how it sounds against the recording (the recording is not part of this project), other window
  widths, other browsers, and the notebook in the Observable Desktop app. Checked in headless Chrome at 1200px: the
  notebook runs without cell errors; the player, from the dev server and from the built `dist/`, runs without errors,
  plays through cycles in which every spel is hidden again at the end; over 500 simulated cycles the generators
  returned only existing spels with finite durations.

## The engine

`package.json` and `package-lock.json` pin the engine at release **v0.6.0** (the first with generated scores and
the score helpers); `npm ci` in `.github/workflows/deploy.yml` builds with exactly that. To move to a later
release, run `node node_modules/scoringthespeltair/scripts/bump.js v0.x.y` in this folder (see the engine's README,
"Releases"). In the scored-air workspace, `preview` and `build` use the workspace's engine, which is the local
checkout, so check a newer engine here only once it is tagged.

Co-implemented with Claude Sonnet 5.5, November 2026.
