// Eloquence
// required modules: none

if (!actor) return ui.notifications.warn("You must have a selected token or assigned actor.");
return Dialog.prompt({
  title: "Eloquence",
  content: `
  <form class="dnd5e">
    <div class="form-group">
      <label>Select Skill</label>
      <div class="form-fields">
        <select>
          <option value="per">${CONFIG.DND5E.skills.per.label}</option>
          <option value="dec">${CONFIG.DND5E.skills.dec.label}</option>
        </select>
      </div>
    </div>
  </form>`,
  rejectClose: false,
  label: "Roll",
  callback: async (html) => {
    const skill = html[0].querySelector("select").value;
    return actor.rollSkill(skill, {reliableTalent: true, event});
  }
});
