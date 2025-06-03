/**
 * Find the latest damage roll in chat. From that message, find a Save activity.
 * Then, loop through each selected token and prompt a saving throw using the properties of that activity,
 * and apply damage accordingly.
 */

const message = game.messages.contents.reverse().find(message => message.flags.dnd5e?.roll?.type === "damage");
if (!message) {
  ui.notifications.warn("Did not find any recent damage rolls in chat.");
  return;
}

const activity = await fromUuid(message.flags.dnd5e?.activity?.uuid);
if (activity?.type !== "save") {
  ui.notifications.warn("Did not find a valid Save activity from latest damage roll.");
  return;
}

const ability = activity.save.ability.first();
const dc = activity.save.dc.value;
const onSave = activity.damage.onSave === "none" ? 0 : activity.damage.onSave === "half" ? 0.5 : 1;

const damages = dnd5e.dice.aggregateDamageRolls(message.rolls, {respectProperties: true}).map(roll => ({
  value: roll.total,
  type: roll.options.type,
  properties: new Set(roll.options.properties ?? []),
}));

const actors = new Set();
for (const token of canvas.tokens.controlled) {
  if (!token.actor || actors.has(token.actor)) continue;
  if (!token.actor.system.attributes?.hp?.value) continue;
  actors.add(token.actor);

  let multiplier = 1;
  await canvas.animatePan(token.center);
  const [roll] = await token.actor.rollSavingThrow({ ability, target: dc });
  if (!roll) continue;
  if (roll.total >= dc) multiplier *= onSave;
  await token.actor.applyDamage(damages, { multiplier });
}
