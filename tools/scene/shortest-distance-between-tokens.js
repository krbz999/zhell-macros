/* Finds the two coordinates between two tokens that have the shortest distance, then pings them. */
/* This is an API example, not something meant for actual use as-is. */

const scene = canvas.scene;
const grid = scene.grid;
const [t1, t2] = scene.tokens.contents;

const offsets = t1.getOccupiedGridSpaceOffsets();
const points = offsets.map(offset => grid.getCenterPoint(offset));

let c1;
let c2;
let dist = Infinity;

outer: for (const offset2 of t2.getOccupiedGridSpaceOffsets()) {
  const p2 = grid.getCenterPoint(offset2);
  for (const p1 of points) {
    const d = grid.measurePath([{ ...p2, elevation: t2.elevation }, { ...p1, elevation: t1.elevation }]).distance;
    if (d < dist) {
      c1 = p1;
      c2 = p2;
      dist = d;
    }
    if (dist === 0) {
      break outer;
    }
  }
}

if (dist < Infinity) {
  canvas.ping(c1);
  canvas.ping(c2);
} else {
  ui.notifications.warn("No shortest distance found.");
}
