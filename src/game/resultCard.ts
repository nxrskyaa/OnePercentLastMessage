import { formatTime } from "@/lib/format";
import { privacyRank } from "@/game/scoring";

export interface ResultCardData {
  success: boolean;
  receiver: string;
  elapsed: number;
  battery: number;
  privacy: number;
  score: number;
  trackerHits: number;
  tipsCollected: number;
}

export const CARD_WIDTH = 1080;
export const CARD_HEIGHT = 1350;

const ink = "#061522";
const cyan = "#8cecff";
const ivory = "#f1f8fb";
const muted = "#a9c5d1";

function line(
  ctx: CanvasRenderingContext2D,
  points: number[],
  color: string,
  width = 1,
) {
  ctx.beginPath();
  ctx.moveTo(points[0], points[1]);
  for (let i = 2; i < points.length; i += 2)
    ctx.lineTo(points[i], points[i + 1]);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

function textFit(
  ctx: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
  maxWidth: number,
  size: number,
  weight = 700,
  minSize = 24,
) {
  let current = size;
  do {
    ctx.font = `${weight} ${current}px Arial, sans-serif`;
    if (ctx.measureText(value).width <= maxWidth) break;
    current -= 2;
  } while (current >= minSize);
  if (current < minSize) {
    current = minSize;
    ctx.font = `${weight} ${current}px Arial, sans-serif`;
    while (value.length > 1 && ctx.measureText(`${value}…`).width > maxWidth)
      value = value.slice(0, -1);
    value += "…";
  }
  ctx.fillText(value, x, y);
}

function label(
  ctx: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
) {
  ctx.fillStyle = muted;
  ctx.font = "700 19px Arial, sans-serif";
  ctx.fillText(value, x, y);
}

function orb(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
) {
  const glow = ctx.createRadialGradient(x, y, 12, x, y, radius);
  glow.addColorStop(0, "#a1eaff55");
  glow.addColorStop(0.42, "#516dff25");
  glow.addColorStop(1, "#516dff00");
  ctx.fillStyle = glow;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
}

export function drawResultCard(
  canvas: HTMLCanvasElement,
  data: ResultCardData,
  mascot: HTMLImageElement,
  logo: HTMLImageElement,
) {
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D unavailable");

  // The same drawing function supplies both the preview and the downloaded PNG.
  ctx.fillStyle = ink;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
  const background = ctx.createLinearGradient(0, 0, 1080, 1350);
  background.addColorStop(0, "#061e32");
  background.addColorStop(0.44, "#0b1536");
  background.addColorStop(0.72, "#12152d");
  background.addColorStop(1, "#031d2b");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  orb(ctx, 805, 520, 640);
  orb(ctx, 202, 1105, 420);
  const foil = ctx.createLinearGradient(170, 130, 990, 930);
  foil.addColorStop(0, "#83e9ff00");
  foil.addColorStop(0.38, "#54b4ff16");
  foil.addColorStop(0.48, "#d79eff29");
  foil.addColorStop(0.55, "#ffe49d23");
  foil.addColorStop(0.68, "#7ce5ff12");
  foil.addColorStop(1, "#7ce5ff00");
  ctx.fillStyle = foil;
  ctx.beginPath();
  ctx.moveTo(298, 0);
  ctx.lineTo(1080, 0);
  ctx.lineTo(1080, 1115);
  ctx.lineTo(689, 1050);
  ctx.closePath();
  ctx.fill();
  const spectrum = ctx.createLinearGradient(92, 0, 990, 0);
  spectrum.addColorStop(0, "#7fe7ff");
  spectrum.addColorStop(0.35, "#88a9ff");
  spectrum.addColorStop(0.65, "#eaa1f4");
  spectrum.addColorStop(1, "#f6d486");
  ctx.fillStyle = spectrum;
  ctx.fillRect(78, 176, 664, 4);
  ctx.globalAlpha = 0.43;
  ctx.fillRect(78, 184, 405, 1);
  ctx.globalAlpha = 1;

  // Etched network tracks and restrained interference marks make the foil legible.
  ctx.save();
  ctx.beginPath();
  ctx.rect(38, 38, 1004, 1274);
  ctx.clip();
  for (let i = 0; i < 11; i++) {
    const x = 400 + i * 73;
    line(ctx, [x, 216, x + 203, 647, x + 110, 798], "#95dbff17");
  }
  for (let i = 0; i < 9; i++) {
    const y = 420 + i * 54;
    line(ctx, [97, y, 342, y, 421, y + 46], "#95dbff13");
  }
  ctx.restore();
  line(ctx, [37, 124, 37, 37, 310, 37], "#80e4f999", 2);
  line(ctx, [770, 37, 1043, 37, 1043, 306], "#80e4f999", 2);
  line(ctx, [37, 1030, 37, 1313, 330, 1313], "#80e4f999", 2);
  line(ctx, [755, 1313, 1043, 1313, 1043, 1054], "#80e4f999", 2);

  ctx.fillStyle = cyan;
  ctx.font = "700 22px Arial, sans-serif";
  ctx.fillText("01 / LAST MESSAGE", 78, 100);
  label(ctx, "DLICOM AI GAME JAM", 78, 137);
  // The mark is the exact supplied reference, never an AI redraw.
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(860, 73, 145, 118, 17);
  ctx.clip();
  ctx.fillStyle = "#071418";
  ctx.fillRect(860, 73, 145, 118);
  ctx.drawImage(logo, 135, 245, 1010, 800, 861, 74, 143, 116);
  ctx.restore();

  ctx.fillStyle = ivory;
  textFit(ctx, data.success ? "MESSAGE" : "SIGNAL", 78, 272, 760, 101, 800, 76);
  const titleGradient = ctx.createLinearGradient(70, 285, 724, 358);
  titleGradient.addColorStop(0, data.success ? "#bff9ff" : "#ffcfca");
  titleGradient.addColorStop(0.54, data.success ? "#86bfff" : "#ff9bc3");
  titleGradient.addColorStop(1, "#eee4ff");
  ctx.fillStyle = titleGradient;
  textFit(
    ctx,
    data.success ? "DELIVERED." : "LOST.",
    78,
    366,
    760,
    102,
    800,
    76,
  );
  line(ctx, [78, 402, 1002, 402], "#9ddbf34d", 2);

  label(ctx, "TO / RECEIVER", 78, 461);
  ctx.fillStyle = ivory;
  textFit(ctx, data.receiver.toUpperCase(), 78, 513, 535, 46, 700, 27);
  ctx.fillStyle = "#c3dce3";
  ctx.font = "400 24px Arial, sans-serif";
  ctx.fillText(
    data.success
      ? "The final packet made it through."
      : "The network kept the final packet.",
    78,
    552,
  );

  // Character art is loaded only after a run ends; the gameplay renderer stays unchanged.
  ctx.save();
  ctx.shadowColor = "#6be1ff88";
  ctx.shadowBlur = 65;
  ctx.drawImage(mascot, 560, 412, 410, 615);
  ctx.restore();
  ctx.strokeStyle = "#a7eeff55";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(741, 789, 283, 343, -0.15, 0.24 * Math.PI, 1.74 * Math.PI);
  ctx.stroke();
  ctx.strokeStyle = "#d7b6ff44";
  ctx.beginPath();
  ctx.ellipse(753, 788, 313, 372, -0.15, 0.91 * Math.PI, 1.94 * Math.PI);
  ctx.stroke();
  ctx.fillStyle = "#f2c7ed";
  ctx.beginPath();
  ctx.arc(947, 488, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f4dc93";
  ctx.beginPath();
  ctx.arc(1001, 704, 3, 0, Math.PI * 2);
  ctx.fill();

  // The opaque telemetry panel protects small text over the character silhouette.
  const panel = ctx.createLinearGradient(58, 610, 469, 1006);
  panel.addColorStop(0, "#091727fa");
  panel.addColorStop(1, "#0c1930e8");
  ctx.fillStyle = panel;
  ctx.beginPath();
  ctx.roundRect(58, 620, 434, 367, 22);
  ctx.fill();
  ctx.strokeStyle = "#a5e8ff77";
  ctx.lineWidth = 2;
  ctx.stroke();
  label(ctx, "RUN TELEMETRY", 83, 671);
  line(ctx, [83, 687, 464, 687], "#7bd0e763");
  const rows: [string, string][] = [
    ["TIME", formatTime(data.elapsed)],
    ["BATTERY LEFT", `${data.battery.toFixed(2)}%`],
    ["PRIVACY", `${Math.round(data.privacy)}%`],
    ["TRACKERS", `${data.trackerHits}`],
    ["TIPS", `${data.tipsCollected}`],
  ];
  rows.forEach(([name, value], index) => {
    const y = 743 + index * 49;
    ctx.fillStyle = muted;
    ctx.font = "700 20px Arial, sans-serif";
    ctx.fillText(name, 83, y);
    ctx.fillStyle = ivory;
    ctx.textAlign = "right";
    textFit(ctx, value, 463, y + 1, 170, 28, 700, 20);
    ctx.textAlign = "left";
  });

  line(ctx, [78, 1030, 1002, 1030], "#9ddbf37a", 2);
  ctx.fillStyle = spectrum;
  ctx.fillRect(78, 1029, 924, 3);
  label(ctx, "FINAL SCORE", 78, 1083);
  ctx.fillStyle = ivory;
  textFit(ctx, data.score.toLocaleString("en-US"), 76, 1199, 590, 122, 800, 66);
  ctx.fillStyle = "#8ee8f7";
  ctx.font = "700 22px Arial, sans-serif";
  textFit(
    ctx,
    `PRIVACY RANK / ${privacyRank(data.privacy)}`,
    80,
    1250,
    625,
    22,
    700,
    18,
  );

  ctx.fillStyle = "#d5edf4";
  ctx.textAlign = "right";
  ctx.font = "700 21px Arial, sans-serif";
  ctx.fillText("BUILT BY NXR", 1002, 1244);
  ctx.fillStyle = muted;
  ctx.font = "700 16px Arial, sans-serif";
  ctx.fillText("#LastMessage  #DlicomGameJam", 1002, 1274);
  ctx.textAlign = "left";
}
