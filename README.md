# Typing Trainer

A browser-based typing trainer that helps you build finger reflexes and speed without leaving your browser. The app follows the curriculum and UX described in [`typing_trainer_requirements.md`](./typing_trainer_requirements.md) and ships as a Vite + React + TypeScript project.

## Features

- **Two training levels**
  - *Finger Reflex Trainer:* structured drills that progress from home row to trigrams with per-unit unlock criteria (≥ 90% accuracy and ≥ 15 net WPM).
  - *Speed Trainer:* timed word sprints with live metrics, error heatmaps, and consistency scores.
- **Responsive curriculum panel** with drill styles, status indicators, and adaptive highlights on the virtual keyboard.
- **Real-time analytics** for WPM, accuracy, error counts, and progress.
- **Local persistence** for settings, progress tracking, and the latest 200 session summaries.
- **Accessibility-friendly UI** with keyboard navigation, ARIA labels, and a color-blind palette toggle.
- **Embedded word pools** (200, 1k, 5k) plus support for custom lists stored locally.

## Getting Started

```bash
npm install
npm run dev
```

The development server starts on <http://localhost:5173>. Changes are hot-reloaded.

### Production Build

```bash
npm run build
```

Artifacts are emitted to `dist/`. Preview the production bundle with:

```bash
npm run preview
```

### Tests

The project includes foundational unit tests for the drill/metrics engines and keyboard utilities.

```bash
npm run test
```

## Project Structure

```
src/
  components/       # Reusable UI elements (header, keyboard, countdown, etc.)
  features/
    level1/         # Finger Reflex Trainer curriculum + engine
    level2/         # Speed Trainer word pools + engine
  state/            # Settings, progress, and history providers (localStorage-backed)
  utils/            # Metrics, keyboard helpers, and storage adapters
```

## License

[MIT](./LICENSE)
