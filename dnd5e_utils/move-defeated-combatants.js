// Display a kill count message?
const displayMessage = true;

/* -------------------------------------------------- */

const combat = game.combat;
const defeated = game.combat.combatants.filter(c => c.isDefeated);

// delete defeated.
const deleteIds = defeated.map(c => c.id);
await combat.deleteEmbeddedDocuments("Combatant", deleteIds);

const {x, y} = canvas.scene.dimensions.sceneRect;
const updates = defeated.map(c => ({_id: c.token.id, x, y}));
await canvas.scene.updateEmbeddedDocuments("Token", updates, {animation: {movementSpeed: 12}});

if (displayMessage) {
  const enemies = canvas.scene.tokens.filter(token => {
    return token.disposition === CONST.TOKEN_DISPOSITIONS.HOSTILE;
  });
  const kills = enemies.filter(token => {
    const hp = token.actor?.system.attributes?.hp;
    return hp && !hp.value;
  }).length;
  ChatMessage.implementation.create({content: `Kills: ${kills} / ${enemies.length}`});
}
