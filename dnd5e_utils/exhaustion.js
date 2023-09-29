// Macro to create stacking exhaustion on selected tokens. It goes up to 10, overrides, exhaustion on the actor,
// and deduces the exhaustion value from spell dc, checks, saves, attacks.
// Shift-click to reduce the level on each token, click normally to increase. When an actor reaches 11 stacks, their
// exhaustion effect is removed, and their hp is updated to 0.

const diff = event.shiftKey ? -1 : 1;

function getData(number) {
  return {
    name: `Exhaustion (${number})`,
    icon: "your exhaustion icon here.webp",
    description: `
    <p><strong>-${number}</strong> subtracted from all D20 rolls (checks, attack rolls, saving throws) and spell save DC.</p>
    <p>Each level of Exhaustion adds another <strong>-1</strong>.
    A long rest removes one stack of exhaustion.
    Gaining another stack while already at -10 kills a creature.</p>`,
    statuses: ["exhaustion"],
    "flags.world.level": number,
    changes: [
      "spell.dc",
      "abilities.check",
      "abilities.save",
      "mwak.attack",
      "rwak.attack",
      "msak.attack",
      "rsak.attack"
    ].map(k => {
      return {key: `system.bonuses.${k}`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: "-@attributes.exhaustion"};
    }).concat([{key: "system.attributes.exhaustion", mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: number}])
  };
}

for (const {actor} of canvas.tokens.controlled) {
  if (!actor || (actor.type === "group") || (actor.type === "vehicle")) continue;
  const effect = actor.effects.find(e => e.statuses.has("exhaustion"));
  const level = effect?.flags.world?.level ?? 1;

  if (diff < 0) {
    if (!effect) continue;
    else if (level === 1) await effect.delete();
    else await effect.update(getData(level - 1));
  } else if (diff > 0) {
    if (!effect) await actor.createEmbeddedDocuments("ActiveEffect", [getData(1)]);
    else if (level === 10) await Promise.all([effect.delete(), actor.update({"system.attributes.hp.value": 0})]);
    else await effect.update(getData(level + 1));
  }
}
