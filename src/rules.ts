export type Phase = "ready" | "playing" | "over";
export type Hit = "buoy" | "bumper" | "beacon" | "sling" | "lane";
export class Rules {
  phase: Phase = "ready";
  score = 0;
  ballNumber = 1;
  bonus = 0;
  multiplier = 1;
  buoys = new Set<number>();
  charge = 0;
  rescues = 0;
  tilted = false;
  paused = false;
  time = 0;
  launchTime = -100;
  message = "Hold SPACE, release to launch";
  private contacts = new Map<string, number>();
  private nudges: number[] = [];
  private lastNudge = -100;
  start() {
    Object.assign(this, new Rules());
    this.contacts = new Map();
    this.nudges = [];
  }
  launch() {
    if (this.phase !== "ready" || this.paused) return false;
    this.phase = "playing";
    this.launchTime = this.time;
    this.message = "Mark the three navigation buoys";
    return true;
  }
  tick(dt: number) {
    if (!this.paused) this.time += dt;
  }
  hit(kind: Hit, id: number) {
    if (this.phase !== "playing" || this.paused || this.tilted) return false;
    const key = `${kind}:${id}`;
    if (this.time - (this.contacts.get(key) ?? -100) < 0.18) return false;
    this.contacts.set(key, this.time);
    this.score += { buoy: 500, bumper: 150, beacon: 300, sling: 75, lane: 250 }[
      kind
    ];
    this.bonus += 100;
    if (kind === "buoy" && this.buoys.size < 3) {
      this.buoys.add(id);
      this.message =
        this.buoys.size === 3
          ? "Route marked · charge five bumper hits"
          : `Buoy ${this.buoys.size}/3 marked`;
    }
    if (kind === "bumper" && this.buoys.size === 3 && this.charge < 5) {
      this.charge++;
      this.message =
        this.charge === 5
          ? "Beacon ready · strike the lighthouse!"
          : `Beacon charge ${this.charge}/5`;
    }
    if (kind === "beacon" && this.charge === 5) {
      this.score += 15000;
      this.rescues++;
      this.multiplier = Math.min(5, this.multiplier + 1);
      this.buoys.clear();
      this.charge = 0;
      this.message = "RESCUE COMPLETE · 15,000";
    }
    return true;
  }
  drain() {
    if (this.phase !== "playing" || this.paused) return "ignored";
    if (!this.tilted && this.time - this.launchTime < 5) {
      this.phase = "ready";
      this.message = "BALL SAVED · launch again";
      return "saved";
    }
    if (!this.tilted) this.score += this.bonus * this.multiplier;
    this.bonus = 0;
    this.contacts.clear();
    if (this.ballNumber === 3) {
      this.phase = "over";
      this.message = "Harbour closed · play again";
    } else {
      this.ballNumber++;
      this.phase = "ready";
      this.message = "Bonus banked · launch next ball";
    }
    this.tilted = false;
    this.nudges = [];
    return "drained";
  }
  nudge() {
    if (
      this.phase !== "playing" ||
      this.paused ||
      this.tilted ||
      this.time - this.lastNudge < 0.35
    )
      return false;
    this.lastNudge = this.time;
    this.nudges = this.nudges.filter((t) => this.time - t < 4);
    this.nudges.push(this.time);
    if (this.nudges.length >= 3) {
      this.tilted = true;
      this.message = "TILT · flippers disabled · bonus lost";
    } else
      this.message = `Nudge ${this.nudges.length}/3 · let the cabinet settle`;
    return true;
  }
  get warning() {
    return this.nudges.filter((t) => this.time - t < 4).length;
  }
  get objective() {
    return this.buoys.size < 3
      ? `MARK BUOYS · ${this.buoys.size}/3`
      : this.charge < 5
        ? `CHARGE BEACON · ${this.charge}/5`
        : "STRIKE THE LIGHTHOUSE";
  }
}
export function parseScores(raw: string | null): number[] {
  try {
    const v: unknown = JSON.parse(raw ?? "[]");
    return Array.isArray(v)
      ? v
          .filter(
            (x): x is number =>
              typeof x === "number" &&
              Number.isSafeInteger(x) &&
              x >= 0 &&
              x <= 1e9,
          )
          .sort((a, b) => b - a)
          .slice(0, 5)
      : [];
  } catch {
    return [];
  }
}
