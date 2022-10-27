// CURRENT COMBATANT
// minimizes all actor sheets on your screen,
// maximizes or opens the sheet of the current combatant
// and selects and pans over to their token.

Object.values(ui.windows).filter(w => {
  return w.document?.documentName.includes("Actor");
}).forEach(w => w.minimize());

const current = game.combat.combatant.token;
const sheet = current.actor.sheet;

if (sheet.rendered) sheet.maximize();
else sheet.render(true);

current.object.control();
canvas.animatePan({ x: current.x, y: current.y, duration: 1000 });
