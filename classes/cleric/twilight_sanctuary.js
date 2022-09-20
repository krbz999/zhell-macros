// TWILIGHT SANCTUARY
// required modules: itemacro, sequencer, jb2a-patreon, warpgate

// CONSTS
const name = "Twilight Sanctuary";
const file = "jb2a.markers.circle_of_stars.orangepurple";
const error = "Please target a token.";
const speaker = ChatMessage.getSpeaker({ actor, token });
const user = game.user.id;
const target = game.user.targets.first();

// find Sequencer effect
const effect = Sequencer.EffectManager.getEffects({ name })[0] ?? false;

if ( !effect ) {
    const size = 8;
    const use = await item.use();
    if ( !use ) return;
    
    const seq = new Sequence().effect()
        .attachTo(token)
        .persist()
        .name(name)
        .file(file)
        .size(canvas.grid.size * size)
        .scaleIn(0, 800, {ease: "easeOutCubic"})
        .rotateIn(180, 1200, {ease: "easeOutCubic"})
        .scaleOut(0, 500, {ease: "easeOutCubic"})
        .fadeOut(500, {ease: "easeOutCubic"});
    return seq.play();
}

new Dialog({
    title: name,
    buttons: {
        hp: {
            icon: "<i class='fas fa-heart'></i>",
            label: "Grant temp HP",
            callback: async () => {
                if ( !target ) {
                    ui.notifications.error(error);
                    return;
                }
                const data = actor.getRollData();
                const roll = new Roll("1d6 + @classes.cleric.levels", data);
                const { total } = await roll.evaluate({ async: true });
                await roll.toMessage({
                    user,
                    speaker,
                    flavor: "Twilight Sanctuary"
                });
                const { temp } = target.actor.system.attributes.hp ?? 0;
                const updates = {
                    actor: {
                        "system.attributes.hp.temp": total
                    }
                }
                const config = {
                    permanent: true,
                    name,
                    description: `You are being granted ${total} temporary hit points.`
                }
                if ( total > temp ) {
                    return warpgate.mutate(target.document, updates, {}, config);
                }
            }
        },
        effect: {
            icon: "<i class='fas fa-check'></i>",
            label: "End an effect",
            callback: async () => {
                if ( !target ) {
                    ui.notifications.error(error);
                    return;
                }
                return ChatMessage.create({
                    user,
                    speaker,
                    content: `${actor.name} ends the charmed or frightened condition on ${target.name}.`
                });
            }
        },
        end: {
            icon: "<i class='fas fa-times'></i>",
            label: "End Sanctuary",
            callback: async () => {
                return Sequencer.EffectManager.endEffects({ name });
            }
        }
    }
}).render(true);
