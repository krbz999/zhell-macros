// Request a saving throw (possibly concentration).

const { BooleanField, NumberField, SetField, StringField } = foundry.data.fields;

const ability = new SetField(new StringField({ choices: CONFIG.DND5E.abilities })).toFormGroup({ label: "Ability" }, { name: "ability", type: "checkboxes" }).outerHTML;
const dc = new NumberField({ min: 0, max: 30, integer: true, nullable: false, label: "DC" }).toFormGroup({}, { name: "dc", value: 10 }).outerHTML;
const isConc = new BooleanField({ label: "Concentration", hint: "Is this a save for concentration?" }).toFormGroup({}, { name: "concentration" }).outerHTML;

foundry.applications.api.Dialog.prompt({
  content: [ability, dc, isConc].join(""),
  window: { title: "Request Saving Throw" },
  position: { width: 400, height: "auto" },
  ok: { callback },
});

async function callback(event, button, dialog) {
  const dataset = foundry.utils.expandObject(new foundry.applications.ux.FormDataExtended(button.form).object);
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
      buttonLabel: dnd5e.enrichers.createRollLabel({ ...data, format: "short", icon: true }),
      hiddenLabel: dnd5e.enrichers.createRollLabel({ ...data, format: "short", icon: true, hideDC: true }),
      dataset: data,
    };
  });
  
  dataset.type = dataset.concentration ? "concentration" : "save";
  const chatData = {
    user: game.user.id,
    content: await foundry.applications.handlebars.renderTemplate("systems/dnd5e/templates/chat/request-card.hbs", { buttons }),
    flavor: game.i18n.localize("EDITOR.DND5E.Inline.RollRequest"),
    speaker: ChatMessage.implementation.getSpeaker({ user: game.user }),
  };
  await getDocumentClass("ChatMessage").create(chatData);
}
