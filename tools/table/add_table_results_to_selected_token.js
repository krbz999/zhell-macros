// Draw from a table that contains items and add the items to a selected token's actor.

// Get the uuid by right-clicking the book icon in the table's header.
const table = await fromUuid("uuid of table goes here");

// Draw items from compendium or sidebar.
const receiver = token?.actor;
if(!table || !receiver){
  ui.notifications.warn("Missing table or selected token.");
  return null;
}
const draw = await table.draw();
const promises = draw.results.map(i => {
  const key = i.documentCollection;
  const id = i.documentId;
  const uuid = `Compendium.${key}.${id}`;
  return key === "Item" ? game.items.get(id) : fromUuid(uuid);
});
const items = await Promise.all(promises);
const itemData = items.map(item => game.items.fromCompendium(item));
return receiver.createEmbeddedDocuments("Item", itemData);
