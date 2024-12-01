/**
 * Completely pointless world script for Dual-Wielder feature. Adds a
 * special trait that must be toggled on for the actor. When an actor
 * updates an item, we check if they have exactly 2 weapons equipped.
 */

Hooks.once("init", function() {
  CONFIG.DND5E.characterFlags.dualWielder = {
    name: "Dual-Wielder",
    hint: "When you are wielding a weapon in each hand, you gain a +1 bonus to your armor class.",
    section: "DND5E.Feats",
    type: Boolean
  }
});

async function apply(item, userId) {
  // Only do this for one user; the one doing the update.
  if (game.user.id !== userId) return;

  // Must be an owned item and owner must have 'Dual-Wielder' special trait.
  const dualWielder = item.actor?.flags.dnd5e?.dualWielder;
  if (!dualWielder) return;

  // Get equipped weapons and Dual Wielder effect.
  const equipped = item.actor.itemTypes.weapon.filter(weapon => weapon.system.equipped);
  const effect = item.actor.effects.find(e => e.flags.world?.dualWielder);

  // If not exactly two weapons equipped, delete the effect if it exists.
  if (equipped.length !== 2) {
    effect?.delete();
  }

  // If effect already active, do nothing.
  else if (effect) {
    return;
  }

  // If exactly two weapons equipped, create the effect.
  else {
    return ActiveEffect.implementation.create({
      name: "Dual-Wielder",
      img: "icons/skills/melee/weapons-crossed-swords-white-blue.webp",
      origin: item.actor.uuid,
      changes: [{
        key: "system.attributes.ac.bonus",
        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
        value: "1"
      }],
      flags: {world: {dualWielder: true}}
    }, {parent: item.actor});
  }
}

Hooks.on("updateItem", (item, update, options, userId) => apply(item, userId));
Hooks.on("deleteItem", (item, options, userId) => apply(item, userId));
