// SONG OF DEFENSE
// required modules: itemacro

const style = `
<style>
.song-of-defense .dialog-buttons {
  flex-direction: column;
  gap: 5px;
}
</style>`;

const spells = foundry.utils.duplicate(actor.system.spells);

// levels with unspent spell slots.
const availableSlots = Object.entries(spells).filter(([key, { value, max }]) => {
  return (value > 0 && max > 0);
});
if (!availableSlots.length) {
  ui.notifications.warn("You have no spell slots remaining.");
  return;
}

const buttons = availableSlots.reduce((acc, [key]) => {
  const level = key === "pact" ? spells[key].level : key.at(-1);
  const label = key === "pact" ? "Pact Slot" : CONFIG.DND5E.spellLevels[level];
  const callback = async () => spendSlot(key, level);
  acc[key] = { label, callback };
  return acc;
}, {});
new Dialog({ title: "Song of Defense", buttons, content: style }, { classes: ["song-of-defense", "dialog"] }).render(true);

// spend spell slot to reduce by 5 * level
async function spendSlot(key, level) {
  spells[key].value--;
  await actor.update({ system: { spells } });
  return ChatMessage.create({
    content: `${actor.name} reduced the incoming damage by up to ${Number(level) * 5}.`,
    speaker: ChatMessage.getSpeaker({ actor })
  });
}
