/*
  Completely pointless world script for Dual-Wielder feature.
  Adds a special trait that must be toggled on for the actor.
  When an actor updates an item, we check if they have
  exactly 2 weapons equippe, and they are both light weapons.
*/

Hooks.once("ready", () => {
  CONFIG.DND5E.characterFlags.dualWielder = {
    name: "Dual-Wielder",
    hint: "When you are wielding a weapon in each hand, you gain a +1 bonus to your armor class.",
    section: "Feats",
    type: Boolean
  }
});

const update_feature = async (...args) => {
  // the args are different for the two hooks but we only need the first and last.
  const item = args[0];
  const userId = args[args.length - 1];
  
  // only do this for one user; the one doing the update.
  if (game.user.id !== userId) return;
  
  // must be an owned item.
  const actor = item.actor;
  if (!actor) return;
  
  // actor must have "Dual-Wielder" special trait.
  const dualWielder = actor.getFlag("dnd5e", "dualWielder");
  if (!dualWielder) return;
  
  // you must have exactly two weapons equipped.
  const validArsenal = actor.itemTypes.weapon.filter(weapon => {
    return foundry.utils.getProperty(weapon, "system.equipped");
  }).length === 2;
  
  // get current dualWielder effect.
  const effect = actor.effects.find(e => {
    return e.getFlag("world", "dual-wielder");
  });
  
  // if not exactly two weapons equipped, delete the effect.
  if (!validArsenal) return effect?.delete();
  
  // if already having the effect, do nothing.
  if (effect) return;
  
  // if exactly two weapons equipped, create the effect.
  return actor.createEmbeddedDocuments("ActiveEffect", [{
    icon: "icons/skills/melee/weapons-crossed-swords-white-blue.webp",
    label: "Dual-Wielder",
    origin: actor.uuid,
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
