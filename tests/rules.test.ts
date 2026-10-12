import { describe, it, expect } from "vitest";
import { Rules } from "../src/rules";
describe("three-ball game", () => {
  it("pays bonus once and finishes after exactly three drains", () => {
    const r = new Rules();
    r.start();
    r.launch();
    r.hit("bumper", 0);
    r.tick(6);
    r.drain();
    expect(r.score).toBe(250);
    r.drain();
    expect(r.score).toBe(250);
    r.launch();
    r.tick(6);
    r.drain();
    r.launch();
    r.tick(6);
    r.drain();
    expect(r.phase).toBe("over");
    expect(r.ballNumber).toBe(3);
  });
});
import { parseScores } from "../src/rules";
it("requires route, then charge, then beacon and can rescue again", () => {
  const r = new Rules();
  r.launch();
  r.hit("beacon", 0);
  for (let i = 0; i < 5; i++) {
    r.tick(0.2);
    r.hit("bumper", 0);
  }
  expect(r.rescues).toBe(0);
  expect(r.charge).toBe(0);
  for (let i = 0; i < 3; i++) r.hit("buoy", i);
  r.tick(0.2);
  r.hit("buoy", 0);
  expect(r.buoys.size).toBe(3);
  for (let i = 0; i < 5; i++) {
    r.tick(0.2);
    r.hit("bumper", 0);
  }
  expect(r.charge).toBe(5);
  const before = r.score;
  r.hit("beacon", 0);
  expect(r.score - before).toBe(15300);
  expect(r.multiplier).toBe(2);
  expect(r.buoys.size).toBe(0);
  expect(r.charge).toBe(0);
  expect(r.rescues).toBe(1);
});
it("debounces duplicate contacts while allowing simultaneous distinct hits", () => {
  const r = new Rules();
  r.launch();
  r.hit("buoy", 0);
  r.hit("buoy", 0);
  r.hit("buoy", 1);
  expect(r.score).toBe(1000);
  r.tick(0.2);
  r.hit("buoy", 0);
  expect(r.score).toBe(1500);
});
it("ball save preserves inventory and pending bonus, tilt forfeits bonus", () => {
  const r = new Rules();
  r.launch();
  r.hit("bumper", 0);
  expect(r.drain()).toBe("saved");
  expect(r.ballNumber).toBe(1);
  expect(r.bonus).toBe(100);
  r.launch();
  r.nudge();
  r.tick(0.36);
  r.nudge();
  r.tick(0.36);
  r.nudge();
  expect(r.tilted).toBe(true);
  const score = r.score;
  r.hit("bumper", 1);
  r.drain();
  expect(r.score).toBe(score);
  expect(r.ballNumber).toBe(2);
  expect(r.bonus).toBe(0);
  expect(r.tilted).toBe(false);
});
it("pause freezes clock and transitions; spaced nudges decay; restart clears progress", () => {
  const r = new Rules();
  r.launch();
  r.paused = true;
  r.tick(20);
  expect(r.time).toBe(0);
  expect(r.hit("buoy", 0)).toBe(false);
  expect(r.nudge()).toBe(false);
  r.paused = false;
  r.nudge();
  r.tick(5);
  r.nudge();
  expect(r.warning).toBe(1);
  expect(r.tilted).toBe(false);
  r.start();
  expect(r.score).toBe(0);
  expect(r.phase).toBe("ready");
  expect(r.warning).toBe(0);
});
it("validates and limits high scores", () => {
  expect(parseScores('[5,100,50,-2,1.5,null,"99",1e20,80,70]')).toEqual([
    100, 80, 70, 50, 5,
  ]);
  expect(parseScores('{"score":55}')).toEqual([]);
  expect(parseScores("broken")).toEqual([]);
});
it("paused drain cannot award bonus or consume a ball", () => {
  const r = new Rules();
  r.launch();
  r.hit("bumper", 0);
  r.tick(6);
  r.paused = true;
  expect(r.drain()).toBe("ignored");
  expect(r.ballNumber).toBe(1);
  expect(r.score).toBe(150);
  expect(r.bonus).toBe(100);
});
