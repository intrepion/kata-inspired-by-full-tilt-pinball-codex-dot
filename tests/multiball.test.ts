import { expect, it } from "vitest";
import { Simulation, dock } from "../src/physics";

function shootDock(sim: Simulation) {
  sim.ball = { x: dock.x, y: dock.y + 35, vx: 0, vy: -300 };
  sim.advance(0.08);
}
function multiball(): Simulation {
  const sim = new Simulation();
  sim.launch(1);
  for (let id = 0; id < 3; id++) sim.rules.hit("buoy", id);
  expect(sim.rules.lockMode).toBe("lit");
  shootDock(sim);
  expect(sim.rules.lockMode).toBe("locked");
  expect(sim.rules.phase).toBe("ready");
  expect(sim.rules.ballNumber).toBe(1);
  sim.launch(1);
  shootDock(sim);
  expect(sim.rules.lockMode).toBe("multiball");
  expect(sim.balls).toHaveLength(2);
  return sim;
}

it("a sink kickout stays single-ball until the three-buoy prerequisite, then locks and releases two balls", () => {
  const sim = new Simulation();
  sim.launch(1);
  shootDock(sim);
  expect(sim.rules.lockMode).toBe("unlit");
  expect(sim.balls).toHaveLength(1);
  const game = multiball();
  game.pause(true);
  const before = game.balls.map((ball) => ({ ...ball }));
  game.advance(0.1);
  expect(game.balls).toEqual(before);
  game.reset();
  expect(game.balls).toHaveLength(1);
  expect(game.rules.lockMode).toBe("unlit");
});

it("two simultaneous bumper entries score independently and retain separate trails", () => {
  const sim = multiball(),
    before = sim.rules.score;
  for (const ball of sim.balls)
    Object.assign(ball, { x: 190, y: 235, vx: 0, vy: 0 });
  sim.advance(1 / 120);
  expect(sim.rules.score - before).toBe(300);
  expect(sim.trailFor(sim.balls[0])).not.toBe(sim.trailFor(sim.balls[1]));
  expect(sim.trailFor(sim.balls[0]).length).toBeGreaterThan(0);
});

it("one multiball drain retains live play and the final simultaneous drain spends one stock", () => {
  const sim = multiball();
  sim.rules.tick(6);
  Object.assign(sim.balls[0], { x: 260, y: 850, vx: 0, vy: 300 });
  Object.assign(sim.balls[1], { x: 360, y: 480, vx: 0, vy: 0 });
  const score = sim.rules.score,
    bonus = sim.rules.bonus;
  sim.advance(1 / 120);
  expect(sim.balls).toHaveLength(1);
  expect(sim.rules.phase).toBe("playing");
  expect(sim.rules.ballNumber).toBe(1);
  expect(sim.rules.score).toBe(score);
  expect(sim.rules.bonus).toBe(bonus);
  expect(sim.rules.lockMode).toBe("unlit");
  Object.assign(sim.ball, { x: 260, y: 850, vx: 0, vy: 300 });
  sim.advance(1 / 120);
  expect(sim.rules.ballNumber).toBe(2);
  expect(sim.rules.phase).toBe("ready");

  const both = multiball();
  both.rules.tick(6);
  const banked = both.rules.score + both.rules.bonus * both.rules.multiplier;
  both.balls.forEach((ball) =>
    Object.assign(ball, { x: 260, y: 850, vx: 0, vy: 300 }),
  );
  both.advance(0.1);
  expect(both.rules.ballNumber).toBe(2);
  expect(both.rules.score).toBe(banked);
  expect(both.rules.bonus).toBe(0);
  expect(both.balls).toHaveLength(1);
});

it("lights a physical lighthouse jackpot once per multiball and cannot double-award contact", () => {
  const sim = multiball();
  Object.assign(sim.balls[0], { x: 258, y: 350, vx: 0, vy: -300 });
  Object.assign(sim.balls[1], { x: 360, y: 480, vx: 0, vy: 0 });
  sim.advance(0.05);
  expect(sim.rules.jackpots).toBe(1);
  expect(sim.rules.jackpotLit).toBe(false);
  sim.advance(0.1);
  expect(sim.rules.jackpots).toBe(1);
  sim.rules.tick(0.2);
  sim.rules.hit("beacon", 0, 99);
  expect(sim.rules.jackpots).toBe(1);
});

it("ordinary launcher and flipper trajectories reach a lock, multiball and jackpot without fixture injection", () => {
  let seed = 51015,
    locked = false,
    released = false,
    jackpot = false;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let game = 0; game < 180 && !jackpot; game++) {
    const sim = new Simulation();
    for (let tick = 0; tick < 120 * 90 && sim.rules.phase !== "over"; tick++) {
      if (sim.rules.phase === "ready") sim.launch(random());
      if (tick % 12 === 0) {
        sim.left = random() > 0.5;
        sim.right = random() > 0.5;
      }
      sim.advance(1 / 120);
      locked ||= sim.rules.lockMode === "locked";
      released ||= sim.rules.multiballs > 0;
      jackpot ||= sim.rules.jackpots > 0;
      if (jackpot) break;
    }
  }
  expect({ locked, released, jackpot }).toEqual({
    locked: true,
    released: true,
    jackpot: true,
  });
}, 30000);
