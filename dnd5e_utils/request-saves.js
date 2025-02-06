// Request a saving throw (possibly concentration).

const ability = new foundry.data.fields.StringField({
  required: true, choices: CONFIG.DND5E.abilities, label: "Ability"
}).toFormGroup({}, {name: "ability"}).outerHTML;
const dc = new foundry.data.fields.NumberField({
  min: 0, max: 30, integer: true, nullable: false, label: "DC"
}).toFormGroup({}, {name: "dc", value: 10}).outerHTML;
const isConc = new foundry.data.fields.BooleanField({
  label: "Concentration", hint: "Is this a save for concentration?"
}).toFormGroup({}, {name: "concentration"}).outerHTML;

const dataset = await foundry.applications.api.DialogV2.prompt({
  content: `<fieldset>${[ability, dc, isConc].join("")}</fieldset>`,
  rejectClose: false,
  modal: true,
  window: {title: "Request Saving Throw"},
  position: {width: 400, height: "auto"},
  ok: {callback: (event, button) => new FormDataExtended(button.form).object}
});
if (!dataset) return;

dataset.type = dataset.concentration ? "concentration" : "save";

const chatData = {
  user: game.user.id,
  content: await renderTemplate("systems/dnd5e/templates/chat/request-card.hbs", {
    buttons: [{
      buttonLabel: dnd5e.enrichers.createRollLabel({...dataset, format: "short", icon: true}),
      hiddenLabel: dnd5e.enrichers.createRollLabel({...dataset, format: "short", icon: true, hideDC: true}),
      dataset: {...dataset, action: "rollRequest", visibility: "all"},
    }],
  }),
  flavor: game.i18n.localize("EDITOR.DND5E.Inline.RollRequest"),
  speaker: ChatMessage.implementation.getSpeaker({user: game.user})
};
await ChatMessage.implementation.create(chatData);
