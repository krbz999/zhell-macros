// FONT OF MAGIC.
// required modules: itemacro.
// setup: embed macro in item with limited uses acting as sorcery points.

// number of points required to regain an nth level spell slot; {slot-level : point-cost}.
const conversion_map = {"1": 2, "2": 3, "3": 5, "4": 6, "5": 7}

const style = `<style>
.dialog .dialog-buttons button {
    background: rgba(0, 0, 0, 0.1);
    border: 2px groove var(--color-border-light-highlight);
    margin: 0 5px 5px 0;
}
</style>`;

const {value: spvalue, max: spmax} = item.data.data.uses;
const spells = duplicate(actor.data.data.spells);

// array of spell levels for converting points to slots.
const valid_levels_with_spent_spell_slots = Object.entries(spells).filter(([key, {value, max}]) => {
  const cost = conversion_map[key.at(-1)];
  if(!cost || cost > spvalue) return false;
  return (max > 0 && value < max);
});
// array of spell levels for converting slots to points.
const spell_levels_with_available_slots = Object.entries(spells).filter(([key, {value, max}]) => {
  return (value > 0 && max > 0);
});

const is_missing_points = spvalue < spmax;
const is_missing_slots = valid_levels_with_spent_spell_slots.length > 0;

// has unspent spell slots.
const has_available_spell_slots = spell_levels_with_available_slots.length > 0;
// has sp equal to or higher than the minimum required.
const has_available_sorcery_points = spvalue >= Math.min(...Object.values(conversion_map));

const can_convert_slot_to_points = has_available_spell_slots && is_missing_points;
const can_convert_points_to_slot = has_available_sorcery_points && is_missing_slots;
if(!can_convert_points_to_slot && !can_convert_slot_to_points){
  return ui.notifications.warn("You have no options available.");
}

// set up available buttons.
const buttons = {};
if(can_convert_slot_to_points) buttons["slot_to_point"] = {
  icon: `<i class="fas fa-arrow-left"></i> <br>`,
  label: "Convert a spell slot to sorcery points",
  callback: async () => {await slot_to_points()}
}
if(can_convert_points_to_slot) buttons["point_to_slot"] = {
  icon: `<i class="fas fa-arrow-right"></i> <br>`,
  label: "Convert sorcery points to a spell slot",
  callback: async () => {await points_to_slot()}
}
new Dialog({title: "Font of Magic", buttons}).render(true);

// Convert spell slot to sorcery points.
async function slot_to_points(){
  const level = await new Promise(resolve => {
    // build buttons for each level where value, max > 0.
    const slot_to_points_buttons = Object.fromEntries(spell_levels_with_available_slots.map(([key, {value, max}]) => {
      const spell_level = key.at(-1);
      return [key, { callback: () => {resolve(spell_level)}, label: `
        <div class="flexrow">
          <span>${CONFIG.DND5E.spellLevels[spell_level]} (${value}/${max})</span>
          <span>(+${spell_level} points)</span>
        </div>`}];
    }));
    
    const stp_dialog = new Dialog({
      title: "Slot to Sorcery Points",
      buttons: slot_to_points_buttons,
      content: style + `
        <p>Pick a spell slot level to convert one spell slot to sorcery points (<strong>${spvalue}/${spmax}</strong>).
        You regain a number of sorcery points equal to the level of the spell slot.</p>`,
      render: (html) => {
        html.css("height", "auto");
        stp_dialog.element[0].querySelector(".dialog-buttons").style.flexDirection = "column";
      },
      close: () => {resolve(0)}
    }).render(true);
  });
  
  if(Number(level) > 0){
    spells[`spell${level}`].value--;
    await actor.update({"data.spells": spells});
    const new_points_value = Math.clamped(spvalue + Number(level), 0, spmax);
    const points_gained = new_points_value - spvalue;
    await item.update({"data.uses.value": new_points_value});
    return ChatMessage.create({
      speaker: ChatMessage.getSpeaker({actor}),
      content: `${actor.name} regained ${points_gained} sorcery points.`
    });
  }
}

// Convert sorcery points to spell slot.
async function points_to_slot(){
  const level = await new Promise(resolve => {
    // build buttons for each level where max > 0, max > value, and conversion_map[level] <= spvalue.
    const points_to_slot_buttons = Object.fromEntries(valid_levels_with_spent_spell_slots.map(([key, {value, max}]) => {
      const spell_level = key.at(-1);
      const cost = conversion_map[spell_level];
      return [key, { callback: () => {resolve(spell_level)}, label: `
        <div class="flexrow">
          <span>${CONFIG.DND5E.spellLevels[spell_level]} (${value}/${max})</span>
          <span>(&minus;${cost} points)</span>
        </div>`}];
    }));
    
    const pts_dialog = new Dialog({
      title: "Sorcery Points to Slot",
      buttons: points_to_slot_buttons,
      content: style + `<p>Pick a spell slot level to regain from sorcery points (<strong>${spvalue}/${spmax}</strong>).</p>`,
      render: (html) => {
        html.css("height", "auto");
        pts_dialog.element[0].querySelector(".dialog-buttons").style.flexDirection = "column";
      },
      close: () => {resolve(0)}
    }).render(true);
  });
  
  if(Number(level) > 0){
    spells[`spell${level}`].value++;
    await actor.update({"data.spells": spells});
    await item.update({"data.uses.value": Math.clamped(spvalue - conversion_map[level], 0, spmax)});
    return ChatMessage.create({
      speaker: ChatMessage.getSpeaker({actor}),
      content: `${actor.name} regained a ${CONFIG.DND5E.spellLevels[level]} spell slot.`
    });
  }
}
