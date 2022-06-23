/* Shield spell
- click while no effect active: cast and apply +5 to AC
- click while effect active: remove effect

Required modules: itemacro
*/

const effect = actor.effects.find(i => i.getFlag("world", "shield-spell") === actor.id);
if(effect) return effect.delete();

const roll = await item.roll();
if(!roll) return;
await actor.createEmbeddedDocuments("ActiveEffect", [{
	changes: [{key: "data.attributes.ac.bonus", mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: "+5"}],
	icon: item.img,
	label: item.name,
	duration: {rounds: 1},
	"flags.world.shield-spell": actor.id,
	"flags.convenientDescription": "You have +5 to AC and immunity to damage from Magic Missile."
}]);