// Toll the Dead
// required modules: itemacro.

const target = game.user.targets.first();
if (!target) return ui.notifications.warn("Please target a token.");

// get consts.
const { level } = actor.system.details;
const { value, max } = target.actor.system.attributes.hp;

// calculate formula.
const dice = level >= 17 ? 4 : level >= 11 ? 3 : level >= 5 ? 2 : 1;
const size = value < max ? "d12" : "d8";

// determine flavor text.
const flavor = value < max ? "Toll the Dead - Damage Roll (hurt)" : "Toll the Dead - Damage Roll (full)";

// roll it.
const use = await item.use();
if (!use) return;
await new Roll(`${dice}${size}[necrotic]`).toMessage({
  flavor,
  speaker: ChatMessage.getSpeaker({ actor })
});
