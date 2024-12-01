// STEPS OF NIGHT
// required modules: itemacro

const id = item.name.slugify({strict: true});
const effect = actor.effects.find(e => e.statuses.has(id));
if (effect) return effect.delete();
const use = await item.use();
if (!use) return;

return actor.createEmbeddedDocuments("ActiveEffect", [{
  name: item.name,
  changes: [{
    key: "system.attributes.movement.fly",
    mode: CONST.ACTIVE_EFFECT_MODES.UPGRADE,
    value: actor.system.attributes.movement.walk
  }],
  duration: {seconds: 60},
  icon: item.img,
  statuses: [id],
  description: "<p>You have a flying speed equal to your walking speed.</p>",
  "flags.visual-active-effects.data.content": item.system.description.value
}]);

