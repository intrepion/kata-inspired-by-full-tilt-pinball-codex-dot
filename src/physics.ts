import { Rules, type Hit } from "./rules";
export type Ball = { x: number; y: number; vx: number; vy: number };
export type Wall = {
  a: [number, number];
  b: [number, number];
  kind?: Hit;
  id?: number;
};
export const walls: Wall[] = [
  { a: [35, 160], b: [60, 80] },
  { a: [60, 80], b: [160, 42] },
  { a: [160, 42], b: [365, 42] },
  { a: [365, 42], b: [465, 85] },
  { a: [465, 85], b: [490, 150] },
  { a: [35, 160], b: [35, 610] },
  { a: [490, 150], b: [490, 825] },
  { a: [450, 175], b: [450, 825] },
  { a: [35, 610], b: [85, 675] },
  { a: [85, 675], b: [115, 760] },
  { a: [440, 340], b: [440, 610] },
  { a: [440, 610], b: [420, 670] },
  { a: [420, 670], b: [405, 775] },
  { a: [98, 560], b: [135, 644], kind: "sling", id: 0 },
  { a: [135, 644], b: [180, 675], kind: "sling", id: 0 },
  { a: [180, 675], b: [98, 560], kind: "sling", id: 0 },
  { a: [390, 560], b: [354, 644], kind: "sling", id: 1 },
  { a: [354, 644], b: [310, 675], kind: "sling", id: 1 },
  { a: [310, 675], b: [390, 560], kind: "sling", id: 1 },
  { a: [128, 655], b: [170, 716] },
  { a: [360, 716], b: [402, 655] },
];
export const circles = [
  { x: 190, y: 270, r: 27, kind: "bumper" as Hit, id: 0 },
  { x: 325, y: 270, r: 27, kind: "bumper" as Hit, id: 1 },
  { x: 258, y: 390, r: 29, kind: "bumper" as Hit, id: 2 },
  { x: 83, y: 245, r: 17, kind: "buoy" as Hit, id: 0 },
  { x: 258, y: 130, r: 17, kind: "buoy" as Hit, id: 1 },
  { x: 415, y: 245, r: 17, kind: "buoy" as Hit, id: 2 },
  { x: 258, y: 323, r: 19, kind: "beacon" as Hit, id: 0 },
];
export const dock = { x: 110, y: 440, radius: 23 };
type BallRuntime = {
  id: number;
  still: number;
  inContact: Set<string>;
  contacts: Set<string>;
  laneInside: boolean[];
  trail: [number, number][];
  dockCooldown: number;
};
const parked = (): Ball => ({ x: 470, y: 780, vx: 0, vy: 0 });
export class Simulation {
  rules = new Rules();
  balls: Ball[] = [parked()];
  private ballStates = new WeakMap<Ball, BallRuntime>();
  private nextBallId = 1;
  get ball(): Ball {
    return this.balls[0];
  }
  set ball(value: Ball) {
    const state = this.balls[0] ? this.runtime(this.balls[0]) : undefined;
    this.balls[0] = value;
    if (state) this.ballStates.set(value, state);
  }
  private runtime(ball: Ball): BallRuntime {
    let state = this.ballStates.get(ball);
    if (!state) {
      state = {
        id: this.nextBallId++,
        still: 0,
        inContact: new Set(),
        contacts: new Set(),
        laneInside: [false, false],
        trail: [],
        dockCooldown: 0,
      };
      this.ballStates.set(ball, state);
    }
    return state;
  }
  trailFor(ball: Ball): readonly [number, number][] {
    return this.runtime(ball).trail;
  }
  get trail(): readonly [number, number][] {
    return this.trailFor(this.ball);
  }
  left = false;
  right = false;
  angles = [0.48, Math.PI - 0.48];
  private omega = [0, 0];
  private accumulator = 0;
  pulses = new Map<string, number>();
  onHit: (kind: Hit) => void = () => {};
  reset() {
    this.rules.start();
    this.balls = [parked()];
    this.ballStates = new WeakMap();
    this.nextBallId = 1;
    this.clearInputs();
    this.accumulator = 0;
    this.pulses.clear();
    this.angles = [0.48, Math.PI - 0.48];
  }
  clearInputs() {
    this.left = false;
    this.right = false;
  }
  pause(value: boolean) {
    this.rules.paused = value;
    this.clearInputs();
    this.accumulator = 0;
  }
  launch(power: number) {
    if (!this.rules.launch()) return;
    const strength = Number.isFinite(power)
      ? Math.max(0, Math.min(1, power))
      : 0;
    this.balls = [
      {
        x: 470,
        y: 780,
        vx: 0,
        vy: -(920 + strength * 280),
      },
    ];
  }
  nudge() {
    if (this.rules.nudge() && !this.rules.tilted) {
      for (const ball of this.balls) {
        ball.vx += ball.x < 260 ? 110 : -110;
        ball.vy -= 150;
      }
    }
  }
  advance(seconds: number) {
    if (this.rules.paused) return;
    this.accumulator += Number.isFinite(seconds)
      ? Math.max(0, Math.min(seconds, 0.1))
      : 0;
    while (this.accumulator >= 1 / 120) {
      this.step();
      this.accumulator -= 1 / 120;
    }
  }
  private step() {
    const dt = 1 / 480;
    this.rules.tick(1 / 120);
    for (let k = 0; k < 4; k++) {
      for (let i = 0; i < 2; i++) {
        const target =
          i === 0
            ? this.left && !this.rules.tilted
              ? -0.42
              : 0.48
            : this.right && !this.rules.tilted
              ? Math.PI + 0.42
              : Math.PI - 0.48;
        const old = this.angles[i];
        this.angles[i] += Math.max(-18 * dt, Math.min(18 * dt, target - old));
        this.omega[i] = (this.angles[i] - old) / dt;
      }
      if (this.rules.phase !== "playing") continue;
      const drained = new Set<Ball>();
      for (const b of [...this.balls]) {
        const state = this.runtime(b);
        state.contacts = new Set();
        state.dockCooldown = Math.max(0, state.dockCooldown - dt);
        b.vy += 460 * dt;
        b.vx *= 0.9997;
        b.vy *= 0.9997;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        if (
          !this.rules.tilted &&
          state.dockCooldown === 0 &&
          Math.hypot(b.x - dock.x, b.y - dock.y) < dock.radius
        ) {
          const before = this.rules.lockMode;
          this.score("lock", 0, state.id);
          if (before === "lit" && this.rules.lockMode === "locked") {
            this.balls = [parked()];
            this.clearInputs();
            break;
          }
          b.x = dock.x + 18;
          b.y = dock.y + 40;
          b.vx = 180;
          b.vy = 260;
          state.dockCooldown = 0.9;
          if (before === "locked" && this.rules.lockMode === "multiball") {
            b.vx = 220;
            b.vy = -560;
            const released = {
              x: dock.x - 18,
              y: dock.y + 40,
              vx: -160,
              vy: -520,
            };
            this.runtime(released).dockCooldown = 0.9;
            this.balls.push(released);
          }
        }
        for (const [i, w] of walls.entries())
          this.segment(w, 5, 0, 0, `w${i}`, b, state);
        for (const c of circles) {
          const dx = b.x - c.x,
            dy = b.y - c.y,
            d = Math.hypot(dx, dy),
            rad = c.r + 9;
          if (d < rad) {
            const nx = d ? dx / d : 0,
              ny = d ? dy / d : -1;
            b.x = c.x + nx * (rad + 0.01);
            b.y = c.y + ny * (rad + 0.01);
            const v = b.vx * nx + b.vy * ny;
            if (v < 0) {
              b.vx -= 1.85 * v * nx;
              b.vy -= 1.85 * v * ny;
            }
            const key = `${c.kind}${c.id}`;
            state.contacts.add(key);
            if (!state.inContact.has(key)) {
              b.vx += nx * (c.kind === "bumper" ? 320 : 90);
              b.vy += ny * (c.kind === "bumper" ? 320 : 90);
              this.score(c.kind, c.id, state.id);
            }
          }
        }
        for (let i = 0; i < 2; i++) {
          const px = i ? 350 : 170,
            py = 716,
            a = this.angles[i],
            end: [number, number] = [
              px + 82 * Math.cos(a),
              py + 82 * Math.sin(a),
            ];
          this.segment(
            { a: [px, py], b: end },
            8,
            this.omega[i],
            i,
            `f${i}`,
            b,
            state,
          );
        }
        for (let i = 0; i < 2; i++) {
          const inside =
            b.y > 635 &&
            b.y < 670 &&
            (i === 0 ? b.x > 45 && b.x < 95 : b.x > 407 && b.x < 438);
          if (inside && !state.laneInside[i]) this.score("lane", i, state.id);
          state.laneInside[i] = inside;
        }
        state.inContact = state.contacts;
        this.limitSpeed(b);
        if (b.y > 845) {
          drained.add(b);
          continue;
        }
        if (Math.hypot(b.vx, b.vy) < 40) state.still += dt;
        else state.still = 0;
        if (state.still > 6) {
          b.vx = b.x < 260 ? 150 : -150;
          b.vy = -360;
          this.rules.message = "Harbour current · ball freed";
          state.still = 0;
        }
      }
      if (this.rules.phase !== "playing") continue;
      this.balls = this.balls.filter((ball) => !drained.has(ball));
      for (let i = 0; i < this.balls.length; i++)
        for (let j = i + 1; j < this.balls.length; j++) {
          const a = this.balls[i],
            b = this.balls[j],
            dx = b.x - a.x,
            dy = b.y - a.y,
            distance = Math.hypot(dx, dy);
          if (distance >= 18) continue;
          const nx = distance ? dx / distance : 1,
            ny = distance ? dy / distance : 0;
          const separation = (18 - distance) / 2;
          a.x -= nx * separation;
          a.y -= ny * separation;
          b.x += nx * separation;
          b.y += ny * separation;
          const approach = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
          if (approach < 0) {
            a.vx += approach * 0.9 * nx;
            a.vy += approach * 0.9 * ny;
            b.vx -= approach * 0.9 * nx;
            b.vy -= approach * 0.9 * ny;
          }
        }
      for (const ball of this.balls) this.limitSpeed(ball);
      if (this.balls.length === 0) {
        this.rules.drain();
        this.balls = [parked()];
        this.clearInputs();
        break;
      }
      if (this.balls.length === 1 && this.rules.lockMode === "multiball") {
        this.rules.endMultiball();
        this.rules.message =
          "Multiball ended · one ball remains · mark buoys to light the dock again";
      }
    }
    if (this.rules.phase === "playing") {
      for (const ball of this.balls) {
        const trail = this.runtime(ball).trail;
        trail.push([ball.x, ball.y]);
        if (trail.length > 14) trail.shift();
      }
    } else for (const ball of this.balls) this.runtime(ball).trail = [];
  }
  private limitSpeed(ball: Ball) {
    const speed = Math.hypot(ball.vx, ball.vy);
    if (speed > 1250) {
      ball.vx *= 1250 / speed;
      ball.vy *= 1250 / speed;
    }
  }
  private score(kind: Hit, id: number, ballId: number) {
    if (this.rules.hit(kind, id, ballId)) {
      this.pulses.set(`${kind}${id}`, this.rules.time);
      this.onHit(kind);
    }
  }
  private segment(
    w: Wall,
    r: number,
    omega: number,
    index: number,
    key: string,
    b: Ball,
    state: BallRuntime,
  ) {
    const dx = w.b[0] - w.a[0],
      dy = w.b[1] - w.a[1],
      t = Math.max(
        0,
        Math.min(
          1,
          ((b.x - w.a[0]) * dx + (b.y - w.a[1]) * dy) / (dx * dx + dy * dy),
        ),
      ),
      qx = w.a[0] + t * dx,
      qy = w.a[1] + t * dy,
      ox = b.x - qx,
      oy = b.y - qy,
      d = Math.hypot(ox, oy);
    if (d >= 9 + r) return;
    state.contacts.add(key);
    let nx = d ? ox / d : -dy / Math.hypot(dx, dy),
      ny = d ? oy / d : dx / Math.hypot(dx, dy);
    if (omega && ny > 0) {
      nx = -nx;
      ny = -ny;
    }
    b.x = qx + nx * (9 + r + 0.01);
    b.y = qy + ny * (9 + r + 0.01);
    const svx = -omega * (qy - w.a[1]),
      svy = omega * (qx - w.a[0]),
      v = (b.vx - svx) * nx + (b.vy - svy) * ny;
    if (v < 0) {
      b.vx -= 1.8 * v * nx;
      b.vy -= 1.8 * v * ny;
    }
    if (omega && Math.abs(omega) > 1 && ny < 0) {
      b.vy = Math.min(b.vy, -520 - 280 * t);
      b.vx += (index === 0 ? 1 : -1) * 150 * t;
    }
    if (w.kind && !state.inContact.has(key)) {
      const eventKey = `${w.kind}${w.id}`;
      if (!state.inContact.has(eventKey)) {
        this.score(w.kind, w.id ?? 0, state.id);
        b.vx += nx * 130;
        b.vy += ny * 130;
      }
      state.contacts.add(eventKey);
    }
  }
}
