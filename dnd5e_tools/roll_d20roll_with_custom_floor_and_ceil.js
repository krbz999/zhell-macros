// set the minimum and maximum of the d20 die, and set the skill to roll.
// the floor and ceil will be ignored if they have values out of range.

const floor = 6;
const ceil = 20;
const skill = "ins";


// ---------- //
const msg = await token.actor.rollSkill(skill, {chatMessage: false, event});
const useFloor = 20 >= floor && floor > 1;
const useCeil = 20 > ceil && ceil > 0;
if(useFloor) msg.dice[0].modifiers.push(`min${floor}`);
if(useCeil) msg.dice[0].modifiers.push(`max${ceil}`);
msg._formula = msg._formula.replace("d20", "d20" + (useFloor ? `min${floor}` : "") + (useCeil > 0 ? `max${ceil}` : ""))
for(let d20 of msg.dice[0].results){
	if(useFloor && d20.result < floor){
		d20.rerolled = true;
		d20.count = floor;
	}
	if(useCeil && d20.result > ceil){
		d20.rerolled = true;
		d20.count = ceil;
	}
}
msg._total = (await new Roll(msg.result).evaluate({async: true})).total;

await msg.toMessage({speaker: ChatMessage.getSpeaker({
	actor: token.actor,
	token: token.document
})});
