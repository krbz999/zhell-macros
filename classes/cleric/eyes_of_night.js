// EYES OF NIGHT
// Required modules: warpgate, itemacro

const range = 120;

const mod = Math.max(actor.system.abilities.wis.mod, 1);
const size = game.user.targets.size;
if (mod < size || size < 1) {
  ui.notifications.error("Please target an appropriate number of creatures.");
  return;
}
const updates = {
  actor: { "system.attributes.senses.darkvision": range },
  token: { sight: { visionMode: "darkvision", range } }
}
const options = {
  name: `Darkvision (${range}ft)`,
  description: `You are being granted ${range} feet of darkvision.`
}

const use = await item.use();
if (!use) return;
[...game.user.targets].map(target => {
  warpgate.mutate(target.document, updates, {}, options);
});
