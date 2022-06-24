/* 
  World Script to let the GM enable/disable short and long rest.
 */


class REST_TOGGLE {
	static MODULE_NAME = "rest_toggling";
	static SETTING_LR = "toggleLR";
	static SETTING_SR = "toggleSR";
	
	// function that toggles LR on/off. Optional boolean; false (disabled), true (enabled).
	static toggleLR = async (bool) => {
		const {MODULE_NAME, SETTING_LR} = this;
		if(!game.user.isGM) return ui.notifications.warn("Excuse me?");
		
		// if a bool is passed, set to that.
		if(bool !== undefined) return game.settings.set(MODULE_NAME, SETTING_LR, bool);
		
		// else just toggle to the opposite.
		const currentValue = game.settings.get(MODULE_NAME, SETTING_LR);
		return game.settings.set(MODULE_NAME, SETTING_LR, !currentValue);
	};
	
	// function that toggles SR on/off. Optional boolean; false (disabled), true (enabled).
	static toggleSR = async (bool) => {
		const {MODULE_NAME, SETTING_SR} = this;
		if(!game.user.isGM) return ui.notifications.warn("Excuse me?");
		
		// if a bool is passed, set to that.
		if(bool !== undefined) return game.settings.set(MODULE_NAME, SETTING_SR, bool);
		
		// else just toggle to the opposite.
		const currentValue = game.settings.get(MODULE_NAME, SETTING_SR);
		return game.settings.set(MODULE_NAME, SETTING_SR, !currentValue);
	};
	
	// hook to disable LR button in the LR dialog.
	static _hookLR = (dialog, html, data) => {
		const {MODULE_NAME, SETTING_LR} = this;
		
		const restDisabled = game.settings.get(MODULE_NAME, SETTING_LR);
		if(!restDisabled) return;
		const restButton = html[0].querySelector("button[data-button='rest']");
		restButton.setAttribute("disabled", true);
	}
	
	// hook to disable SR buttons in the SR dialog.
	static _hookSR = (dialog, html, data) => {
		const {MODULE_NAME, SETTING_SR} = this;
		
		const restDisabled = game.settings.get(MODULE_NAME, SETTING_SR);
		if(!restDisabled) return;
		const rollButton = html[0].querySelector("#roll-hd");
		rollButton.setAttribute("disabled", true);
		const restButton = html[0].querySelector("button[data-button='rest']");
		restButton.setAttribute("disabled", true);
	}
}

Hooks.on("renderLongRestDialog", REST_TOGGLE._hookLR);
Hooks.on("renderShortRestDialog", REST_TOGGLE._hookSR);

// set up functions:
Hooks.once("setup", () => {
	
	// create functions in game.restToggle.
	game.restToggle = !!game.restToggle ? game.restToggle : {};
	game.restToggle.toggleLR = REST_TOGGLE.toggleLR;
	game.restToggle.toggleSR = REST_TOGGLE.toggleSR;
	
	// register settings.
	game.settings.register(REST_TOGGLE.MODULE_NAME, REST_TOGGLE.SETTING_LR, {
		name: "Toggle Long Rests",
		hint: "Enable or disable long rests on character sheets.",
		config: true,
		scope: "world",
		type: Boolean,
		default: true
	});
	
	game.settings.register(REST_TOGGLE.MODULE_NAME, REST_TOGGLE.SETTING_SR, {
		name: "Toggle Short Rests",
		hint: "Enable or disable short rests on character sheets.",
		config: true,
		scope: "world",
		type: Boolean,
		default: true
	});
});