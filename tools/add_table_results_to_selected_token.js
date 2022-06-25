// roll on a table that contains items and add the item to a selected token's actor.

// use this if the table is in the sidebar.
const table = game.tables.getName("name of the table");

// use this if the table is in a compendium.
const tableKey = "key of the compendium that has the table";
const tableName = "name of the table";
const pack = game.packs.get(tableKey);
const tableId = pack.index.find(i => i.name === tableName)._id;
const table = await pack.getDocument(tableId);

// draw items from compendium or sidebar.
const receiver = token?.actor;
if(!table || !receiver) return ui.notifications.warn("Missing table or selected token.");
const {results} = await table.draw();
const itemData = (await Promise.all(results.map(i => {
  const key = i.data.collection;
  const itemId = i.data.resultId;
  const uuid = `Compendium.${key}.${itemId}`;
  return key === "Item" ? game.items.get(itemId) : fromUuid(uuid);
}))).map(i => i.toObject());
await receiver.createEmbeddedDocuments("Item", itemData);
