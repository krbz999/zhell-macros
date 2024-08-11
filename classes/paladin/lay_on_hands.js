// LAY ON HANDS
// required modules: itemacro

const uses = item.system.uses;
if (!uses.value) {
  ui.notifications.warn(`${item.name} has no uses left.`);
  return;
}

const input = new foundry.data.fields.NumberField({
  min: 1,
  step: 1,
  max: uses.value,
  label: "Charges"
}).toFormGroup({}, {name: "loh", value: 1}).outerHTML;

const content = `
<fieldset>
  <legend>Lay on Hands</legend>
  <p class="hint">Lay on Hands has ${uses.value} uses left. You can expend a number of charges to heal someone, or expend 5 charges to cure a disease or poison.</p>
  ${input}
</fieldset>`;

const buttons = [{
  action: "heal",
  icon: "fa-solid fa-fw fa-hand-holding-heart",
  label: "Heal!",
  callback: async (event, button, html) => {
    const number = Number(button.form.elements.loh.value);
    await new CONFIG.Dice.DamageRoll(String(number), {}, {type: "healing"}).toMessage({
      flavor: "Lay on Hands",
      speaker: ChatMessage.implementation.getSpeaker({actor: actor})
    });
    return item.update({"system.uses.value": uses.value - number});
  }
}];

if (uses.value >= 5) buttons.push({
  action: "cure",
  icon: "fa-solid fa-fw fa-virus",
  label: "Cure!",
  callback: async (event, button, html) => {
    await ChatMessage.implementation.create({
      content: `${actor.name} cures a disease or poison.`,
      speaker: ChatMessage.implementation.getSpeaker({actor: actor})
    });
    return item.update({"system.uses.value": uses.value - 5});
  }
});

foundry.applications.api.DialogV2.wait({
  buttons: buttons,
  content: content,
  rejectClose: false,
  modal: true,
  position: {width: 400, height: "auto"},
  window: {title: "Lay on Hands", icon: "fa-hand-holding-heart"}
});
