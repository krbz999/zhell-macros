/**
 * Use a weapon and roll attack, then optionally use Divine Smite. The damage of
 * the spell will be configured depending on the activity but not rolled, instead
 * it will be added on top of the weapon's damage roll.
 * This macro assumes the use of the Divine Smite spell from the 24 PHB but is
 * likely to work with similar setups.
 */

const weapon = actor.items.get("<id of the weapon>");
const smite = actor.items.get("<id of divine smite spell>");

/* ------------------------------------------------------- */

const weaponUse = await weapon.use({legacy: false});
if (!weaponUse) return;
const smiteUse = await smite.use({legacy: false, subsequentActions: false});
if (!smiteUse) return;
const {scaling, activity: {id: activityId}} = smiteUse.message.flags.dnd5e;
const config = smite.clone({"flags.dnd5e.scaling": scaling}, {keepId: true}).system.activities.get(activityId).getDamageConfig();
return weapon.system.activities.get(weaponUse.message.flags.dnd5e.activity.id).rollDamage({rolls: config.rolls});
