// Flaming Sphere
// modules required: itemacro, warpgate.
// setup: have a sidebar actor named "Flaming Sphere" with a feature set up correctly, with the same name.

// check if spawn already exists, and if it does, roll the item.
const spawn = canvas.scene.tokens.find(i => i.actor.getFlag("world", "flaming-sphere") === actor.id);
if(!!spawn) return spawn.actor.items.getName("Flaming Sphere").roll();

// if spawn does not exist, cast the spell:
const level = await warpgate.dnd5e.rollItem(item);
if(!level) return;

// set up options and updates to token and actor:
const {HOVER, NONE} = CONST.TOKEN_DISPLAY_MODES;
const dc = actor.data.data.attributes.spelldc;

const updates = {
	token: {
		name: `${game.user.charname}'s FLaming Sphere`,
		displayName: HOVER, displayBars: NONE
	},
	actor: {"flags.world.flaming-sphere": actor.id},
	embedded: {Item: {"Flaming Sphere": {
		img: "icons/magic/fire/explosion-fireball-large-orange.webp",
		data: {
			"damage.parts": [[`${level}d6`, "fire"]],
			save: {ability: "dex", dc, scaling: "flat"}}
	}}}
}

// spawn the actor:
await warpgate.spawn("Flaming Sphere", updates);