// delete combatants from the combat tracker if and only if they have 0 or less hp and do not have a player owner.
// required modules: none.

const ids = game.combat.combatants.filter(c => {
  const player = c.token.actor.hasPlayerOwner;
  const hp = c.token.actor.system.attributes.hp.value > 0;
  return !player && !hp;
}).map(c => c.id);
await game.combat.deleteEmbeddedDocuments("Combatant", ids);
