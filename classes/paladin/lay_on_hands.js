// LAY ON HANDS
// required modules: itemacro

const { value } = item.system.uses;
if ( value < 1 ) {
    ui.notifications.warn(`${item.name} has no uses left.`);
    return;
}
const content = `
<p>Lay on Hands has ${value} uses left.</p>
<form>
    <div class="form-group">
        <label for="num">Hit points to restore:</label>
        <div class="form-fields">
            <input id="num" type="number" value="1"></input>
        </div>
    </div>
</form>`;

const buttons = {
    heal: {
        icon: "<i class='fa-solid fa-hand-holding-heart'></i>",
        label: "Heal!",
        callback: async (html) => {
            const number = Number(html[0].querySelector("#num").value);
            if ( number < 1 || number > value ) {
                ui.notifications.warn("Invalid number.");
                return;
            }
            await new Roll(`${number}`).toMessage({
                speaker: ChatMessage.getSpeaker({ actor }),
                flavor: item.name
            });
            return item.update({ "system.uses.value": value - number });
        }
    }
}
if ( value >= 5 ) {
    buttons.cure = {
        icon: "<i class='fa-solid fa-virus'></i>",
        label: "Cure!",
        callback: async (html) => {
            await ChatMessage.create({
                content: `${actor.name} cures a disease or poison.`,
                speaker: ChatMessage.getSpeaker({ actor })
            });
            return item.update({ "system.uses.value": value - 5 });
        }
    }
}

new Dialog({ title: "Lay on Hands", content, buttons }).render(true);
