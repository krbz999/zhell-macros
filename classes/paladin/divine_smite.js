// Divine Smite
// required modules: none.

const rollData = foundry.utils.duplicate(actor.getRollData());
const inputs = Object.entries(rollData.spells).filter(s => {
	return s[1].value > 0;
}).map(([key, {value, max}]) => {
	let crd = key === "pact" ? "Pact Slot" : nth(Number(key.at(-1)));
	return [key, crd, value, max];
});
if(inputs.length < 1) return ui.notifications.warn("You have no spell slots remaining.");

const options = inputs.reduce((acc, [key, crd, value, max]) => {
	return acc + `<option value="${key}">${crd} (${value}/${max})</option>`;
}, ``);
const content = `
<form>
	<div class="form-group">
		<label style="flex: 1;">Spell Slot:</label>
		<div class="form-fields">
			<select id="smite-slot">${options}</select>
			<input type="checkbox" id="extra-die"></input>
			<label for="extra-die">Extra&nbsp;die</label>
		</div>
	</div>
</form>`;

new Dialog({
	title: "Divine Smite",
	content,
	buttons: {
		smite: {
			icon: `<i class="fas fa-gavel"></i>`,
			label: "Smite!",
			callback: async (html) => await rollDamage(html)
		}
	}
}).render(true);

function nth(n){return n + (["st","nd","rd"][((n+90)%100-10)%10-1]||"th")}

async function rollDamage(html){
	const slot = html[0].querySelector("#smite-slot").value;
	const extra = html[0].querySelector("#extra-die").checked;
	const level = slot === "pact" ? rollData.spells["pact"].level : Number(slot.at(-1));
	const dice = Math.min(5, 1 + level) + (extra ? 1 : 0);
	const formula = `${dice}d8`;
	const flavor = "Divine Smite (Radiant)";
	const speaker = ChatMessage.getSpeaker({actor});
	const damageRoll = new CONFIG.Dice.DamageRoll(formula, rollData, {flavor});
	const configure = await damageRoll.configureDialog({title: "Divine Smite"});
	if(!configure) return;
	await damageRoll.toMessage({speaker});
	const value = rollData.spells[slot].value - 1;
	return actor.update({[`data.spells.${slot}.value`]: value});
}
