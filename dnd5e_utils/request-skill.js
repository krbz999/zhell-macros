/**
 * Prompts a dialog for a GM to request a skill check, then creates a chat message players can click.
 * Requires dnd5e 5.1.0 or higher and having a primary party configured.
 */

const { BooleanField, SetField, StringField, ForeignDocumentField, NumberField } = foundry.data.fields;
const members = Array.from(game.actors.party.system.members).map(({ actor }) => ({ value: actor.id, label: actor.name }));

const ability = new StringField().toFormGroup(
  { label: "Ability" },
  { blank: false, choices: CONFIG.DND5E.abilities, name: "ability" },
);
const skill = new StringField().toFormGroup(
  { label: "Skill" },
  { blank: false, choices: CONFIG.DND5E.skills, name: "skill" },
);
const target = new NumberField({ nullable: false }).toFormGroup(
  { label: "Difficulty" },
  { value: 15, min: 1, max: 30, name: "target", step: 1 },
);
const actors = new SetField(new StringField()).toFormGroup(
  { label: "Actors", classes: ["stacked"] },
  { options: members, name: "actors", value: members.map(m => m.value), type: "checkboxes" },
);

const result = await foundry.applications.api.Dialog.input({
  window: { title: "Request Skill Check" },
  content: [ability, skill, target, actors].map(field => field.outerHTML).join(""),
});
if (!result?.actors.length) return;

await ChatMessage.implementation.create({
  type: "request",
  flavor: `DC ${result.target} ${CONFIG.DND5E.abilities[result.ability].label} (${CONFIG.DND5E.skills[result.skill].label})`,
  system: {
    handler: "skill",
    data: { ability: result.ability, skill: result.skill, target: result.target },
    targets: result.actors.map(id => ({ actor: game.actors.get(id).uuid })),
  },
});
