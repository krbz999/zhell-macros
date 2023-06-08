// Grant currency to all selected tokens, with appended notes.
// unknown system.

const tokens = canvas.tokens.controlled.reduce((acc, token) => {
  if (!token.actor) return acc;
  return acc + `
  <div class="form-group">
    <label>${token.actor.name}</label>
    <div class="form-fields">
      <input type="checkbox" name="tokenId" value="${token.id}" checked>
    </div>
  </div>`;
}, "");

return Dialog.prompt({
  title: "Cyberpunk Currency Thing",
  rejectClose: false,
  content: `
  <form>
    ${tokens}
    <div class="form-group">
      <label>Reason:</label>
      <div class="form-fields">
        <input name="reason" type="text">
      </div>
    </div>
    <div class="form-group">
      <label>Amount:</label>
      <div class="form-fields">
        <input name="amount" type="number" data-dtype="Number">
      </div>
    </div>
  </form>`,
  callback: callback,
  label: "Apply"
});

async function callback(html) {
  const data = new FormDataExtended(html[0].querySelector("form")).object;
  console.log(data);
  if (!data.reason || !data.amount) return ui.notifications.warn("One or both fields were not filled.");
  for (const id of data.tokenId) {
    if (!id) continue; // if unchecked.
    const token = canvas.scene.tokens.get(id);
    const wealth = foundry.utils.deepClone(token.actor.system.wealth);
    wealth.value += data.amount;
    const transaction = `${data.amount < 0 ? "Decreased" : "Increased"} by ${data.amount} to ${wealth.value}`;
    wealth.transactions.push([transaction, data.reason]);
    await token.actor.update({"system.wealth": wealth});
  }
}
