// Twilight Sanctuary
// Required modules: itemacro, sequencer, jb2a-patreon, warpgate

// CONSTS
const name = "Twilight Sanctuary";
const file = "jb2a.markers.circle_of_stars.orangepurple";
const error = "Please target a token.";
const speaker = ChatMessage.getSpeaker({actor, token});
const user = game.user.id;
const target = game.user.targets.first();

// find Sequencer effect
const effect = Sequencer.EffectManager.getEffects({name})[0] ?? false;

if(!effect){
	const size = 8;
	const cast = await item.roll();
	if(!cast) return;
	new Sequence()
		.effect()
			.attachTo(token)
			.persist()
			.name(name)
			.file(file)
			.size(canvas.grid.size * size)
			.scaleIn(0, 800, {ease: "easeOutCubic"})
			.rotateIn(180, 1200, {ease: "easeOutCubic"})
			.scaleOut(0, 500, {ease: "easeOutCubic"})
			.fadeOut(500, {ease: "easeOutCubic"})
		.play();
}else{
	new Dialog({
		title: name,
		buttons: {
			hp: {
				icon: `<i class="fas fa-heart"></i>`,
				label: "<br>Grant temp HP",
				callback: async () => {
					const {levels} = actor.getRollData().classes.cleric;
					if(!target) return ui.notifications.error(error);
					const roll = new Roll(`1d6 + ${levels}`);
					const {total} = await roll.evaluate({async: true});
					roll.toMessage({user, speaker, flavor: "Twilight Sanctuary"});
					const {temp} = target.actor.getRollData().attributes.hp ?? 0;
					const updates = {actor: {"data.attributes.hp.temp": total}};
					const config = {permanent: true, name, description: `You are being granted ${total} temporary hit points.`};
					if(total > temp) await warpgate.mutate(target.document, updates, {}, config);
				}
			},
			effect: {
				icon: `<i class="fas fa-check"></i>`,
				label: "<br>End an effect",
				callback: async () => {
					if(!target) return ui.notifications.error(error);
					ChatMessage.create({user,  speaker, content: `${actor.name} ends the charmed or frightened condition on ${target.name}.`});
				}
			},
			end: {
				icon: `<i class="fas fa-times"></i>`,
				label: "<br>End Sanctuary",
				callback: async () => { await Sequencer.EffectManager.endEffects({name}); }
			}
		},
		default: "hp"
	}).render(true);
}