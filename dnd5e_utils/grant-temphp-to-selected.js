/**
 * Click to set temporary hit points of selected tokens.
 * Shift-click to remove all temporary hit points of selected tokens.
 */

const actors = Array.from(canvas.tokens.controlled.reduce((acc, token) => {
  if (token.actor) acc.add(token.actor);
  return acc;
}, new Set()));

if (event.shiftKey) {
  for (const actor of actors) await actor.update({"system.atributes.hp.temp": null});
  return;
}

const value = await foundry.applications.api.DialogV2.prompt({
  window: {title: "Add Temp HP"},
  position: {width: 400},
  content: "<input type='number' name='temphp' min=1 step=1 value='5' autofocus>",
  rejectClose: false,
  ok: {
    label: "Apply",
    callback: (event, button) => button.form.elements.temphp.valueAsNumber,
  },
});
if (value) for (const actor of actors) await actor.applyTempHP(value);
