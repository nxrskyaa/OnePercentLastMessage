import fs from "node:fs";
import assert from "node:assert/strict";
import ts from "typescript";

// Load the real procedural geometry without a browser or a second bundler.
function moduleUrl(path, replacements = {}) {
  let source = fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
  for (const [from, to] of Object.entries(replacements))
    source = source.replaceAll(`"${from}"`, JSON.stringify(to));
  const code = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  return `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`;
}
const three = import.meta.resolve("three");
const chat = moduleUrl("src/rendering/chatGeometry.ts", { three });
const geometry = moduleUrl("src/rendering/craftGeometry.ts", {
  three,
  "./chatGeometry": chat,
  "three/addons/utils/BufferGeometryUtils.js": import.meta
    .resolve("three/addons/utils/BufferGeometryUtils.js"),
  "three/addons/geometries/RoundedBoxGeometry.js": import.meta
    .resolve("three/addons/geometries/RoundedBoxGeometry.js"),
});
const { buildCraft } = await import(geometry);
const { COURIER_CRAFTS } = await import(moduleUrl("src/game/crafts.ts"));
const widths = [];
for (const craft of COURIER_CRAFTS) {
  const batches = buildCraft(craft);
  let triangles = 0;
  assert.equal(Object.keys(batches).length, 4);
  for (const batch of Object.values(batches)) {
    const positions = batch.getAttribute("position");
    assert.ok(positions.count > 0);
    triangles += positions.count / 3;
    for (const name of ["position", "normal", "uv", "color"]) {
      assert.ok(batch.getAttribute(name), `${craft.kind}: missing ${name}`);
      assert.ok(
        [...batch.getAttribute(name).array].every(Number.isFinite),
        `${craft.kind}: nonfinite ${name}`,
      );
    }
    batch.computeBoundingBox();
  }
  widths.push(batches.hull.boundingBox.max.x - batches.hull.boundingBox.min.x);
  assert.ok(
    triangles < 5000,
    `${craft.kind}: ${triangles} exceeds craft budget`,
  );
  assert.equal(craft.engines.length, craft.kind === "comet" ? 3 : 2);
  console.log(
    `${craft.name}: ${triangles} triangles, 4 material batches, ${craft.engines.length} nozzles`,
  );
  Object.values(batches).forEach((batch) => batch.dispose());
}
assert.equal(
  new Set(widths.map((width) => width.toFixed(2))).size,
  3,
  "Craft silhouettes must differ",
);
