// shows the provided media to all players.

await Dialog.prompt({
  title: "Share Image",
  content: `
  <form>
    <div class="form-group">
      <label>Image:</label>
      <div class="form-fields">
        <input type="text" placeholder="Paste link here..." autofocus>
      </div>
    </div>
  </form>`,
  label: "Show",
  rejectClose: false,
  callback: (html) => {
    const imageUrl = html[0].querySelector("input").value;
    if (!imageUrl) return ui.notifications.info("You did not provide a valid image.");
    return new ImagePopout(imageUrl).render(true).shareImage();
  }
});
