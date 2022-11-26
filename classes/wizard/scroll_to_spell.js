// Turn a spell scroll into a spell.
// required modules: none.

const key = "..."; // key for the pack where you find the spell.
const wizard = game.actors.getName("Name of the wizard");

const scrolls = wizard.itemTypes.consumable.filter(item => {
  if ( item.system.consumableType !== "scroll" ) return false;
  return item.name.startsWith("Spell Scroll:");
});
if ( !scrolls.length ) {
  ui.notifications.info("Actor has no scrolls.");
  return;
}
const options = scrolls.reduce((acc, { id, name }) => {
  return acc += `<option value="${id}">${name}</option>`;
}, "");
const content = `
<form>
  <div class="form-group">
    <label for="item-select">Select the scroll:</label>
    <div class="form-fields">
      <select id="item-select">${options}</select>
    </div>
  </div>
</form>`;
return Dialog.prompt({
  title: "Scroll to Spell",
  content,
  rejectClose: false,
  label: "Create Spell",
  callback: async (html) => {
    const scrollId = html[0].querySelector("#item-select").value;
    const scroll = wizard.items.get(scrollId);
    const pack = game.packs.get(key);
    const spellId = pack.index.getName(scroll.name.replace("Spell Scroll: ", ""))._id;
    const spell = pack.getDocument(spellId);
    const createdSpell = await wizard.createEmbeddedDocuments("Item", [spell.toObject()]);
    if ( createdSpell.length > 0 ) return scroll.delete();
  }
});
