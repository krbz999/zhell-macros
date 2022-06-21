// Lay on Hands
// required modules: itemacro

const {value} = item.data.data.uses;
if(value < 1) return ui.notifications.warn(`${item.name} has no uses left.`);
const content = `
	<p>Lay on Hands has ${value} uses left.</p>
	<hr>
	<form>
		<div class="form-group">
			<label for="num">Hit points to restore:</label>
			<div class="form-fields">
				<input id="num" type="number" value="1"></input>
			</div>
		</div>
	</form>
	<hr>`;

const buttons = {
	heal: {
		label: "Heal!",
		callback: async (html) => {
			const number = Number(html[0].querySelector("input[id=num]").value);
			if(number < 1 || number > value) return ui.notifications.warn("Invalid number.");
			await new Roll(`${number}`).toMessage({
				speaker: ChatMessage.getSpeaker({actor}),
				flavor: item.name
			});
			await item.update({"data.uses.value": value - number});
		}
	}
}
if(value >= 5){
	buttons.cure = {
		label: "Cure!",
		callback: async (html) => {
			await ChatMessage.create({
				content: `${actor.name} cures a disease or poison.`,
				speaker: ChatMessage.getSpeaker({actor})
			});
			await item.update({"data.uses.value": value - 5});
		}
	}
}

new Dialog({title: "Lay on Hands", content, buttons, default: "heal"}).render(true);