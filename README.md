# Midnight Harbour

An original browser pinball table about guiding a rescue vessel through the night. Inspired by the tactile appeal of classic desktop pinball, including Full Tilt! Pinball; no original game's artwork, layouts, rules, branding, music or code is copied.

## Play locally

Requires Node 24 and npm. In this directory:

```sh
npm ci
npm run build
npm run preview
```

Open **http://127.0.0.1:5212**. The server binds only to loopback. `--strictPort` protects earlier servers. No boot or login service is installed.

Restart the production server, from any directory:

```sh
cd /Users/intrepion/Documents/Codex/2026-10-12/task-2/kata-inspired-by-full-tilt-pinball-codex-dot && npm run preview
```

If port 5212 is already serving this game, use that running instance. Session log: `/tmp/midnight-harbour-5212.log`.

## Controls

- A / Left arrow: left flipper. D / Right arrow: right flipper.
- Hold Space and release: launch. Longer hold increases power.
- N / Up arrow: nudge. Three nudges in four seconds tilt; flippers disable and the current bonus is forfeited.
- P: pause/resume. R: fresh three-ball game.
- All actions have named on-screen buttons. Focused flippers and launcher respond to Space or Enter.
- Switching windows pauses and releases held controls. Explicitly resume to continue.
- Sound is synthesized from original oscillator tones, muted by default.

## Rules

Hit all three diamond buoys (500 each), then five bumper hits (150 each), then the central beacon (300) for a 15,000 rescue award. Each rescue raises the bonus multiplier up to ×5 and resets the route. Return lanes award 250; slingshots 75. Each scored contact banks 100 bonus points, paid once on drain with the current multiplier. Route progress survives drains. Three balls per game; a five-second launch ball save returns the same ball. Tilt defeats the save and forfeits bonus. Local top-five scores are validated before use; storage failures allow play to continue.

## Physics and quality

120 Hz deterministic integration with four contact substeps, circle/capsule collision and moving-flipper surface velocity; speed capped at 1,250 table units/second. This is deliberately approximate arcade physics, with forgiving flipper impulses and an automatic current to free a stationary ball after six seconds. No guaranteed reproduction of a real machine.

`npm test`, `npm run typecheck`, `npm run build`, and `npm audit --audit-level=moderate` match CI. See [specification](docs/SPEC.md), [glossary](GLOSSARY.md), [decision](docs/adr/0001-simulation-boundary.md), and [QA report](docs/qa/REPORT.md). No external runtime dependencies, trackers, fonts or assets.
