import { it, expect } from "vitest";
import { Simulation } from "../src/physics";
it("launcher drives the ball onto the physical playfield with bounded speed", () => {
  const s = new Simulation();
  s.launch(1);
  for (let i = 0; i < 240; i++) s.advance(1 / 120);
  expect(s.ball.x).toBeLessThan(440);
  expect(Math.hypot(s.ball.vx, s.ball.vy)).toBeLessThanOrEqual(1250);
});
import { circles } from "../src/physics";
it("fixed stepping produces the same trajectory for grouped frames", () => {
  const a = new Simulation(),
    b = new Simulation();
  a.launch(0.5);
  b.launch(0.5);
  for (let i = 0; i < 60; i++) a.advance(1 / 60);
  for (let i = 0; i < 120; i++) b.advance(1 / 120);
  expect(a.ball.x).toBeCloseTo(b.ball.x, 8);
  expect(a.ball.y).toBeCloseTo(b.ball.y, 8);
});
it("fast impacts do not tunnel through the side rail", () => {
  const s = new Simulation();
  s.launch(1);
  s.ball = { x: 60, y: 450, vx: -1250, vy: 0 };
  s.advance(0.1);
  expect(s.ball.x).toBeGreaterThan(49);
  expect(s.ball.vx).toBeGreaterThan(0);
});
it("moving flipper delivers an upward impulse and pause releases it", () => {
  const s = new Simulation();
  s.launch(1);
  s.ball = { x: 220, y: 715, vx: 0, vy: 100 };
  s.left = true;
  s.advance(0.05);
  expect(s.ball.vy).toBeLessThan(-400);
  s.pause(true);
  const b = { ...s.ball };
  s.advance(0.1);
  expect(s.ball).toEqual(b);
  expect(s.left).toBe(false);
  s.pause(false);
  s.advance(0.02);
  expect(s.ball.y).not.toBe(b.y);
});
it("all objective targets have an open physical approach and valid contact", () => {
  for (const c of circles.filter(
    (c) => c.kind === "buoy" || c.kind === "beacon",
  )) {
    const s = new Simulation();
    s.launch(1);
    s.ball = { x: c.x, y: c.y + 70, vx: 0, vy: -450 };
    for (let i = 0; i < 20; i++) s.advance(1 / 120);
    expect(s.rules.score).toBeGreaterThan(0);
    if (c.kind === "buoy") expect(s.rules.buoys.has(c.id)).toBe(true);
  }
});
it("resting bumper contact is scored only on contact entry", () => {
  const s = new Simulation();
  s.launch(1);
  s.ball = { x: 190, y: 235, vx: 0, vy: 0 };
  s.advance(1 / 120);
  expect(s.rules.score).toBe(150);
  for (let i = 0; i < 12; i++) s.advance(1 / 120);
  expect(s.rules.score).toBe(150);
});
it("drain inventory and restart cancel old trajectory", () => {
  const s = new Simulation();
  s.launch(1);
  s.rules.tick(6);
  s.ball = { x: 260, y: 840, vx: 0, vy: 400 };
  s.advance(0.1);
  expect(s.rules.ballNumber).toBe(2);
  expect(s.rules.phase).toBe("ready");
  s.reset();
  expect(s.ball).toEqual({ x: 470, y: 780, vx: 0, vy: 0 });
  expect(s.rules.ballNumber).toBe(1);
});
it("recovers a trapped stationary ball and caps runaway velocity", () => {
  const s = new Simulation();
  s.launch(1);
  s.ball = { x: 470, y: 790, vx: 0, vy: 10000 };
  s.advance(1 / 120);
  expect(Math.hypot(s.ball.vx, s.ball.vy)).toBeLessThanOrEqual(1250);
  const t = new Simulation();
  t.launch(1);
  for (let i = 0; i < 800; i++) {
    t.ball = { x: 258, y: 500, vx: 0, vy: 0 };
    t.advance(1 / 120);
  }
  expect(t.rules.message).toBe("Harbour current · ball freed");
});

it("rematch clears old hit effects when the game clock restarts", () => {
  const s = new Simulation();
  s.launch(1);
  s.ball = { x: 190, y: 235, vx: 0, vy: 0 };
  s.advance(0.02);
  expect(s.pulses.size).toBeGreaterThan(0);
  s.reset();
  expect(s.pulses.size).toBe(0);
  expect(s.angles).toEqual([0.48, Math.PI - 0.48]);
});
