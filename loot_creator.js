// macro to create loot, either in an item pile or on an actor.
// can additionally add to the sidebar on creation.

// required modules: item-piles, warpgate

// get a random image from the treasurs folder.
const {files} = await FilePicker.browse("public", "icons/commodities/treasure");
const img = files[Math.floor(Math.random() * files.length)];

// set up input fields.
const nameField = `<input id="name" type="text" value="Curiosity"></input>`;
const priceField = `<input id="price" type="number" value="25"></input>`;
const weightField = `<input id="weight" type="number" value="1"></input>`;
const quantityField = `<input id="quantity" type="number" value="1"></input>`;
const descriptionField = `<textarea style="resize: none" id="description" placeholder="Enter text..."></textarea>`;
const sidebarCheck = `<input type="checkbox" id="sidebarbox"></input>`;

// set up html.
const content = `
	<p style="text-align:center"><img src="${img}" style="width:60px; height: 60px;"></p>
	<hr>
	<form>
		<div class="form-group">
			<label for="name">Item name</label>
			<div class="form-fields">${nameField}</div>
		</div>
		<div class="form-group">
			<label for="price">Price (GP)</label>
			<div class="form-fields">${priceField}</div>
		</div>
		<div class="form-group">
			<label for="weight">Weight (lbs.)</label>
			<div class="form-fields">${weightField}</div>
		</div>
		<div class="form-group">
			<label for="quantity">Quantity</label>
			<div class="form-fields">${quantityField}</div>
		</div>
		<div class="form-group">
			<label for="description">Description</label>
			<div class="form-fields">${descriptionField}</div>
		</div>
		<div class="form-group">
			<label for="sidebarbox">Add to sidebar</label>
			<div class="form-fields">${sidebarCheck}</div>
		</div>
	</form>
	<hr>`;

// create and render dialog.
new Dialog({content, title: "Create Loot", buttons: {go: {
	icon: `<i class="fas fa-check"></i>`,
	label: "Create Loot!",
	callback: async (html) => {
		// construct item data.
		const name = html[0].querySelector("input[id=name]").value;
		const value = html[0].querySelector("textarea[id=description]").value;
		const price = html[0].querySelector("input[id=price]").value;
		const quantity = html[0].querySelector("input[id=quantity]").value;
		const weight = html[0].querySelector("input[id=weight]").value;
		
		const itemData = {name, img, type: "loot", data: {description: {value}, price, quantity, rarity: "common", weight}}
		
		// pick the target or location.
		const crosshairs = await warpgate.crosshairs.show({label: "Select recipient or location", drawIcon: false, size: 1});
		const tokenDocs = !crosshairs.cancelled ? warpgate.crosshairs.collect(crosshairs) : [];
		
		// pop it in the sidebar
		const sidebar = html[0].querySelector("input[id=sidebarbox]").checked;
		if(sidebar) await Item.createDocuments([itemData]);
		
		// if no token was targeted, add the item to a new item pile, initially hidden.
		if(tokenDocs.length < 1){
			const updates = {embedded: {Item: {[name]: itemData}}, token: {hidden: true}}
			return warpgate.spawnAt(crosshairs, "Default Item Pile", updates);
		}
		
		// if a token was targeted, add to their inventory instead.
		await tokenDocs[0].actor.createEmbeddedDocuments("Item", [itemData]);
		// if single item pile it's probably named as that item, so fix that 
		const isItemPile = tokenDocs[0].getFlag("item-piles", "data.enabled");
		if(!!isItemPile) await tokenDocs[0].update({name: "Pile of Loot"});
	}
}}, default: "go"}).render(true);