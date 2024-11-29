/**
 * Draw a random spell from a table that is created dynamically
 * using data retrieved from the Compendium Browser.
 */

// The spell levels. Use 0 for cantrips.
const levels = [0, 1, 2, 3, 4];

/* ----------------------------------------------------- */

const name = `Random Spell (${CONFIG.DND5E.spellLevels[level]})`;
const spells = await dnd5e.applications.CompendiumBrowser.fetch(Item, {
  types: new Set(["spell"]),
  filters: [{k: "system.level", o: "in", v: levels}],
  index: false,
  sort: true
});

const resultData = [];
for (const [i, spell] of spells.entries()) {
  resultData.push({
    range: [i + 1, i + 1],
    weight: 1,
    documentId: spell.id,
    documentCollection: spell.pack,
    drawn: false,
    img: spell.img,
    text: spell.name,
    type: CONST.TABLE_RESULT_TYPES.COMPENDIUM,
  });
}

const table = new RollTable.implementation({
  name: name,
  results: resultData,
  formula: `1d${resultData.length}`
});

table.draw();
