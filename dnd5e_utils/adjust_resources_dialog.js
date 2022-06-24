// dialog to adjust resources.


const actor = token?.actor ?? game.user.character;
if(!actor) return ui.notifications.warn("You need an actor.");

const resources = duplicate(actor.data.data.resources);
const content = `
	<form>
		<div class="form-group">
			<label for="first">${resources.primary.label}</label>
			<div class="form-fields">
				<input type="number" id="firstvalue" value="${resources.primary.value}"></input>
				<span class="sep"> / </span>
				<input type="number" id="firstmax" value="${resources.primary.max}"></input>
			</div>
		</div>
		<div class="form-group">
			<label for="second">${resources.secondary.label}</label>
			<div class="form-fields">
				<input type="number" id="secondvalue" value="${resources.secondary.value}"></input>
				<span class="sep"> / </span>
				<input type="number" id="secondmax" value="${resources.secondary.max}"></input>
			</div>
		</div>
		<div class="form-group">
			<label for="third">${resources.tertiary.label}</label>
			<div class="form-fields">
				<input type="number" id="thirdvalue" value="${resources.tertiary.value}"></input>
				<span class="sep"> / </span>
				<input type="number" id="thirdmax" value="${resources.tertiary.max}"></input>
			</div>
		</div>
	</form>
	<hr>`;
new Dialog({
	title: "Adjust Resources",
	content,
	buttons: {go: {
		icon: `<i class="fas fa-check"></i>`,
		label: "All Good",
		callback: async (html) => {
			resources.primary.value = Number(html[0].querySelector("input[id=firstvalue]").value);
			resources.primary.max = Number(html[0].querySelector("input[id=firstmax]").value);
			resources.secondary.value = Number(html[0].querySelector("input[id=secondvalue]").value);
			resources.secondary.max = Number(html[0].querySelector("input[id=secondmax]").value);
			resources.tertiary.value = Number(html[0].querySelector("input[id=thirdvalue]").value);
			resources.tertiary.max = Number(html[0].querySelector("input[id=thirdmax]").value);
			await actor.update({"data.resources": resources});
		}
	}},
	default: "go"
}).render(true);