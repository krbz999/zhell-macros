// Eloquence
// required modules: none

Dialog.prompt({
  title: "Eloquence",
  content: `
  <form>
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
    const a = token?.actor ?? game.user.character;
    return a.rollSkill(skill, { reliableTalent: true, event });
  }
});
