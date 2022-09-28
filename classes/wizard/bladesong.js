/* Bladesong
- click while no effect active: +INT to AC, +10 to MOV, ADV on ACR, +INT to concentration saves.
- click while effect active: remove effect
- if wizard 14 or higher: +INT to mwak damage.
*/

// required modules: itemacro
// added benefit with concentrationnotifier and convenientDescription.

const effect = actor.effects.find(e => e.getFlag("world", "bladesong") === actor.id);
if ( effect ) return effect.delete();

const {
  abilities: { int: { mod } },
  classes: { wizard: { levels } }
} = actor.getRollData();
const {ADD} = CONST.ACTIVE_EFFECT_MODES;
const changes = [
  { key: "system.attributes.ac.bonus", mode: ADD, value: mod },
  { key: "system.attributes.movement.walk", mode: ADD, value: 10 },
  { key: "flags.dnd5e.concentrationBonus", mode: ADD, value: `+${mod}` }
];
if ( levels >= 14 ) changes.push({ key: "system.bonuses.mwak.damage", mode: ADD, value: `+${mod}` });

const use = await item.use();
if ( !use ) return;
await actor.createEmbeddedDocuments("ActiveEffect", [{
  changes,
  icon: item.img,
  label: item.name,
  duration: { seconds: 60 },
  "flags.world.bladesong": actor.id,
  "flags.visual-active-effects.data": `
    You have +${mod} to AC,
    +10ft movement speed,
    advantage on Acrobatics,
    ${levels >= 14 ? "+" + mod + " to melee weapon damage," : ""}
    and +${mod} to saving throws for concentration.`,
}]);
