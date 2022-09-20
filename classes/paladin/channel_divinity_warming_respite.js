// WARMING RESPITE (oath of the hearth)
// required modules: itemacro, warpgate

const use = await item.use();
if ( !use ) return;

const { levels } = actor.getRollData().classes.paladin;
const updates = { actor: { "system.attributes.hp.temp": levels } }
const options = {
    permanent: true,
    description: `${actor.name} is granting you ${levels} temporary hit points.`
}
Array.from(game.user.targets).filter(target => {
    return target.actor.system.attributes.hp.temp < levels;
}).map(target => {
    return warpgate.mutate(target.document, updates, {}, options);
});
