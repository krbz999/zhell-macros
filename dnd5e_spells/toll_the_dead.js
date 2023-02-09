// Toll the Dead
// required modules: itemacro.

if (game.user.targets.size !== 1) return ui.notifications.warn("Please target exactly one token.");

const hp = game.user.targets.first().actor.system.attributes.hp;
const formula = (hp.value ?? 0) < (hp.max + (hp.tempmax ?? 0)) ? "1d12" : "1d8";
const clone = item.clone({"system.damage.parts": [[formula, "necrotic"]]}, {keepId: true});
clone.prepareFinalAttributes();
const use = await clone.use({}, {"flags.dnd5e.itemData": clone.toObject()});
