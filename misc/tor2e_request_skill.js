// tor2e request skill roll.
// required modules: requestor.


// fake actor to the rescue to get all the common skills. All hail Steve.
const skill_labels = Object.values(new Actor({name: "Steve", type: "character"}).data.data.commonSkills).map(({label}) => game.i18n.localize(label));

// construct dialog so the GM can pick which skills.
const choices = await new Promise(resolve => {
	const checkboxes = skill_labels.reduce((acc, e) => acc += `
		<div class="form-group">
			<label for="${e}">${e}</label>
			<div class="form-fields">
				<input type="checkbox" id="${e}" value="${e}"></input>
			</div>
		</div>`, ``);
	new Dialog({
		title: "Select skills available",
		content: `<form>${checkboxes}</form>`,
		buttons: {go: {
			icon: `<i class="fas fa-check"></i>`,
			label: "All Good",
			callback: (html) => {
				const boxes = html[0].querySelectorAll("input[type='checkbox']:checked");
				const ticked = [];
				for(let box of boxes) ticked.push(box.value);
				resolve(ticked);
			}
		}},
		default: "go",
		close: () => resolve([])
	}).render(true);
});
if(choices.length < 1) return;

// construct Requestor.
const buttonData = [];
for(let i = 0; i < choices.length; i++){
	buttonData.push({
		action: async () => {
			await game.tor2e.macro.utility.rollSkillMacro(args.skill, false, {actorId: game.user.character.id, event});
		},
		label: choices[i],
		skill: choices[i]
	});
}

await Requestor.request({
	buttonData,
	title: "Roll Skill",
	description: "Please roll one of these skills.",
	context: {popout: true, autoClose: true},
	img: "insert your image here"
});
