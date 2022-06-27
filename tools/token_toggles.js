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
if(swapSize) updates.img = token.document.data.img === imgs[0] ? imgs[1] : imgs[0];
if(swapImg) updates = mergeObject(updates, {
  height: token.document.data.height === sizes[0] ? sizes[1] : sizes[0],
  width: token.document.data.height === sizes[0] ? sizes[1] : sizes[0]
});

await token.document.update(updates);
