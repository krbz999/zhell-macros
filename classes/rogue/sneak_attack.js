// Sneak Attack
// Required modules: itemacro

const id = "sneak-attack";
const effect = actor.effects.find(e => e.flags.core?.statusId === id);
if(effect) return effect.delete();

const mode = CONST.ACTIVE_EFFECT_MODES.ADD;
const value = `@scale.rogue.${id}`;
const changes = ["mwak", "rwak"].map(wak => {
  return {key: `system.bonuses.${wak}.damage`, mode, value};
});

return actor.createEmbeddedDocuments("ActiveEffect", [{
  changes,
  icon: item.img,
  label: item.name,
  "flags.core.statusId": id
}]);
