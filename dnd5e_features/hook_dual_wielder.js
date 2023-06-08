/**
 * Completely pointless world script for Dual-Wielder feature. Adds a
 * special trait that must be toggled on for the actor. When an actor
 * updates an item, we check if they have exactly 2 weapons equipped.
 */

Hooks.once("ready", () => {
  CONFIG.DND5E.characterFlags.dualWielder = {
    name: "Dual-Wielder",
    hint: "When you are wielding a weapon in each hand, you gain a +1 bonus to your armor class.",
    section: "Feats",
    type: Boolean
  }
});

const update_feature = async (item, ...rest) => {
  // Only do this for one user; the one doing the update.
  if (game.user.id !== rest.at(-1)) return;

  // Must be an owned item and owner must have 'Dual-Wielder' special trait.
  const dualWielder = item.actor?.getFlag("dnd5e", "dualWielder");
  if (!dualWielder) return;

  // Get equipped weapons and Dual Wielder effect.
  const equipped = item.actor.itemTypes.weapon.filter(weapon => weapon.system.equipped);
  const effect = item.actor.effects.find(e => e.getFlag("world", "dual-wielder"));

  // If not exactly two weapons equipped, delete the effect if it exists.
  if (equipped.length !== 2) return effect?.delete();

  // If effect already active, do nothing.
  if (effect) return;

  // If exactly two weapons equipped, create the effect.
  return item.actor.createEmbeddedDocuments("ActiveEffect", [{
    icon: "icons/skills/melee/weapons-crossed-swords-white-blue.webp",
    label: "Dual-Wielder",
    origin: item.actor.uuid,
    changes: [{
      key: "system.attributes.ac.bonus",
      mode: CONST.ACTIVE_EFFECT_MODES.ADD,
      value: "+1"
    }],
    "flags.world.dual-wielder": true
  }]);
}

Hooks.on("updateItem", update_feature);
Hooks.on("deleteItem", update_feature);
