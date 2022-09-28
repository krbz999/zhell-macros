// Arcane Recovery
// required modules: itemacro
/*
  You have learned to regain some of your magical energy by studying your spellbook.
  Once per day when you finish a short rest, you can choose expended spell slots to recover.
  The spell slots can have a combined level that is equal to or less than half your wizard level (rounded up),
  and none of the slots can be 6th level or higher.
*/

// get spell object and wizard levels.
const {
  spells,
  classes: {
    wizard: {
      levels
    }
  }
} = actor.getRollData();

// bail out if you can't use this item again.
const available = item.system.uses.value > 0;
if (!available) {
  const string = "DND5E.AbilityUseUnavailableHint";
  const locale = game.i18n.localize(string);
  ui.notifications.warn(locale);
  return;
}

// attained spell levels, then mapping to value and max.
const level_maps = Array.fromRange(6).filter(i => {
  return spells[`spell${i + 1}`].max > 0;
}).map(i => {
  return spells[`spell${i + 1}`];
});

// bail out if there are no missing valid spell slots.
const anyMissing = level_maps.filter(({ value, max }) => {
  return value !== max;
})
if (!anyMissing.length) {
  ui.notifications.warn("You are not missing any valid spell slots.");
  return;
}

const use = await item.use();
if (!use) return;

const maxVal = Math.ceil(levels / 2);
let spent = 0;

let content = `<p name="header">Recovering spell slots: <strong>${spent}</strong> / ${maxVal}.</p> <hr> <form>`;
for (let i = 0; i < level_maps.length; i++) {
  content += `
		<div class="form-group">
			<label style="text-align:center"><strong>${nth(i + 1)}-level</strong></label>
			<div class="form-fields">`;
  for (let j = 0; j < level_maps[i].max; j++) content += `
		<input
			type="checkbox"
			value="${i + 1}"
			name="level${i + 1}"
			${j < level_maps[i].value ? 'checked disabled' : ''}
		></input>`;
  content += `</div></div>`;
}
content += `</form> <hr>`;

const dialog = new Dialog({
  title: "Arcane Recovery",
  content,
  buttons: {
    go: {
      icon: `<i class="fas fa-check"></i>`,
      label: "Recover",
      callback: async (html) => {
        if (spent > maxVal || spent < 1) {
          ui.notifications.warn("Invalid number of slots to recover.");
          dialog.render(true);
        } else {
          for (let i = 0; i < 9; i++) {
            const val = html[0].querySelectorAll(`input[name=level${i + 1}]:checked`).length;
            spells[`spell${i + 1}`].value = val;
          }
          await actor.update({ system: { spells } });
          ui.notifications.info("Spell slots recovered!");
        }
      }
    }
  },
  render: (html) => {
    html[0].querySelectorAll("input[type=checkbox]").forEach(input => {
      input.addEventListener("change", function () {
        spent = Array.fromRange(9).reduce((acc, i) => {
          const selector = `input[name=level${i + 1}]:checked:not(:disabled)`;
          const length = html[0].querySelectorAll(selector).length;
          return acc + Number(length * (i + 1));
        }, 0);
        const hint = `Recovering spell slots: <strong>${spent}</strong> / ${maxVal}.`;
        html[0].querySelector("p[name=header]").innerHTML = hint;
      });
    });
  }
}).render(true);

function nth(n) { return n + (["st", "nd", "rd"][((n + 90) % 100 - 10) % 10 - 1] || "th") }
