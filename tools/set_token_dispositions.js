// single dialog to configure all selected tokens' disposition, displayBars, and displayName configuration.

const options_disposition = Object.entries(CONST.TOKEN_DISPOSITIONS).reduce((acc, [key,value]) => acc += `<option value="${value}">${key}</option>`, ``);
const options_display = Object.entries(CONST.TOKEN_DISPLAY_MODES).reduce((acc, [key, value]) => acc += `<option value="${value}">${key}</option>`, ``);

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
      <select id="display-name">${options_display}</select>
    </div>
  </div>
  </form>`,
  buttons: {
    go: {
      icon: `<i class="fas fa-check"></i>`,
      label: "Apply",
      callback: async (html) => {
        const disposition = Number(html[0].querySelector("select[id=disposition]").value);
        const displayBars = Number(html[0].querySelector("select[id='display-bars']").value);
        const displayName = Number(html[0].querySelector("select[id='display-name']").value);
        const updates = canvas.tokens.controlled.map(i => ({_id: i.id, disposition, "bar1.attribute": "attributes.hp", displayBars, displayName}));
        await canvas.scene.updateEmbeddedDocuments("Token", updates);
      }
    }
  },
  default: "go",
}).render(true);
