import { it, expect } from "vitest";
import { Simulation } from "../src/physics";
it("ordinary launcher and flipper controls can complete every rescue prerequisite", () => {
  const reached = new Set<number>();
  let rescue = false;
  let seed = 913;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let game = 0; game < 120 && !rescue; game++) {
    const s = new Simulation();
    for (let tick = 0; tick < 120 * 60 && s.rules.phase !== "over"; tick++) {
      if (s.rules.phase === "ready") s.launch(random());
      if (tick % 12 === 0) {
        s.left = random() > 0.5;
        s.right = random() > 0.5;
      }
      s.advance(1 / 120);
      for (const id of s.rules.buoys) reached.add(id);
      if (s.rules.rescues > 0) {
        rescue = true;
        break;
      }
    }
  }
  expect([...reached].sort()).toEqual([0, 1, 2]);
  expect(rescue).toBe(true);
});
