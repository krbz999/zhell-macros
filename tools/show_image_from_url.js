// shows the provided media to all players.

new Dialog({
  title: "Share Image via URL",
  content: `
  <form>
    <div class="form-group">
      <label for="image-url">Image URL</label>
      <div class="form-fields">  
        <input type="text" id="image-url" name="image-url"></input>
      </div>
    </div>
  </form>`,
  buttons: {
    go: {
      icon: "<i class='fas fa-check'></i>",
      label: "Share",
      callback: (html) => {
        const imageUrl = html[0].querySelector("input[id='image-url']").value;
        if(!imageUrl) return ui.notifications.info("You did not provide a valid image.");
        const imgPop = new ImagePopout(imageUrl);
        imgPop.render(true);
        imgPop.shareImage();
      }
    }
  },
  default: "go"
}).render(true);