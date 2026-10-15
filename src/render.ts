import { Simulation, walls, circles, dock } from "./physics";
const W = 520,
  H = 860;
export function render(
  c: CanvasRenderingContext2D,
  s: Simulation,
  reduced: boolean,
) {
  const t = s.rules.time;
  c.clearRect(0, 0, W, H);
  const bg = c.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#0b2832");
  bg.addColorStop(1, "#081b23");
  c.fillStyle = bg;
  c.fillRect(0, 0, W, H);
  const line = (
    x: number,
    y: number,
    x2: number,
    y2: number,
    color: string,
    width = 1,
  ) => {
    c.strokeStyle = color;
    c.lineWidth = width;
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x2, y2);
    c.stroke();
  };
  const text = (
    str: string,
    x: number,
    y: number,
    size = 12,
    color = "#a8c5c6",
    font = "monospace",
  ) => {
    c.font = `${size}px ${font}`;
    c.fillStyle = color;
    c.textAlign = "center";
    c.fillText(str, x, y);
  };
  const disc = (
    x: number,
    y: number,
    r: number,
    fill: string | CanvasGradient,
    stroke: string,
    width = 2,
  ) => {
    c.beginPath();
    c.arc(x, y, r, 0, Math.PI * 2);
    c.fillStyle = fill;
    c.fill();
    c.strokeStyle = stroke;
    c.lineWidth = width;
    c.stroke();
  };
  // Engraved sea contours and navigational grid.
  for (let y = 80; y < 800; y += 38) {
    c.beginPath();
    for (let x = 20; x < 452; x += 4) {
      const yy = y + 9 * Math.sin(x / 53 + y / 75);
      if (x === 20) c.moveTo(x, yy);
      else c.lineTo(x, yy);
    }
    c.strokeStyle = "#22424a55";
    c.lineWidth = 1;
    c.stroke();
  }
  for (let x = 60; x < 450; x += 65) line(x, 70, x, 810, "#31505a25");
  c.save();
  c.translate(258, 475);
  for (let i = 0; i < 32; i++) {
    c.rotate(Math.PI / 16);
    line(0, -72, 0, -(i % 4 === 0 ? 88 : 79), "#6e8b8055", i % 4 === 0 ? 2 : 1);
  }
  c.restore();
  disc(258, 475, 63, "#0c252b", "#57766c55");
  text("N", 258, 422, 10, "#c3a775");
  text("W", 203, 480, 10);
  text("E", 312, 480, 10);
  text("S", 258, 535, 10);
  line(258, 441, 258, 509, "#72968b55");
  line(224, 475, 292, 475, "#72968b55");
  text("MIDNIGHT", 258, 185, 26, "#c8d8c6", "Georgia");
  text("H A R B O U R", 258, 207, 13, "#c7a878");
  text("RESCUE / AFTER DARK", 258, 227, 7, "#85a8aa");
  // Lighthouse silhouette inside central bumper field.
  c.fillStyle = "#c4c2a733";
  c.beginPath();
  c.moveTo(242, 340);
  c.lineTo(249, 286);
  c.lineTo(267, 286);
  c.lineTo(274, 340);
  c.closePath();
  c.fill();
  line(243, 291, 273, 291, "#d9bc8555", 3);
  if (s.rules.charge === 5) {
    c.save();
    c.globalAlpha = 0.13 + 0.08 * Math.sin(t * 5);
    c.fillStyle = "#f6d59b";
    c.beginPath();
    c.moveTo(258, 323);
    c.lineTo(70, 160);
    c.lineTo(100, 80);
    c.closePath();
    c.fill();
    c.beginPath();
    c.moveTo(258, 323);
    c.lineTo(415, 80);
    c.lineTo(443, 160);
    c.closePath();
    c.fill();
    c.restore();
  }
  // Shooter rail and visible guide markings.
  c.fillStyle = "#07181f";
  c.fillRect(455, 150, 30, 673);
  for (let y = 640; y < 775; y += 20) line(462, y, 478, y, "#536d6b", 1);
  text("L", 470, 370, 9);
  text("A", 470, 387, 9);
  text("U", 470, 404, 9);
  text("N", 470, 421, 9);
  text("C", 470, 438, 9);
  text("H", 470, 455, 9);
  // slingshot panels
  for (const pts of [
    [
      [98, 560],
      [135, 644],
      [180, 675],
    ],
    [
      [390, 560],
      [354, 644],
      [310, 675],
    ],
  ]) {
    c.beginPath();
    c.moveTo(...(pts[0] as [number, number]));
    for (const p of pts.slice(1)) c.lineTo(...(p as [number, number]));
    c.closePath();
    c.fillStyle = "#173a40";
    c.fill();
    c.strokeStyle = "#a57750";
    c.lineWidth = 2;
    c.stroke();
  }
  text("PORT", 138, 624, 9, "#c8a472");
  text("STARBOARD", 355, 624, 8, "#c8a472");
  c.lineCap = "round";
  for (const w of walls) {
    line(...w.a, ...w.b, "#031017", 13);
    line(...w.a, ...w.b, w.kind ? "#b98257" : "#8c9f94", 6);
    line(...w.a, ...w.b, w.kind ? "#dca270" : "#d0d4b9", 1.5);
  }
  for (const o of circles) {
    const pulse = Math.max(
      0,
      Math.min(1, 1 - (t - (s.pulses.get(`${o.kind}${o.id}`) ?? -100)) * 4),
    );
    const lit =
      o.kind === "buoy"
        ? s.rules.buoys.has(o.id)
        : o.kind === "beacon"
          ? s.rules.charge === 5 || s.rules.jackpotLit
          : false;
    const col =
      o.kind === "buoy"
        ? "#e4ad76"
        : o.kind === "beacon"
          ? "#f1d68a"
          : "#75e7d3";
    c.save();
    c.shadowColor = col;
    c.shadowBlur = lit || pulse ? 22 : 8;
    if (o.kind === "buoy") {
      c.translate(o.x, o.y);
      c.rotate(Math.PI / 4);
      c.fillStyle = lit ? "#d4aa6a" : "#294a4c";
      c.strokeStyle = col;
      c.lineWidth = 3;
      c.fillRect(-13, -13, 26, 26);
      c.strokeRect(-13, -13, 26, 26);
      c.rotate(-Math.PI / 4);
      text(String(o.id + 1), 0, 4, 12, lit ? "#142b30" : "#ead1ac");
    } else {
      disc(o.x, o.y, o.r + 5, "#04161d", "#667e73", 3);
      disc(o.x, o.y, o.r, lit || pulse ? col : "#254b50", col, 3);
      disc(o.x, o.y, o.r - 8, "#122e35", col, 1);
      text(o.kind === "beacon" ? "✦" : "+", o.x, o.y + 7, 24, col);
    }
    c.restore();
    if (pulse && !reduced)
      disc(
        o.x,
        o.y,
        o.r + 8 + (1 - pulse) * 15,
        "#0000",
        col + Math.floor(pulse * 100 + 30).toString(16),
        1,
      );
  }
  text("1", 70, 282, 8, "#adbdad");
  text("2", 258, 103, 8, "#adbdad");
  text("3", 428, 282, 8, "#adbdad");
  text(
    s.rules.jackpotLit ? "JACKPOT 10,000" : "BEACON",
    258,
    359,
    8,
    "#d6bc85",
  );
  const dockLit = s.rules.lockMode !== "unlit";
  disc(
    dock.x,
    dock.y,
    dock.radius + 8,
    "#142c36",
    dockLit ? "#93f5e5" : "#8d9a91",
    3,
  );
  disc(dock.x, dock.y, dock.radius, "#020b13", "#718e89", 2);
  if (s.rules.lockMode === "locked")
    disc(dock.x, dock.y, 8, "#dce9df", "#f6fff3", 1);
  text("DOCK LOCK", dock.x, dock.y + 47, 8, dockLit ? "#b1f9e9" : "#95aaa1");
  text(
    s.rules.lockMode === "locked"
      ? "1 LOCKED"
      : s.rules.lockMode === "multiball"
        ? "MULTIBALL"
        : dockLit
          ? "LOCK LIT"
          : `${s.rules.lockBuoys.size}/3 BUOYS`,
    dock.x,
    dock.y + 60,
    8,
    "#9bbab4",
  );
  for (let i = 0; i < 5; i++)
    disc(
      222 + i * 18,
      552,
      4,
      i < s.rules.charge ? "#7cead4" : "#24424a",
      i < s.rules.charge ? "#bfffee" : "#66746a",
      1,
    );
  text("KEEP THE LIGHT ALIVE", 258, 582, 9, "#8ca99f");
  text(`${s.rules.multiplier}×`, 258, 636, 25, "#c4a479", "Georgia");
  text("BONUS", 258, 654, 8, "#93b4af");
  text("RETURN", 73, 604, 7);
  text("RETURN", 420, 604, 7);
  for (let i = 0; i < 2; i++) {
    const px = i ? 350 : 170,
      a = s.angles[i],
      ex = px + 82 * Math.cos(a),
      ey = 716 + 82 * Math.sin(a);
    line(px, 720, ex, ey + 4, "#000b", 20);
    line(px, 716, ex, ey, "#bd784f", 17);
    line(px, 713, ex, ey - 3, "#e5c99b", 8);
    disc(px, 716, 10, "#395558", "#e6bf89", 2);
    disc(px, 716, 3, "#c6ded2", "#182a2e", 1);
  }
  text("OUT", 88, 745, 7, "#dc9a7b");
  text("OUT", 417, 745, 7, "#dc9a7b");
  line(195, 811, 325, 811, "#654d40", 2);
  text("THE LONG WAY HOME", 258, 794, 10, "#73918c");
  text("ORIGINAL TABLE / 2026", 258, 829, 7, "#688983");
  // launcher spring
  for (let y = 802; y < 835; y += 5) line(461, y, 479, y + 3, "#a9a98d", 2);
  for (const b of s.balls) {
    const trail = s.trailFor(b);
    if (!reduced && s.rules.phase === "playing")
      trail.forEach(([x, y], i) => {
        c.beginPath();
        c.arc(x, y, 4 + i / 6, 0, Math.PI * 2);
        c.fillStyle = `rgba(130,233,225,${(i / trail.length) * 0.16})`;
        c.fill();
      });
    c.save();
    c.shadowColor = "#91e2da";
    c.shadowBlur = 12;
    const metal = c.createRadialGradient(b.x - 3, b.y - 4, 1, b.x, b.y, 10);
    metal.addColorStop(0, "#fff");
    metal.addColorStop(0.3, "#d6e6df");
    metal.addColorStop(0.65, "#8da9ad");
    metal.addColorStop(1, "#324e58");
    disc(b.x, b.y, 9, metal, "#e5f3e3", 1);
    c.restore();
  }
  if (s.rules.tilted) text("T I L T", 258, 485, 40, "#f1a28b", "Georgia");
}
