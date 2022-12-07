// HARNESS DIVINE POWER
// required modules: itemacro
// setup: 
// (1) Place macro in Item Macro on the Harness Divine Power feature.
// (2) Have Harness Divine Power set up with Limited Uses.
// (3) Have Harness Divine Power consume Limited Uses of a Channel Divinity item.

const {spells, attributes: {prof}} = foundry.utils.duplicate(actor.system);
const maxLevel = Math.ceil(prof/2);
const validLevels = [];
for (let i = 1; i <= maxLevel; i++) {
  const key = `spell${i}`;
  if (spells[key].value < spells[key].max && spells[key].max > 0) validLevels.push(key);
}
const {level: pl, max: pm, value: pv} = spells["pact"];
if (pm > 0 && pl <= maxLevel && pv < pm) validLevels.push("pact");

// bail out if you are not missing any spell slots or if the item has no remaining uses (limited uses and resources).
if (!validLevels.length) {
  ui.notifications.warn("You are not missing any valid spell slots.");
  return;
}
const {value: limUses} = item.system.uses;
if (!limUses) {
  ui.notifications.warn("You have no uses left of Harness Divine Power.");
  return;
}
const resourceItem = actor.items.get(item.system.consume.target);
const {value: conUses} = resourceItem.system.uses;
if (!conUses) {
  ui.notifications.warn("You have no uses of Channel Divinity left.");
  return;
}

// define dialog contents
const options = validLevels.reduce((acc, e) => {
  const {value, max} = spells[e];
  const label = e === "pact" ? "Pact Slots" : CONFIG.DND5E.spellLevels[e.at(-1)];
  return acc + `<option value="${e}">${label} (${value} / ${max})</option>`;
}, "");

new Dialog({
  title: "Harness Divine Power",
  content: `
  <p>Select a spell slot level.</p>
  <form>
    <div class="form-group">
      <label>Spell Slot:</label>
      <div class="form-fields">
        <select id="hdp-level" autofocus>${options}</select>
      </div>
    </div>
  </form>`,
  buttons: {
    run: {
      icon: "<i class='fa-solid fa-hand-sparkles'></i>",
      label: "Recover",
      callback: async (html) => {
        const level = html[0].querySelector("#hdp-level").value;
        spells[level].value++;
        await actor.update({"system.spells": spells});
        await actor.updateEmbeddedDocuments("Item", [
          {_id: resourceItem.id, "system.uses.value": conUses - 1},
          {_id: item.id, "system.uses.value": limUses - 1}
        ]);
        ui.notifications.info("Recovered a spell slot!");
      }
    }
  }
}).render(true);
