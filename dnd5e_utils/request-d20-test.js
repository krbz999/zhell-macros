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
  const el = document.createElement(foundry.applications.elements.HTMLEnrichedContentElement.tagName);
  el.classList.add("hidden");
  el.setAttribute("enricher", "dnd5e-enricher");

  const btn = document.createElement("A");
  btn.classList.add("enricher-action");
  btn.dataset.action = "postRequest";

  const span = document.createElement("SPAN");
  span.classList.add("roll-link-group");
  span.dataset.type = button.dataset.action;
  span.dataset.dc = Number(data.dc);
  span.dataset.request = true;
  span.dataset.format = "long";
  span.insertAdjacentElement("beforeend", btn);

  // CHECK
  if (button.dataset.action === "check") {
    if (data.check.ability) span.dataset.ability = data.check.ability;
    if (data.check.tool.length) {
      span.dataset.tool = data.check.tool.join("|");
      span.dataset.usingTool = span.dataset.tool;
    }
    if (data.check.tool.length === 1 && !data.check.ability) span.dataset.ability = CONFIG.DND5E.tools[data.check.tool[0]].ability;
    if (data.check.skill.length) span.dataset.skill = data.check.skill.join("|");
  }

  // SAVE
  else if (button.dataset.action === "save") {
    if (data.save.concentration) span.dataset.type = "concentration";
    else if (!data.save.ability.length) return;
    if (data.save.ability.length) span.dataset.ability = data.save.ability.join("|");
  }

  el.insertAdjacentElement("beforeend", span);
  button.insertAdjacentElement("afterend", el);
  btn.click();
  el.remove();
}

foundry.applications.api.Dialog.wait({
  content: html,
  form: { closeOnSubmit: false },
  position: { width: 550, height: "auto" },
  window: { title: "Request D20 Test", icon: "fa-solid fa-dice-d20" },
  buttons: [{ label: "Check", action: "check", callback }, { label: "Save", action: "save", callback }],
});
