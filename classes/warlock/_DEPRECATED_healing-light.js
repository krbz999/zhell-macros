// Healing Light
// required modules: itemacro

const uses = item.system.uses;
const cha = actor.system.abilities.cha; // maximum you can spend at once
const die = "d6"; // die size

if (!uses.value) {
  ui.notifications.warn("You do not have any remaining uses.");
  return null;
}

const options = Array.fromRange(Math.min(cha.mod, uses.value), 1).reduce((acc, e) => {
  return acc += `<option value="${e}">${e}${die}</option>`;
}, "");
const content = `
<form class="dnd5e">
  <div class="form-group">
    <label>Number of dice to spend (${uses.value}/${uses.max})</label>
    <div class="form-fields">
      <select name="spend">${options}</select>
    </div>
  </div>
</form>`;

new Dialog({
  content: content,
  title: "Healing Light",
  buttons: {
    go: {
      icon: "<i class='fa-solid fa-check'></i>",
      label: "Heal",
      callback: async ([html]) => {
        const spending = parseInt(html.querySelector("SELECT").value) || 0;

        const clone = item.clone({
          "system.damage.parts": [[`${spending}${die}`, "healing"]],
          "system.actionType": "heal"
        }, {keepId: true});
        clone.prepareData();
        clone.prepareFinalAttributes();

        await clone.rollDamage({options: {fastForward: true, critical: false}});
        return item.update({"system.uses.value": uses.value - spending});
      }
    }
  }
}).render(true);
