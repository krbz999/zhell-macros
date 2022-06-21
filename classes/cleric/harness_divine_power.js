/* Harness Divine Power
 * Regain one expended spell slot, the level of which can
 * be no higher than half your proficiency bonus (rounded up).
 * Requires Item Macro.
 */

const {prof} = actor.getRollData().attributes;
const spells = duplicate(actor.getRollData().spells);

// reached spell levels
const lvl = Array.fromRange(Math.ceil(prof/2)).map(i => i+1).filter(i => spells[`spell${i}`].max > 0);

// maps of values and max values
const val = lvl.map(i => spells[`spell${i}`].value);
const max = lvl.map(i => spells[`spell${i}`].max);

// bail out of you are not missing any spell slots
if(lvl.filter(i => spells[`spell${i}`].value !== spells[`spell${i}`].max).length < 1) return ui.notifications.error("You are not missing any valid spell slots.");

// expend use of feature
const roll = await item.roll();
if(!roll) return;

// helper variables for the dialog
const maxVal = 1;
let spent = 0;

// define dialog contents
let content = `<div name="header"><p>Recovering spell slots: <strong>${spent}</strong> / ${maxVal}.</p></div><table>`;
for(let i = 0; i < lvl.length; i++){
	content += `<tr><td style="text-align: center"><strong>${nth(i+1)}-level:</strong></td><td>`;
	for(let j = 0; j < max[i]; j++) content += `<input type="checkbox" value="${i+1}" name="level${lvl[i]}" ${j < val[i] ? 'checked disabled' : ''}/>`;
	content += `</td></tr>`;
}
content += `</table>`;

new Dialog({
	title: "Harness Divine Power",
	content,
	buttons: {
		ok: {
			icon: `<i class="fas fa-check"></i>`,
			label: "Recover",
			callback: async (html) => {
				if(spent > maxVal || spent === 0) return ui.notifications.error("Invalid number of slots to recover.");
				const obj = {};
				for(let i = 1; i <= 9; i++) obj[`data.spells.spell${i}.value`] = html[0].querySelectorAll(`input[name=level${i}]:checked`).length;
				await actor.update(obj);
				return ui.notifications.info("Spell slots recovered!");
			}
		}
	},
	render: (html) => {
		html[0].querySelectorAll("input[type=checkbox]").forEach(input => {
			input.addEventListener("change", function(){
				spent = lvl.reduce((acc, e) => acc += Number(html[0].querySelectorAll(`input[name=level${e}]:checked:not(:disabled)`).length), 0);
				html[0].querySelector("div[name=header]").innerHTML = `<p>Recovering spell slots: <strong>${spent}</strong> / ${maxVal}.</p>`;
			});
		});
	},
	default: "ok"
}).render(true);

function nth(n){return n + (["st","nd","rd"][((n+90)%100-10)%10-1]||"th")}
