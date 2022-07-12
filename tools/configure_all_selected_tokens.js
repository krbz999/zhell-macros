// single dialog to configure all selected tokens' disposition, displayBars, and displayName configuration.

const {disposition: defdisp, displayBars: defbars, displayName: defname} = canvas.tokens.controlled[0].document.data;
const options_disposition = Object.entries(CONST.TOKEN_DISPOSITIONS).reduce((acc, [key, value]) => {
  let selected = value === defdisp && "selected";
  return acc + `<option value="${value}" ${selected}>${key}</option>`
}, ``);
const options_display = Object.entries(CONST.TOKEN_DISPLAY_MODES).reduce((acc, [key, value]) => {
  let selected = value === defbars && "selected";
  return acc + `<option value="${value}" ${selected}>${key}</option>`;
}, ``);
const options_displayN = Object.entries(CONST.TOKEN_DISPLAY_MODES).reduce((acc, [key, value]) => {
  let selected = value === defname && "selected";
  return acc + `<option value="${value}" ${selected}>${key}</option>`;
}, ``);

new Dialog({
  title: "Token Configuration",
  content: `
  <form>
    <div class="form-group">
      <label for="disposition">Disposition</label>
      <div class="form-fields">
        <select id="disposition">${options_disposition}</select>
      </div>
    </div>
    <div class="form-group">
      <label for="display-bars">Display Bars</label>
      <div class="form-fields">
        <select id="display-bars">${options_display}</select>
      </div>
    </div>
    <div class="form-group">
      <label for="display-name">Display Name</label>
      <div class="form-fields">
        <select id="display-name">${options_displayN}</select>
      </div>
    </div>
  </form>`,
  buttons: {go: {
    icon: `<i class="fas fa-check"></i>`,
    label: "Apply",
    callback: async (html) => {
      const disposition = Number(html[0].querySelector("select[id=disposition]").value);
      const displayBars = Number(html[0].querySelector("select[id='display-bars']").value);
      const displayName = Number(html[0].querySelector("select[id='display-name']").value);
      const updates = canvas.tokens.controlled.map(i => ({_id: i.id, disposition, displayBars, displayName}));
      await canvas.scene.updateEmbeddedDocuments("Token", updates);
    }
  }},
  default: "go",
  render: (html) => {
    html[0].querySelector("select[id=disposition]").focus();
  }
}).render(true);
