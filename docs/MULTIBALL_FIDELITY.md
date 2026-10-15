# Dock lock and multiball — focused correction

2026-10-15. Audited repository `2026-10-12/task-2/kata-inspired-by-full-tilt-pinball-codex-dot`, clean at baseline `dbd8de529bc2148a46a948374e08e6242ad14548`. Preview PID 6138 at http://localhost:5212 preserved. No new dependencies, assets, commits or pushes.

## Research and accepted contract

Read the [original Maxis Full Tilt help transcription](https://www.scribd.com/document/725644308/Help-Full-Tilt-Pinball-v1-1) before planning. This is mirrored primary documentation; the hosting site's AI summary was excluded. Its original body describes pull/release launching, timed flipper control, limited nudging, and multiball ball control. Dragon's Keep distinguishes a target-lit tower lock, kickouts, two-ball Gargoyle play and three-ball tower play, with separate jackpot shots. These support the defining lock/multiple-live-ball/physical-award skill; Midnight Harbour uses original geometry, smaller scores and its own bounded two-shot rule. The preservation repository link was unavailable, so no new claim relies on its unread contents.

The user delegates recommended Grill with Docs and Implement choices. Existing public seams are Rules transitions, Simulation inputs/advance and isolated ball fixtures. No fixture or direct rule call is browser evidence.

1. Mark all three lock buoys. The left dock sink lights. A real ball entering it locks for 2,500 total shot points, and a replacement serve uses the same numbered stock.
2. Make the dock again with the newly served ball. Both the held ball and current ball kick into the field with different upward trajectories. Their positions, contact entries, trails, stillness recovery and lane entries are independent; equal-ball contact is resolved physically.
3. While two balls are live, the central lighthouse lights a 10,000 jackpot. It awards once in that multiball; later beacon hits retain normal scoring. Original rescue progression can continue independently.
4. One multiball drain leaves the survivor and accumulated bonus in play, with no stock loss. The final drain invokes the stock/bonus transition once, including simultaneous drains. A normal stock-ending drain resets the dock prerequisite; the five-second ball save retains its existing behavior. Three stocks, pause, tilt, rematch and saved records remain intact.

## Source evidence and checks

- New focused fixtures cover an unlit sink/kickout, lit lock and replacement serve, second-shot release, independent contact scoring/trails, pause/reset, one-ball continuation, simultaneous final drains, and physical lighthouse jackpot without duplicate awards.
- The ordinary-control search uses **only** fresh Simulation creation, launcher strength, left/right flipper inputs and time. It never changes ball coordinates, rules or mission state. Seed 51015, attempt 2 reached a locked ball, two live balls and a jackpot at **69.4 simulation seconds**, stock 3, score **55,500**, with two balls still live. [Exact input/event trace](qa/multiball-control-trace.json).
- Strict typecheck and the full **26/26 tests** pass (21 retained plus five new feature cases), including the ordinary-control rescue solver and the new lock/multiball/jackpot solver. The original checkout strict typecheck, all 26 tests and production build passed (9 modules, 20.74 kB JS; Vite 2.38 s). Independent review passed with no remaining blockers. Native browser acceptance passed after the renewed unlock and exclusive handoff, as recorded below. The later native acceptance is recorded below; no preview restart was needed.

The first ordinary-control search reached lock and multiball but failed to reach the jackpot. The original down-table kickout gave too little playable field time; the revised physical kickouts return both balls upward into open lanes. The same fixed search then reached the jackpot. This is simulation reachability, not browser E2E.

## Normal-input route

1. Start a fresh shift; hold/release Space to launch, use A/D or named flipper buttons. Mark all three diamond buoys. Watch the dock counter and ring light independently of the rescue route.
2. Shoot the left sink at logical table `(110,440)`. Observe a held ball in its hole, `DOCK LOCKED`, ready launcher and unchanged stock number. Serve again with Space; shoot the sink a second time.
3. Verify two separate moving balls/trails and `2 LIVE`. Continue controlling both flippers. Shoot the lighthouse at `(258,323)` while its jackpot label is on; observe the jackpot count and one 10,000 award.
4. Let one ball drain; verify a single surviving ball continues without advancing the stock or paying bonus. Let the final ball drain, then continue through stock 3 and rematch. Confirm tilt/pause/reduced-motion still work and old saved records remain listed.

Shot timing changes with launcher power, flipper timing and prior collisions. The trace is source-only deterministic simulation input evidence, not a guaranteed manual script or browser acceptance. Browser control is exclusive and parent-owned.

## Limits

One original table and one dock feature, with circle/capsule arcade collision and existing assisted flipper impulses. No original Full Tilt table, large ramp network, mission menu, three-way nudge, extra transport, exact original scores/timing or hardware/mobile claims. A two-ball mode is the bounded correction; broader Full Tilt table fidelity remains partial.

## Native browser acceptance passed — 2026-10-15

The earlier 17:08 UTC locked-Mac inventory is historical. After the user confirmed unlock and the parent explicitly regranted exclusive access at 17:30 UTC, native inventory succeeded. The worker used only its new tab `222225564` at `http://fidelity-gta-worker-20261015.localhost:5212/`. Existing user/root/Witness tabs, original save origins and preview listeners were preserved. No game-state/model/DOM event injection or clock manipulation was used.

Native Space launcher and A/D flipper rhythm reached a physical held dock ball (6,875 points, stock 1), a replacement serve on the same stock, two visible moving balls/trails, and one lighthouse jackpot alongside a rescue. The shift completed at 65,800 points; Play again reset play and browser Reload retained the 65,800 record.

Fixed 2D full-table view and normal page scroll; native launcher, flippers, pause/resume and rematch were exercised. Single-survivor drain timing was not separately captured; a tilt state and reduced-motion/touch/audio behavior were not verified. These limits do not change the observed lock → two-live-ball → jackpot → record/reload loop. No source fix, test/build rerun or preview restart was required by native QA.

See [detailed local acceptance](LOCAL_ACCEPTANCE_2026-10-15.md) and the [screenshots and acceptance record](LOCAL_ACCEPTANCE_2026-10-15.md). Simulated guides and historical fixtures remain source-only evidence; the native results above are a separate observed pass. After all four projects, the worker closed only its own QA tab and explicitly released native ownership.
