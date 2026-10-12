# QA evidence — 2026-10-12

## Automated deterministic verification
21 tests across rules, physics, input and ordinary-control reachability pass. Covered: fixed-step equivalence across frame grouping; launch impulse into the table; fast side-rail collision without tunneling; moving-flipper upward impulse; target open approaches; bounded speed; stationary recovery trigger; contact-entry scoring and debounce; simultaneous distinct events; rescue prerequisites/reset/award; bonus paid once; ball save/inventory/game-over; tilt and nudge decay; pause freeze including direct drain; rematch effect reset; physical-key modifier changes; focus changes during holds; simultaneous keys; input cancellation registry; malformed saves and top-five sorting.

Tests inject initial ball positions for isolated collision scenarios. These are deterministic fixtures, not browser gameplay achievements. The reachability test uses only `launch`, left/right flipper inputs and simulation time on fresh games, seeded at 913, and completes a rescue. It never injects a ball position or directly advances mission state. This demonstrates every objective can be reached using ordinary controls.

Red/green evidence: rules test initially failed with missing module, passed after implementation; physics launch test initially failed with missing module, passed after implementation. Browser rematch exposed a negative effect-radius exception after clock reset; reset now clears effects and rendering clamps pulse values. Regression passes.

## Actual supported local Chrome gameplay
Browser extension connected to the user's local Chrome. Production page loaded at http://127.0.0.1:5212. UI actions used visible named controls and physical keyboard events. No hidden game-state mutation, score injection or mission injection was used.

- First full game: launched all three balls, operated flippers, scored bumper/target/sling events, observed natural drains and game-over at **12,275**. All three buoys marked and beacon charge reached **5/5**, with visible “STRIKE THE LIGHTHOUSE”. Rescue was not completed before drain.
- After fixes: second full three-ball game ended at **17,300**, using keyboard and on-screen launcher/flipper controls. Saved record displayed. Rematch returned to ball 1, score zero and route 0/3; no rendering exception.
- Records persisted across page reload and showed both completed scores.
- Focused launcher accepted Space; focused flippers accepted Space/Enter. Pointer buttons also launched and operated both flippers.
- Explicit pause displayed overlay; Resume resumed play.
- Browser automation ordinarily emulates continued focus. Temporarily disabling that emulation with the supported developer capability produced the genuine focus-loss pause overlay and released controls. Restored the automation setting afterward; explicitly resumed. No OS unlock or restriction bypass.
- A subsequent short launch drained during the five-second save window; “BALL SAVED” retained ball 1 and bonus.
- Three visible N key presses produced **TILT**, disabled-flipper/bonus-lost instruction. R reset the tilted game.
- 390×844 portrait viewport displayed the table, objective, bonus bank, saved records, named buttons and instructions without horizontal overflow. Temporary viewport override reset afterward.
- Sound toggle labels changed from Enable sound to Mute sound and back. **Audio was not listened to**; speaker output/quality and physical mobile multitouch are unverified.

Screenshots: `game-over.jpg` (initial result), `final-game-over.jpg` (17,300 final-code result), `portrait.jpg`, `interruption.jpg`, `tilt.jpg`, `table.jpg` (final ready table). Earlier screenshot appearance may precede the final mobile visibility refinement; final portrait evidence is refreshed.

## Independent review
Standards and specification reviewed by separate sub-agents using Matt Pocock code-review. Findings fixed: keyboard activation on focused controls; modifier-stable release; launcher capture cancellation; focus changes during held keys; simultaneous-key preservation; paused drain guard; portrait records and bonus visibility. Standards final recheck reports no serious correctness or documented-standard violation. Spec review confirmed initial fixes; its focus-change finding is covered by the held-key fix and regression tests. Input registry tests are unit verification, not DOM pointer-cancellation evidence. Unexpected pointercapture cancellation and real touchscreen multitouch were not exercised on hardware.

## Delivery checks and honest limits
Strict TypeScript check and production build pass. Initial dependencies had audit findings; patched registry releases produce **zero vulnerabilities**. Production output has no runtime network assets or fonts. Runtime is approximate arcade physics, including assisted flipper impulses and stationary recovery. Manual Chrome gameplay reached every buoy and full beacon charge; full rescue completion is proven by automated ordinary-input trajectories, **not achieved in manual Chrome QA**. Reduced-motion trail suppression is implemented; physical reduced-motion OS setting and non-Chrome browsers were not tested.

The server is a detached session-only child with no launch agent, login task or boot persistence, bound to 127.0.0.1:5212. Earlier ports 5173–5211 were untouched. HTTP page and every bundled JS/CSS asset checked independently. CI and exact final SHA are reported in delivery output rather than amended into this file after the final commit.
