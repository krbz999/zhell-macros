/**
 * A script to fix your world when you decide to convert all your assets from one
 * file type to another or decide to reorganize your image and sound assets.
 *
 * This script will traverse all documents in the world, including embedded documents,
 * finding every single filepath field and perfoming a change to the stored value.
 *
 * NOTE: This does not currently cover urls such as `<img src="">` in html fields.
 * NOTE: This script requires a minimum core version of 14.
 *
 * This script will check for the existence of both the new and old filepath,
 * and only perform an update to that field if the new one exists. This behavior
 * can be configured below.
 */

/**
 * Enter here the substring of filepaths that will be replaced.
 * @type {string}
 */
const toReplace = "Cool Assets Folder Name I Regret/";

/**
 * Enter here the string that the above substring will be replaced with.
 * @type {string}
 */
const replaceWith = "my-assets/";

/**
 * Change the value of a filepath field even if the current value exists?
 * @type {boolean}
 */
const forceChangeExisting = true;

/**
 * Change the value of a filepath field even if the new value does not exist?
 * @type {boolean}
 */
const forceChangeNonExistingNew = false;

/* -------------------------------------------------- */
/*   Script starts here.                              */
/*   Change nothing below this line.                  */
/* -------------------------------------------------- */

/**
 * An enumeration of all file path fields.
 * @example 'filepaths.Actor.core' or 'filepaths.Actor.subtypes["myModule.monster"]'.
 * @type {Record<string, { core: Set<string>, subtypes: Record<string, Set<string> }>}
 */
const filepaths = CONST.ALL_DOCUMENT_TYPES.reduce((acc, documentName) => {
  acc[documentName] = {
    core: new Set(),
    subtypes: {},
  };

  // Grab all easy-to-grab fields on the root document model.
  const DocumentClass = getDocumentClass(documentName);
  DocumentClass.schema.apply(function() {
    if (this instanceof foundry.data.fields.FilePathField) acc[documentName].core.add(this.fieldPath);
  });

  // Retrieve all package file path fields.
  for (const [type, datamodel] of Object.entries(CONFIG[documentName]?.dataModels ?? {})) {
    if (!datamodel) continue;
    acc[documentName].subtypes[type] = new Set();

    // Grab all easy-to-grab fields on the subtype.
    datamodel.schema.apply(function() {
      if (this instanceof foundry.data.fields.FilePathField) acc[documentName].subtypes[type].add(this.fieldPath);
    });

    const packageHasRegistered = (pkg, subtype) => {
      return !!pkg.documentTypes?.[documentName]?.[subtype]?.filePathFields;
    };

    let pkg;
    let [packageId, subtype] = type.split(".");

    // If the type is 'base', or there is no dot-notation, it must be a model registered by core or system.
    if (!subtype || (type === "base")) {
      // This is just a guess. Systems should be discouraged from registering models with this subtype.
      pkg = packageHasRegistered(game.system, type) ? game.system : null;
    }

    // It must otherwise be from a module.
    else {
      pkg = game.modules.get(packageId);
      pkg = packageHasRegistered(pkg) ? pkg : null;
    }

    if (!pkg) {
      // If the package that registered the subtype could not be found,
      // or the subtype was registered by core, we cannot retrieve more fields.
      continue;
    }

    const paths = Object.keys(pkg.documentTypes[documentName][subtype].filePathFields);
    paths.forEach(path => acc[documentName].subtypes[type].add(`system.${path}`));
  }

  return acc;
}, {});

// `DataModel#schema.apply` has issues with arrays and other such structures, so some have to be
// added manually in addition to reading from manifests above.
filepaths.Card.core.add("faces.*.img");

/* -------------------------------------------------- */

/**
 * Helper method to mutate a string such as `system.activities.*.img` into all relevant paths on a document.
 * @param {foundry.abstract.Document} doc
 * @param {string} path
 * @returns {Set<string>}
 */
const retrieveDocumentPaths = (doc, path) => {
  /**
   * Internal helper method.
   * @param {any} current
   * @param {string[]} parts
   * @param {string[]} accumulated
   * @returns {string[]}
   */
  const helper = (current, parts, accumulated) => {
    if (!parts.length) return [accumulated];

    const [currentPart, ...tailParts] = parts;

    if (currentPart === "*") {
      if (typeof current === "object")
        return Object.keys(current).flatMap(key => helper(current[key], tailParts, [...accumulated, key]));
      else return [];
    }

    if (current && (currentPart in current)) {
      return helper(current[currentPart], tailParts, [...accumulated, currentPart]);
    }

    return [];
  };

  const resolved = new Set();
  for (const p of helper(doc._source, path.split("."), [])) resolved.add(p.join("."));
  return resolved;
};

/* -------------------------------------------------- */

let value = 0;
let max = 0;
let collectionName;
let pathsChanged = 0;
let documentsChanged = 0;

const notification = ui.notifications.info("Finding broken filepaths...", {
  progress: true,
  pct: 0,
  permanent: true,
});
const updateNotification = () => {
  notification.update({
    message: `Finding broken filepaths in ${collectionName} collection...`,
    pct: value / max,
  });
};

const batches = [];
for (const collection of game.collections) {
  max += collection.size;
  collectionName = collection.documentName;
  updateNotification();
  for (const doc of collection) {
    await createBatch(doc);
    value++;
    updateNotification();
    for (const [, d] of doc.traverseEmbeddedDocuments()) {
      max++;
      updateNotification();
      await createBatch(d);
      value++;
      updateNotification();
    }
  }
}
const changes = await foundry.documents.modifyBatch(batches);
console.warn(`These documents were changed by the Asset Migration script.`, Object.groupBy(changes.flat(), d => d.documentName));
notification.element?.classList.add("success");
notification.update({
  message: `Scanning and update complete! Changed ${pathsChanged} filepaths across ${documentsChanged} documents.`,
  pct: 1,
});

/* -------------------------------------------------- */

/**
 * Create the batch operation object for a document.
 * @param {foundry.abstract.Document} doc
 * @returns {Promise<void>}
 */
async function createBatch(doc) {
  const update = {};
  let paths = filepaths[doc.documentName].core.union(filepaths[doc.documentName].subtypes[doc.type] ?? new Set());
  paths = paths.reduce((acc, path) => acc.union(retrieveDocumentPaths(doc, path)), new Set());
  for (const path of paths) {
    const current = foundry.utils.getProperty(doc._source, path);
    if (!current) continue;
    let exists = await foundry.utils.srcExists(current);
    if (exists && !forceChangeExisting) continue;
    const replacement = current.replace(toReplace, replaceWith);
    exists = await foundry.utils.srcExists(replacement);
    if (exists || forceChangeNonExistingNew) {
      Object.assign(update, { _id: doc.id, [path]: replacement });
      pathsChanged++;
    }
  }
  if (foundry.utils.isEmpty(update)) return;

  // Push update to an existing batch operation or create a new one.
  const existingBatch = batches.find(b => (b.parent === doc.parent) && (b.documentName === doc.documentName));
  if (existingBatch) existingBatch.updates.push(update);
  else batches.push({ action: "update", parent: doc.parent, updates: [update], documentName: doc.documentName });
  documentsChanged++;
}
