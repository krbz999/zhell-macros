// pop a dialog to pick a scene to activate.
const options = game.scenes.reduce((acc, {id, name}) => acc += `<option value="${id}">${name}</option>`, "");
const content = `
<form>
  <div class="form-group">
    <label for="scene-select">Scene</label>
    <div class="form-fields">
      <select id="scene-select">${options}</select>
    </div>
  </div>
</form>`;
new Dialog({
  title: "Activate Scene",
  content,
  buttons: {
    go: {
      icon: `<i class="fas-fa check"></i>`,
      label: "Activate!",
      callback: async (html) => {
        const sceneId = html[0].querySelector("select[id='scene-select']").value;
        const scene = game.scenes.get(sceneId);
        await scene.activate();
      }
    }
  }
}).render(true);
