// create a rolltable using all items in a compendium.

const collection = "compendium key goes here";
const tableImg = "image of your rolltable goes here";
const tableName = "name of the new table goes here";
const tableDescription = "description of table goes here";

/* --------------------- */
const compendium = game.packs.get(key);
if(!compendium) return ui.notifications.warn("Your key is invalid.");
const compendiumIndex = await compendium.getIndex({fields: ["img"]});

const results = [...compendiumIndex].map(({name, img}, i) => ({
	text: name,
	type: CONST.TABLE_RESULT_TYPES.COMPENDIUM,
	collection,
	img,
	weight: 1,
	range: [i+1, i+1],
	drawn: false
}));

await RollTable.create({
	name: tableName,
	results,
	img: tableImg,
	description: tableDescription,
	formula: `1d${results.length}`
});
