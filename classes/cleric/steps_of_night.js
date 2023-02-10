// STEPS OF NIGHT
// required modules: itemacro

const id = item.name.slugify({strict: true});
const effect = actor.effects.find(e => e.flags.core?.statusId === id);
if (effect) return effect.delete();
const use = await item.use();
if (!use) return;

return actor.createEmbeddedDocuments("ActiveEffect", [{
  label: item.name,
  changes: [{
    key: "system.attributes.movement.fly",
    mode: CONST.ACTIVE_EFFECT_MODES.UPGRADE,
    value: actor.system.attributes.movement.walk
  }],
  duration: {seconds: 60},
  icon: item.img,
  "flags.core.statusId": id,
  "flags.visual-active-effects.data": {
    intro: "<p>You have a flying speed equal to your walking speed.</p>",
    content: item.system.description.value
  }
}]);
