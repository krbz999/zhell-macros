// Twilight Cleric, Steps of Night
// Required modules: itemacro

const effect = actor.effects.find(i => !!i.getFlag("world", "steps-of-night"));
if(!effect){
	const roll = await item.roll();
	if(!roll) return;
	return actor.createEmbeddedDocuments("ActiveEffect", [{
		label: "Steps of Night",
		changes: [{key: "data.attributes.movement.fly", mode: CONST.ACTIVE_EFFECT_MODES.UPGRADE, value: 60}],
		duration: {seconds: 60},
		icon: item.img,
		"flags.world.steps-of-night": true
	}]);
}
return effect.delete();
