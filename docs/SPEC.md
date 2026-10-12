# Midnight Harbour specification
Original artwork, table geometry, sounds and rules; a tribute to the appeal of desktop pinball, with no reproduced Full Tilt assets.

## Autonomous decision tree
1. Scope → one finished harbour table; canvas art, local only, private repository.
2. Physics → 120 Hz fixed step, four collision substeps, bounded speed, circular ball/capsule walls and moving flippers. Approximate arcade physics, not a rigid-body simulator.
3. Rules → three balls; three unique buoy hits unlock five bumper hits; then beacon completes rescue for 15,000 points and increases bonus multiplier up to 5. Rescue resets its route. Targets 500, bumpers 150, sling 75, return lane 250. Bonus grows with valid contacts, paid once on drain; tilt forfeits bonus.
4. Controls → A/left arrow, D/right arrow; hold/release Space to launch; N/up arrow nudge; P pause; R rematch. Named touch buttons. Focus loss auto-pauses and releases all inputs. Resuming requires explicit action.
5. Recovery → first 5 seconds ball save, bounded collision speed, stationary-ball recovery after 6 seconds. Tilt after three nudges within 4 seconds; no nudge can be spammed faster than 350ms.
6. Presentation → midnight navy, oxidized brass, cyan phosphor and coral highlights; readable status and mission panel. Reduced motion disables trails and shake. Optional synthesized audio, muted by default.
7. Persistence → local top five integer scores, reject malformed/nonfinite/out-of-range data; storage failures do not interrupt play.

## Authorized test seams
Public rules state transitions and event dispatch catch prerequisites, scoring, bonus, inventory, tilt and duplicate events. Public simulation stepping and explicit fixture ball initial conditions catch integration, launch, moving-flipper impulses, bounds and recovery; fixtures are not browser gameplay claims. Persistence parsing catches invalid saves. Browser ordinary visible controls verify the integrated game.

## Acceptance
Page works in portrait and desktop; launcher, flippers, pause, rematch and mission are visibly understandable. No hidden-state mutation is used to claim browser achievements. Physically reachable mission objects are validated with trajectory fixtures and attempted in real gameplay. CI tests, typecheck, build and audit must pass for final SHA. Browser and audio limitations are documented candidly.
