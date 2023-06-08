// cycle a selected token between its wildcard images, in order.

const currentImg = token.document.texture.src;
const actorId = token.actor.id;
const wildcardImages = await game.actors.get(actorId).getTokenImages();
const currentIndex = wildcardImages.indexOf(currentImg);
const next = (currentIndex + 1) === wildcardImages.length ? 0 : currentIndex + 1;
await token.document.update({"texture.src": wildcardImages[next]});
