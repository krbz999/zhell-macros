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
  const checked = !!character && selectedPlayerIds.includes(character.id) && "checked";
  
  return acc + `
    <input type="checkbox" id="${id}" value="${name}" ${checked}>
    <label for="${id}">${name}</label>`;
}, `<form><div class="form-group"><div class="form-fields">`) + `</div></div></form>`;

new Dialog({
  title: "Whisper",
  content: `
    <p>Whisper to:</p>${options} <hr>
    <label for="message">Message:</label>
    <textarea id="message" name="message" rows="4" cols="50"></textarea>
    <hr>`,
  buttons: {go: {
    icon: `<i class="fas fa-check"></i>`,
    label: "Whisper",
    callback: async (html) => {
      const whisperIds = new Set();
      for(let {id} of users){
        if(html[0].querySelector(`input[id=${id}]`).checked){
          whisperIds.add(id);
        }
      }
      const content = html[0].querySelector("textarea[id=message]").value;
      if(!whisperIds.size) return;
      const whisper = Array.from(whisperIds);
      await ChatMessage.create({content, whisper});
    }
  }}
}).render(true);
