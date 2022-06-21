/* Bladesong
- click while no effect active: +INT to AC, +10 to MOV, ADV on ACR, +INT to concentration saves.
- click while effect active: remove effect
- if wizard 14 or higher: +INT to mwak damage.
*/

// required modules: itemacro
// added benefit with concentrationnotifier and convenientDescription.

const effect = actor.effects.find(i => i.getFlag("world", "bladesong") === actor.id);
if(effect) return effect.delete();

const {abilities: {int: {mod}}, classes: {wizard: {levels}}} = duplicate(actor.getRollData());
const value = `+${mod}`;
const mode = CONST.ACTIVE_EFFECT_MODES.ADD;

const changes = [
	{key: "data.attributes.ac.bonus", mode, value},
	{key: "data.attributes.movement.walk", mode, value: "+10"},
	{key: "data.skills.acr.bonuses.passive", mode, value: "+5"},
	{key: "flags.dnd5e.concentrationBonus", mode, value}
];
if(levels >= 14) changes.push({key: "data.bonuses.mwak.damage", mode, value});



const roll = await item.roll();
if(!roll) return;

await actor.createEmbeddedDocuments("ActiveEffect", [{
	changes,
	icon: item.img,
	label: item.name,
	duration: {seconds: 60},
	"flags.world.bladesong": actor.id,
	"flags.convenientDescription": `
		You have ${value} to AC,
		+10ft movement speed,
		advantage on Acrobatics,
		${levels >= 14 ? value + " to melee weapon damage," : ""}
		and ${value} to saving throws for concentration.`,
}]);