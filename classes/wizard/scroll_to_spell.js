// Turn a spell scroll into a spell.
// required modules: none.

const key = "..."; // key for the pack where you find the spell.
const wizard = game.actors.getName("Name of the wizard");

const scrolls = wizard.itemTypes.consumable.filter(i => i.data.data.consumableType === "scroll" && i.name.includes("Spell Scroll:"));
if(scrolls.length < 1) return ui.notifications.info("Actor has no scrolls.");
const options = scrolls.reduce((acc, {id, name}) => acc += `<option value="${id}">${name}</option>`, ``);
const content = `
	<form>
		<div class="form-group">
			<label for="item-select">Select the scroll:</label>
			<div class="form-fields">
				<select id="item-select">${options}</select>
			</div>
		</div>
	</form>`;
new Dialog({
	title: "Scroll to Spell",
	content,
	buttons: {
		go: {
			icon: `<i class="fas fa-check"></i>`,
			label: "Create Spell",
			callback: async (html) => {
				const scrollId = html[0].querySelector("select[id='item-select']").value;
				const scroll = wizard.items.get(scrollId);
				const pack = await game.packs.get(key).getIndex();
				const spellId = pack.find(i => i.name === scroll.name.replace("Spell Scroll: ", ""))?._id;
				const spell = await game.packs.get(key).getDocument(spellId);
				const createdSpell = await wizard.createEmbeddedDocuments("Item", [spell?.toObject()]);
				if(createdSpell.length > 0) scroll?.delete();
			}
		}
	},
	default: "go"
}).render(true);