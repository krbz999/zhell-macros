// select a token (of any square size) and toggle a measured template centered on them.

// base radius of the aura.
const base = 10;

const template = canvas.scene.templates.find(t => {
  return t.getFlag("world", "aura");
});
if(template) return template.delete();
const {x, y, width} = token.document;
const {size, distance} = canvas.scene.grid;
const center = {x: x + width/2 * size, y: y + width/2 * size};
const radius = base + (width/2 * distance);
await canvas.scene.createEmbeddedDocuments("MeasuredTemplate", [{
 t: "circle", x: center.x, y: center.y,
 distance: radius, user: game.user.id,
 flags: {world: {aura: true}}
}]);
