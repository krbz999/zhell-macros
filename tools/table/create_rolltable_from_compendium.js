// create a rolltable using all items in a compendium.

const compendiumKey = "compendium key goes here";
const tableImg = "image of your rolltable goes here";
const tableName = "name of the new table goes here";
const tableDescription = "description of table goes here";

/* --------------------- */

const pack = game.packs.get(compendiumKey);
if (!pack) {
  ui.notifications.warn("Your key is invalid.");
  return null;
}

const tableResults = pack.index.map((item, i) => ({
  img: item.img,
  text: item.name,
  type: CONST.TABLE_RESULT_TYPES.COMPENDIUM,
  documentCollection: compendiumKey,
  documentId: item._id,
  weight: 1,
  range: [i + 1, i + 1],
  drawn: false
}));

await RollTable.implementation.create({
  name: tableName,
  results: tableResults,
  img: tableImg,
  description: tableDescription,
  formula: `1d${tableResults.length}`
});
