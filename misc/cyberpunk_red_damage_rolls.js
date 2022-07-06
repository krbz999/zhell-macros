// two dice roll macros for Cyberpunk RED.


/* Roll a d10 + a modifier. If you roll a 10,
   add another d10 on top. If you rolled a d10,
   subtract another d10 instead. */
new Dialog({
	title: "your title here",
	content: `
	<form> <div class="form-group">
		<label for="roll-modifier">Modifier</label>
		<div class="form-fields">
			<input id="roll-modifier" type="text"></input>
		</div>
	</div> </form>`,
	buttons: {go: {
		icon: `<i class="fas fa-check"></i>`,
		label: "Roll it.",
		callback: async (html) => {
			const modifier = html[0].querySelector("#roll-modifier").value;
			const roll = new Roll(`1d10xo + ${modifier}`);
			await roll.evaluate({async: true});
			if(roll.dice[0].results[0].result !== 1){
				return roll.toMessage({
					flavor: "your flavor text here",
					speaker: ChatMessage.getSpeaker()
				});
			}
			
			const roll2 = new Roll(`1d10xo + ${modifier} - 1d10`);
			await roll2.evaluate({async: true});
			roll2.dice[0].results[0] = roll.dice[0].results[0];
			roll2._total = eval(roll2.result);
			await roll2.toMessage({
				flavor: "your flavor here",
				speaker: ChatMessage.getSpeaker()
			});
		}
	}},
	default: "go",
	render: (html) => html[0].querySelector("#roll-modifier").focus()
}).render(true);


/* Roll a variable number of d6s. If more than one die, post them
   in chat, announcing a critical hit if at least two dice rolled
   a 6. If instead only one d6, either post it in chat if it did
   not roll a 6, else roll another d6, and if both are sixes,
   announce a critical hit, else just post the first die. */
new Dialog({
	title: "your title here",
	content: `
	<form> <div class="form-group">
		<label for="roll-modifier">Number of d6s</label>
		<div class="form-fields">
			<input id="roll-modifier" type="text"></input>
		</div>
	</div> </form>`,
	buttons: {go: {
		icon: `<i class="fas fa-check"></i>`,
		label: "Roll it.",
		callback: async (html) => {
			const modifier = Number(html[0].querySelector("#roll-modifier").value);
			const roll = await new Roll(`${modifier}d6`).evaluate({async: true});
			if(modifier === 1 && roll.total === 6){
				const roll2 = await new Roll("1d6").evaluate({async: true});
				if(roll2.total !== 6){
					roll2.dice[0].results[0].active = false;
					roll2.dice[0].results[0].discarded = true;
					roll.dice[0].results.push(roll2.dice[0].results[0]);
				}
				else{
					roll.dice[0].results.push(roll2.dice[0].results[0]);
					roll._total = 12;
				}
			}
			const sixes = roll.dice[0].results.filter(({result}) => result === 6).length;
			const flavor = sixes > 1 ? "Critical Hit!" : undefined;
			await roll.toMessage({flavor, speaker: ChatMessage.getSpeaker()});
		}
	}},
	default: "go",
	render: (html) => html[0].querySelector("#roll-modifier").focus()
}).render(true);
