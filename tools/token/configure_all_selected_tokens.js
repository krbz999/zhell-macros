// single dialog to configure all selected tokens' disposition, displayBars, and displayName configuration.

const {disposition: defdisp, displayBars: defbars, displayName: defname} = token.document;
const options_disposition = Object.entries(CONST.TOKEN_DISPOSITIONS).reduce((acc, [key, value]) => {
  const selected = value === defdisp && "selected";
  return acc + `<option value="${value}" ${selected}>${key}</option>`
}, "");
const options_display = Object.entries(CONST.TOKEN_DISPLAY_MODES).reduce((acc, [key, value]) => {
  const selected = value === defbars && "selected";
  return acc + `<option value="${value}" ${selected}>${key}</option>`;
}, "");
const options_displayN = Object.entries(CONST.TOKEN_DISPLAY_MODES).reduce((acc, [key, value]) => {
  const selected = value === defname && "selected";
  return acc + `<option value="${value}" ${selected}>${key}</option>`;
}, "");

new Dialog({
  title: "Token Configuration",
  content: `
  <form>
    <div class="form-group">
      <label>Disposition</label>
      <div class="form-fields"><select id="disposition" autofocus>${options_disposition}</select></div>
    </div>
    <div class="form-group">
      <label>Display Bars</label>
      <div class="form-fields"><select id="display-bars">${options_display}</select></div>
    </div>
    <div class="form-group">
      <label>Display Name</label>
      <div class="form-fields"><select id="display-name">${options_displayN}</select></div>
    </div>
  </form>`,
  buttons: {
    go: {
      icon: "<i class='fa-solid fa-check'></i>",
      label: "Apply",
      callback: async (html) => {
        const disposition = Number(html[0].querySelector("#disposition").value);
        const displayBars = Number(html[0].querySelector("#display-bars").value);
        const displayName = Number(html[0].querySelector("#display-name").value);
        const updates = canvas.tokens.controlled.map(token => {
          return {_id: token.id, disposition, displayBars, displayName};
        });
        await canvas.scene.updateEmbeddedDocuments("Token", updates);
      }
    }
  }
}).render(true);
