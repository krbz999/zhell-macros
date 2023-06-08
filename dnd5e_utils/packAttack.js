// PACK ATTACKS
// select a group of tokens, then select what item to attack with.

const pack = canvas.tokens.controlled.map(i => i.actor);
const actorIds = pack.map(i => i.id);
if (!new Set(actorIds).size) {
  ui.notifications.warn("No selected tokens!");
  return;
}

const itemsWithAttacks = actorIds.map(id => {
  return game.actors.get(id);
}).reduce((acc, {items}) => {
  acc.push(...items);
  return acc;
}, []).filter(item => item.hasAttack).map(item => item.name);
const names = new Set(itemsWithAttacks);

const options = names.reduce((acc, name) => {
  return acc + `<option value="${name}">${name}</option>`;
}, "");
const content = `
<p>Choose pack attack:</p>
<form>
  <div class="form-group">
    <div class="form-fields">
      <select id="attack">${options}</select>
    </div>
  </div>
</form>`;

return Dialog.prompt({
  title: "Pack Attack!",
  content,
  rejectClose: false,
  callback: async (html, event) => {
    const ev = event;
    let leader;
    const name = html[0].querySelector("#attack").value;
    let content = "";

    for (const member of pack) {
      const item = await member.items.getName(name);
      if (!item) continue;
      leader = member;
      const attack = await item.rollAttack({event: ev, chatMessage: false});
      if (!attack) continue;
      game.dice3d?.showForRoll(attack, game.user, true);
      if (attack.isCritical) content += `<p>Attack Roll: ${attack.total} (Critical!)</p>`;
      else if (attack.isFumble) content += `<p>Attack Roll: ${attack.total} (Fumbled)</p>`;
      else content += `<p>Attack Roll: ${attack.total}</p>`;
    }
    const item = leader.items.getName(name);
    await item.displayCard();
    await ChatMessage.create({content, "flags.core.canPopout": true});
    if (item.hasDamage) for (const member of pack) {
      await member.items.getName(name)?.rollDamage();
    }
  }
});
