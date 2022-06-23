// Magic Missile
// required modules: itemmacro

const roll = await item.roll();
if(!roll) return;

const content = roll.data.content;
const level = Number(content.charAt(content.indexOf("data-spell-level") + 18));

const dialog = new Dialog({
	title: "Direct your missiles",
	content: `<p>Write a comma-separated list of numbers adding up to ${level + 2} to roll the missile damage individually on each target.</p>
	<hr>
	<form>
		<div class="form-group">
			<label for="csv">CSV (${level + 2} missiles):</label>
			<div class="form-fields">
				<input type="text" id="csv" value="${level + 2}"></input>
			</div>
		</div>
	</form>
	<hr>`,
	buttons: {fire: {
		icon: `<i class='fas fa-check'></i>`,
		label: "Shoot!",
		callback: async (html) => {
			const csv = html[0].querySelector("input[id=csv]").value;
			const values = csv.split(",");
			
			// check if the sum is correct.
			const sum = values.reduce((acc, e) => acc += Number(e), 0);
			if(sum !== level + 2) return dialog.render();
			
			// create the rolls.
			for(let value of values){
				await new Roll(`${value}d4 + ${value}`).toMessage({
					flavor: "Magic Missile - Damage Roll (Force)",
					speaker: ChatMessage.getSpeaker({actor})
				});
			}
		}
	}},
	default: "fire"
});
dialog.render(true);
