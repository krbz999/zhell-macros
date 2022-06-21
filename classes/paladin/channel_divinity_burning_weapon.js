/*
 * As a bonus action, you can ignite one weapon that you are holding with fiery energy using your Channel Divinity.
 * For 1 minute, you deal extra fire damage with that weapon equal to your Charisma modifier (minimum 1).
 * The weapon also emits bright light in a 20-foot radius and dim light for an additional 20 feet.
 * If the weapon is not already magical, it becomes magical for the duration.
 */

// Channel Divinity: Burning Weapon
// (homebrew Oath of the Hearth)
// required modules: warpgate, itemacro

const name = "Burning Weapon";
const hasMutation = warpgate.mutationStack(token.document).getName(name);
if(hasMutation) return warpgate.revert(token.document, name);

const weapons = actor.itemTypes.weapon.filter(i => i.data.data.equipped);
if(weapons.length < 1) return ui.notifications.warn("You have no equipped weapons.");

const roll = await item.roll();
if(!roll) return;

// mutation function:
const mutate = async (weaponId) => {
	const weapon = actor.items.get(weaponId);
	if(!weapon) return;
	const mod = Math.max(1, actor.data.data.abilities.cha.mod);
	const damageParts = weapon.data.data.damage.parts;
	damageParts[0][0] = `${damageParts[0][0]} + ${mod}[fire]`;
	
	await warpgate.mutate(token.document, {
		token: {light: {bright: 20, dim: 40, color: "#e05d06", "animation.type": "torch"}},
		embedded: {Item: {[weaponId]: {data: {"properties.mgc": true, "damage.parts": damageParts}}}}
	}, {}, {name, comparisonKeys: {Item: "_id"}});
}

/* exactly one weapon */
if(weapons.length === 1) return mutate(weapons[0].id);

/* multiple weapons */
const weaponSelect = weapons.reduce((acc, {id, name}) => acc += `<option value="${id}">${name}</option>`, ``);
const content = `
	<p>Pick your weapon for ${name}.</p>
	<form>
		<div class="form-group">
			<label for="wpn">Weapon</label>
			<div class="form-fields">
				<select id="wpn">${weaponSelect}</select>
			</div>
		</div>
	</form>`;

new Dialog({
	title: name,
	content,
	buttons: {
		go: {
			icon: `<i class="fas fa-check"></i>`,
			label: "Flame On!",
			callback: (html) => {
				const weaponId = html[0].querySelector("select[id=wpn]").value;
				return mutate(weaponId);
			}
		}
	},
	default: "go",
}).render(true);

