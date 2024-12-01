// Goodberry + Disciple of Life.
// setup: place item macro in 'Goodberry' spell.
// required modules: itemacro.

// whether or not actor is also a Life Cleric.
const disciple = true;

// get spell level;
const use = await item.use();
if (!use) return;
const level = use.flags.dnd5e.use.spellLevel;
const bonus = disciple ? level + 2 : 0;
const name = disciple ? `Goodberry (${level.ordinalString()})` : "Goodberry";

// find existing goodberry
const existingItem = actor.itemTypes.consumable.find(i => i.name === name);
if (existingItem) {
  const quantity = existingItem.system.quantity + 10;
  return existingItem.update({"system.quantity": quantity});
}

// else create new goodberry stack
return actor.createEmbeddedDocuments("Item", [{
  name,
  type: "consumable",
  img: "icons/consumables/food/berries-ration-round-red.webp",
  system: {
    damage: {parts: [[`${1 + bonus}`, "healing"]]},
    quantity: 10,
    description: {
      value: `<p>You can use an action to eat a goodberry to restore ${1 + bonus} hit point(s).</p>`
    },
    rarity: "common",
    activation: {type: "action", cost: 1},
    uses: {value: 1, max: 1, per: "charges", autoDestroy: true},
    actionType: "heal",
    consumableType: "food"
  }
}]);
