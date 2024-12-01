// EYES OF NIGHT
// Required modules: warpgate, itemacro

const range = 120;
const targets = game.user.targets;
const mod = Math.max(actor.system.abilities.wis.mod, 1);

if (!targets.size.between(1, mod)) {
  ui.notifications.error(`Please target between 1 and ${mod} creatures.`);
  return;
}

const updates = {
  actor: {"system.attributes.senses.darkvision": range},
  token: {"sight.visionMode": "darkvision", "sight.range": range}
};

const options = {
  name: `Darkvision (${range}ft)`,
  description: `You are being granted ${range} feet of darkvision.`
};

const use = await item.use();
if (!use) return;

for (const target of targets) {
  await warpgate.mutate(target.document, updates, {}, options);
}
