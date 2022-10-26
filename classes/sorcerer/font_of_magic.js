// FONT OF MAGIC.
// required modules: itemacro
// setup: embed macro in item with limited uses acting as sorcery points.

// number of points required to regain an nth level spell slot; {slot-level : point-cost}.
const conversionMap = {
  "1": 2,
  "2": 3,
  "3": 5,
  "4": 6,
  "5": 7
}

const style = `
<style>

.font-of-magic .dialog-buttons {
  flex-direction: column;
  gap: 5px;
}

</style>`;

const { value: spvalue, max: spmax } = item.system.uses;
const spells = foundry.utils.duplicate(actor.system.spells);

// array of spell levels for converting points to slots.
const validLevelsWithSpentSpellSlots = Object.entries(spells).filter(([key, entry]) => {
  const k = key === "pact" ? entry.level : key.at(-1);
  const cost = conversionMap[k];
  if (!cost || cost > spvalue) return false;
  return (entry.max > 0 && entry.value < entry.max);
});
// array of spell levels for converting slots to points.
const spellLevelsWithAvailableSlots = Object.entries(spells).filter(([key, entry]) => {
  return (entry.value > 0 && entry.max > 0);
});

const isMissingPoints = spvalue < spmax;
const isMissingSlots = validLevelsWithSpentSpellSlots.length > 0;

// has unspent spell slots.
const hasAvailableSpellSlots = spellLevelsWithAvailableSlots.length > 0;
// has sp equal to or higher than the minimum required.
const hasAvailableSorceryPoints = spvalue >= Math.min(...Object.values(conversionMap));

const canConvertSlotToPoints = hasAvailableSpellSlots && isMissingPoints;
const canConvertPointsToSlot = hasAvailableSorceryPoints && isMissingSlots;
if (!canConvertPointsToSlot && !canConvertSlotToPoints) {
  ui.notifications.warn("You have no options available.");
  return;
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
new Dialog({ title: "Font of Magic", buttons }).render(true);

// Convert spell slot to sorcery points.
async function slotToPoints() {
  const retKey = await new Promise(resolve => {
    // build buttons for each level where value, max > 0.
    const slotToPointsButtons = Object.fromEntries(spellLevelsWithAvailableSlots.map(([key, vals]) => {
      const k = key === "pact" ? "Pact Slot" : CONFIG.DND5E.spellLevels[key.at(-1)];
      return [key, {
        callback: () => { resolve(key) }, label: `
        <div class="flexrow">
          <span>${k} (${vals.value}/${vals.max})</span>
          <span>(+${vals.level ?? key.at(-1)} points)</span>
        </div>`}];
    }));

    new Dialog({
      title: "Slot to Sorcery Points",
      buttons: slotToPointsButtons,
      content: style + `
      <p>Pick a spell slot level to convert one
      spell slot to sorcery points (<strong>${spvalue}/${spmax}</strong>).
      You regain a number of sorcery points equal
      to the level of the spell slot.</p>`,
      close: () => { resolve(0) }
    }, {
      classes: ["dialog", "font-of-magic"]
    }).render(true);
  });

  if (retKey !== 0) {
    spells[retKey].value--;
    await actor.update({ system: { spells } });
    const level = retKey === "pact" ? spells["pact"].level : retKey.at(-1);
    const newPointsValue = Math.clamped(spvalue + Number(level), 0, spmax);
    const pointsGained = newPointsValue - spvalue;
    await item.update({ "system.uses.value": newPointsValue });
    return ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `${actor.name} regained ${pointsGained} sorcery points.`
    });
  }
}

// Convert sorcery points to spell slot.
async function pointsToSlot() {
  const retKey = await new Promise(resolve => {
    // build buttons for each level where max > 0, max > value, and conversionMap[level] <= spvalue.
    const pointsToSlotButtons = Object.fromEntries(validLevelsWithSpentSpellSlots.map(([key, vals]) => {
      const k = key === "pact" ? "Pact Slot" : CONFIG.DND5E.spellLevels[key.at(-1)];
      const cost = conversionMap[vals.level ?? key.at(-1)];
      return [key, {
        callback: () => { resolve(key) }, label: `
        <div class="flexrow">
          <span>${k} (${vals.value}/${vals.max})</span>
          <span>(&minus;${cost} points)</span>
        </div>`}];
    }));

    new Dialog({
      title: "Sorcery Points to Slot",
      buttons: pointsToSlotButtons,
      content: style + `<p>Pick a spell slot level to regain from sorcery points (<strong>${spvalue}/${spmax}</strong>).</p>`,
      close: () => { resolve(0) }
    }, {
      classes: ["dialog", "font-of-magic"]
    }).render(true);
  });

  if (retKey !== 0) {
    spells[retKey].value++;
    await actor.update({ system: { spells } });
    const level = retKey === "pact" ? spells["pact"].level : retKey.at(-1);
    await item.update({ "system.uses.value": Math.clamped(spvalue - conversionMap[level], 0, spmax) });
    const str = retKey === "pact" ? "Pact Slot" : `${CONFIG.DND5E.spellLevels[level]} spell slot`;
    return ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `${actor.name} regained a ${str}.`
    });
  }
}
