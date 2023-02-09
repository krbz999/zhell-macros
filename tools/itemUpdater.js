/**
 * Macro to find and replace instances of a given item on any actor in the world.
 * Drag the source item into the input field, then select an item to replace by
 * clicking on the recycling icon. The item will be deleted and replaced entirely
 * with a copy of the source item.
 * Use with caution; deletion is permanent!
 *
 * Required modules: none.
 */

let item;
async function _replaceItemOnActor(itemUuid) {
  const toReplace = await fromUuid(itemUuid);
  const owner = toReplace.actor;
  const conf = await toReplace.deleteDialog();
  if (conf) return owner.createEmbeddedDocuments("Item", [item.toObject()]);
  return false;
}

function _render(html) {
  html[0].addEventListener("click", async (event) => {
    const target = event.target.closest("a.replace-button");
    if (!target) return;
    const uuid = target.dataset.uuid;
    const del = await _replaceItemOnActor(uuid);
    if (del) target.closest("tr").remove();
    d.setPosition({ height: "auto" });
  });
  html[0].querySelector(".drop-location").addEventListener("drop", _onDrop);
}

async function _onDrop(event) {
  const data = JSON.parse(event.dataTransfer.getData("text/plain"));
  if ((data.type !== "Item") || !data.uuid) return;
  item = await fromUuid(data.uuid);
  return _generateContent();
}

async function _generateContent() {
  const rows = game.actors.reduce((acc, a) => {
    const items = a.items.filter(i => i.name === item.name);
    if (!items.length) return acc;
    return acc + items.reduce((abb, i) => {
      return abb + `
      <tr>
        <td>${a.link}</td>
        <td>${i.link}</td>
        <td><a class="replace-button" data-uuid="${i.uuid}"><i class="fa-solid fa-recycle"></i></a></td>
      </tr>`;
    }, "");
  }, "");

  const style = `
  <style>
  .find-and-replace table tr > :last-child {
    text-align: center;
  </style>`;

  const _content = `
  <table>
    <thead>
      <tr>
        <th>Actor</th>
        <th>Item</th>
        <th>Replace</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;

  const DIV = document.createElement("DIV");
  DIV.innerHTML = style + await TextEditor.enrichHTML(_content, { async: true });
  d.element[0].querySelector(".drop-location").replaceWith(...DIV.children);
  d.setPosition({ height: "auto" });
}

const d = new Dialog({
  render: _render,
  buttons: {
    gucci: {
      label: "Done",
      icon: "<i class='fa-solid fa-check'></i>",
    }
  },
  title: "Replace Items",
  content: "<input type='text' placeholder='Drop item here' class='drop-location'>"
}, {
  classes: ["dialog", "find-and-replace"],
  dragDrop: [{ dragSelector: null, dropSelector: ".drop-location" }]
}).render(true);
