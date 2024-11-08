/**
 * Prompts a dialog for a GM to request a skill check, then creates a chat message players can click.
 * This emulates the system functionality entirely.
 */

const ability = new foundry.data.fields.StringField({
  required: false, choices: CONFIG.DND5E.abilities, label: "Ability"
}).toFormGroup({}, {name: "ability"}).outerHTML;
const skill = new foundry.data.fields.StringField({
  required: true, choices: CONFIG.DND5E.skills, label: "Skill"
}).toFormGroup({}, {name: "skill"}).outerHTML;
const dc = new foundry.data.fields.NumberField({
  min: 0, max: 30, integer: true, nullable: false, label: "DC"
}).toFormGroup({}, {name: "dc", value: 10}).outerHTML;

const dataset = await foundry.applications.api.DialogV2.prompt({
  content: `<fieldset>${[ability, skill, dc].join("")}</fieldset>`,
  rejectClose: false,
  modal: true,
  window: {title: "Request Skill Check"},
  position: {width: 400, height: "auto"},
  ok: {callback: (event, button) => new FormDataExtended(button.form).object}
});
if (!dataset) return;

dataset.type = "skill";
dataset.ability ||= CONFIG.DND5E.skills[dataset.skill].ability;

const chatData = {
  user: game.user.id,
  content: await renderTemplate("systems/dnd5e/templates/chat/request-card.hbs", {
    buttonLabel: dnd5e.enrichers.createRollLabel({...dataset, format: "short", icon: true}),
    hiddenLabel: dnd5e.enrichers.createRollLabel({...dataset, format: "short", icon: true, hideDC: true}),
    dataset: {...dataset, action: "rollRequest", visibility: "all"}
  }),
  flavor: game.i18n.localize("EDITOR.DND5E.Inline.RollRequest"),
  speaker: ChatMessage.implementation.getSpeaker({user: game.user})
};
await ChatMessage.implementation.create(chatData);
