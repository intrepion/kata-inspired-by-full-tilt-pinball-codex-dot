# Full Tilt multiball — native browser acceptance

2026-10-15 actual Mac Chrome/intrepion, dedicated worker tab222225564 at isolated http://fidelity-gta-worker-20261015.localhost:5212/. Final reviewed26-test/typecheck/build candidate. Native CUA scroll/launcher/flipper/pause/rematch input only. Ordinary source-simulation guide informed the rhythm; no game-state/model/DOM injection, altered clock, fixture position or direct rule invocation. Other tabs/save origins/listenerPID6138 preserved.

Camera: fixed full-table2D pinball view, normal page scroll exposes dock/lighthouse/flippers together. Controls: Space held250ms/release for launcher; queued native A+D200ms and neutral Shift200ms alternating; P pause/resume; Play again and normal browser reload. Actual timing diverged from the source trace; results below were observed, not inferred.

First live shift: Space250ms plus20flipper cycles reached physically held ball in left dock, DOCK LOCKED / SHOOT DOCK AGAIN, READY TO SAIL, score6875,stock1. Pause/Resume showed the white held ball in the dock. Second Space250ms plus6cycles reached BALL01/03 ·2LIVE and MULTIBALL ·LIGHTHOUSE JACKPOT,score8525. Resume plus3cycles: two separate balls/trails were visibly present (one near upper rail, one near right flipper), stock1/2LIVE, MULTIBALL ·KEEP BOTH ALIVE ·1JACKPOT, rescue1,score35150–35225 as live frames advanced. The lighthouse physical shot awarded the jackpot and existing rescue progressed independently.

Both balls later drained; observed next ready state BALL02/03,score50550,bonus0,1JACKPOT. Remaining stocks served normally; BALL03/03 followed, then SHIFT COMPLETE /Safe harbour,65800points,1rescue,record65800. Play again reset score/stock/lock; normal browserReload retained LOCAL HARBOUR RECORDS65800. A subsequent rematch remained playable and was paused before navigation away. Nudge keys were attempted near final drain, but a tilt state was not observed and is not claimed.

Evidence: dock-locked.jpg (held ball visible),two-live-paused.jpg (2LIVE/jackpot-lit labels),jackpot-and-final-drain.jpg (1JACKPOT persists into stock2),shift-complete.jpg,record-reload.jpg. The unpaused two-ball frame was also directly observed in the CUA tool output; the later saved jackpot image already shows stock2, so its filename does not claim two live balls. Single-survivor timing was not separately captured; per-ball continuation/simultaneous-drain edge cases remain source-test evidence.

Focused native lock→replacement serve→two physical live balls→jackpot→shift record/reload passed. No source fix, suite/build rerun or preview restart required. Limits: one original compact table, approximate arcade collision/assist, no original Full Tilt table network or exact commercial tuning; no touch/audio/reduced-motion hardware claims.

## Included native captures

- [dock-locked.jpg](qa/fidelity-2026-10-15/dock-locked.jpg)
- [two-live-paused.jpg](qa/fidelity-2026-10-15/two-live-paused.jpg)
- [jackpot-and-final-drain.jpg](qa/fidelity-2026-10-15/jackpot-and-final-drain.jpg)
- [shift-complete.jpg](qa/fidelity-2026-10-15/shift-complete.jpg)
- [record-reload.jpg](qa/fidelity-2026-10-15/record-reload.jpg)
