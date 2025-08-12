// CURRENT COMBATANT
// minimizes all actor sheets on your screen,
// maximizes or opens the sheet of the current combatant
// and selects and pans over to their token.


for (const w of Object.values(ui.windows).concat([...foundry.applications.instances.values()].filter(app => app.hasFrame))) {
  if (w.document?.documentName === "Actor") w.minimize();
}

const current = game.combat.combatant.token;
const sheet = current.actor.sheet;

if (sheet.rendered) sheet.maximize();
else sheet.render(true);

current.object.control();
canvas.animatePan({x: current.x, y: current.y, duration: 1000});
