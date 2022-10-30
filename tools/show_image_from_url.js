// shows the provided media to all players.

await Dialog.prompt({
  title: "Share Image via URL",
  content: "<input type='text' placeholder='Paste link here...' autofocus>",
  rejectClose: false,
  callback: (html) => {
    const imageUrl = html[0].querySelector("input").value;
    if (!imageUrl) {
      return ui.notifications.info("You did not provide a valid image.");
    }
    const ip = new ImagePopout(imageUrl);
    ip.render(true);
    ip.shareImage();
  }
});
