/**
 * Tool 1: Select a region, place the cursor above the grid space that should be added
 * to this region, then execute the macro (with a keyboard shortcut).
 */
const region = canvas.regions.controlled[0]?.document;
if (!region) {
  ui.notifications.warn("You have to select a region!");
  return;
}

const points = canvas.grid.getVertices(canvas.mousePosition).reduce((acc, {x, y}) => {
  acc.push(x, y);
  return acc;
}, []);
const shapes = region.toObject().shapes;
shapes.push({type: "polygon", points: points, hole: canvas.regions._holeMode});
await region.update({shapes: shapes});

/**
 * Tool 2: This consolidates the many shapes of a region into the lowest amount needed.
 * Good in case you have used Tool 1 a lot and have several hundreds of small grid space shapes.
 */
for (const region of canvas.regions.placeables) {
  const shapes = [];
  for (const polygon of region.polygons) {
    const hole = !polygon.isPositive;
    shapes.push({type: "polygon", hole: hole, points: polygon.points});
  }
  await region.document.update({shapes: shapes});
}
