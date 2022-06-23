// Goodberry + Disciple of Life.
// required modules: itemacro.

const disciple_of_life = true;


const item = actor.itemTypes.spell.find(i => i.name === "Goodberry");

// get spell level;
const roll = await item.roll();
if(!roll) return;
const content = roll.data.content;
const level = Number(content.charAt(content.indexOf("data-spell-level") + 18));
const bonus = disciple_of_life ? level + 2 : 0;

// find existing goodberry
const existingItem = actor.items.getName(`Goodberry (${nth(level)})`);
if(!!existingItem) await existingItem.update({"data.quantity": existingItem.data.data.quantity + 10});

// else create new goodberry stack
else await actor.createEmbeddedDocuments("Item", [{
	name: `Goodberry (${nth(level)})`,
	type: "consumable",
	img: "icons/consumables/food/berries-ration-round-red.webp",
	data: {
		damage: {parts: [[`${1 + bonus}`, "healing"]]},
		quantity: 10,
		description: {value: `<p>You can use an action to eat a goodberry to restore ${1 + bonus} hit point(s).</p>`},
		rarity: "common",
		activation: {type: "action", cost: 1},
		uses: {value: 1, max: 1, per: "charges", autoDestroy: true},
		actionType: "heal",
		consumableType: "food"
	}
}]);

/* helper function */
function nth(n){return n + (["st","nd","rd"][((n+90)%100-10)%10-1]||"th")}
