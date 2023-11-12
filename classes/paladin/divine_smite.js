// DIVINE SMITE
// required modules: none.

const data = actor.getRollData();
const inputs = Object.entries(data.spells).filter(([key, values]) => {
  return values.value > 0;
}).map(([key, values]) => {
  const crd = (key === "pact") ? "Pact Slot" : CONFIG.DND5E.spellLevels[key.at(-1)];
  return [key, crd, values];
});
if (!inputs.length) return ui.notifications.warn("You have no spell slots remaining.");

const options = inputs.reduce((acc, [key, crd, values]) => {
  return acc + `<option value="${key}">${crd} (${values.value}/${values.max})</option>`;
}, "");

const content = `
<form class="dnd5e">
  <div class="form-group">
    <label>Spell Slot:</label>
    <div class="form-fields">
      <select name="slot">${options}</select>
      <label class="checkbox">
        <input type="checkbox" name="extra">
        Extra die
      </label>
    </div>
  </div>
</form>`;

return Dialog.prompt({title: "Divine Smite", content: content, label: "Smite!", callback: rollDamage, rejectClose: false});

async function rollDamage([html], event) {
  const {slot, extra} = new FormDataExtended(html.querySelector("FORM")).object;
  const level = (slot === "pact") ? data.spells["pact"].level : parseInt(slot.replace("spell", ""));
  const feature = new Item.implementation({
    type: "feat",
    name: "Divine Smite",
    system: {
      damage: {parts: [[`${Math.min(5, 1 + level) + (extra ? 1 : 0)}d8`, "radiant"]]},
      actionType: "util"
    }
  }, {parent: actor});
  feature.prepareData();
  feature.prepareFinalAttributes();
  const roll = await feature.rollDamage({event});
  if (!roll) return;
  const value = data.spells[slot].value - 1;
  return actor.update({[`system.spells.${slot}.value`]: value});
}
