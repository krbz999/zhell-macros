// BLADESONG
// required modules: itemacro.
// added benefit with concentrationnotifier and visual-active-effects.

const effect = actor.effects.find(e => e.statuses.has("bladesong"));
if (effect) return effect.delete();

const mode = CONST.ACTIVE_EFFECT_MODES.ADD;
const value = actor.system.abilities.int.mod;
const changes = [
  {key: "system.attributes.ac.bonus", mode, value},
  {key: "system.attributes.movement.walk", mode, value: 10},
  {key: "flags.dnd5e.concentrationBonus", mode, value: `+${value}`}
];
if (actor.classes.wizard.system.levels >= 14) {
  changes.push({key: "system.bonuses.mwak.damage", mode, value: `+${value}`});
}

const use = await item.use();
if (!use) return;

return actor.createEmbeddedDocuments("ActiveEffect", [{
  changes,
  icon: item.img,
  name: item.name,
  duration: {seconds: 60},
  statuses: ["bladesong"],
  description: "<p>You are under the effects of Bladesong.</p>",
  "flags.visual-active-effects.data.content": `<p>... text goes here ...</p>`
}]);
