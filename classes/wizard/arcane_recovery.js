// Arcane Recovery
// required modules: itemacro
/*
	You have learned to regain some of your magical energy by studying your spellbook.
	Once per day when you finish a short rest, you can choose expended spell slots to recover.
	The spell slots can have a combined level that is equal to or less than half your wizard level (rounded up),
	and none of the slots can be 6th level or higher.
*/

// get spell object and wizard levels.
const {spells, classes: {wizard: {levels}}} = duplicate(actor.getRollData());

// attained spell levels, then mapping to value and max.
const level_maps = Array.fromRange(6).filter(i => spells[`spell${i+1}`].max > 0).map(i => spells[`spell${i+1}`]);

// bail out if there are no missing valid spell slots.
if(level_maps.filter(({value, max}) => value !== max).length < 1) return ui.notifications.warn("You are not missing any valid spell slots.");

const roll = await item.roll();
if(!roll) return;

const maxVal = Math.ceil(levels/2);
let spent = 0;

let content = `<p name="header">Recovering spell slots: <strong>${spent}</strong> / ${maxVal}.</p> <hr> <form>`;
for(let i = 0; i < level_maps.length; i++){
	content += `
		<div class="form-group">
			<label style="text-align:center"><strong>${nth(i+1)}-level</strong></label>
			<div class="form-fields">`;
	for(let j = 0; j < level_maps[i].max; j++) content += `
		<input
			type="checkbox"
			value="${i+1}"
			name="level${i+1}"
			${j < level_maps[i].value ? 'checked disabled' : ''}
		></input>`;
	content += `</div></div>`;
}
content += `</form> <hr>`;



const dialog = new Dialog({
	title: "Arcane Recovery",
	content,
	buttons: {
		go: {
			icon: `<i class="fas fa-check"></i>`,
			label: "Recover",
			callback: async (html) => {
				if(spent > maxVal || spent < 1){
					ui.notifications.warn("Invalid number of slots to recover.");
					dialog.render(true);
				} else {
					for(let i = 0; i < 9; i++) spells[`spell${i+1}`].value = html[0].querySelectorAll(`input[name=level${i+1}]:checked`).length;
					await actor.update({"data.spells": spells});
					return ui.notifications.info("Spell slots recovered!");
				}
			}
		}
	},
	render: (html) => {
		html[0].querySelectorAll("input[type=checkbox]").forEach(input => {
			input.addEventListener("change", function(){
				spent = Array.fromRange(9).reduce((acc, i) => acc += Number(html[0].querySelectorAll(`input[name=level${i+1}]:checked:not(:disabled)`).length * (i+1)), 0);
				html[0].querySelector("p[name=header]").innerHTML = `Recovering spell slots: <strong>${spent}</strong> / ${maxVal}.`;
			});
		});
	},
	default: "go"
}).render(true);

function nth(n){return n + (["st","nd","rd"][((n+90)%100-10)%10-1]||"th")}