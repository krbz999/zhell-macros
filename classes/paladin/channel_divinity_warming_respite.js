// channel divinity: warming respite (oath of the hearth)
// required modules: itemacro, warpgate.

const roll = await item.roll();
if(!roll) return;

const {levels} = actor.getRollData().classes.paladin;

for(let target of game.user.targets){
	const temp = actor.getRollData().attributes.hp.temp ?? 0;
	if(levels <= temp) continue;
	const updates = {actor: {"data.attributes.hp.temp": levels}};
	const options = {permanent: true, description: `${actor.name} is granting you ${levels} temporary hit points.`};
	await warpgate.mutate(target.document, updates, {}, options);
}