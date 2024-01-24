/**
 * Macro to create loot, either in an item pile or on an actor.
 * Can additionally add to the sidebar on creation.
 * Required modules: item-piles, warpgate.
 * Credit to @LukasPrism for the warpgate targeting.
 */

/* --------------------------- */

const {files} = await FilePicker.browse("public", "icons/commodities/treasure");
const img = files[Math.floor(Math.random() * files.length)];

const content = `
<p style="text-align:center">
  <img src="${img}" style="width: 60px; height: 60px;">
</p>
<hr>
<form class="dnd5e">
  <div class="form-group">
    <label for="name">Item name</label>
    <div class="form-fields">
      <input name="name" type="text" value="Curiosity">
    </div>
  </div>
  <div class="form-group">
    <label for="price">Price (GP)</label>
    <div class="form-fields">
      <input name="system.price.value" type="number" value="25">
    </div>
  </div>
  <div class="form-group">
    <label for="weight">Weight (lbs.)</label>
    <div class="form-fields">
      <input name="system.weight" type="number" value="1">
    </div>
  </div>
  <div class="form-group">
    <label for="quantity">Quantity</label>
    <div class="form-fields">
      <input name="system.quantity" type="number" value="1">
    </div>
  </div>
  <div class="form-group">
    <label for="description">Description</label>
    <div class="form-fields">
      <textarea style="resize: none" name="system.description.value" placeholder="Enter text..."></textarea>
    </div>
  </div>
  <div class="form-group">
    <label for="sidebarbox">Add to sidebar</label>
    <div class="form-fields">
      <input name="sidebar" type="checkbox">
    </div>
  </div>
</form>`;

Dialog.prompt({
  title: "Create Loot",
  rejectClose: false,
  label: "Create Loot!",
  content: content,
  callback: async ([html]) => {
    const itemData = foundry.utils.mergeObject({
      img, type: "loot", "system.rarity": "common"
    }, new FormDataExtended(html.querySelector("FORM")).object);
    const sidebar = itemData.sidebar;
    delete itemData.sidebar;

    const crosshairs = await warpgate.crosshairs.show({
      label: "Select recipient or location", drawIcon: false, size: 1
    });
    const tokenDocs = crosshairs.cancelled ? [] : warpgate.crosshairs.collect(crosshairs);
    if (sidebar) await Item.createDocuments([itemData]);

    // if no token was targeted, add the item to a new item pile, initially hidden.
    if (!tokenDocs.length) {
      const updates = {
        embedded: {Item: {[itemData.name]: itemData}},
        token: {hidden: true}
      }
      return warpgate.spawnAt(crosshairs, "Default Item Pile", updates);
    }

    const [token] = tokenDocs;
    const parent = token.actor;
    await Item.create(itemData, {parent: parent});
    const isItemPile = token.getFlag("item-piles", "data.enabled");
    if (isItemPile) return token.update({name: "Pile of Loot"});
  }
});
