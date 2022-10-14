// COMBATANT NAME TOGGLE
// If the combatant and its token's names match, prompts you to rename the combatant.
// else returns the combatant's name to match the token.
// Uses the token you hover over (in the combat tracker).

const combatant = canvas.tokens.hover?.combatant;
if (!combatant) {
  ui.notifications.warn("You ain't hoverin' above nuthin'.");
  return;
}

const grantAlias = combatant.name === combatant.token.name;
if (grantAlias) {
  return Dialog.prompt({
    title: "Hide Name",
    content: `<input type='text' placeholder='New name for ${combatant.name}...' autofocus>`,
    rejectClose: false,
    callback: async (html) => {
      const name = html[0].querySelector("input").value;
      if (!name) {
        ui.notifications.warn("No name put in.");
        return;
      }
      return combatant.update({name});
    }
  });
} else await combatant.update({name: combatant.token.name});
