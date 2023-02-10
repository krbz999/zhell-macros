// LAY ON HANDS
// required modules: itemacro

const uses = item.system.uses;
if(!uses.value) return ui.notifications.warn(`${item.name} has no uses left.`);

const content = `
<p>Lay on Hands has ${uses.value} uses left.</p>
<form>
  <div class="form-group">
    <label for="num">Hit points to restore:</label>
    <div class="form-fields">
      <input type="number" value="1" autofocus>
    </div>
  </div>
</form>`;

const buttons = {
  heal: {
    icon: "<i class='fa-solid fa-hand-holding-heart'></i>",
    label: "Heal!",
    callback: async (html) => {
      const number = Number(html[0].querySelector("#num").value);
      if(!number.between(1, uses.value)) return ui.notifications.warn("Invalid number.");
      await new Roll(`${number}`).toMessage({speaker, flavor: item.name});
      return item.update({"system.uses.value": uses.value - number});
    }
  }
};
if(uses.value >= 5){
  buttons.cure = {
    icon: "<i class='fa-solid fa-virus'></i>",
    label: "Cure!",
    callback: async (html) => {
      await ChatMessage.create({content: `${actor.name} cures a disease or poison.`, speaker});
      return item.update({"system.uses.value": uses.value - 5});
    }
  };
}
return new Dialog({title: item.name, content, buttons}).render(true);
