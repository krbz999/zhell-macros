// Combat Macro, requesting initiative.
// This creates a combat if it does not exist.
// It then requests Initiative rolls from all players.
// GM can use it to roll for all selected tokens.
// Tokens that have initiative values are skipped.
// Combat is toggled on for each token if they are not already.
// Item Piles will be ignored.
// required modules: requestor.

const action = async () => {
  const selected = canvas.tokens.controlled;
  const charTokens = game.user.character?.getActiveTokens() ?? [];
  const itemPilesActive = !!game.modules.get("item-piles")?.active;
  const tokens = (selected.length ? selected : charTokens).filter(token => {
    const ini = token.combatant?.initiative;
    if ([undefined, null].includes(ini)) return true;
    if (!itemPilesActive) return true;
    return !token.actor?.getFlag("item-piles", "data.active");
  });
  if (!tokens.length) {
    ui.notifications.warn("No valid tokens.");
    return null;
  }
  for (const token of tokens) {
    await token.actor?.rollInitiativeDialog();
  }
}

const combat = game.combat ?? await Combat.create({scene: canvas.scene.id, active: true});
await Requestor.request({
  buttonData: [{action, label: "Roll Initiative!", combatId: combat.id}],
  img: "icons/skills/melee/weapons-crossed-swords-yellow.webp",
  description: "Roll initiative for all selected tokens or your assigned character.",
  title: "Roll Initiative",
  limit: Requestor.LIMIT.FREE,
  context: {popout: true, autoClose: true},
  speaker: ChatMessage.getSpeaker({alias: "Initiative"})
});
