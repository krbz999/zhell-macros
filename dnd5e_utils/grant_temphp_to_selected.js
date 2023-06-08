/**
 * Click to set temporary hit points of selected tokens.
 * Shift-click to remove temporary hit points of selected tokens.
 */

if (event.shiftKey) {
  for (const token of canvas.tokens.controlled) {
    token.actor?.update({"system.attributes.hp.temp": null});
  }
  return;
}

new Dialog({
  title: "Add temporary hit points",
  content: `
  <form class="dnd5e">
    <div class="form-group">
      <label>Temp HP</label>
      <div class="form-fields">
        <input type="number" data-dtype="Number" name="temphp" autofocus>
      </div>
    </div>
  </form>`,
  buttons: {
    go: {
      icon: "<i class='fa-solid fa-check'></i>",
      label: "Apply",
      callback: async (html) => {
        const update = new FormDataExtended(html[0].querySelector("form")).object;
        for (const token of canvas.tokens.controlled) {
          await token.actor?.applyTempHP(update.temphp);
        }
      }
    }
  }
}).render(true);
