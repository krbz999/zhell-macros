// FLAMING SPHERE
// Spawns a flaming sphere, and allows each subsequent use while concentrating
// on the spell to redisplay the card at the correct level. Uses Effect Macro
// to dismiss the sphere when concentration ends.
// Required modules: itemacro, warpgate, concentrationnotifier, effectmacro.

// if concentrating on this spell, redisplay it.
const isConc = CN.isActorConcentratingOnItem(actor, item);
if (isConc) return CN.redisplayCard(actor);

// if not concentrating on this spell, cast and summon.
const use = await item.use();
if (!use) return;

// then set up updates to token and actor:
const updates = { token: {
  name: `${actor.name.split(" ")[0]}'s Sphere`,
  displayName: CONST.TOKEN_DISPLAY_MODES.HOVER,
  displayBars: CONST.TOKEN_DISPLAY_MODES.NONE,
  light: { dim: 40, bright: 20 }
} }
const options = { crosshairs: {
  drawIcon: false, icon: "icons/svg/dice-target.svg"
} }

// then spawn the actor:
await actor.sheet.minimize();
const [spawn] = await warpgate.spawn("Flaming Sphere", updates, {}, options);
await actor.sheet.maximize();
const effect = CN.isActorConcentratingOnItem(actor, item);
return effect?.setFlag("effectmacro", "onDelete.script", `await warpgate.dismiss("${spawn}");`);
