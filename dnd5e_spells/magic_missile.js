// MAGIC MISSILE
// required modules: itemacro

const use = await item.use();
if (!use) return;

const div = document.createElement("DIV");
div.innerHTML = use.content;
const level = Number(div.firstChild.dataset.spellLevel);

const dialog = new Dialog({
  title: "Direct your missiles",
  content: `<p>Write a comma-separated list of numbers adding up to ${level + 2} to roll the missile damage individually on each target.</p>
  <hr>
  <form>
    <div class="form-group">
      <label for="csv">CSV (${level + 2} missiles):</label>
      <div class="form-fields">
        <input type="text" id="csv" value="${level + 2}">
      </div>
    </div>
  </form>`,
  buttons: {
    fire: {
      icon: "<i class='fa-solid fa-check'></i>",
      label: "Shoot!",
      callback: async (html) => {
        const csv = html[0].querySelector("#csv").value;
        const values = csv.split(",");

        // check if the sum is correct.
        const sum = values.reduce((acc, e) => acc += Number(e), 0);
        if (sum !== level + 2) return dialog.render();
        // create the rolls.
        const rolls = await Promise.all(values.map(v => {
          return new Roll(`${v}d4 + ${v}`).evaluate({async: true});
        }));
        return ChatMessage.create({
          flavor: "Magic Missile - Damage Roll (Force)",
          speaker: ChatMessage.getSpeaker({actor}),
          type: CONST.CHAT_MESSAGE_TYPES.ROLL,
          rolls
        });
      }
    }
  }
});
dialog.render(true);
