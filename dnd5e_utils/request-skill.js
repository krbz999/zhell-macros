/**
 * Prompts a dialog for a GM to request a skill check, then creates a chat message players can click.
 * Requires dnd5e 5.1.0 or higher and having a primary party configured.
 */

const {
  createFormGroup, createSelectInput, createMultiSelectInput,
} = foundry.applications.fields;
const range = foundry.applications.elements.HTMLRangePickerElement;
const members = Array.from(game.actors.party.system.members)
  .map(({ actor }) => ({ value: actor.id, label: actor.name }));

// Create inputs.
const ability = createFormGroup({
  label: "Ability",
  input: createSelectInput({
    blank: false,
    options: Object.entries(CONFIG.DND5E.abilities).map(([k, v]) => ({ value: k, label: v.label })),
    name: "ability",
  }),
}).outerHTML;

const skill = createFormGroup({
  label: "Skill",
  input: createSelectInput({
    blank: "",
    options: Object.entries(CONFIG.DND5E.skills).map(([k, v]) => ({ value: k, label: v.label })),
    name: "skill",
  }),
}).outerHTML;

const target = createFormGroup({
  label: "Difficulty",
  input: range.create({
    min: 1,
    max: 30,
    value: 15,
    name: "target",
    step: 1,
  }),
}).outerHTML;

const actors = createFormGroup({
  label: "Actors",
  classes: ["stacked"],
  input: createMultiSelectInput({
    options: members,
    name: "actors",
    value: members.map(m => m.value),
    type: "checkboxes",
  }),
}).outerHTML;

// Prompt configuration.
const result = await foundry.applications.api.Dialog.input({
  window: {
    title: "Request Skill Check",
    icon: "fa-solid fa-hand-point-up",
  },
  content: [ability, skill, target, actors].join(""),
});
if (!result?.actors.length) return;

let flavor = `DC ${result.target} ${CONFIG.DND5E.abilities[result.ability].label}`;
if (result.skill) flavor += ` (${CONFIG.DND5E.skills[result.skill].label})`;

await ChatMessage.implementation.create({
  flavor,
  type: "request",
  sound: "assets/sounds/wilhelm-scream.ogg",
  system: {
    handler: "skill",
    data: { ability: result.ability, skill: result.skill, target: result.target },
    targets: result.actors.map(id => ({ actor: game.actors.get(id).uuid })),
  },
});
