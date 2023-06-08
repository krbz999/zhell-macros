// pop a dialog to pick a scene to activate.
const options = game.scenes.reduce((acc, {id, name}) => {
  return acc + `<option value="${id}">${name}</option>`;
}, "");
const content = `
<form>
  <div class="form-group">
    <label>Scene</label>
    <div class="form-fields">
      <select autofocus>${options}</select>
    </div>
  </div>
</form>`;
new Dialog({
  title: "Activate Scene",
  content,
  buttons: {
    go: {
      icon: "<i class='fa-solid fa-check'></i>",
      label: "Activate!",
      callback: async (html) => {
        const sceneId = html[0].querySelector("select").value;
        return game.scenes.get(sceneId).activate();
      }
    }
  }
}).render(true);
