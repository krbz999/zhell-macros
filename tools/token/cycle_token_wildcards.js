// cycle a selected token between its wildcard images, in order.

const currentImg = token.document.data.img;
const actorId = token.actor.id;
const wildcardImages = await game.actors.get(actorId).getTokenImages();
const currentIndex = wildcardImages.indexOf(currentImg);
const next = (currentIndex + 1) === wildcardImages.length ? 0 : currentIndex + 1;
await token.document.update({img: wildcardImages[next]});
