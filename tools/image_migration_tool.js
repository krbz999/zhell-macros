/**
 * A script mainly to fix your world when you decide to convert all your assets from one
 * file type to another or after reorganizing your image and sound assets.
 *
 * Replace the 'toReplace' and 'replacement' variables for your own use case and remove
 * the entries in the arrays of the respective document types in the 'property' object if
 * you want them to be untouched (or add new ones).
 */

// what to replace and what it should be replaced by:
const toReplace = ".png";
const replacement = ".webp";

// Comment out or remove the document types you do not wish to touch.
const property = {
  ActiveEffect: ["img"],
  Actor: ["img", "prototypeToken.texture.src", "prototypeToken.ring.subject.texture"],
  AmbientLight: [],
  AmbientSound: [],
  Card: [],
  Cards: [],
  Item: ["img"],
  JournalEntry: [],
  JournalEntryPage: ["src"],
  Macro: ["img"],
  Note: ["texture.src"],
  Playlist: [],
  PlaylistSound: ["path"],
  RollTable: ["img"],
  Scene: ["background.src", "foreground"],
  TableResult: ["img"],
  Tile: ["texture.src"],
  Token: ["texture.src", "ring.subject.texture"],
  User: ["img"],
};

/* ----------------------------- */

let globalUpdates = 0;

for (const collection of game.collections) {
  for (const document of collection) {
    await performUpdate(document);
    for (const [, embedded] of document.traverseEmbeddedDocuments()) {
      await performUpdate(embedded);
    }
  }
}

async function performUpdate(document) {
  try {
    const paths = property[document.documentName] ?? [];
    const update = {};

    const source = document.toObject();

    for (const path of paths) {
      const value = foundry.utils.getProperty(source, path);
      if (!value || (await srcExists(value))) continue;
      const replaced = value.replaceAll(toReplace, replacement);
      if (value !== replaced) foundry.utils.setProperty(update, path, replaced);
    }

    if (!foundry.utils.isEmpty(update)) {
      update._id = document.id;
      globalUpdates++;
      console.warn(`Updated ${document.documentName} '${document.name || document.id}' (${document.uuid}).`);
      return document.update(update);
    }
  } catch(err) {
    console.error(`Unable to update ${document.documentName} '${document.name || document.id}' (${document.uuid}).`);
    console.error(err);
  }
  return document;
}

ui.notifications.info(`COMPLETED UPDATE OF ${globalUpdates} DOCUMENTS.`);
