/**
  Click to set temporary hit points of selected tokens.
  Shift-click to remove temporary hit points of selected tokens.
  Actor temp hp will use whichever is highest.
**/

if(event.shiftKey){
  for(let tok of canvas.tokens.controlled) await tok.actor.update({"data.attributes.hp.temp" : null});
  return;
}

new Dialog({
  title: "Add temporary hit points",
  content: `
  <form>
    <div class="form-group">
      <label for="temphp">Temp HP</label>
      <div class="form-fields">
        <input id="temphp" type="number"></input>
      </div>
    </div>
  </form>`,
  buttons: {go: {
    icon: `<i class="fas fa-check"></i>`,
    label: "Apply",
    callback: async (html) => {
      const {value} = html[0].querySelector("input[id=temphp]");
      for(let tok of canvas.tokens.controlled){
        let {temp} = tok.actor.getRollData().attributes.hp;
        await tok.actor.update({"data.attributes.hp.temp" : Math.max(temp, value)});
      }
    }
  }},
  default: "go"
}).render(true);
