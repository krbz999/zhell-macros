// Arcane Recovery
// required modules: itemacro

// get spell object and wizard levels.
const levels = actor.classes.wizard.system.levels;
const spells = foundry.utils.deepClone(actor.system.spells);

// bail out if you can't use this item again.
const available = item.system.uses.value > 0;
if (!available) {
  ui.notifications.warn("DND5E.AbilityUseUnavailableHint", {localize: true});
  return;
}

// attained spell levels, then mapping to value and max.
const level_maps = Array.fromRange(6, 1).reduce((acc, i) => {
  const s = spells[`spell${i}`];
  if (s.max > 0) acc.push(s);
  return acc;
}, []);

// bail out if there are no missing valid spell slots.
if (!level_maps.some(s => s.value !== s.max)) {
  ui.notifications.warn("You are not missing any valid spell slots.");
  return;
}

const use = await item.use();
if (!use) return;

const maxVal = Math.ceil(levels / 2);
let spent = 0;

let content = `<p name="header">Recovering spell slots: <strong>${spent}</strong> / ${maxVal}.</p> <hr> <form>`;
for (let i = 0; i < level_maps.length; i++) {
  const val = i + 1;
  const name = `level${val}`;
  content += `
  <div class="form-group">
    <label style="text-align:center"><strong>${val.ordinalString()}-level</strong></label>
    <div class="form-fields">`;
  for (let j = 0; j < level_maps[i].max; j++) {
    const cd = j < level_maps[i].value ? "checked disabled" : "";
    content += `<input type="checkbox" value="${val}" name="${name}" ${cd}></input>`;
  }
  content += "</div></div>";
}
content += "</form> <hr>";

const dialog = new Dialog({
  title: "Arcane Recovery",
  content,
  buttons: {
    go: {
      icon: `<i class="fa-solid fa-hat-wizard"></i>`,
      label: "Recover",
      callback: async (html) => {
        if (spent > maxVal || spent < 1) {
          ui.notifications.warn("Invalid number of slots to recover.");
          return dialog.render(true);
        }
        for (let i = 0; i < 9; i++) {
          const selector = `input[name=level${i + 1}]:checked`;
          const val = html[0].querySelectorAll(selector).length;
          spells[`spell${i + 1}`].value = val;
        }
        await actor.update({"system.spells": spells});
        ui.notifications.info("Spell slots recovered!");
      }
    }
  },
  render: (html) => {
    html[0].addEventListener("change", function() {
      const selector = "input:checked:not(:disabled)";
      const inputs = html[0].querySelectorAll(selector);
      spent = Array.from(inputs).reduce((acc, node) => {
        return acc + Number(node.value);
      }, 0);
      const hint = `Recovering spell slots: <strong>${spent}</strong> / ${maxVal}.`;
      html[0].querySelector("[name=header]").innerHTML = hint;
    });
  }
}).render(true);
