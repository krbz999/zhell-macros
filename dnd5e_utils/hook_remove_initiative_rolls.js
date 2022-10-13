// delete all initiative rolls from chat. Only show 3d dice rolls for player characters.
Hooks.on("preCreateChatMessage", (msg, roll, context, userId) => {
  if (!msg.getFlag("core", "initiativeRoll")) return;
  context.temporary = true;
  const actor = game.actors.get(roll.speaker.actor);
  if (!!actor && actor.hasPlayerOwner) {
    game.dice3d?.showForRoll(msg.roll, game.user, true);
  }
});
