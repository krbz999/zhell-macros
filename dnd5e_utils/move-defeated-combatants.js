// Move the defeated combatants to the top left of the scene?
const moveDefeated = true;

// Display a kill count chat message?
const displayMessage = false;

const defeated = game.combat.combatants.filter(c => c.isDefeated);
const deleteIds = defeated.map(c => c.id);
await game.combat.deleteEmbeddedDocuments("Combatant", deleteIds);
if (moveDefeated) {
 const { x, y } = canvas.scene.dimensions.sceneRect;
 const updates = defeated.map(c => ({ _id: c.token.id, x, y }));
 await canvas.scene.updateEmbeddedDocuments("Token", updates, { animation: { movementSpeed: 12 } });
}
if (displayMessage) {
 const enemies = canvas.scene.tokens.filter(token => token.disposition === CONST.TOKEN_DISPOSITIONS.HOSTILE);
 const kills = enemies.filter(token => !token.actor.system.attributes.hp.value).length;
 ChatMessage.implementation.create({ content: `<p>Kills: ${kills} / ${enemies.length}</p>`});
}
