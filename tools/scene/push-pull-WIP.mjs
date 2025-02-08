const from = canvas.tokens.get("0RuGIG2lyWTx6sVZ");
const tokens = canvas.tokens.placeables.filter(p => p.id !== from.id);
const distance = event.shiftKey ? -10 : 10;

const updates = tokens.map(token => {
  const point = (canvas.scene.grid.type === CONST.GRID_TYPES.GRIDLESS)
    ? pushGridless(token, distance)
    : pushGrid(token, distance);
  return point ? {_id: token.id, ...point} : point;
}).filter(_ => _);

canvas.scene.updateEmbeddedDocuments("Token", updates, {animation: {duration: 150}});

/* -------------------------------------------------- */

/**
 * Push or pull a token on a gridless scene.
 * @param {Token} token     The token to push.
 * @param {number} feet     The number of feet to push (if positive) or pull (if negative).
 * @returns {Point|null}    The point to which to move the token, or null if no movement possible.
 */
function pushGridless(token, feet) {
  const ray = new Ray(feet > 0 ? from.center : token.center, feet > 0 ? token.center : from.center);
  const angle = Math.toDegrees(ray.angle);

  let translated = canvas.grid.getTranslatedPoint(token.center, angle, Math.abs(feet));

  // If a pull and distance to source is smaller, use smaller distance.
  const dist = canvas.grid.measurePath([token.center, from.center]).distance;
  if ((feet < 0) && (dist - canvas.grid.distance <= Math.abs(feet))) {
    feet = Math.max(0, dist - canvas.grid.distance);
    if (!feet) return null;
    translated = canvas.grid.getTranslatedPoint(token.center, angle, feet);
  }

  const coll = token.checkCollision(translated, {origin: token.center, mode: "closest"});
  if (coll) {
    const {angle, distance} = new Ray(token.center, coll);
    const ray = Ray.fromAngle(token.document.x, token.document.y, angle, distance * .99);
    // Do not bother pushing or pulling if the distance is less than 1 foot.
    if (canvas.grid.measurePath([ray.B, token.document]).distance < 1) return null;
    return ray.B;
  } else {
    let translated = canvas.grid.getTranslatedPoint(token.document, angle, Math.abs(feet));
    return translated;
  }
}

/* -------------------------------------------------- */

/**
 * Push or pull a token on a gridded scene.
 * @param {Token} token     The token to push.
 * @param {number} feet     The number of feet to push (if positive) or pull (if negative).
 * @returns {Point|null}    The point to which to move the token, or null if no movement possible.
 */
function pushGrid(token, feet) {
  const ray = new Ray(feet > 0 ? from.center : token.center, feet > 0 ? token.center : from.center);
  const angle = Math.toDegrees(ray.angle);

  // If a pull and distance to source is smaller, use smaller distance.
  if ((feet < 0) && (canvas.grid.measurePath([token.center, from.center]).distance <= Math.abs(feet))) {
    feet = Math.max(0, canvas.grid.measurePath([token.center, from.center]).distance - canvas.grid.distance);
    if (!feet) return null;
  }

  let translated;
  let intersects;
  const check = () => {
    translated = canvas.grid.getTranslatedPoint(token.center, angle, Math.abs(feet));
    intersects = token.checkCollision(canvas.grid.getCenterPoint(translated), {origin: token.center, mode: "closest"});
  };
  check();
  while (intersects) {
    if (!feet) return null;
    if (feet > 0) {
      feet -= canvas.grid.distance;
      if (feet <= 0) return null;
    } else {
      feet += canvas.grid.distance;
      if (feet >= 0) return null;
    }
    check();
  }
  const snapped = canvas.grid.getTopLeftPoint(translated);

  // Do not bother pushing or pulling if the distance is less than 1 foot, or if it would collide with the source.
  if ((canvas.grid.measurePath([snapped, token.document]).distance < 1) || (canvas.grid.measurePath([snapped, from.document]).distance < 1)) return null;

  return snapped;
}
