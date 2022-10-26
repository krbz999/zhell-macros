// shows the provided media to all players.

new Dialog({
  title: "Share Image via URL",
  content: `
  <form>
    <div class="form-group">
      <label>Image URL:</label>
      <input type="text" id="image-url"/>
    </div>
  </form>`,
  buttons: {
    yes: {
      icon: '<i class="fas fa-check"></i>',
      label: "Share",
      callback: (html) => {
        const imageUrl = html[0].querySelector("#image-url").value;
        if (!imageUrl) {
          return ui.notifications.info("You did not provide a valid image.");
        }
        const ip = new ImagePopout(imageUrl);
        ip.render(true);
        ip.shareImage();
      }
    }
  }
}).render(true);
