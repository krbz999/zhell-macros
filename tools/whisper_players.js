// Provides a dialog to whisper specific players. If you have tokens selected, it will automatically default to try and whisper those players.

// get every user id that is not you.
const users = game.users.filter(u => u.id !== game.user.id);

// get every assigned character.
const characterIds = users.map(u => u.character?.id).filter(i => !!i);

// get every assigned character you have selected.
const selectedPlayerIds = canvas.tokens.controlled.map(i => i.actor.id).filter(i => characterIds.includes(i));

// Build checkbox list for all active players
const options = users.reduce((acc, {id, name, character}) => {
  // should be checked by default.
  const checked = (!!character && selectedPlayerIds.includes(character.id)) ? "selected" : "";

  return acc + `<span class="whisper-dialog-player-name ${checked}" id="${id}">${name}</span>`;
}, `<form><div class="form-fields">`) + `</div></form>`;


const style = `
<style>

.form-fields {
  display: grid;
  grid-template-columns: auto auto auto auto;
}

.whisper-dialog-player-name.selected {
  background: green;
}

.whisper-dialog-player-name {
  padding: 1px 4px;
  border: 1px solid var(--color-border-dark-tertiary);
  border-radius: 2px;
  white-space: nowrap;
  word-break: break-all;
}

</style>`;

new Dialog({
  title: "Whisper",
  content: style + `
    <p>Whisper to:</p>${options} <hr>
    <label for="message">Message:</label>
    <textarea style="resize: none;" id="message" name="message" rows="6" cols="50"></textarea>
    <hr>`,
  buttons: {
    go: {
      icon: `<i class="fa-solid fa-check"></i>`,
      label: "Whisper",
      callback: async (html) => {
        const whisperIds = new Set();
        for (let {id} of users) {
          if (!!html[0].querySelector(`span[id="${id}"].selected`)) {
            whisperIds.add(id);
          }
        }
        const content = html[0].querySelector("textarea[id=message]").value;
        if (!whisperIds.size) return;
        const whisper = Array.from(whisperIds);
        await ChatMessage.create({content, whisper});
      }
    }
  },
  render: (html) => {
    html.css("height", "auto");
    for (let playerName of html[0].querySelectorAll(".whisper-dialog-player-name")) {
      playerName.addEventListener("click", () => {
        playerName.classList.toggle("selected");
      });
    }
  }
}).render(true);
