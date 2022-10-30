// STEPS OF NIGHT
// required modules: itemacro

const effect = actor.effects.find(effect => {
  return effect.getFlag("core", "statusId") === "steps-of-night";
});
if (effect) return effect.delete();
const use = await item.use();
if (!use) return;

return actor.createEmbeddedDocuments("ActiveEffect", [{
  label: "Steps of Night",
  changes: [{
    key: "system.attributes.movement.fly",
    mode: CONST.ACTIVE_EFFECT_MODES.UPGRADE,
    value: actor.system.attributes.movement.walk
  }],
  duration: { seconds: 60 },
  icon: item.img,
  "flags.core.statusId": "steps-of-night",
  "flags.visual-active-effects.data": {
    intro: "You have a flying speed equal to your walking speed.",
    content: item.system.description.value
  }
}]);
