// set all selected tokens as friendly, neutral, hostile

const options = Object.entries(CONST.TOKEN_DISPOSITIONS).reduce((acc, [key,value]) => acc += `<option value="${value}">${key}</option>`, ``);

new Dialog({
	title: "Token Disposition",
	content: `
	<form>
		<div class="form-group">
			<label for="disposition">Disposition</label>
			<div class="form-fields">
				<select id="disposition">${options}</select>
			</div>
		</div>
	</form>`,
	buttons: {
		go: {
			icon: "<i class='fas fa-check'></i>",
			label: "Apply",
			callback: async (html) => {
				const disposition = Number(html[0].querySelector("select[id=disposition]").value);
				const updates = canvas.tokens.controlled.map(i => ({_id: i.id, disposition}));
				await canvas.scene.updateEmbeddedDocuments("Token", updates);
			}
		}
	},
	default: "go",
}).render(true);