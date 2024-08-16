// single dialog to configure all selected tokens' disposition, displayBars, and displayName configuration.

const tokens = canvas.tokens.controlled;

if (!tokens.length) {
  ui.notifications.warn("You have no tokens selected.");
  return null;
}

/**
 * Configure and create a form-field section for a token property.
 * @param {object} object             An object in the global `CONST`.
 * @param {function} transformer      A function to transform a string.
 * @param {string} property           The token document's property.
 * @returns {string}
 */
const configure = (object, transformer, property) => {
  return new foundry.data.fields.StringField({
    required: true,
    choices: Object.fromEntries(Object.entries(foundry.utils.invertObject(object)).map(([k, v]) => [k, transformer(v)])),
    label: {
      disposition: "TOKEN.Disposition",
      displayBars: "TOKEN.ResourceDisplay",
      displayName: "TOKEN.CharShowNameplate"
    }[property]
  }).toFormGroup({localize: true}, {localize: true, name: property, value: token.document[property]}).outerHTML;
};

const disposition = configure(CONST.TOKEN_DISPOSITIONS, (v) => `TOKEN.DISPOSITION.${v}`, "disposition");
const displayBars = configure(CONST.TOKEN_DISPLAY_MODES, (v) => `TOKEN.DISPLAY_${v}`, "displayBars");
const displayName = configure(CONST.TOKEN_DISPLAY_MODES, (v) => `TOKEN.DISPLAY_${v}`, "displayName");

return foundry.applications.api.DialogV2.prompt({
  rejectClose: false,
  content: `<fieldset>${disposition}${displayBars}${displayName}</fieldset>`,
  modal: true,
  window: {title: "TOKEN.Title"},
  position: {width: 450},
  ok: {
    label: "Update",
    callback: (event, button, html) => {
      const update = new FormDataExtended(button.form).object;
      const updates = tokens.map(token => ({_id: token.id, ...update}));
      canvas.scene.updateEmbeddedDocuments("Token", updates);
    }
  }
});
