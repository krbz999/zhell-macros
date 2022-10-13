// dialog to adjust resources.
if(!actor) return ui.notifications.warn("You need an actor.");

const resources = foundry.utils.duplicate(actor.system.resources);
const content = `
<form>
  <div class="form-group">
    <label>${resources.primary.label}</label>
    <div class="form-fields">
      <input type="number" id="primary-v" value="${resources.primary.value}">
      <span class="sep"> / </span>
      <input type="number" id="primary-m" value="${resources.primary.max}">
    </div>
  </div>
  <div class="form-group">
    <label>${resources.secondary.label}</label>
    <div class="form-fields">
      <input type="number" id="secondary-v" value="${resources.secondary.value}">
      <span class="sep"> / </span>
      <input type="number" id="secondary-m" value="${resources.secondary.max}">
    </div>
  </div>
  <div class="form-group">
    <label>${resources.tertiary.label}</label>
    <div class="form-fields">
      <input type="number" id="tertiary-v" value="${resources.tertiary.value}">
      <span class="sep"> / </span>
      <input type="number" id="tertiary-m" value="${resources.tertiary.max}">
    </div>
  </div>
</form>`;
new Dialog({
  title: "Adjust Resources",
  content,
  buttons: {
    go: {
      icon: "<i class='fa-solid fa-check'></i>",
      label: "All Good",
      callback: async (html) => {
        resources.primary.value = Number(html[0].querySelector("#primary-v").value);
        resources.primary.max = Number(html[0].querySelector("#primary-m").value);
        resources.secondary.value = Number(html[0].querySelector("#secondary-v").value);
        resources.secondary.max = Number(html[0].querySelector("#secondary-m").value);
        resources.tertiary.value = Number(html[0].querySelector("#tertiary-v").value);
        resources.tertiary.max = Number(html[0].querySelector("#tertiary-m").value);
        return actor.update({ "system.resources": resources });
      }
    }
  }
}).render(true);
