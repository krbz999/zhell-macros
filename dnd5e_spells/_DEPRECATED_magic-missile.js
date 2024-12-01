// MAGIC MISSILE
// required modules: itemacro

const use = await item.use();
if (!use) return;

const spellLevel = use.flags.dnd5e.use.spellLevel;

const dialog = new Dialog({
  title: "Direct your missiles",
  content: `<p>Write a comma-separated list of numbers adding up to ${spellLevel + 2} to roll the missile damage individually on each target.</p>
  <hr>
  <form class="dnd5e">
    <div class="form-group">
      <label>CSV (${spellLevel + 2} missiles):</label>
      <div class="form-fields">
        <input type="text" value="${spellLevel + 2}">
      </div>
    </div>
  </form>`,
  buttons: {
    fire: {
      icon: "<i class='fa-solid fa-check'></i>",
      label: "Shoot!",
      callback: async ([html]) => {
        const csv = html.querySelector("INPUT").value;
        const values = csv.split(",");

        // check if the sum is correct.
        const sum = values.reduce((acc, e) => acc + (parseInt(e) || 0), 0);
        if (sum !== spellLevel + 2) {
          ui.notifications.warn("Invalid list.");
          return dialog.render();
        }

        for (const v of values) {
          const clone = item.clone({
            "system.level": spellLevel,
            "system.damage.parts": [[`${v}d4 + ${v}`]],
            "system.actionType": "other"
          }, {keepId: true});
          clone.prepareData();
          clone.prepareFinalAttributes();
          await clone.rollDamage({options: {fastForward: true, critical: false}});
        }
      }
    }
  }
});
dialog.render(true);
