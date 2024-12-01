// delete all initiative rolls from chat. Only show 3d dice rolls for player characters.
Hooks.on("preCreateChatMessage", (message) => {
  if (!message.flags.core?.initiativeRoll) return;
  const actor = game.actors.get(message.speaker.actor);
  if (actor?.hasPlayerOwner) game.dice3d?.showForRoll(message.rolls[0], game.user, true);
  return false;
});
