/**
 * A script mainly to fix your world when you decide to convert all your assets from one
 * file type to another. Replace the 'toReplace' and 'replacement' variables for your own
 * use case and remove the entries in the arrays of the respective document types in the
 * 'property' object if you want them to be untouched (or add new ones).
 */

// what to replace and what it should be replaced by:
const toReplace = ".png";
const replacement = ".webp";

// Comment out or remove the document types you do not wish to touch.
const property = {
  "Actor": ["img", "prototypeToken.texture.src"],
  "Item": ["img"],
  "ActiveEffect": ["img"],
  "Scene": ["background.src", "foreground"],
  "Token": ["texture.src"],
  "ActorDelta": ["img"],
  "Tile": ["texture.src"],
  "Note": ["texture.src"],
  "JournalEntry": [],
  "JournalEntryPage": ["src"],
  "Macro": ["img"],
  "RollTable": ["img"],
  "TableResult": ["img"]
};

/* ----------------------------- */

let globalUpdates = 0;

async function updateSidebar() {
  for (const docName of Object.keys(property)) {
    const docClass = getDocumentClass(docName);
    const collection = game[docClass.metadata.collection];
    if (!collection) continue;
    const updates = collection.map(createUpdate);
    await docClass.updateDocuments(updates);
    for (const doc of collection) await updateEmbeddedDocumentsRecursively(doc);
  }
}

// create an update for a single document.
function createUpdate(doc) {
  const paths = property[doc.documentName];
  const update = {_id: doc.id};
  for (const path of paths) {
    const value = foundry.utils.getProperty(doc, path);
    if (!value) continue;
    const newValue = value.replaceAll(toReplace, replacement);
    if (value !== newValue) {
      foundry.utils.setProperty(update, path, newValue);
      globalUpdates++;
      console.warn(`Updated document ${doc.name ?? ""} (${doc.uuid})`);
    }
  }
  return update;
}

async function updateEmbeddedDocumentsRecursively(doc) {
  const embedded = getDocumentClass(doc.documentName).metadata.embedded;
  for (const key of Object.keys(embedded)) {
    if (!(key in property)) continue;
    let collection = doc.getEmbeddedCollection(key);
    if (collection instanceof foundry.utils.Collection) {
      // really just for 'ActorDelta'
      const embeddedUpdates = collection.map(createUpdate);
      await doc.updateEmbeddedDocuments(key, embeddedUpdates);
    } else {
      collection = [collection];
    }
    for (const c of collection) await updateEmbeddedDocumentsRecursively(c);
  }
}

await updateSidebar();
