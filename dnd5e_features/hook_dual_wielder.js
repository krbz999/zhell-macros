/*
  Completely pointless world script for Dual-Wielder feature.
  Adds a special trait that must be toggled on for the actor.
  When an actor updates an item, we check if they have
  exactly 2 weapons equippe, and they are both light weapons.
*/

Hooks.once("ready", () => {
  CONFIG.DND5E.characterFlags.dualWielder = {
    name: "Dual-Wielder",
    hint: "When you are wielding a light weapon in each hand, you gain a +1 bonus to your armor class.",
    section: "Feats",
    type: Boolean
  }
});

const update_feature = async (...args) => {
  // the args are different for the two hooks but we only need the first and last.
  const item = args[0];
  const userId = args[args.length - 1];
  
  // only do this for one user; the one doing the update.
  if(game.user.id !== userId) return;
  
  // must be an owned item.
  const actor = item.actor;
  if(!actor) return;
  
  // actor must have "Dual-Wielder" special trait.
  const dualWielder = !!actor.getFlag("dnd5e", "dualWielder");
  if(!dualWielder) return;
  
  // you must have exactly two weapons equipped, and they must both be light.
  const equippedWeapons = actor.itemTypes.weapon.filter(weapon => !!getProperty(weapon, "data.data.equipped"));
  const equippedLightWeapons = equippedWeapons.filter(weapon => !!getProperty(weapon, "data.data.properties.lgt"));
  const validArsenal = equippedWeapons.length === 2 && equippedLightWeapons.length === 2;
  
  // get current dualWielder effect.
  const effect = actor.effects.find(i => !!i.getFlag("world", "dual-wielder"));
  
  // if not exactly 2 light weapons equipped, delete the effect if it exists.
  if(!validArsenal){
    if(!effect) return;
    else return effect?.delete();
  }
  
  // if exactly 2 light weapons equipped, create the effect if it does not exist.
  if(!!effect) return;
  return actor.createEmbeddedDocuments("ActiveEffect", [{
    icon: "icons/skills/melee/weapons-crossed-swords-white-blue.webp",
    label: "Dual-Wielder",
    origin: actor.uuid,
    changes: [{
      key: "data.attributes.ac.bonus",
      mode: CONST.ACTIVE_EFFECT_MODES.ADD,
      value: "+1"
    }],
    "flags.world.dual-wielder": true
  }]);
};

Hooks.on("updateItem", await update_feature);
Hooks.on("deleteItem", await update_feature);
