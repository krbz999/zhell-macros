// Turn a spell scroll into a spell.
// required modules: none.

const key = "dnd5e.spells"; // key for the pack where you find the spell.
const wizard = game.actors.getName("Name of the wizard");

const scrolls = wizard.items.filter(item => {
  if ((item.type !== "consumable") || (item.system.consumableType !== "scroll")) return false;
  return item.name.startsWith("Spell Scroll:");
});

if (!scrolls.length) {
  ui.notifications.info("Actor has no scrolls.");
  return null;
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
  callback: async ([html]) => {
    const scroll = wizard.items.get(html.querySelector("select").value);
    const pack = game.packs.get(key);
    const name = scroll.name.replace("Spell Scroll: ", "");
    const idx = pack.index.getName(name)?._id;
    if (!idx) {
      ui.notifications.warn(`No spell with the name '${name}' exists in compendium '${key}'.`);
      return null;
    }
    const spell = await pack.getDocument(idx);
    return Promise.all([
      Item.implementation.create(game.items.fromCompendium(spell), {parent: wizard}),
      scroll.delete()
    ]);
  }
});
