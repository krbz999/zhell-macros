/* 
  Applies a floor of 10 to Persuasion and Deception.
  Requires having a token selected, or having an assigned character.
*/
new Dialog({
  title: "Eloquence",
  content: `
    <form><div class="form-group">
      <label>Select Skill</label>
      <div class="form-fields">
        <select id="eloquence">
          <option value="per">Persuasion</option>
          <option value="dec">Deception</option>
        </select>
      </div>
    </div></form>`,
  buttons: {go: {
    icon: `<i class="fas fa-check"></i>`,
    label: "Roll",
    callback: async (html) => {
      const skill = html[0].querySelector("#eloquence").value;
      const actor = token?.actor ?? game.user.character;
      const roll = await actor.rollSkill(skill, {event, chatMessage: false});
	    return applyReliableDammit(actor, roll);
    }
  }},
  default: "go"
}).render(true);

async function applyReliableDammit(actor, message){
	const floor = 10;
	message.dice[0].modifiers.push(`min${floor}`);
	message._formula = message._formula.replace("d20", `d20min${floor}`);
	for(let d20 of message.dice[0].results){
		if(d20.result < floor){
			d20.rerolled = true;
			d20.count = floor;
		}
	}
	message._total = eval(message.result);
	const speaker = ChatMessage.getSpeaker({actor});
	return message.toMessage({speaker});
}
