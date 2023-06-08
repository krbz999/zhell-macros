// pop a dialog to pick a scene to view.
// choosing from all scenes set to 'All Players'
const options = game.scenes.filter(scene => {
  const {active, ownership} = scene;
  return active || (ownership.default === 2);
}).reduce((acc, {id, name}) => {
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
  title: "View Scene",
  content,
  buttons: {
    view: {
      icon: "<i class='fa-solid fa-eye'></i>",
      label: "View!",
      callback: (html) => {
        return game.scenes.get(html[0].querySelector("select").value).view();
      }
    }
  }
}).render(true);
