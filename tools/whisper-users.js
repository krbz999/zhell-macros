/**
 * Send a message to specific users. The selection will be initially determined
 * by which tokens are selected.
 */

const {HTMLField, SetField, StringField} = foundry.data.fields;
const usersField = new SetField(new StringField({
  choices: game.users.reduce((acc, user) => {
    if (user !== game.user) acc[user.id] = user.name;
    return acc;
  }, {}),
}), {}).toFormGroup({
  label: "Users",
  hint: "Select the users that should receive the message.",
  classes: ["stacked"]
}, {
  name: "users",
  type: "checkboxes",
  value: game.users.filter(user => {
    if (!user.character) return false;
    if (user === game.user) return false;
    return canvas.tokens.controlled.some(token => token.actor === user.character);
  }).map(user => user.id)
}).outerHTML;
const textField = new HTMLField().toFormGroup({
  label: "Message",
}, {
  name: "message",
  compact: true,
  height: 300,
}).outerHTML;

const config = await foundry.applications.api.DialogV2.prompt({
  content: `<fieldset>${usersField}${textField}</fieldset>`,
  modal: true,
  rejectClose: false,
  position: {width: 550, height: "auto"},
  window: {title: "Whisper Users", icon: "fa-solid fa-comments"},
  ok: {callback: (event, button) => new FormDataExtended(button.form).object},
});
if (!config || !config.message) return;

ChatMessage.implementation.create({whisper: config.users, content: config.message});
