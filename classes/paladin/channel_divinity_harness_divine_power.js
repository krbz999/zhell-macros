/* Harness Divine Power
 * Regain one expended spell slot, the level of which can
 * be no higher than half your proficiency bonus (rounded up).
 * Required modules: itemacro.
 */

const rollData = foundry.utils.duplicate(actor.getRollData());
const {spells, attributes: {prof}} = rollData;
const maxLevel = Math.ceil(prof/2);
const validLevels = [];
for(let i = 1; i <= maxLevel; i++){
	const key = `spell${i}`;
	if(spells[key].value < spells[key].max && spells[key].max > 0){
		validLevels.push(key);
	}
}
const {level: pl, max: pm, value: pv} = spells["pact"];
if(pm > 0 && pl <= maxLevel && pv < pm) validLevels.push("pact");

// bail out if you are not missing any spell slots or if the item has no remaining uses (limited uses and resources).
if(!validLevels.length) return ui.notifications.warn("You are not missing any valid spell slots.");
const {value: limUses} = item.data.data.uses;
if(!limUses) return ui.notifications.warn("You have no uses left of Harness Divine Power.");
const resourceItem = actor.items.get(item.data.data.consume.target);
const {value: conUses} = resourceItem.data.data.uses;
if(!conUses) return ui.notifications.warn("You have no uses of Channel Divinity left.");

// define dialog contents
const options = validLevels.reduce((acc, e) => {
	const {value, max} = spells[e];
	const label = e === "pact" ? "Pact Slots" : (nth(Number(e.at(-1))) + " Level");
	return acc + `<option value="${e}">${label} (${value} / ${max})</option>`;
}, ``);

new Dialog({
	title: "Harness Divine Power",
	content: `
	<p>Select a spell slot level.</p>
	<form>
		<div class="form-group">
			<label>Spell Slot:</label>
			<div class="form-fields">
				<select id="hdp-level">${options}</select>
			</div>
		</div>
	</form>`,
	buttons: {
		run: {
			icon: `<i class="fas fa-hand-sparkles"></i>`,
			label: "Recover",
			callback: async (html) => {
				const level = html[0].querySelector("#hdp-level").value;
				spells[level].value++;
				await actor.update({"data.spells": spells});
				await actor.updateEmbeddedDocuments("Item", [
					{_id: resourceItem.id, "data.uses.value": conUses - 1},
					{_id: item.id, "data.uses.value": limUses - 1}
				]);
				return ui.notifications.info("Recovered a spell slot!");
			}
		}
	}
}).render(true);

function nth(n){return n + (["st","nd","rd"][((n+90)%100-10)%10-1]||"th")}
