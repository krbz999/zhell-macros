// FONT OF MAGIC.
// required modules: itemacro
// setup: embed macro in item with limited uses acting as sorcery points.

// Map of slot level to point cost.
const conversionMap = { 1: 2, 2: 3, 3: 5, 4: 6, 5: 7 };
const style = `
<style>
.font-of-magic .dialog-buttons {
  flex-direction: column;
  gap: 5px;
}
</style>`;
const spellPoints = item.system.uses;
const spellSlots = { ...actor.system.spells };

// array of spell levels for converting points to slots.
const validLevelsWithSpentSpellSlots = Object.entries(spellSlots).filter(([key, entry]) => {
  const k = key === "pact" ? entry.level : key.at(-1);
  const cost = conversionMap[k];
  if (!cost || (cost > spellPoints.value)) return false;
  return (entry.max > 0 && entry.value < entry.max);
});
// array of spell levels for converting slots to points.
const spellLevelsWithAvailableSlots = Object.entries(spellSlots).filter(([key, entry]) => {
  return (entry.value > 0) && (entry.max > 0);
});

const isMissingPoints = spellPoints.value < spellPoints.max;
const isMissingSlots = validLevelsWithSpentSpellSlots.length > 0;

// has unspent spell slots.
const hasAvailableSpellSlots = spellLevelsWithAvailableSlots.length > 0;
// has sp equal to or higher than the minimum required.
const hasAvailableSorceryPoints = spellPoints.value >= Math.min(...Object.values(conversionMap));

const canConvertSlotToPoints = hasAvailableSpellSlots && isMissingPoints;
const canConvertPointsToSlot = hasAvailableSorceryPoints && isMissingSlots;
if (!canConvertPointsToSlot && !canConvertSlotToPoints) {
  ui.notifications.warn("You have no options available.");
  return null;
}

// set up available buttons.
const buttons = {};
if (canConvertSlotToPoints) buttons["slotToPoint"] = {
  icon: "<i class='fa-solid fa-arrow-left'></i> <br>",
  label: "Convert a spell slot to sorcery points",
  callback: slotToPoints
}
if (canConvertPointsToSlot) buttons["pointToSlot"] = {
  icon: "<i class='fa-solid fa-arrow-right'></i> <br>",
  label: "Convert sorcery points to a spell slot",
  callback: pointsToSlot
}
new Dialog({ title: item.name, buttons }).render(true);

// Convert spell slot to sorcery points.
async function slotToPoints() {
  // build buttons for each level where value, max > 0.
  const slotToPointsButtons = Object.fromEntries(spellLevelsWithAvailableSlots.map(([key, vals]) => {
    const k = key === "pact" ? "Pact Slot" : CONFIG.DND5E.spellLevels[key.at(-1)];
    return [key, {
      callback: () => key,
      label: `
      <div class="flexrow">
        <span>${k} (${vals.value}/${vals.max})</span>
        <span>(+${vals.level ?? key.at(-1)} points)</span>
      </div>`
    }];
  }));

  const retKey = await Dialog.wait({
    title: "Slot to Sorcery Points",
    buttons: slotToPointsButtons,
    content: style + `
    <p>Pick a spell slot level to convert one spell slot to sorcery points (<strong>${spellPoints.value}/${spellPoints.max}</strong>).
    You regain a number of sorcery points equal to the level of the spell slot.</p>`
  }, {
    classes: ["dialog", "font-of-magic"]
  });
  if (!retKey) return null;

  await actor.update({ [`system.spells.${retKey}.value`]: spellSlots[retKey].value - 1 });
  const level = retKey === "pact" ? spellSlots["pact"].level : retKey.at(-1);
  const newPointsValue = Math.clamped(spellPoints.value + Number(level), 0, spellPoints.max);
  await item.update({ "system.uses.value": newPointsValue });
  return ChatMessage.create({
    speaker,
    content: `${actor.name} regained ${newPointsValue - spellPoints.value} sorcery points.`
  });
}

// Convert sorcery points to spell slot.
async function pointsToSlot() {
  const pointsToSlotButtons = Object.fromEntries(validLevelsWithSpentSpellSlots.map(([key, vals]) => {
    const k = key === "pact" ? "Pact Slot" : CONFIG.DND5E.spellLevels[key.at(-1)];
    const cost = conversionMap[vals.level ?? key.at(-1)];
    return [key, {
      callback: () => key,
      label: `
      <div class="flexrow">
        <span>${k} (${vals.value}/${vals.max})</span>
        <span>(&minus;${cost} points)</span>
      </div>`
    }];
  }));

  const retKey = await Dialog.wait({
    title: "Sorcery Points to Slot",
    buttons: pointsToSlotButtons,
    content: style + `<p>Pick a spell slot level to regain from sorcery points (<strong>${spellPoints.value}/${spellPoints.max}</strong>).</p>`
  }, {
    classes: ["dialog", "font-of-magic"]
  });
  if (!retKey) return null;

  await actor.update({ [`system.spells.${retKey}.value`]: spellSlots[retKey].value + 1 });
  const level = retKey === "pact" ? spellSlots["pact"].level : retKey.at(-1);
  await item.update({ "system.uses.value": Math.clamped(spellPoints.value - conversionMap[level], 0, spellPoints.max) });
  const str = retKey === "pact" ? "Pact Slot" : `${CONFIG.DND5E.spellLevels[level]} spell slot`;
  return ChatMessage.create({
    speaker,
    content: `${actor.name} regained a ${str}.`
  });
}
