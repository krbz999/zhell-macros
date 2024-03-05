/**
 * Cycle a selected token between its wildcard images, in order.
 * Hold shift to go backwards.
 */

if (!token) {
  ui.notifications.warn("You need a token on the scene to use this macro.");
  return null;
}

const isReverse = event.shiftKey;
const wildcardImages = await token.document.baseActor.getTokenImages();
const currentIndex = wildcardImages.indexOf(token.document.texture.src);
let next;
if (!isReverse) next = (currentIndex + 1 === wildcardImages.length) ? 0 : (currentIndex + 1);
else next = (currentIndex > 0) ? (currentIndex - 1) : wildcardImages.length - 1;
await token.document.update({"texture.src": wildcardImages[next]});
