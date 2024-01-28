/**
 * Replace parts of the 'img' property on all documents in a compendium.
 */

const key = "key of compendium";
const toReplace = "the part of the string that is going to be replaced";
const replacement = "the replacement for the substring";

/* --------------------- */

const pack = game.packs.get(key);
const documents = await pack.getDocuments();
const updates = documents.map(doc => ({
  _id: doc.id,
  img: doc.img.replace(toReplace, replacement)
}));
await pack.documentClass.updateDocuments(updates, {pack: key});
