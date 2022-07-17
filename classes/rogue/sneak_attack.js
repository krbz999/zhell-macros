// Sneak Attack
// Required modules: itemacro

// applies an effect that increases weapon damage equal to sneak attack.
// click again to remove the effect.

// if effect, delete it
const effect = actor.effects.find(i => i.data.label === "Sneak Attack");
if(effect) return effect.delete();

// if no effect, create it
const mode = CONST.ACTIVE_EFFECT_MODES.ADD;
const value = `+${item.data.data.damage.parts[0][0]}`;

await actor.createEmbeddedDocuments("ActiveEffect", [{
	changes: [
		{key: "data.bonuses.mwak.damage", mode, value},
		{key: "data.bonuses.rwak.damage", mode, value}
	],
	icon: item.img,
	label: "Sneak Attack",
	"flags.core.statusId": "sneak-attack"
}]);
