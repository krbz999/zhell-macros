/**
 * Click to set temporary hit points of selected tokens.
 * Shift-click to remove all temporary hit points of selected tokens.
 */

const actors = Array.from(canvas.tokens.controlled.reduce((acc, token) => {
  if (token.actor) acc.add(token.actor);
  return acc;
}, new Set()));

if (event.shiftKey) return Promise.all(actors.map(actor => actor.update({"system.attributes.hp.temp": null})));

return Dialog.prompt({
  title: "Add temporary hit points",
  content: `
  <form class="dnd5e">
    <div class="form-group">
      <label>Temp HP</label>
      <div class="form-fields">
        <input type="number" name="temphp" autofocus>
      </div>
    </div>
  </form>`,
  label: "Apply",
  callback: async (html) => {
    const {temphp} = new FormDataExtended(html[0].querySelector("FORM")).object;
    if (!temphp) return null;
    return Promise.all(actors.map(actor => actor.applyTempHP(temphp)));
  }
});
