// Goodberry + Disciple of Life.
// required modules: itemacro.

// whether or not actor is also a Life Cleric.
const disciple = true;

const item = actor.itemTypes.spell.find(i => {
  return i.name === "Goodberry";
});

// get spell level;
const use = await item.use();
if (!use) return;
const DIV = document.createElement("DIV");
DIV.innerHTML = use.content;
const level = Number(DIV.firstChild.dataset.spellLevel);
const bonus = disciple ? level + 2 : 0;
const name = disciple ? `Goodberry (${nth(level)})` : "Goodberry";

// find existing goodberry
const existingItem = actor.itemTypes.consumable.find(i => {
  return i.name === name;
});
if (existingItem) {
  const quantity = existingItem.system.quantity + 10;
  return existingItem.update({ "system.quantity": quantity });
}

// else create new goodberry stack
return actor.createEmbeddedDocuments("Item", [{
  name,
  type: "consumable",
  img: "icons/consumables/food/berries-ration-round-red.webp",
  system: {
    damage: { parts: [[`${1 + bonus}`, "healing"]] },
    quantity: 10,
    description: {
      value: `<p>You can use an action to eat a goodberry to restore ${1 + bonus} hit point(s).</p>`
    },
    rarity: "common",
    activation: {
      type: "action", cost: 1
    },
    uses: {
      value: 1, max: 1, per: "charges", autoDestroy: true
    },
    actionType: "heal",
    consumableType: "food"
  }
}]);

/* helper function */
function nth(n){return n + (["st","nd","rd"][((n+90)%100-10)%10-1]||"th")}
