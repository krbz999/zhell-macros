/**
 * A prompt to pick a note from any on the map,
 * then pull the user and all players to that note.
 * Required modules: none.
 */

const options = canvas.scene.notes.reduce((acc, e) => {
  let label;
  if (!e.entryId) label = e.text;
  else if (e.pageId) label = game.journal.get(e.entryId).pages.get(e.pageId).name;
  else label = game.journal.get(e.entryId).name;
  return acc + `<option value="${e.id}">${label}</option>`;
}, "");
const content = `
<form>
  <div class="form-group">
    <label>Select City:</label>
    <div class="form-fields">
      <select>${options}</select>
    </div>
  </div>
</form>`;
await Dialog.prompt({
  title: "Pan to City",
  content,
  rejectClose: false,
  label: "Pan to City",
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
