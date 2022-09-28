// Fathomless Warlock, spawn Fathomless Tentacle.
// if spawned actor already exists, show this item's chat card, otherwise summon.
// required modules: warpgate, itemacro.

// check if spawn already exists, and if it does, use this item.
const spawn = canvas.scene.tokens.find(t => t.actor.getFlag("world", "fathomless-tentacle") === actor.id);
if ( spawn ) return item.displayCard();

// if spawn does not exist, cast the spell / use the feature:
const use = await item.use();
if ( !use ) return;

// updates to the spawn's token, actor, and items:
const updates = {
  token: {
    name: `${game.user.charname}'s Fathomless Tentacle`,
    displayName: CONST.TOKEN_DISPLAY_MODES.HOVER,
    displayBars: CONST.TOKEN_DISPLAY_MODES.NONE
  },
  actor: {
    "flags.world.fathomless-tentacle": actor.id
  }
}

// now spawn the actor:
await actor.sheet.minimize();
await warpgate.spawn("Fathomless Tentacle", updates);
await actor.sheet.maximize();
