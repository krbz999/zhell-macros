// Combat Macro, requesting initiative.
// This creates a combat if it does not exist.
// It then requests Dexterity checks from all players.
// GM can use it to roll for all selected tokens.
// Tokens that have initiative values are skipped.
// Combat is toggled on for each token if they are not already.
// Item Piles will be ignored.
// required modules: requestor.


const action = async () => {
  const selected = canvas.tokens.controlled;
  const charTokens = game.user.character?.getActiveTokens() ?? [];
  const itemPilesActive = !!game.modules.get("item-piles")?.active;
  let toks = selected.length > 0 ? selected : charTokens;

  toks = toks.filter(i => {
    if (i.combatant && i.combatant.initiative !== null) return false;
    if (!itemPilesActive) return true;
    if (i.actor.getFlag("item-piles", "data.active")) return false;
    return true;
  });
  if (!toks.length) {
    return ui.notifications.warn("No valid tokens.");
  }
  const updates = [];
  for (const tok of toks) {
    const parts = [];
    // init bonuses.
    const init_only = tok.actor.getFlag("world", "initiative-bonus");
    if (!!init_only) parts.push(init_only);
    parts.push(tok.actor.system.attributes.init.value);

    // the following is only until the dnd5e issue gets fixed.
    // dex mod
    parts.push("@mod");
    // prof
    const abl = tok.actor.system.abilities["dex"];
    if (abl.checkProf.hasProficiency) parts.push("@prof");
    // dex check bonuses
    if (abl.bonuses.check) parts.push("@dexCheckBonus");
    // global actor bonus
    if (tok.actor.system.bonuses?.abilities?.check) parts.push("@checkBonus");
    // end.

    const rollOptions = {
      chatMessage: !game.user.isGM,
      event,
      parts,
      advantage: !!tok.actor.getFlag("dnd5e", "initiativeAdv"),
      disadvantage: !!tok.actor.getFlag("dnd5e", "initiativeDisadv")
    }
    const { total } = await tok.actor.rollAbilityTest("dex", rollOptions);
    if (total !== undefined && total !== null) {
      if (!tok.inCombat) await tok.toggleCombat();
      updates.push({ _id: tok.combatant.id, initiative: total });
    }
  }
  return game.combats.get(this.combatId).updateEmbeddedDocuments("Combatant", updates);
}

const combat = game.combat ?? await Combat.create({ scene: canvas.scene.id, active: true });
await Requestor.request({
  buttonData: [{ action, label: "Roll Initiative!", combatId: combat.id }],
  img: "icons/skills/melee/weapons-crossed-swords-yellow.webp",
  description: "Roll initiative for all selected tokens or your assigned character.",
  title: "Roll Initiative",
  limit: Requestor.LIMIT.FREE,
  context: { popout: true, autoClose: true },
  speaker: ChatMessage.getSpeaker({ alias: "Initiative" })
});
