import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import assert from "node:assert/strict";
import ts from "typescript";
import { fileURLToPath } from "node:url";
const sourceDir = path.dirname(fileURLToPath(import.meta.url));
const cache = new Map();
function load(relative) {
  const filename = path.resolve(sourceDir, "..", relative);
  if (cache.has(filename)) return cache.get(filename);
  const result = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  vm.runInNewContext(code, {
    exports: result.exports,
    module: result,
    require: (name) =>
      load(
        path.relative(
          path.resolve(sourceDir, ".."),
          path.resolve(path.dirname(filename), name + ".ts"),
        ),
      ),
    Math,
  });
  cache.set(filename, result.exports);
  return result.exports;
}
const { GAME_CONFIG: config } = load("src/game/config.ts");
const { generateNodes, aperture, hitsObstacle, rotorAngle } =
  load("src/game/nodes.ts");
const damp = (value, target, response, dt) =>
  target + (value - target) * Math.exp(-response * dt);

function simulate(seed, stage, idle = false) {
  const nodes = generateNodes(seed, stage);
  let x = 0,
    y = 0,
    z = 0,
    vx = 0,
    vy = 0,
    speed = config.movement.cruiseSpeed;
  let battery = 1,
    elapsed = 0,
    hits = 0,
    boosters = 0,
    burstUntil = 0,
    burstSpeed = 0;
  const crossed = new Set();
  while (
    battery > 0 &&
    Math.hypot(x, y, z - config.destination.z) > config.destination.radius &&
    elapsed < 280
  ) {
    const dt = 1 / 60;
    const target = nodes.find(
      (n) => n.z < z && !["tip", "tracker", "public"].includes(n.type),
    );
    let tx = 0,
      ty = 0;
    if (target && !idle) {
      const arrival = elapsed + (z - target.z) / Math.max(speed, 1);
      const p = aperture(target, arrival);
      tx = p.x;
      ty = p.y;
      if (target.type === "rotor") {
        let best = Infinity;
        for (let cx = -12; cx <= 12; cx += 2)
          for (let cy = -5; cy <= 11; cy += 2) {
            if (
              [
                [-1, -1],
                [1, 1],
                [-1, 1],
                [1, -1],
              ].some(([dx, dy]) =>
                hitsObstacle(target, cx + dx, cy + dy, arrival),
              )
            )
              continue;
            const distance = Math.hypot(cx - x, cy - y);
            if (distance < best) {
              best = distance;
              tx = cx;
              ty = cy;
            }
          }
      }
    }
    const sx = idle ? 0 : Math.max(-1, Math.min(1, (tx - x) * 1.3));
    const sy = idle ? 0 : Math.max(-1, Math.min(1, (ty - y) * 1.3));
    vx = damp(
      vx,
      sx * config.movement.lateralSpeed,
      config.movement.lateralResponse,
      dt,
    );
    vy = damp(
      vy,
      sy * config.movement.verticalSpeed,
      config.movement.verticalResponse,
      dt,
    );
    speed = damp(
      speed,
      (idle ? config.movement.cruiseSpeed : config.movement.accelerateSpeed) +
        (elapsed < burstUntil ? burstSpeed : 0),
      config.movement.speedResponse,
      dt,
    );
    x = Math.max(-15, Math.min(15, x + vx * dt));
    y = Math.max(
      config.movement.minAltitude,
      Math.min(config.movement.maxAltitude, y + vy * dt),
    );
    const previous = z;
    z = Math.max(config.destination.z, z - speed * dt);
    elapsed += dt;
    battery = Math.max(0, battery - config.battery.drainPerSecond * dt);
    for (const n of nodes) {
      if (crossed.has(n.id) || previous <= n.z || z > n.z) continue;
      crossed.add(n.id);
      const gap = Math.hypot(x - n.x, y - n.y);
      if (
        ["shutter", "rotor", "curtain"].includes(n.type) &&
        hitsObstacle(n, x, y, elapsed)
      ) {
        hits++;
        battery = Math.max(0, battery - config.obstacles.damageBattery);
      } else if (n.type === "booster" && gap <= n.radius) {
        boosters++;
        battery = Math.min(1, battery + config.nodes.boosterCharge);
        burstSpeed = config.nodes.relayBurstSpeed;
        burstUntil = elapsed + config.nodes.boosterBurstSeconds;
      } else if (n.type === "relay" && gap <= 2.1) {
        burstSpeed = config.nodes.relayBurstSpeed;
        burstUntil = elapsed + config.nodes.relayBurstSeconds;
      } else if (n.type === "tracker" && gap <= n.radius)
        battery = Math.max(0, battery - config.nodes.trackerBatteryDamage);
    }
  }
  return {
    seed,
    stage,
    success:
      Math.hypot(x, y, z - config.destination.z) <= config.destination.radius &&
      battery > 0,
    seconds: Math.round(elapsed),
    battery: +battery.toFixed(2),
    hits,
    boosters,
  };
}

for (let stage = 0; stage < 3; stage++)
  for (let seed = 1; seed <= 12; seed++) {
    const nodes = generateNodes(seed, stage);
    assert.equal(
      new Set(nodes.map((n) => n.id)).size,
      nodes.length,
      "Unique node IDs",
    );
    for (const n of nodes.filter((n) => n.type === "shutter"))
      for (let t = 0; t < 200; t += 0.5) {
        const p = aperture(n, t);
        assert.equal(
          hitsObstacle(n, p.x, p.y, t),
          false,
          "Aperture center must be clear",
        );
        assert.equal(
          hitsObstacle(n, p.x + n.radius + 1, p.y, t),
          true,
          "Side panel must collide",
        );
        assert.equal(
          hitsObstacle(n, p.x, p.y + (n.height ?? 3.5) + 1, t),
          true,
          "Vertical panel must collide",
        );
        assert(
          p.y - (n.height ?? 3.5) + config.movement.collisionRadius <
            config.movement.maxAltitude &&
            p.y + (n.height ?? 3.5) - config.movement.collisionRadius >
              config.movement.minAltitude,
        );
      }
    for (const n of nodes.filter((n) => n.type === "rotor")) {
      const a = rotorAngle(n, 30);
      assert(
        hitsObstacle(n, n.x + Math.cos(a) * 8, n.y + Math.sin(a) * 8, 30),
        "Blade point must collide",
      );
    }
    const result = simulate(seed, stage);
    assert(result.success, JSON.stringify(result));
    assert(result.seconds > 90 && result.seconds < 160, JSON.stringify(result));
    assert(result.hits <= 2, JSON.stringify(result));
    console.log(JSON.stringify(result));
  }
const idle = simulate(1, 0, true);
assert.equal(
  idle.success,
  false,
  "Ignoring altitude and power gates must not finish the course",
);
assert(idle.hits >= 3, "Mandatory maneuvers must be meaningful");
console.log("36 movement-limited route simulations passed; idle run fails.");
