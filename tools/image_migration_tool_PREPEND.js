// Author: Zhell#9201
// Put together by Havoc#1805

// This script goes through all images (and sounds) in almost all objects.
// It takes the following steps:
// - check if an image exists. If it does, no changes made.
// - if the image does not exist, it prepends the below string, and checks if that new image exists.
// - if the new image exists, it will perform a replacement.
// - if the new image also does not exist, the user will be notified in the console (F12).
// This is ideal for people moving from local host to server like AWS

// The string to prepend to the sources.
const prepend = "PREPEND URL (remember to end it with /)";

// the collection and what property is being updated:
// e.g., [Item, "img"] for img on every item in the directory.
const maps = [
  [Scene, "background.src"],
  [Item, "img"],
  [Actor, "img"],
  [Actor, "prototypeToken.texture.src"],
  [Macro, "img"],
  [RollTable, "img"]
];

// the collection, the embedded collection, what property to update:
// e.g.: ["items", "effects", "icon"] for the icons on all effects on all items in the directory.
const embedded = [
  ["scenes", "notes", "texture.src"],
  ["playlists", "sounds", "path"],
  ["scenes", "tiles", "texture.src"],
  ["scenes", "tokens", "texture.src"],
  ["actors", "items", "img"],
  ["journal", "pages", "src"],
  ["tables", "results", "img"],
  ["actors", "effects", "icon"],
  ["items", "effects", "icon"]
];

// touch nothing below this line.

let errors = 0;
const missingFilePaths = [];
ui.notifications.info("MIGRATION BEGUN!");

for (const m of maps) await swap(...m);

for (const m of embedded) await swapEmbedded(...m);

ui.notifications.info(`MIGRATION COMPLETED! (errors: ${errors})`);

console.log("MISSING FILE PATHS:");
for(const [doc, prop] of missingFilePaths) console.log(doc, prop);

async function swap(collection, property) {
  const coll = collection.metadata.collection;
  console.warn(`Replacing ${property} in game.${coll}.`);
  try {
    const updates = await createMap(game[coll], property);
    return collection.updateDocuments(updates);
  } catch (err) {
    return error(`ERROR IN 'game.${coll}'.`);
    console.warn(err);
  }
}

async function swapEmbedded(collection, embeddedCollection, property) {
  console.warn(`Replacing ${property} in ${collection} on ${embeddedCollection}.`);
  for (const doc of game[collection]) {
    try {
      const docs = await createMap(doc[embeddedCollection], property);
      if (!docs.length) continue;
      const type = doc[embeddedCollection].find(c => c).documentName;
      await doc.updateEmbeddedDocuments(type, docs);
    } catch (err) {
      error(`ERROR REPLACING '${property}' IN 'game.${collection}' (${doc.name}).`);
      console.warn(err);
    }
  }
}

async function createMap(docs, property) {
  const updates = [];
  for (const doc of docs) {
    const prop = foundry.utils.getProperty(doc, property);
    const f = await fetch(prop);
    if (f.status === 200) continue;
    else if (f.status === 404) {
      const g = await fetch(prepend + prop);
      if (g.status === 200) updates.push({_id: doc.id, [property]: prepend + prop});
      else missingFilePaths.push([doc, prop]);
    }
  }
  return updates;
}

function error(string) {
  console.error(string);
  errors++;
  return null;
}
