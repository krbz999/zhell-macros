// Toll the Dead
// required modules: itemacro.

const target = game.user.targets.first();
if (!target) return ui.notifications.warn("Please target a token.");

// get consts.
const { value, max, tempmax=0 } = target.actor.system.attributes.hp;
const formula = value < (max + tempmax) ? "1d12" : "1d8";
const clone = item.clone({"system.damage.parts": [[formula, "necrotic"]]}, {keepId: true});
const use = await clone.use({}, {"flags.dnd5e.itemData": clone.toObject()});
