// Dialog to adjust resources.
// Optional compatibility with 'Add a Resource'.

if (!actor) return ui.notifications.warn("You need a token selected or an actor assigned.");

const data = actor.toObject();
const names = ["primary", "secondary", "tertiary"].map(r => `system.resources.${r}`);
if (game.modules.get("addar")?.active) {
  const ids = Object.keys(data.flags.addar?.resource ?? {});
  names.push(...ids.map(id => `flags.addar.resource.${id}`));
}

const content = names.reduce((acc, name) => {
  const {label, value, max} = foundry.utils.getProperty(data, name);
  return acc + `
  <div class="form-group">
    <label>${label || "Resource"}</label>
    <div class="form-fields">
      <input type="number" data-dtype="Number" name="${name}.value" value="${value || 0}">
      <span class="sep"> / </span>
      <input type="number" data-dtype="Number" name="${name}.max" value="${max || 0}">
    </div>
  </div>`;
}, "");

const form = await Dialog.prompt({
  title: "Adjust Resources",
  content: `<form>${content}</form>`,
  rejectClose: false,
  label: "All Good",
  callback: (html) => {
    const update = new FormDataExtended(html[0].querySelector("form")).object;
    return actor.update(update);
  }
});
