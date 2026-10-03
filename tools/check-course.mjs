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
const { flightCenter, flightLengthScale, flightSlope } = load(
  "src/game/flightPath.ts",
);

for (let stage = 0; stage < 3; stage++) {
  assert.deepEqual(JSON.parse(JSON.stringify(flightCenter(0, stage))), {
    x: 0,
    y: 0,
  });
  assert.equal(Math.abs(flightCenter(-1800, stage).x), 0);
  for (let d = 1; d <= 1800; d++) {
    const a = flightCenter(-d, stage),
      b = flightCenter(-d + 1, stage),
      slope = flightSlope(-d, stage);
    assert.ok([a.x, a.y, slope.x, slope.y].every(Number.isFinite));
    assert.ok(
      Math.hypot(a.x - b.x, a.y - b.y) < 2.5,
      "Route must stay continuous and flyable",
    );
    assert.ok(flightLengthScale(-d, stage) >= 1);
  }
  assert.ok(
    Math.abs(flightCenter(-650, stage).x) > 60,
    "Switchback must be visible",
  );
  assert.ok(flightCenter(-895, stage).y > 40, "Sky bridge must be elevated");
}
const {
  generateNodes,
  aperture,
  hitsObstacle,
  rotorAngle,
  blockingObstacle,
  hitsRelayRim,
  relayFrame,
} = load("src/game/nodes.ts");
const { flightControls, axisVelocity, pilotTarget, pilotCue, controlScale } =
  load("src/game/pilot.ts");
const gate = generateNodes(1, 0).find((node) => node.type === "shutter");
const opening = aperture(gate, 0);
assert.equal(
  blockingObstacle(
    [gate],
    gate.z + 3,
    gate.z - 8,
    opening.x + gate.radius + 1,
    opening.y,
    0,
  )?.id,
  gate.id,
  "Boost cannot tunnel through panels",
);
assert.equal(
  blockingObstacle([gate], gate.z + 3, gate.z - 8, opening.x, opening.y + 12, 0)
    ?.id,
  gate.id,
  "Cannot fly over solid gates",
);
assert.equal(
  blockingObstacle([gate], gate.z + 3, gate.z - 8, opening.x, opening.y, 0),
  undefined,
  "Aligned pilot can pass",
);
assert.equal(
  blockingObstacle([gate], gate.z + 2.2, gate.z + 2, opening.x, opening.y, 0),
  undefined,
  "Blocked pilot can realign and resume",
);
const rotor = generateNodes(1, 0).find((node) => node.type === "rotor");
assert.equal(
  hitsObstacle(rotor, rotor.x + 20, rotor.y, 0),
  true,
  "Rotor perimeter prevents bypass",
);
const relay = generateNodes(1, 0).find((n) => n.type === "relay");
const frame = relayFrame(relay);
const barAngle = Math.PI / frame.sides;
assert.equal(hitsRelayRim(relay, relay.x, relay.y), false, "Centre is safe");
assert.equal(
  hitsRelayRim(
    relay,
    relay.x + Math.cos(barAngle) * frame.radius,
    relay.y + Math.sin(barAngle) * frame.radius,
  ),
  true,
  "Visible frame bar causes damage",
);
assert.equal(
  hitsRelayRim(relay, relay.x + 12, relay.y),
  false,
  "Empty sky is not a wall",
);
for (const dt of [1 / 30, 1 / 60, 1 / 144]) {
  for (const forward of [13.5, 22.5, 27.5]) {
    let vx = 0,
      vy = 0,
      x = 0,
      y = 0;
    const scale = controlScale(forward);
    for (let t = 0; t < 1; t += dt) {
      vx = axisVelocity(vx, 0.5, config.movement.lateralSpeed * scale, 12, dt);
      vy = axisVelocity(vy, 0.5, config.movement.verticalSpeed * scale, 12, dt);
      x += vx * dt;
      y += vy * dt;
    }
    assert(
      x / forward > 0.26 && y / forward > 0.18,
      "Both axes retain authority at maximum burst speed",
    );
    for (let t = 0; t < 0.25; t += dt) {
      vx = axisVelocity(vx, 0, 10 * scale, 12, dt);
      vy = axisVelocity(vy, 0, 7 * scale, 12, dt);
    }
    assert(
      Math.abs(vx) < 0.05 && Math.abs(vy) < 0.05,
      "Release stops axes at high speed",
    );
  }
}
const brake = flightControls(new Set(["shift", "s"]));
assert.equal(brake.boosting, false, "Brakes override nitro");
assert.equal(brake.targetSpeed, config.movement.brakeSpeed);
assert.equal(
  flightControls(new Set(["a"]), 0.8).steer,
  -1,
  "Keyboard overrides mouse",
);
assert(
  axisVelocity(7, 0, 7, 12, 0.2) < 0.1,
  "Released altitude input stops promptly",
);
const analog = flightControls(new Set(["shift"]), 0, { x: 0.35, y: 0.65 });
assert.equal(analog.steer, 0.35, "Touch steering remains proportional");
assert.equal(analog.lift, 0.65, "Analog climbs while steering");
assert.equal(analog.boosting, true, "Nitro works with both analog axes");
assert.equal(flightControls(new Set(), 0, { x: -0.5, y: -0.8 }).lift, -0.8);
assert.equal(flightControls(new Set(["a", "e"]), 0, { x: 1, y: 1 }).steer, -1);
assert.equal(flightControls(new Set(["e"]), 0, { x: 1, y: 1 }).lift, -1);
const { gameInput } = load("src/game/input.ts");
gameInput.touchAxis.current.x = 1;
gameInput.touchAxis.current.y = -1;
gameInput.pressed.current.add("shift");
gameInput.clear();
assert.equal(
  gameInput.touchAxis.current.x,
  0,
  "Pause clears horizontal touch input",
);
assert.equal(
  gameInput.touchAxis.current.y,
  0,
  "Pause clears vertical touch input",
);
assert.equal(gameInput.pressed.current.size, 0, "Pause clears held actions");
const damp = (value, target, response, dt) =>
  target + (value - target) * Math.exp(-response * dt);

function simulate(
  seed,
  stage,
  idle = false,
  novice = false,
  dt = 1 / 60,
  nitro = false,
) {
  const nodes = generateNodes(seed, stage);
  // A novice follows the actual visible cue, reacts only every 0.4 seconds,
  // cruises without W, and overlooks alternate power nodes when choosing a target.
  let powerIndex = 0;
  const visible = nodes.filter(
    (n) => n.type !== "booster" || ++powerIndex % 2 === 1,
  );
  let nextReaction = 0,
    sx = 0,
    sy = 0;
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
  const blockedHits = new Set();
  while (
    battery > 0 &&
    Math.hypot(x, y, z - config.destination.z) > config.destination.radius &&
    elapsed < 280
  ) {
    const target = nodes.find(
      (n) => n.z < z && !["tip", "tracker", "public"].includes(n.type),
    );
    let tx = 0,
      ty = 0;
    if (target && !idle) {
      const arrival =
        elapsed +
        ((z - target.z) * flightLengthScale((z + target.z) / 2, stage)) /
          Math.max(speed, 1);
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
    if (novice) {
      if (elapsed >= nextReaction) {
        const cue = pilotCue(
          pilotTarget(visible, z, elapsed),
          x,
          y,
          z - config.destination.z,
        );
        sx = cue.horizontal;
        sy = cue.vertical;
        nextReaction = elapsed + 0.4;
      }
    } else {
      sx = idle ? 0 : Math.max(-1, Math.min(1, (tx - x) * 1.3));
      sy = idle ? 0 : Math.max(-1, Math.min(1, (ty - y) * 1.3));
    }
    vx = axisVelocity(
      vx,
      sx,
      config.movement.lateralSpeed * controlScale(speed),
      config.movement.lateralResponse,
      dt,
    );
    vy = axisVelocity(
      vy,
      sy,
      config.movement.verticalSpeed * controlScale(speed),
      config.movement.verticalResponse,
      dt,
    );
    const boosting = nitro && elapsed % 12 < 3;
    speed = damp(
      speed,
      (boosting
        ? config.movement.boostSpeed
        : idle || novice
          ? config.movement.cruiseSpeed
          : config.movement.accelerateSpeed) +
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
    z = Math.max(
      config.destination.z,
      z - (speed * dt) / flightLengthScale(z, stage),
    );
    const blocker = blockingObstacle(nodes, previous, z, x, y, elapsed + dt);
    if (blocker) {
      z = Math.min(previous, blocker.z + config.obstacles.gateStandOff);
      speed = 0;
      if (!blockedHits.has(blocker.id)) {
        blockedHits.add(blocker.id);
        hits++;
        battery = Math.max(0, battery - config.obstacles.damageBattery);
      }
    }
    elapsed += dt;
    battery = Math.max(
      0,
      battery -
        (config.battery.drainPerSecond +
          (boosting ? config.battery.boostExtraDrainPerSecond : 0)) *
          dt,
    );
    for (const n of nodes) {
      if (crossed.has(n.id) || previous <= n.z || z > n.z) continue;
      crossed.add(n.id);
      const gap = Math.hypot(x - n.x, y - n.y);
      if (hitsRelayRim(n, x, y)) {
        hits++;
        battery = Math.max(0, battery - config.obstacles.rimBatteryDamage);
        continue;
      }
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
    pilot: novice ? "delayed-cruise" : idle ? "idle" : "expert",
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
assert(idle.hits >= 1, "Idle pilot is stopped at a solid gate");
console.log("36 movement-limited route simulations passed; idle run fails.");

for (let stage = 0; stage < 3; stage++) {
  for (let seed = 1; seed <= 12; seed++) {
    const novice = simulate(seed, stage, false, true);
    assert(novice.success, JSON.stringify(novice));
    assert(novice.boosters < 8, "Novice must miss some pickups");
    assert(
      novice.battery > config.obstacles.damageBattery * 3,
      "Room for three additional mistakes",
    );
    assert(
      novice.seconds > 120 && novice.seconds < 180,
      JSON.stringify(novice),
    );
    console.log(JSON.stringify(novice));
    const lowFrameRate = simulate(seed, stage, false, true, 1 / 30);
    assert(lowFrameRate.success, JSON.stringify(lowFrameRate));
  }
}
console.log(
  "36 delayed cruise pilots and 36 at 30Hz pass with missed pickups; input release and brake priority pass.",
);

for (let stage = 0; stage < 3; stage++)
  for (let seed = 1; seed <= 12; seed++) {
    for (const dt of [1 / 30, 1 / 60]) {
      const run = simulate(seed, stage, false, false, dt, true);
      assert(run.success, JSON.stringify(run));
    }
  }
console.log(
  "72 nitro course runs pass at 30/60Hz; high-speed axes, release and physical rims verified.",
);
