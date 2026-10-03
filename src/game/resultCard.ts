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
  playerName: string;
  xHandle: string;
  avatarUrl: string;
  stageName: string;
  language: "en" | "id";
}

export const CARD_WIDTH = 1080;
export const CARD_HEIGHT = 1350;

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

/** Matches the in-game courier poster; foiled details are drawn only once at export. */
export function drawResultCard(
  canvas: HTMLCanvasElement,
  data: ResultCardData,
  mascot: HTMLImageElement,
  logo: HTMLImageElement,
  avatar: HTMLImageElement | null,
  wordmark: HTMLImageElement,
) {
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D unavailable");
  const paper = "#f8f8eb",
    navy = "#111f36",
    gold = "#ffe697",
    accent = data.success ? "#8de3dd" : "#ffa180";
  const id = data.language === "id";
  const plate = (points: number[], fill: string, stroke = navy, width = 6) => {
    ctx.beginPath();
    ctx.moveTo(points[0], points[1]);
    for (let i = 2; i < points.length; i += 2)
      ctx.lineTo(points[i], points[i + 1]);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = width;
    ctx.stroke();
  };
  ctx.fillStyle = navy;
  ctx.fillRect(0, 0, 1080, 1350);
  plate([33, 40, 1047, 40, 1047, 1310, 33, 1310], accent, paper, 3);
  ctx.save();
  ctx.beginPath();
  ctx.rect(38, 45, 1004, 1260);
  ctx.clip();
  for (let y = 50; y < 1300; y += 13)
    for (let x = 43; x < 1040; x += 13) {
      ctx.fillStyle = "#18395633";
      ctx.beginPath();
      ctx.arc(x, y, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  plate([35, 625, 1045, 1158, 1045, 1308, 35, 770], navy, navy, 0);
  plate([35, 250, 760, 42, 1045, 42, 1045, 116, 35, 370], paper, paper, 0);
  const foil = ctx.createLinearGradient(140, 210, 1050, 1020);
  foil.addColorStop(0, "#82e6ff00");
  foil.addColorStop(0.33, "#d4b5ff33");
  foil.addColorStop(0.47, "#f7f7f2aa");
  foil.addColorStop(0.55, "#fff0a466");
  foil.addColorStop(0.72, "#8ee9ee00");
  ctx.fillStyle = foil;
  ctx.fillRect(38, 45, 1004, 1260);
  for (let i = 0; i < 6; i++)
    line(ctx, [800 + i * 19, 45, 250 + i * 19, 1305], "#f8f8eb36", 1);
  ctx.restore();
  ctx.drawImage(wordmark, 62, 70, 455, 176);
  ctx.drawImage(logo, 135, 245, 1010, 800, 890, 83, 120, 95);
  ctx.fillStyle = navy;
  textFit(ctx, "DLICOM × NXR", 685, 222, 326, 21, 800, 18);
  ctx.save();
  ctx.translate(730, 487);
  ctx.rotate(0.12);
  ctx.fillStyle = "#162d4930";
  textFit(ctx, data.success ? "SENT!" : "RETRY!", -250, 0, 560, 150, 900, 110);
  ctx.restore();
  ctx.save();
  ctx.translate(819, 710);
  ctx.rotate(-0.14);
  ctx.drawImage(mascot, -255, -370, 485, 727);
  ctx.restore();
  // Hard ink keyline and skewed panels remain readable over the character art.
  plate([51, 302, 1000, 260, 1010, 370, 61, 412], navy, paper, 5);
  ctx.save();
  ctx.translate(90, 382);
  ctx.rotate(-0.044);
  ctx.fillStyle = paper;
  textFit(
    ctx,
    id
      ? data.success
        ? "PESAN TERKIRIM"
        : "SINYAL HILANG"
      : data.success
        ? "MESSAGE DELIVERED"
        : "SIGNAL LOST",
    0,
    0,
    860,
    68,
    900,
    37,
  );
  ctx.restore();
  const grade = !data.success
    ? "X"
    : data.trackerHits === 0 && data.privacy >= 90
      ? "S"
      : data.privacy >= 75
        ? "A"
        : data.privacy >= 50
          ? "B"
          : "C";
  plate([62, 461, 583, 440, 602, 641, 82, 660], navy, paper, 5);
  ctx.fillStyle = gold;
  textFit(ctx, grade, 86, 620, 170, 175, 900, 140);
  label(ctx, id ? "PERINGKAT" : "RUN RANK", 276, 493);
  ctx.fillStyle = paper;
  textFit(ctx, privacyRank(data.privacy), 276, 542, 295, 35, 900, 23);
  ctx.fillStyle = accent;
  textFit(ctx, data.receiver, 276, 588, 285, 23, 800, 17);
  ctx.fillStyle = paper;
  textFit(ctx, data.stageName, 276, 622, 285, 17, 700, 14);
  plate([70, 701, 633, 684, 643, 842, 80, 859], gold, navy, 6);
  ctx.fillStyle = navy;
  textFit(ctx, id ? "SKOR AKHIR" : "FINAL SCORE", 94, 736, 235, 20, 800, 18);
  textFit(ctx, data.score.toLocaleString("en-US"), 91, 829, 510, 104, 900, 60);
  const rows: [string, string, number | null][] = [
    [id ? "WAKTU" : "TIME", formatTime(data.elapsed), null],
    [id ? "BATERAI" : "BATTERY", `${data.battery.toFixed(2)}%`, data.battery],
    [
      id ? "PRIVASI" : "PRIVACY",
      `${Math.round(data.privacy)}%`,
      data.privacy / 100,
    ],
    [
      id ? "BENTURAN / TIPS" : "COLLISIONS / TIPS",
      `${data.trackerHits} / ${data.tipsCollected}`,
      null,
    ],
  ];
  rows.forEach(([name, value, progress], i) => {
    const x = 76 + (i % 2) * 282,
      y = 893 + Math.floor(i / 2) * 99;
    plate([x, y, x + 263, y - 8, x + 263, y + 72, x, y + 80], navy, paper, 3);
    ctx.fillStyle = accent;
    textFit(ctx, name, x + 15, y + 22, 220, 17, 800, 15);
    ctx.fillStyle = paper;
    textFit(ctx, value, x + 15, y + 61, 225, 35, 800, 25);
    if (progress !== null) {
      ctx.fillStyle = "#ffffff26";
      ctx.fillRect(x + 15, y + 69, 232, 3);
      ctx.fillStyle = accent;
      ctx.fillRect(x + 15, y + 69, 232 * Math.max(0, Math.min(1, progress)), 3);
    }
  });
  plate([696, 969, 991, 928, 1002, 993, 707, 1034], navy, paper, 4);
  ctx.save();
  ctx.translate(721, 1008);
  ctx.rotate(-0.13);
  ctx.fillStyle = accent;
  textFit(
    ctx,
    data.success ? "DELIVERY CONFIRMED" : "SIGNAL INTERRUPTED",
    0,
    0,
    255,
    21,
    900,
    15,
  );
  ctx.restore();
  plate([68, 1126, 1007, 1104, 1012, 1222, 74, 1243], paper, navy, 5);
  ctx.save();
  ctx.beginPath();
  ctx.arc(135, 1181, 42, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = "#385986";
  ctx.fillRect(93, 1139, 84, 84);
  if (avatar) {
    const size = Math.min(avatar.naturalWidth, avatar.naturalHeight);
    ctx.drawImage(
      avatar,
      (avatar.naturalWidth - size) / 2,
      (avatar.naturalHeight - size) / 2,
      size,
      size,
      93,
      1139,
      84,
      84,
    );
  } else {
    ctx.fillStyle = paper;
    textFit(
      ctx,
      data.playerName.slice(0, 2).toUpperCase(),
      105,
      1195,
      67,
      34,
      900,
      22,
    );
  }
  ctx.restore();
  ctx.fillStyle = navy;
  textFit(ctx, data.playerName, 200, 1174, 756, 45, 900, 24);
  ctx.fillStyle = "#385986";
  textFit(
    ctx,
    data.xHandle ? `@${data.xHandle}` : "DLICOM SIGNAL COURIER",
    202,
    1209,
    755,
    23,
    700,
    18,
  );
  plate([64, 1254, 1014, 1254, 1014, 1302, 64, 1302], paper, navy, 3);
  ctx.fillStyle = navy;
  textFit(ctx, "#LastMessage  #DlicomGameJam", 80, 1284, 620, 18, 800, 16);
  textFit(ctx, "1% / LAST MESSAGE", 760, 1284, 234, 18, 800, 14);
}
