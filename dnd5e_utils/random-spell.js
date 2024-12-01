/**
 * Draw a random spell from a table that is created dynamically
 * using data retrieved from the Compendium Browser.
 */

// The spell levels. Use 0 for cantrips.
const levels = new Set([0, 1, 2, 3, 4]);

/* ----------------------------------------------------- */

const spells = await dnd5e.applications.CompendiumBrowser.fetch(Item, {
  filters: [{k: "system.level", o: "in", v: levels}],
  index: false,
  sort: true,
  types: new Set(["spell"]),
});

const resultData = [];
for (const [i, spell] of spells.entries()) {
  resultData.push({
    documentCollection: spell.pack,
    documentId: spell.id,
    drawn: false,
    img: spell.img,
    range: [i + 1, i + 1],
    text: spell.name,
    type: CONST.TABLE_RESULT_TYPES.COMPENDIUM,
    weight: 1,
  });
}

const table = new RollTable.implementation({
  formula: `1d${resultData.length}`,
  name: "Random Spell",
  results: resultData,
});

table.draw();
