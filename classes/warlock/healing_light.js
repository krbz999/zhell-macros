// Healing Light
// required modules: itemacro

const {value, max} = item.getChatData().uses;
const {mod} = actor.getRollData().abilities.cha; // maximum you can spend at once
const die = "d6"; // die size
const target = game.user.targets.first();

if(value < 1) return item.roll({configureDialog: false});

const options = Array.fromRange(Math.min(mod,value)).reduce((acc,e) => acc += `<option value="${e+1}">${e+1}${die}</option>`, ``);
const content = `
	<form>
		<div class="form-group">
			<label>Number of dice to spend (${value}/${max})</label>
			<div class="form-fields">
				<select id="spend">${options}</select>
			</div>
		</div>
	</form>
	<hr>`;

new Dialog({
	content,
	title: "Healing Light"
	buttons: {
		yes: {
			icon: `<i class="fas fa-check"></i>`,
			label: "Heal",
			callback: async (html) => {
				const targetAppend = target ? `on ${target.name}` : "";
				const spending = html[0].querySelector("select[id=spend]").value;
				await new Roll(`${spending}${die}`).toMessage({flavor: `${actor.name} uses ${item.name} ${targetAppend}`, speaker: ChatMessage.getSpeaker({actor})});
				await item.update({"data.uses.value": value - spending});
			}
		}
	},
	default: "yes"
}).render(true);
