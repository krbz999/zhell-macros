// SHIELD
// required modules: itemacro.
// supported: visual-active-effects

const effect = actor.effects.find(i => i.getFlag("world", "shield-spell") === actor.id);
if (effect) return effect.delete();

const use = await item.use();
if (!use) return;
await actor.createEmbeddedDocuments("ActiveEffect", [{
  changes: [{
    key: "system.attributes.ac.bonus",
    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
    value: 5
  }],
  icon: item.img,
  label: item.name,
  duration: { rounds: 1 },
  "flags.world.shield-spell": actor.id,
  "flags.visual-active-effects.data": {
    intro: "You have +5 to AC and immunity to damage from Magic Missile.",
    content: item.system.description.value
  }
}]);
