// replace parts of a string on properties of documents.

// what to replace and what it should be replaced by:
const toReplace = ".png";
const replacement = ".webp";

// the collection and what property is being updated:
// e.g., [Item, "img"] for img on every item in the directory.
const maps = [
  [Item, "img"],
  [Macro, "img"],
  [Actor, "img"],
  [Actor, "prototypeToken.texture.src"],
  [RollTable, "img"],
  [Scene, "background.src"]
];

// the collection, the embedded collection, what property to update:
// e.g.: ["items", "effects", "icon"] for the icons on all effects on all items in the directory.
const embedded = [
  ["items", "effects", "icon"],
  ["actors", "items", "img"],
  ["actors", "effects", "icon"],
  ["tables", "results", "img"],
  ["scenes", "tokens", "texture.src"],
  ["scenes", "tiles", "texture.src"],
  ["scenes", "notes", "texture.src"],
  ["journal", "pages", "src"]
];

// touch nothing below this line.
let errors = 0;
ui.notifications.info("MIGRATION BEGUN!");
for (const m of maps) await swap(...m);
for (const m of embedded) await swapEmbedded(...m);
ui.notifications.info(`MIGRATION COMPLETED! (errors: ${errors})`);

async function swap(collection, property) {
  const coll = collection.metadata.collection;
  console.warn(`Replacing ${property} in game.${coll}.`);
  try {
    const updates = createMap(game[coll], property);
    return collection.updateDocuments(updates);
  } catch (err) {
    return error(`Error in game.${coll}.`, err);
  }
}

async function swapEmbedded(collection, embeddedCollection, property) {
  console.warn(`Replacing ${property} in ${collection} on ${embeddedCollection}.`);
  for (const doc of game[collection]) {
    try {
      const docs = createMap(doc[embeddedCollection], property);
      if (!docs.length) continue;
      const type = doc[embeddedCollection].find(c => c).documentName;
      await doc.updateEmbeddedDocuments(type, docs);
    } catch (err) {
      error(`Error replacing ${property} in game.${collection} (${doc.name}).`, err);
    }
  }
}

function createMap(docs, property) {
  return docs.map(doc => {
    const prop = foundry.utils.getProperty(doc, property);
    if (!prop) return { _id: doc.id };
    return { _id: doc.id, [property]: prop.replace(toReplace, replacement) };
  })
}

function error(string, err){
  console.error(string);
  console.warn(err);
  errors++;
  return null;
}
