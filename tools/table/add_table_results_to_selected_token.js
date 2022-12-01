// roll on a table that contains items and add the item to a selected token's actor.

// get the uuid by right-clicking the book icon in the table's header.
const table = await fromUuid("uuid of table goes here");

// draw items from compendium or sidebar.
const receiver = token?.actor;
if(!table || !receiver) return ui.notifications.warn("Missing table or selected token.");
const {results} = await table.draw();
const itemData = (await Promise.all(results.map(i => {
  const key = i.documentCollection;
  const itemId = i.documentId;
  const uuid = `Compendium.${key}.${itemId}`;
  return key === "Item" ? game.items.get(itemId) : fromUuid(uuid);
}))).map(i => i.toObject());
await receiver.createEmbeddedDocuments("Item", itemData);
