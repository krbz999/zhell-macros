/*
  Takes all selected tokens, pops a dialog, pick save type, input damage and DC, hold a modifier key if you want to (shift, alt, ctrl),
  and each selected NON-PLAYER-OWNED token will roll a save and apply full damage if they fail, or half if they succeed.
  (toggle for no damage on success too)
  (Does not take damage resistances into account) 
*/

const tokens = canvas.tokens.controlled.filter(i => !i.actor.hasPlayerOwner);
if(tokens.length < 1) return ui.notifications.warn("No valid tokens.");
const names = tokens.map(i => i.name).join(", ");
const options = Object.entries(CONFIG.DND5E.abilities).reduce((acc, [a,b]) => acc += `<option value="${a}">${b}</option>`, ``);
const content = `
  <p>Roll saves and apply damage to: ${names}.</p>
  <hr>
  <form>
    <div class="form-group">
      <label for="type">Saving Throw</label>
      <div class="form-fields">
        <select id="type">${options}</select>
      </div>
    </div>
    <div class="form-group">
      <label for="dc">Difficulty</label>
      <div class="form-fields">
        <input id="dc" type="number" min="1" step="1.0"></input>
      </div>
    </div>
    <div class="form-group">
      <label for="dmg">Damage</label>
      <div class="form-fields">
        <input id="dmg" type="number"></input>
        <input id="no" type="checkbox"></input>
        <label for="no">No&nbsp;damage&nbsp;on&nbsp;success?</label>
      </div>
    </div>
  </form>`;

new Dialog({
  title: "Request Saving Throw",
  content,
  buttons: {
    yes: {
      icon: "<i class='fas fa-check'></i>",
      label: "Save!",
      callback: async (html) => {
        const ev = event;
        const type = html[0].querySelector("#type").value;
        const dc = Number(html[0].querySelector("#dc").value);
        const dmg = Number(html[0].querySelector("#dmg").value);
        const no = html[0].querySelector("#no").checked;
        if(!dc) return ui.notifications.warn("Invalid DC.");
        if(dmg < 1) return ui.notifications.warn("Invalid damage.");
        for(let t of tokens){
          let {total} = await t.actor.rollAbilitySave(type, {event: ev});
          if(total < dc) await t.actor.applyDamage(dmg);
          else if(no) continue;
          else await t.actor.applyDamage(Math.floor(dmg/2));
        }
      }
    }
  },
  default: "yes"
}).render(true);
