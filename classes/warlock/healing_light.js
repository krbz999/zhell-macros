// Healing Light
// required modules: itemacro

const {value, max} = item.system.uses;
const {mod} = actor.system.abilities.cha; // maximum you can spend at once
const die = "d6"; // die size
const target = game.user.targets.first();

if (value < 1) return item.use({}, {configureDialog: false});

const options = Array.fromRange(Math.min(mod, value), 1).reduce((acc, e) => {
  return acc += `<option value="${e}">${e}${die}</option>`;
}, "");
const content = `
<form class="dnd5e">
  <div class="form-group">
    <label>Number of dice to spend (${value}/${max})</label>
    <div class="form-fields">
      <select id="spend">${options}</select>
    </div>
  </div>
</form>`;

new Dialog({
  content,
  title: "Healing Light",
  buttons: {
    go: {
      icon: "<i class='fas fa-check'></i>",
      label: "Heal",
      callback: async (html) => {
        const targetAppend = target ? `on ${target.name}` : "";
        const spending = html[0].querySelector("#spend").value;
        await new Roll(`${spending}${die}`).toMessage({
          flavor: `${actor.name} uses ${item.name} ${targetAppend}`,
          speaker
        });
        return item.update({"system.uses.value": value - spending});
      }
    }
  }
}).render(true);
