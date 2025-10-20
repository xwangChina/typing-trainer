
# Typing Trainer — Requirements Specification

## 1) Overview

A browser-based typing trainer with two levels:

1. **Level 1 – Finger Reflex Trainer (Fundamentals):** Builds reflexes by mapping specific fingers to specific keys following standard QWERTY touch‑typing conventions. Drills progress from home-row letters to top/bottom rows, then common pairs and trigrams. Emphasis on accuracy and correct finger usage, with visual keyboard guidance.
2. **Level 2 – Speed Trainer (Fluency):** Presents random words and challenges the user to type them quickly and accurately. Timed runs with WPM, accuracy, and error analytics.

No sign-in is required; all data persists locally in the browser. The app is mobile-friendly but optimized for desktop/laptop keyboards.

---

## 2) Goals & Non‑Goals

### Goals
- Teach correct finger-to-key mapping for English QWERTY.
- Improve speed and accuracy with structured practice.
- Provide immediate, actionable feedback (visual, numeric, and summaries).
- Keep all user data on-device (privacy by default).

### Non‑Goals (v1)
- Cloud sync / accounts.
- Multiplayer leaderboards.
- Alternative layouts (Dvorak/Colemak) — may come later.

---

## 3) Success Metrics
- **Level 1:** User advances from each unit with ≥ **90% accuracy** and ≥ **15 net WPM** within a unit drill.
- **Level 2:** Measurable increase in **net WPM** and **accuracy** over 7 sessions (stored locally).
- Session retention: ≥ 50% of users complete at least one full session after onboarding.

---

## 4) UX at a Glance

### Primary Layout (Desktop)
- **Header:** App title, level switcher, quick stats (lifetime avg WPM, accuracy), Settings (gear).
- **Main Pane (center):** Drill text (Level 1) or word stream (Level 2), input line, live feedback.
- **Right Pane:** Virtual keyboard with colored finger zones; highlights current target key(s), Caps Lock status, and error keys.
- **Footer:** Session timer, current WPM, accuracy, error count, progress bar.

### Mobile/Tablet Adjustments
- Virtual keyboard collapsible under a toggle.
- Larger text/input; haptics toggle if supported.

---

## 5) Levels & Curriculum

### Level 1 — Finger Reflex Trainer
**Objective:** Correct finger-key association and accurate keystrokes.

**Finger Zones (letters only, QWERTY):**
- **Left Pinky:** `Q, A, Z`
- **Left Ring:** `W, S, X`
- **Left Middle:** `E, D, C`
- **Left Index:** `R, F, V, T, G, B`
- **Right Index:** `Y, H, N, U, J, M`
- **Right Middle:** `I, K`
- **Right Ring:** `O, L`
- **Right Pinky:** `P`
- **Thumbs:** Space

> Note: While some schools place `B` under either index, we assign it to **Left Index** for consistency in v1.

**Unit Progression (default):**
1. **Home Row:** `A S D F J K L ;` (letters only for drills → `a s d f j k l`)
2. **Top Row Left:** `Q W E R T`
3. **Top Row Right:** `Y U I O P`
4. **Bottom Row Left:** `Z X C V B`
5. **Bottom Row Right:** `N M`
6. **Pairs & Alternation:** common digrams across hands (e.g., `at`, `ed`, `to`, `an`, `he`, `in`)
7. **Trigrams:** high-frequency sequences (e.g., `the`, `and`, `ing`)
8. **Mixed Review:** randomized letters from mastered units.

**Drill Types:**
- **Single-letter repetition:** target letter appears with count-down bubbles.
- **Alternating pairs:** two-target alternation (e.g., `a`↔`s`) with rhythm meter.
- **Row runs:** sequences across a row.
- **Adaptive review:** weights mistake-prone letters/pairs higher (spaced repetition-lite).

**Gating Criteria (per unit):**
- Finish a 60–120s drill **with ≥ 90% accuracy** and **≥ 15 net WPM** to unlock next unit.
- If unmet, offer **focused retry** (auto-selects weak letters) or **slow mode** (reduced pace).

### Level 2 — Speed Trainer
**Objective:** Increase fluency and speed on real words.

**Modes:**
- **Timed Runs:** 15s, 30s, 60s (default 60s), 120s, custom.
- **Word Pools:** 
  - *Beginner:* top 200 common words
  - *Core:* top 1,000 words
  - *Advanced:* 5,000+ words
  - *Custom list:* user-pasted list

**Flow:**
1. Countdown `3-2-1` with focus lock.
2. Stream 1–3 upcoming words ahead (configurable).
3. Real-time metrics: **raw WPM**, **net WPM**, **accuracy**, **corrected errors**, **uncorrected errors**.
4. Summary: per-word latency histogram, error heatmap by character, best streak, consistency score.

**Anti-cheat / UX Rules:**
- Disable paste into the typing field.
- Do not count extra characters beyond word boundary.
- Config to require **space** to advance, or **auto-advance** on exact match.

---

## 6) Input Handling & Metrics

**Keyboard Events:**
- Use `keydown` and `keyup` for responsiveness; ignore modifier-only keys.
- Normalize to lowercase for letter comparison; show Caps Lock indicator.
- `Backspace` allowed; track corrected vs. uncorrected errors.
- Prevent default on unwanted shortcuts (e.g., `Ctrl+S`) in focused input.

**Timing & Stats:**
- **Raw WPM**: `(typedChars / 5) / minutesElapsed`.
- **Net WPM**: `rawWPM - (uncorrectedErrors / minutesElapsed)`.
- **Accuracy**: `correctKeystrokes / totalKeystrokes`.
- **Latency**: time between keystrokes; compute per-character and per-word medians.

**Session Lifecycle:**
- Start on first valid keystroke after countdown.
- Pause/resume with UI or when window loses focus (configurable).

---

## 7) Visual Keyboard

- SVG-based keyboard with keys grouped by finger color zones.
- Highlights **target key(s)** for the current drill/word.
- Shows **pressed** vs. **intended** key feedback for 200ms.
- Indicates **Caps Lock** and **Space** regions.
- Optional hints: home-row nubs on `F` and `J`.

---

## 8) Configuration & Settings (persist to localStorage)

- Theme: light/dark/system.
- Sound: on/off (key click, success, error); volume slider.
- Font size / line height.
- Color-blind friendly palette (deuteranopia, protanopia).
- Word pool selection (Level 2).
- Show next N upcoming words (0–3).
- Require-space vs. auto-advance (Level 2).
- Countdown: 3s on/off.
- Target goals per unit (override defaults).
- Reset progress / clear data.

**localStorage Keys (prefix `tt:`):**
- `tt:settings` — JSON for all settings.
- `tt:progress` — JSON by unitId `{ accuracy, bestNetWPM, lastPlayed }`.
- `tt:history` — array of last 200 sessions `{ ts, level, duration, netWPM, accuracy, errors, unitId? }`.

---

## 9) Data & Word Lists

- Ship with embedded arrays for common word lists (200, 1k, 5k). 
- Accept custom list via textarea (stored locally).
- All processing remains client-side.

**Example word item:** plain strings; no API required.

---

## 10) Technical Architecture

**Stack (recommended for Codex Cloud):**
- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS; optional shadcn/ui
- **State:** React Context + reducers (or Zustand)
- **Visualization:** SVG for keyboard, simple divs for streams
- **Testing:** Vitest + React Testing Library; Playwright for e2e

**Structure:**
```
/src
  /components
    Header.tsx
    StatsBar.tsx
    Keyboard.svg.tsx
    DrillText.tsx
    WordStream.tsx
    InputField.tsx
    SummaryModal.tsx
    SettingsModal.tsx
    Countdown.tsx
    ProgressBar.tsx
  /features
    level1/
      engine.ts (drill generation, progression)
      units.ts (unit definitions & gating)
    level2/
      engine.ts (run logic, timers, scoring)
      words.ts (bundled lists)
  /state
    settings.ts
    progress.ts
    history.ts
  /utils
    metrics.ts (WPM, accuracy, latency)
    keyboard.ts (key normalization, caps lock detection)
    storage.ts (localStorage wrapper, migration)
  App.tsx
  main.tsx
```

**State Machines (sketch):**
- **Level 1:** `idle → countdown → active → summary` (+ `paused`)
- **Level 2:** `idle → countdown → active → summary` (+ `paused`)

**Performance:**
- Use a single `requestAnimationFrame` timer to update UI; track timestamps per keystroke.
- Avoid re-render on every keypress by appending to a ring buffer and using refs.

**Security & Privacy:**
- No network calls by default; all data stays local.
- CSP-friendly (no inline scripts where possible).

**Accessibility (A11y):**
- Semantic labels, ARIA roles for interactive elements.
- High contrast option and color-blind-safe palettes.
- Keyboard-only navigation (Tab/Enter/Escape).
- Screen-reader hints for errors and progress.

**Internationalization:**
- English only in v1; structure strings for future i18n.

---

## 11) Algorithms & Details

**Level 1 Drill Generation:**
- Each unit exposes a set of target letters.
- Create sequences with configurable length and spacing:
  - `single`: repeat letter with spaces → `a a a a a`
  - `pair`: alternate `a s a s …`
  - `mixed`: weighted random focusing on weak letters
- Adaptive weighting: letter weight ∝ recent error rate (decay with half-life of 3 drills).

**Error Tracking:**
- **Corrected error:** user typed wrong char then backspaced and corrected before advancing.
- **Uncorrected error:** user advanced with mismatch (counts in net WPM penalty).

**Consistency Score (Level 2 summary):**
- Inverse of the coefficient of variation (std/mean) of per-word latencies, scaled 0–100.

**Unlock Logic:**
- Store per-unit best stats; if thresholds met in any run, mark unit as unlocked.

---

## 12) Acceptance Criteria (high level)

1. **Level 1 basics:**
   - Can run a home-row drill, capture keystrokes, show target highlights, compute WPM/accuracy.
   - Unlock next unit upon meeting thresholds; otherwise offer focused retry.
2. **Level 2 basics:**
   - Can start a 60s run with Core 1k word list, compute raw/net WPM and accuracy.
   - Summary modal shows error heatmap by character and per-word latency mini-histogram.
3. **Persistence:**
   - Settings, progress, and last 200 sessions persist and reload correctly.
4. **A11y & Visuals:**
   - Keyboard highlights correct keys; color-blind theme available.
   - App usable with keyboard-only navigation.
5. **No external network required.**

---

## 13) Test Plan (outline)

**Unit Tests (Vitest):**
- `metrics.ts`: rawWPM, netWPM, accuracy calculations.
- `keyboard.ts`: normalization, Caps Lock detection.
- `engine.ts` (both levels): sequence generation, unlock logic, adaptive weighting.

**E2E (Playwright):**
- Level 1 home-row drill from countdown to summary; unlock check.
- Level 2 60s run; verify net WPM and accuracy display; paste disabled.
- Settings persistence across reloads.

**Accessibility Checks:**
- Axe automated checks pass on main screens.

---

## 14) Nice-to-Have (post‑v1)

- PWA install & offline assets.
- Cloud profile & optional leaderboard.
- Alternate layouts (Dvorak/Colemak), regional keyboards.
- Per-finger heatmaps; webcam posture tips (opt-in).
- Coach mode with spaced-repetition across units.
- Export/import local progress (JSON).

---

## 15) Deliverables

- Source code as a Vite React + TS project.
- Embedded word lists (200/1k/5k).
- Build scripts and README with run/test instructions.
- Automated tests outlined above.

---

## 16) License & Attribution

- Include a permissive license (MIT recommended).
- Word lists sourced from public domain or created for the project.
