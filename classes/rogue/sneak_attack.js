// Sneak Attack
// Required modules: itemacro

const identifier = "sneak-attack";
const effect = actor.effects.find(e => {
  return e.getFlag("core", "statusId") === identifier);
});
if (effect) return effect.delete();
const mode = CONST.ACTIVE_EFFECT_MODES.ADD;
const value = `+${actor.getRollData().scale.rogue[identifier]}`;
const changes = ["mwak", "rwak"].map(wak => {
  return {key: `system.bonuses.${wak}.damage`, mode, value};
});
return actor.createEmbeddedDocuments("ActiveEffect", [{
  changes, icon: item.img, label: "Sneak Attack",
  "flags.core.statusId": identifier
}]);
