// LAY ON HANDS
// required modules: itemacro

const uses = item.system.uses;
if (!uses.value) {
  ui.notifications.warn(`${item.name} has no uses left.`);
  return null;
}

const content = `
<p>Lay on Hands has ${uses.value} uses left.</p>
<form class="dnd5e">
  <div class="form-group">
    <label>Hit points to restore:</label>
    <div class="form-fields">
      <input type="number" value="1" autofocus min="1" max="${uses.value}">
    </div>
  </div>
</form>`;

const buttons = {
  heal: {
    icon: "<i class='fa-solid fa-hand-holding-heart'></i>",
    label: "Heal!",
    callback: async ([html]) => {
      const number = parseInt(html.querySelector("input").value) || 0;
      if (!number.between(1, uses.value)) {
        ui.notifications.warn("Invalid number.");
        return null;
      }
      const clone = item.clone({
        "system.damage.parts": [[`${number}`, "healing"]],
        "system.actionType": "heal"
      }, {keepId: true});
      clone.prepareData();
      clone.prepareFinalAttributes();
      await clone.rollDamage({options: {fastForward: true, critical: false}});
      return item.update({"system.uses.value": uses.value - number});
    }
  },
  cure: {
    condition: uses.value >= 5,
    icon: "<i class='fa-solid fa-virus'></i>",
    label: "Cure!",
    callback: async () => {
      await ChatMessage.implementation.create({
        content: `${actor.name} cures a disease or poison.`,
        speaker
      });
      return item.update({"system.uses.value": uses.value - 5});
    }
  }
};
return new Dialog({title: item.name, content, buttons}).render(true);
