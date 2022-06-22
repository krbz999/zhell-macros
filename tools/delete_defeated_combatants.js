// delete combatants from the combat tracker if and only if they have 0 or less hp and do not have a player owner.
// required modules: none.

// the ids of the combatants to delete.
const ids = game.combat.combatants.filter(i => {
	// filter out player-owned combatants.
	if(i.hasPlayerOwner) return false;
	
	// filter out living combatants
	if(getProperty(i.token, "actor.data.data.attributes.hp.value") > 0) return false;
	
	return true;
}).map(i => i.id);

// yeet 'em.
await game.combat.deleteEmbeddedDocuments("Combatant", ids);
