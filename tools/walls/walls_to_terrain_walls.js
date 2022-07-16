// converts all normal walls on the current scene to terrain walls.

const {NORMAL, LIMITED} = CONST.WALL_SENSE_TYPES;
const updates = canvas.scene.walls.filter(i => {
  // only walls that are set up exactly as regular walls (blocking everything).
  const {light, move, sight, sound} = i.data;
  return new Set([light, move, sight, sound, NORMAL]).size === 1;
}).map(i => {
  // set blocking of light, sight, and sound to terrain defaults.
  return {_id: i.id, light: LIMITED, sight: LIMITED, sound: LIMITED};
});
await canvas.scene.updateEmbeddedDocuments("Wall", updates);
