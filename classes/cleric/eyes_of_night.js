// EYES OF NIGHT
// Required modules: warpgate, itemacro.

const range = 120;

const mod = Math.max(actor.getRollData().abilities.wis.mod, 1);
const size = game.user.targets.size;
if(mod < size || size < 1) return ui.notifications.error("Please target an appropriate number of creatures.");
const updates = {actor: {"data.attributes.senses.darkvision": range}, token: {dimSight: range}};
const options = {name: `Darkvision (${range}ft)`, description: `You are being granted ${range} feet of darkvision.`};

const roll = await item.roll();
if(!roll) return;
for(let target of game.user.targets) await warpgate.mutate(target.document, updates, {}, options);