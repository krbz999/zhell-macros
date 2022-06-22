// Fathomless Warlock, spawn Fathomless Tentacle.
// if spawned actor already exists, roll its attack (a feature on the spawn with the same name).
// required modules: warpgate, itemacro.

// check if spawn already exists, and if it does, roll the item.
const spawn = canvas.scene.tokens.find(t => t.actor.getFlag("world", "fathomless-tentacle") === actor.id);
if(!!spawn) return spawn.actor.items.getName("Fathomless Tentacle").roll();

// if spawn does not exist, cast the spell / use the feature:
const roll = await item.roll();
if(!roll) return;

// updates to the spawn's token, actor, and items:
const updates = {
	token: {
		name: `${game.user.charname}'s Fathomless Tentacle`,
		displayName: CONST.TOKEN_DISPLAY_MODES.HOVER,
		displayBars: CONST.TOKEN_DISPLAY_MODES.NONE
	},
	actor: {
		"data.abilities": actor.getRollData().abilities,
		"data.details.cr": actor.data.data.details.level,
		"flags.world.fathomless-tentacle": actor.id
	},
	embedded: {Item: {"Fathomless Tentacle": {"data.damage.parts": [[
		Roll.replaceFormulaData(item.data.data.damage.parts[0][0], actor.getRollData()),
		item.data.data.damage.parts[0][1]
	]]}}}
}

// now spawn the actor:
await actor.sheet.minimize();
await warpgate.spawn("Fathomless Tentacle", updates);
await actor.sheet.maximize();