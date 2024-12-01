// HARNESS DIVINE POWER
// required modules: itemacro

const data = actor.getRollData();
const maxLevel = Math.ceil(data.attributes.prof / 2);
const validLevels = [];
for (let i = 1; i <= maxLevel; i++) {
  const key = `spell${i}`;
  if ((data.spells[key].value < data.spells[key].max) && (data.spells[key].max > 0)) {
    validLevels.push(key);
  }
}
const pact = data.spells.pact;
if ((pact.max > 0) && (pact.level <= maxLevel) && (pact.value < pact.max)) validLevels.push("pact");

// bail out if you are not missing any spell slots or if the item has no remaining uses (limited uses and resources).
if (!validLevels.length) return ui.notifications.warn("You are not missing any valid spell slots.");
if (!item.system.uses.value) return ui.notifications.warn("You have no uses left of Harness Divine Power.");

const resourceItem = actor.items.get(item.system.consume.target);
const uses = resourceItem.system.uses;
if (!uses.value) return ui.notifications.warn("You have no uses of Channel Divinity left.");

// define dialog contents
const options = validLevels.reduce((acc, e) => {
  const spells = data.spells[e];
  const label = e === "pact" ? "Pact Slots" : CONFIG.DND5E.spellLevels[e.at(-1)];
  return acc + `<option value="${e}">${label} (${spells.value} / ${spells.max})</option>`;
}, "");

return Dialog.prompt({
  title: item.name,
  rejectClose: false,
  label: "Recover",
  content: `
  <p>Select a spell slot level.</p>
  <form>
    <div class="form-group">
      <label>Spell Slot:</label>
      <div class="form-fields">
        <select>${options}</select>
      </div>
    </div>
  </form>`,
  callback: async (html) => {
    const level = html[0].querySelector("select").value;
    const value = data.spells[level].value + 1;
    await actor.update({[`system.spells.${level}.value`]: value});
    await actor.updateEmbeddedDocuments("Item", [
      {_id: resourceItem.id, "system.uses.value": uses.value - 1},
      {_id: item.id, "system.uses.value": item.uses.value - 1}
    ]);
    ui.notifications.info("Recovered a spell slot!");
  }
});
