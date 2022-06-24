// delete all initiative rolls from chat. Only show 3d dice rolls for player characters.
Hooks.on("preCreateChatMessage", (msg, roll, context, userId) => {
	// pre-hook, so don't need to filter by user, everyone just marks their messages as temp.
	
	// bail out if not initiative roll.
	if(!msg.getFlag("core", "initiativeRoll")) return;
	
	// set message as temporary.
	context.temporary = true;
	
	// show 3d dice if player-owned actor.
	const actor = game.actors.get(roll.speaker.actor);
	if(!!actor && actor.hasPlayerOwner) game.dice3d?.showForRoll(msg.roll, game.user, true);
});