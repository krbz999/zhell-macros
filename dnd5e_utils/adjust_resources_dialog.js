// Dialog to adjust resources.
// Optional compatibility with 'Add a Resource'.

const a = token?.actor ?? game.user.character;
if(!a) return ui.notifications.warn("You need a token selected or an actor assigned.");

const data = a.toObject();
const names = ["primary", "secondary", "tertiary"].map(r => `system.resources.${r}`);
if(game.modules.get("addar")?.active){
  const ids = Object.keys(data.flags.addar?.resource ?? {});
  names.push(...ids.map(id => `flags.addar.resource.${id}`));
}

const content = names.reduce((acc, name) => {
  const {label, value, max} = foundry.utils.getProperty(data, name);
  return acc + `
  <div class="form-group">
    <label>${label || "Resource"}</label>
    <div class="form-fields">
      <input type="number" name="${name}.value" value="${value || 0}">
      <span class="sep"> / </span>
      <input type="number" name="${name}.max" value="${max || 0}">
    </div>
  </div>`;
}, "");

const form = await Dialog.prompt({
  title: "Adjust Resources",
  content: `<form>${content}</form>`,
  rejectClose: false,
  label: "All Good",
  callback: (html) => {
    const formData = {};
    html[0].querySelectorAll("input[type=number]").forEach(input => {
      formData[input.name] = input.valueAsNumber;
    });
    return formData;
  }
});
if(form) return a.update(form);
