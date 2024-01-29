// single dialog to configure all selected tokens' disposition, displayBars, and displayName configuration.

/**
 * Configure and create a form-field section for a token property.
 * @param {object} object             An object in the global `CONST`.
 * @param {function} transformer      A function to transform a string.
 * @param {string} property           The token document's property.
 * @returns {string}
 */
const configure = (object, transformer, property) => {
  object = Object.entries(foundry.utils.invertObject(object));
  object = object.map(([k, v]) => [k, transformer(v)]);
  object = Object.fromEntries(object);
  const options = {selected: token.document[property], localize: true};
  return `
  <div class="form-fields">
    <select name="${property}">
      ${HandlebarsHelpers.selectOptions(object, {hash: options})}
    </select>
  </div>`;
};

const tokens = canvas.tokens.controlled;

if (!tokens.length) {
  ui.notifications.warn("You have no tokens selected.");
  return null;
}

const disposition = configure(CONST.TOKEN_DISPOSITIONS, (v) => `TOKEN.DISPOSITION.${v}`, "disposition");
const displayBars = configure(CONST.TOKEN_DISPLAY_MODES, (v) => `TOKEN.DISPLAY_${v}`, "displayBars");
const displayName = configure(CONST.TOKEN_DISPLAY_MODES, (v) => `TOKEN.DISPLAY_${v}`, "displayName");

return Dialog.prompt({
  title: game.i18n.localize("TOKEN.Title"),
  label: game.i18n.localize("Update"),
  rejectClose: false,
  content: `
  <form>
    <div class="form-group"><label>${game.i18n.localize("TOKEN.Disposition")}</label>${disposition}</div>
    <div class="form-group"><label>${game.i18n.localize("TOKEN.ResourceDisplay")}</label>${displayBars}</div>
    <div class="form-group"><label>${game.i18n.localize("TOKEN.CharShowNameplate")}</label>${displayName}</div>
  </form>`,
  callback: async ([html]) => {
    const update = new FormDataExtended(html.querySelector("FORM")).object;
    const updates = tokens.map(token => ({_id: token.id, ...update}));
    return canvas.scene.updateEmbeddedDocuments("Token", updates);
  }
});
