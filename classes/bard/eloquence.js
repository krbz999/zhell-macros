// Eloquence
// required modules: none

const a = token?.actor ?? game.user.character;
if(a) return ui.notifications.warn("You must have a selected token or assigned actor.");

return Dialog.prompt({
  title: "Eloquence",
  content: `
  <form class="dnd5e">
    <div class="form-group">
      <label>Select Skill</label>
      <div class="form-fields">
        <select>
          <option value="per">Persuasion</option>
          <option value="dec">Deception</option>
        </select>
      </div>
    </div>
  </form>`,
  rejectClose: false,
  label: "Roll",
  callback: async (html) => {
    const skill = html[0].querySelector("select").value;
    return a.rollSkill(skill, {reliableTalent: true, event});
  }
});
