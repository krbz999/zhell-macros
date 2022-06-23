// RAINBOW RECURVE

/* Required modules:
 * concentrationnotifier
 * itemacro
 * mre-dnd5e
 */

// get whether we are concentrating on the spell.
const CN = ConcentrationNotifier;
const concentrating = !!CN.concentratingOn(actor, item);

// if not concentrating, cast the spell and choose arrow, otherwise just choose arrow.
if(!concentrating) await restoreArrows();
return chooseArrow();

// dialog to choose arrow.
async function chooseArrow(){
	const arrows = Object.entries(item.getFlag("world", "arrow-available"));
	const available = arrows.filter(([arrow, bool]) => bool);
	
	if(available.length < 1){
		const effect = CN.concentratingOn(actor, item);
		if(effect) return effect.delete();
	}
	
	const options = available.reduce((acc, [arrow, bool]) => acc += `
		<option value="${arrow}">${arrow.titleCase()}</option>`, ``);
	
	const choice = await new Promise(resolve => {
		new Dialog({
			title: "Rainbow Recurve",
			content: `
				<form>
					<div class="form-group">
						<label for="arrow">Select arrow:</label>
						<div class="form-fields">
							<select id="arrow">${options}</select>
						</div>
					</div>
				</form>`,
			buttons: {go: {
				icon: `<i class="fas fa-check"></i>`,
				label: "Shoot!",
				callback: (html) => {
					const arrow = html[0].querySelector("select[id=arrow]").value;
					resolve(arrow);
				}
			}},
			default: "go",
			close: () => resolve(false)
		}).render(true);
	});
	if(!choice) return;
	
	await shootArrow(choice);
}

// create item clone.
async function shootArrow(choice){
	const formulaSet = choice === "red" ? [1] : choice === "orange" ? [2] : choice === "yellow" ? [3] : choice === "green" ? [4] : choice === "blue" ? [5] : false;
	const additionalSave = choice === "indigo" ? "con" : choice === "violet" ? "wis" : false;
	
	const mreFlag = [{label: "Damage", formulaSet: [0]}];
	if(formulaSet) mreFlag.push({label: "On failed save", formulaSet});
	
	await item.setFlag("mre-dnd5e", "formulaGroups", mreFlag); 
	const displayCard = concentrating ? await item.displayCard({createMessage: false}) : await item.roll({createMessage: false});
	
	// add new saving throw button.
	if(additionalSave){
		const content = displayCard.content;
		const template = document.createElement("template");
		template.innerHTML = content;
		const html = template.content.firstChild;
		const regularSaveButton = html.querySelector("button[data-action=save]"); // to insert new button after.
		const {spelldc, spellcasting} = actor.data.data.attributes;
		
		let abilityS = additionalSave;
		let abilityL = CONFIG.DND5E.abilities[abilityS];
		const newSaveButton = document.createElement("button");
		newSaveButton.setAttribute("data-action", "save");
		newSaveButton.setAttribute("data-ability", abilityS);
		newSaveButton.innerHTML = `Saving Throw DC ${spelldc} ${abilityL}`;
		regularSaveButton.parentNode.insertBefore(newSaveButton, regularSaveButton.nextSibling);
		displayCard.content = html.outerHTML;
	}
	
	await ChatMessage.create(displayCard);
	await item.setFlag("world", `arrow-available.${choice}`, false);
}

// reset all arrows to be available.
async function restoreArrows(){
	await item.setFlag("world", "arrow-available", {
		red: true, // formula 1
		orange: true, // formula 2
		yellow: true, // formula 3
		green: true, // formula 4
		blue: true, // formula 5
		indigo: true, // no formula
		violet: true // no formula
	});
	await item.setFlag("mre-dnd5e", "formulaGroups", [{label: "Damage", formulaSet: [0]}]);
}