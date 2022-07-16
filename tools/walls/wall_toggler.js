// execute macro to cycle selected wall directions (both, left, right).
// hold shift to instead cycle between movement types (none, normal).

if(!event.shiftKey){
  const {BOTH, LEFT, RIGHT} = CONST.WALL_DIRECTIONS;
  const updates = canvas.walls.controlled.map(i => {
    let dir = BOTH;
    if(i.document.data.dir === BOTH) dir = LEFT;
    else if(i.document.data.dir === LEFT) dir = RIGHT;
    return {_id: i.id, dir}
  });
  await canvas.scene.updateEmbeddedDocuments("Wall", updates);
}else{
  const {NONE, NORMAL} = CONST.WALL_MOVEMENT_TYPES;
  const updates = canvas.walls.controlled.map(i => ({_id: i.id, move: i.document.data.move === NONE ? NORMAL : NONE}));
  await canvas.scene.updateEmbeddedDocuments("Wall", updates);
}
