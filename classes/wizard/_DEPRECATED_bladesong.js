// BLADESONG
// required modules: itemacro.
// added benefit with concentrationnotifier and visual-active-effects.

const status = "bladesong";
const effect = actor.effects.find(e => e.statuses.has(status));
if (effect) return effect.delete();

const use = await item.use();
if (!use) return;

return actor.createEmbeddedDocuments("ActiveEffect", [{
  changes: [
    {key: "system.attributes.ac.bonus"},
    {key: "system.attributes.movement.walk", value: 10},
    {key: "system.attributes.concentration.bonuses.save"},
    actor.classes.wizard.system.levels >= 14 ? {key: "system.bonuses.mwak.damage"} : null
  ].reduce((acc, obj) => {
    if (obj) acc.push(foundry.utils.mergeObject(obj, {
      mode: CONST.ACTIVE_EFFECT_MODES.ADD,
      value: "@abilities.int.mod"
    }, {overwrite: false}));
    return acc;
  }, []),
  img: item.img,
  name: item.name,
  duration: {seconds: 60},
  description: `<p>You are under the effects of ${item.name}.</p>`,
}]);
