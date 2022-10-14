// execute macro to cycle selected wall directions (both, left, right).
// hold shift to instead cycle between movement types (none, normal).

if (!event.shiftKey ){
  const { BOTH, LEFT, RIGHT } = CONST.WALL_DIRECTIONS;
  const updates = canvas.walls.controlled.map(wall => {
    let dir = BOTH;
    if (wall.document.dir === BOTH) dir = LEFT;
    else if (wall.document.dir === LEFT) dir = RIGHT;
    return { _id: wall.id, dir };
  });
  await canvas.scene.updateEmbeddedDocuments("Wall", updates);
} else {
  const { NONE, NORMAL } = CONST.WALL_MOVEMENT_TYPES;
  const updates = canvas.walls.controlled.map(wall => {
    return { _id: wall.id, move: wall.document.move === NONE ? NORMAL : NONE };
  });
  await canvas.scene.updateEmbeddedDocuments("Wall", updates);
}
