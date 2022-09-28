/* 
  Applies a floor of 10 to Persuasion and Deception.
  Requires having a token selected, or having an assigned character.
*/
new Dialog({
  title: "Eloquence",
  content: `
  <form>
    <div class="form-group">
      <label>Select Skill</label>
      <div class="form-fields">
        <select id="eloquence">
          <option value="per">Persuasion</option>
          <option value="dec">Deception</option>
        </select>
      </div>
    </div>
  </form>`,
  buttons: {
    go: {
      icon: "<i class='fa-solid fa-check'></i>",
      label: "Roll",
      callback: async (html) => {
        const skill = html[0].querySelector("#eloquence").value;
        const a = token?.actor ?? game.user.character;
        await a.rollSkill(skill, { reliableTalent: true, event });
      }
    }
  }
}).render(true);
