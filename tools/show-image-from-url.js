// shows the provided media to all players.

const url = await foundry.applications.api.DialogV2.prompt({
  window: {
    title: "Share Image via URL",
  },
  content: "<input type='text' placeholder='Paste link here...' autofocus name='url'>",
  modal: false,
  rejectClose: false,
  position: {
    width: 400,
  },
  ok: {
    callback: (event, button) => button.form.elements.url.value,
  },
});
if (!url) return;

const popout = new ImagePopout(url);
popout.render(true);
popout.shareImage();
