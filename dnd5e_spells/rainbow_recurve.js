// RAINBOW RECURVE
// required modules: concentrationnotifier, itemacro, rollgroups

// get whether we are concentrating on the spell.
let effect = CN.isActorConcentratingOnItem(actor, item);

const colors = [
  "red", "orange", "yellow", "green",
  "blue", "indigo", "violet"
];

// if not concentrating, cast the spell.
if (!effect) {
  const use = await item.use();
  if (!use) return;
  effect = await CN.waitForConcentrationStart(actor, {
    item, max_wait: 1000
  });
  if (!effect) return;
}
return chooseArrow();

// dialog to choose arrow.
async function chooseArrow() {
  // get all arros that have NOT been fired.
  const arrows = effect.getFlag("world", "arrow-fired") ?? {};
  const available = colors.filter(c => {
    return !(c in arrows);
  });

  // no arrows available, end concentration.
  if (available.length < 1) return effect.delete();

  const options = available.reduce((acc, color) => {
    return acc + `<option value="${color}">${color.titleCase()}</option>`;
  }, "");

  new Dialog({
    title: "Rainbow Recurve",
    content: `
    <form>
      <div class="form-group">
        <label for="arrow">Select arrow:</label>
        <div class="form-fields">
          <select id="arrow">${options}</select>
        </div>
      </div>
    </form>`,
    buttons: {
      shoot: {
        icon: "<i class='fa-solid fa-check'></i>",
        label: "Shoot!",
        callback: async (html) => {
          const arrow = html[0].querySelector("#arrow").value;
          return shootArrow(arrow);
        }
      }
    }
  }).render(true);
}

// create item clone.
async function shootArrow(arrow) {
  // set up rollgroups and damage parts.
  const groups = [{ label: "Force", parts: [0] }];
  if (arrow === "red") {
    groups.push({ label: "Fire", parts: [1] });
  } else if (arrow === "orange") {
    groups.push({ label: "Acid", parts: [2] });
  } else if (arrow === "yellow") {
    groups.push({ label: "Lightning", parts: [3] });
  } else if (arrow === "green") {
    groups.push({ label: "Poison", parts: [4] });
  } else if (arrow === "blue") {
    groups.push({ label: "Cold", parts: [5] });
  }

  let addSave;
  if (arrow === "indigo") addSave = "con";
  else if (arrow === "violet") addSave = "wis";

  await effect.setFlag("concentrationnotifier", "data", {
    "itemData.flags.rollgroups.config.groups": groups
  });

  const card = await CN.redisplayCard(actor);

  // add new saving throw button.
  if (addSave) {
    const div = document.createElement("DIV");
    div.innerHTML = card.content;
    const oldSave = div.querySelector("button[data-action=save]");
    const dc = actor.system.attributes.spelldc;

    const ability = CONFIG.DND5E.abilities[addSave];
    const newSaveButton = document.createElement("button");
    newSaveButton.setAttribute("data-action", "save");
    newSaveButton.setAttribute("data-ability", addSave);
    newSaveButton.innerHTML = `Saving Throw DC ${dc} ${ability}`;
    oldSave.after(newSaveButton);
    await card.update({ content: div.innerHTML });
  }
  await effect.setFlag("world", `arrow-fired.${arrow}`, true);
}
