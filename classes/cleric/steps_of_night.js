// STEPS OF NIGHT
// required modules: itemacro

const effect = actor.effects.find(effect => {
    return effect.getFlag("world", "steps-of-night");
});
if ( effect ) return effect.delete();
const use = await item.use();
if ( !use ) return;

return actor.createEmbeddedDocuments("ActiveEffect", [{
    label: "Steps of Night",
    changes: [{
        key: "system.attributes.movement.fly",
        mode: CONST.ACTIVE_EFFECT_MODES.UPGRADE,
        value: 60
    }],
    duration: { seconds: 60 },
    icon: item.img,
    "flags.world.steps-of-night": true
}]);
