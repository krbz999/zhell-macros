// Request a saving throw (possibly concentration).

const { BooleanField, NumberField, SetField, StringField } = foundry.data.fields;
const { renderTemplate } = foundry.applications.handlebars;
const { FormDataExtended } = foundry.applications.ux;
const Cls = foundry.utils.getDocumentClass("ChatMessage");
const { createRollLabel } = dnd5e.enrichers;
const { Dialog } = foundry.applications.api;

const ability = new SetField(new StringField({ choices: CONFIG.DND5E.abilities })).toFormGroup(
  { label: game.i18n.localize("DND5E.Ability") },
  { name: "ability", type: "checkboxes" },
).outerHTML;

const dc = new NumberField({ nullable: false, integer: true }).toFormGroup(
  { label: game.i18n.localize("DND5E.AbbreviationDC") },
  { name: "dc", value: 10, min: 0, max: 30 },
).outerHTML;

const isConc = new BooleanField().toFormGroup(
  { label: game.i18n.localize("DND5E.Concentration"), hint: "Is this a save for concentration?" },
  { name: "concentration" },
).outerHTML;

Dialog.prompt({
  content: [ability, dc, isConc].join(""),
  window: { title: "Request Saving Throw" },
  position: { width: 400, height: "auto" },
  ok: { callback },
});

async function callback(event, button, dialog) {
  const dataset = foundry.utils.expandObject(new FormDataExtended(button.form).object);
  if (!dataset.ability.length) return;

  const buttons = dataset.ability.map(ability => {
    const data = {
      ability,
      type: dataset.concentration ? "concentration" : "save",
      dc: dataset.dc,
      action: "rollRequest",
      visibility: "all",
    };

    return {
      buttonLabel: createRollLabel({ ...data, format: "short", icon: true }),
      hiddenLabel: createRollLabel({ ...data, format: "short", icon: true, hideDC: true }),
      dataset: data,
    };
  });
  
  const chatData = {
    user: game.user.id,
    content: await renderTemplate("systems/dnd5e/templates/chat/roll-request-card.hbs", { buttons }),
    flavor: game.i18n.localize("EDITOR.DND5E.Inline.RollRequest"),
    speaker: Cls.getSpeaker({ user: game.user }),
  };
  await Cls.create(chatData);
}
