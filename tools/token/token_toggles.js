// swap selected token's img and size.
// add image paths and size changes below:

// toggles.
const swapSize = true;
const swapImg = true;

// array of changes.
const imgs = ["imageA.webp", "imageB.webp"];
const sizes = [1, 2];

// the update object.
const updates = {}
if (swapImg) updates["texture.src"] = token.document.texture.src === imgs[0] ? imgs[1] : imgs[0];
if (swapSize) updates = foundry.utils.mergeObject(updates, {
  height: token.document.height === sizes[0] ? sizes[1] : sizes[0],
  width: token.document.height === sizes[0] ? sizes[1] : sizes[0]
});
await token.document.update(updates);
