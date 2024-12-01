/**
 * Arcane Recovery (wizard).
 * Required modules: itemacro.
 * (you can remove the itemacro requirement by defining 'item' as the Arcane Recovery feature).
 *
 * The below configuration lets you configure the maximum point count to recover,
 * as well as the maximum level of the spell slot.
 */

const maximum = Math.ceil(actor.classes.wizard.system.levels / 2);
const maxLevel = 5;

/* ---------------------- */

// get spell object and wizard levels.
const levels = actor.classes.wizard.system.levels;
const clone = actor.clone({}, {keepId: true});
const spells = clone.system.spells;

// bail out if you can't use this item again.
const available = item.system.uses.value > 0;
if (!available) {
  ui.notifications.warn("DND5E.AbilityUseUnavailableHint", {localize: true});
  return null;
}

function isValidLevel([k, v], value = false) {
  const level = /spell([0-9]+)/.test(k) ? parseInt(k.replace("spell", "")) : v.level;
  const valid = Number.isInteger(level) && level.between(1, maxLevel) && (v.max > 0);
  if (!value) return valid;
  return valid && (v.value < v.max);
}

const missingSlots = Object.entries(clone.system.spells).filter(a => isValidLevel(a, true));

// Bail out if there are no missing valid spell slots.
if (!missingSlots.length) {
  ui.notifications.warn("You are not missing any valid spell slots.");
  return null;
}

const use = await item.use();
if (!use) return;

function getContentAndValue() {
  let spent = 0;

  let content = "<form class='dnd5e'>";

  for (const [k, v] of Object.entries(clone.system.spells).filter(a => isValidLevel(a))) {
    const isLeveled = /spell([0-9]+)/.test(k);
    const level = isLeveled ? parseInt(k.replace("spell", "")) : v.level;
    const spellLevel = CONFIG.DND5E.spellLevels[level];
    const label = isLeveled ? spellLevel : `${k.capitalize()} Slots [${spellLevel}]`;

    content += `
    <div class="form-group">
      <label>${label}</label>
      <div class="form-fields">`;

    for (let i = 0; i < v.max; i++) {
      const disabled = (actor.system.spells[k].value >= i + 1) ? "disabled" : "";
      const checked = (!!disabled || (v.value >= i + 1)) ? "checked" : "";
      content += `<input type="checkbox" name="${k}" ${disabled} ${checked}>`;
      if (!disabled && !!checked) spent += level;
    }

    content += "</div></div>";
  }
  content += "</form>";
  return {
    content: `<p name="header">Recovering spell slots: <strong>${spent}</strong> / ${maximum}.</p>` + content,
    value: spent
  };
}

const dialog = new (class ArcaneRecovery extends Dialog {
  /** @override */
  render(force = false, options = {}) {
    const {content, value} = getContentAndValue();
    this.data.content = content;
    this.data.spent = value;
    return super.render(force, options);
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    html[0].querySelectorAll("input[type=checkbox]").forEach(input => {
      input.addEventListener("change", this._onClickBox.bind(this));
    });
  }

  _onClickBox(event) {
    const key = event.currentTarget.name;
    const value = event.currentTarget.closest(".form-fields").querySelectorAll("input:checked").length;
    clone.updateSource({[`system.spells.${key}.value`]: value});
    this.render();
  }

})({
  title: item.name,
  buttons: {
    apply: {
      icon: "<i class='fa-solid fa-hat-wizard'></i>",
      label: "Recover",
      callback: callback
    }
  }
}).render(true);

async function callback([html], event) {
  if (!this.data.spent || (this.data.spent > maximum)) {
    ui.notifications.warn("Invalid number of slots to recover.");
    this.render(true);
    return null;
  }

  const update = clone.system.toObject().spells;
  return actor.update({"system.spells": update});
}
