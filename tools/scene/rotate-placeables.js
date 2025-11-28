/**
 * An overly complicated macro that rotates walls and lights around the center of the scene.
 */

// The rotation, in radians.
const angle = Math.PI / 2; // 90

const P = { x: canvas.scene.dimensions.rect.width / 2, y: canvas.scene.dimensions.rect.height / 2 };
const rotatePoint = p => {
  const m = new PIXI.Matrix();
  m.translate(-P.x, -P.y);
  m.rotate(angle);
  m.translate(P.x, P.y);
  return m.apply(p);
};

// Walls
let updates = [];
for (const wall of canvas.scene.walls) {
  const a = { x: wall.c[0], y: wall.c[1] };
  const b = { x: wall.c[2], y: wall.c[3] };
  const a1 = rotatePoint(a);
  const b1 = rotatePoint(b);
  updates.push({ _id: wall.id, c: [a1.x, a1.y, b1.x, b1.y] });
}
await canvas.scene.updateEmbeddedDocuments("Wall", updates);

// Lights
updates = [];
for (const light of canvas.scene.lights) {
  const p = rotatePoint(light.object.center);
  updates.push({ _id: light.id, x: p.x, y: p.y });
}
await canvas.scene.updateEmbeddedDocuments("AmbientLight", updates);
