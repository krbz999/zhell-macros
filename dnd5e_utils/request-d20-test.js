const abilities = Object.entries(CONFIG.DND5E.abilities).map(([k, v]) => ({ value: k, label: v.label }))
const skills = Object.entries(CONFIG.DND5E.skills).map(([k, v]) => ({ value: k, label: v.label }));
const tools = Array.from((await dnd5e.documents.Trait.choices("tool")).asSet()).map(k => ({ value: k, label: dnd5e.documents.Trait.keyLabel(`tool:${k}`) }));

/* ----------------------------------- */

const checkAbility = foundry.applications.fields.createSelectInput({ options: [{value: "", label: ""}, { rule: true }].concat(abilities), name: "check.ability" });
const checkSkills = foundry.applications.fields.createMultiSelectInput({ options: skills, name: "check.skill" });
const checkTools = foundry.applications.fields.createMultiSelectInput({ options: tools, name: "check.tool" });
const saveAbility = foundry.applications.fields.createMultiSelectInput({ options: abilities, name: "save.ability" });
const saveConcentration = foundry.applications.fields.createCheckboxInput({ name: "save.concentration" });
const dc = foundry.applications.elements.HTMLRangePickerElement.create({ min: 0, max: 30, value: 15, step: 1, name: "dc" });
const fg = (input, label, hint) => {
  const classes = (input.tagName === "MULTI-SELECT") ? ["stacked"] : [];
  const element = foundry.applications.fields.createFormGroup({ input, label, hint, classes });
  return element.outerHTML;
};

const html = `
<fieldset>
  <legend>Check</legend>
  ${fg(checkAbility, "Ability")}
  ${fg(checkSkills, "Skills")}
  ${fg(checkTools, "Tools")}
</fieldset>
<fieldset>
  <legend>Save</legend>
  ${fg(saveAbility, "Ability")}
  ${fg(saveConcentration, "Concentration")}
</fieldset>
${fg(dc, "Difficulty")}`;

async function callback(event, button) {
  const data = foundry.utils.expandObject(new foundry.applications.ux.FormDataExtended(button.form).object);

  const parts = [];

  // CHECK
  if (button.dataset.action === "check") {
    parts.push("/check");
    parts.push(data.check.ability)
    parts.push(data.check.tool.join("|"));
    parts.push(data.check.skill.join("|"));
  }

  // SAVE
  else if (button.dataset.action === "save") {
    parts.push("/save");
    parts.push(data.save.concentration && "concentration");
    parts.push(data.save.ability.join("|"));
  }

  parts.push(data.dc);

  const string = `[[${parts.filterJoin(" ")}]]`;
  const htmlString = await CONFIG.ux.TextEditor.enrichHTML(string);
  const html = foundry.utils.parseHTML(htmlString);
  html.classList.add("hidden");
  
  button.insertAdjacentElement("afterend", html);
  html.querySelector("[data-action=postRequest]").click();
  html.remove();
}

foundry.applications.api.Dialog.wait({
  content: html,
  form: { closeOnSubmit: false },
  position: { width: 550, height: "auto" },
  window: { title: "Request D20 Test", icon: "fa-solid fa-dice-d20" },
  buttons: [{ label: "Check", action: "check", callback }, { label: "Save", action: "save", callback }],
});
