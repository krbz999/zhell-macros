// Turn a spell scroll into a spell.
// required modules: none.

const key = "..."; // key for the pack where you find the spell.
const wizard = game.actors.getName("Name of the wizard");

const scrolls = wizard.itemTypes.consumable.filter(item => {
  if (item.system.consumableType !== "scroll") return false;
  return item.name.startsWith("Spell Scroll:");
});
if (!scrolls.length) {
  ui.notifications.info("Actor has no scrolls.");
  return;
}
const options = scrolls.reduce((acc, {id, name}) => {
  return acc += `<option value="${id}">${name}</option>`;
}, "");
const content = `
<form class="dnd5e">
  <div class="form-group">
    <label>Select the scroll:</label>
    <div class="form-fields">
      <select autofocus>${options}</select>
    </div>
  </div>
</form>`;
return Dialog.prompt({
  title: "Scroll to Spell",
  content,
  rejectClose: false,
  label: "Create Spell",
  callback: async (html) => {
    const scroll = wizard.items.get(html[0].querySelector("select").value);
    const pack = game.packs.get(key);
    const spell = await pack.getDocument(pack.index.getName(scroll.name.replace("Spell Scroll: ", ""))._id);
    const [createdSpell] = await wizard.createEmbeddedDocuments("Item", [spell.toObject()]);
    if (createdSpell) return scroll.delete();
  }
});
