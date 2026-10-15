# Keep stock accounting separate from live balls

The existing rules treated every physical drain as the end of a numbered ball. Multiball requires independent physical balls under one stock: only loss of the last live ball may bank bonus or consume that stock. Each ball therefore has independent contact, trail, lane and stillness state, while cabinet tilt, bonus and mission progression remain shared. The original `ball` fixture seam addresses the first live ball; rendering observes all live balls.

A real dock entry, rather than a score counter alone, captures the first ball and serves another. A second made dock shot releases two physically simulated trajectories. This keeps table navigation and flipper timing central without adding an external physics dependency or replacing the existing rescue objective. Current high-score persistence contains no active game, so no runtime save migration is needed.
