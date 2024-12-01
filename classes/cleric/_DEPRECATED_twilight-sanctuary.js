// TWILIGHT SANCTUARY
// required modules: itemacro, sequencer, jb2a-patreon, warpgate

// CONSTS
const file = "jb2a.markers.circle_of_stars.orangepurple";
const error = "Please target a token.";
const target = game.user.targets.first();

// find Sequencer effect
const [effect] = Sequencer.EffectManager.getEffects({name: item.name});

if (!effect) {
  const use = await item.use();
  if (!use) return;
  return new Sequence()
    .effect()
    .attachTo(token)
    .persist()
    .name(item.name)
    .file(file)
    .size(canvas.grid.size * 8)
    .scaleIn(0, 800, {ease: "easeOutCubic"})
    .rotateIn(180, 1200, {ease: "easeOutCubic"})
    .scaleOut(0, 500, {ease: "easeOutCubic"})
    .fadeOut(500, {ease: "easeOutCubic"})
    .play();
}

new Dialog({
  title: item.name,
  buttons: {
    hp: {
      icon: "<i class='fa-solid fa-heart'></i>",
      label: "Grant temp HP",
      callback: async () => {
        if (!target) return ui.notifications.error(error);
        const roll = new Roll("1d6 + @classes.cleric.levels", actor.getRollData());
        const {total} = await roll.evaluate({async: true});
        await roll.toMessage({speaker, flavor: item.name});
        const temp = target.actor.system.attributes.hp.temp ?? 0;
        const updates = {actor: {"system.attributes.hp.temp": total}};
        const config = {permanent: true, name: item.name, description: `You are being granted ${total} temporary hit points.`};
        if (total > temp) return warpgate.mutate(target.document, updates, {}, config);
      }
    },
    effect: {
      icon: "<i class='fa-solid fa-check'></i>",
      label: "End an effect",
      callback: async () => {
        if (!target) return ui.notifications.error(error);
        return ChatMessage.create({speaker, content: `${actor.name} ends the charmed or frightened condition on ${target.name}.`});
      }
    },
    end: {
      icon: "<i class='fa-solid fa-times'></i>",
      label: "End Sanctuary",
      callback: async () => {
        return Sequencer.EffectManager.endEffects({name: item.name});
      }
    }
  }
}).render(true);
