// BLADESONG
// required modules: itemacro.
// added benefit with concentrationnotifier and visual-active-effects.

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
let mwakBonus = "";
if ( levels >= 14 ) {
  changes.push({ key: "system.bonuses.mwak.damage", mode: ADD, value: `+${mod}` });
  mwakBonus = ` you add +${mod} to melee weapon damage,`;
}

const use = await item.use();
if ( !use ) return;

return actor.createEmbeddedDocuments("ActiveEffect", [{
  changes,
  icon: item.img,
  label: item.name,
  duration: { seconds: 60 },
  "flags.world.bladesong": actor.id,
  "flags.visual-active-effects.data": {
    intro: "<p>You are under the effects of Bladesong.</p>",
    content: `<p>You have +${mod} to your AC, +10ft of movement speed, advantage on Acrobatics checks,${mwakBonus} and you have a +${mod} bonus to saving throws to maintain concentration.</p>`
  }
}]);
