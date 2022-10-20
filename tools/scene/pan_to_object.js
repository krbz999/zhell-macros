/**
 * A prompt to pick a note from any on the map,
 * then pull the user and all players to that note.
 * Required modules: none.
 */

const options = canvas.scene.notes.reduce((acc, e) => {
  return acc + `<option value="${e.id}">${e.text}</option>`;
});
const content = `
<form>
  <div class="form-group">
    <label>Select City:</label>
    <div class="form-fields"> <select>${options}</select> </div>
  </div>
</form>`;
await Dialog.prompt({
  title: "Pan to City",
  content,
  callback: (html) => {
    const id = html[0].querySelector("select").value;
    const note = canvas.scene.notes.get(id);
    const origin = note.object.center;
    const options = {
      scene: canvas.scene.id,
      pull: true,
      style: CONFIG.Canvas.pings.types.PULL
    };
    return canvas.ping(origin, options);
  }
});
