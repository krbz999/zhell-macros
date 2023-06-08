// WARMING RESPITE (oath of the hearth)
// required modules: itemacro, warpgate

const use = await item.use();
if (!use) return;

const levels = actor.classes.paladin.system.levels;
const updates = {actor: {"system.attributes.hp.temp": levels}};
const options = {
  permanent: true,
  description: `${actor.name} is granting you ${levels} temporary hit points.`
};
for (const target of game.user.targets) {
  if (target.actor.system.attributes.hp.temp < levels) {
    await warpgate.mutate(target.document, updates, {}, options);
  }
}
