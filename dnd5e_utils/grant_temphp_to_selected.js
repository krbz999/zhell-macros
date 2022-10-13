/**
  Click to set temporary hit points of selected tokens.
  Shift-click to remove temporary hit points of selected tokens.
**/

if (event.shiftKey) {
  return canvas.tokens.controlled.map(token => {
    return token.actor?.update({ "system.attributes.hp.temp": null });
  });
}

new Dialog({
  title: "Add temporary hit points",
  content: `
  <form>
    <div class="form-group">
      <label for="temphp">Temp HP</label>
      <div class="form-fields">
        <input id="temphp" type="number"></input>
      </div>
    </div>
  </form>`,
  buttons: {
    go: {
      icon: "<i class='fa-solid fa-check'></i>",
      label: "Apply",
      callback: async (html) => {
        const { value } = html[0].querySelector("#temphp");
        return canvas.tokens.controlled.map(token => {
          return token.actor?.applyTempHP(value);
        });
      }
    }
  }
}).render(true);
