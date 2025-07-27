/**
 * A tool for managing hordes or big groups of tokens and their attacks and damage rolls.
 */

class PackAttack extends Dialog {
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.classes.push("pack-attack");
    options.height = "auto";
    return options;
  }

  static async create() {
    return new this({
      title: "Pack Attack Tool",
      buttons: {close: {icon: "<i class='fa-solid fa-check'></i>", label: "Close"}}
    }).render(true);
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    html[0].querySelectorAll("[data-action]").forEach(n => {
      switch (n.dataset.action) {
        case "item":
          n.addEventListener("change", this._onItem.bind(this)); break;
        case "attack":
          n.addEventListener("click", this._onAttack.bind(this)); break;
        case "damage":
          n.addEventListener("click", this._onDamage.bind(this)); break;
        case "ping":
          n.addEventListener("click", this._onPing.bind(this)); break;
      }
    });
  }

  /**
   * Ping or pull to a token.
   * @param {Event} event     Initiating click event.
   */
  async _onPing(event) {
    const tokenId = event.currentTarget.closest("[data-token-id]").dataset.tokenId;
    const origin = this.ids[tokenId].token.object.center;
    canvas.ping(origin, {});
  }

  /**
   * Roll damage for a token actor's item.
   * @param {Event} event     Initiating click event.
   */
  async _onDamage(event) {
    const tokenId = event.currentTarget.closest("[data-token-id]").dataset.tokenId;
    const itemId = event.currentTarget.closest("[data-token-id]").querySelector("[data-action=item]").value;
    const item = this.ids[tokenId].token.actor.items.get(itemId);
    if (!item) return;
    const dmg = await item.rollDamage({event: event});
    if (!dmg) return;
    foundry.utils.setProperty(this, `ids.${tokenId}.damage`, dmg.total);
    this.render();
  }

  /**
   * Roll attack for a token actor's item.
   * @param {Event} event     Initiating click event.
   */
  async _onAttack(event) {
    const tokenId = event.currentTarget.closest("[data-token-id]").dataset.tokenId;
    const itemId = event.currentTarget.closest("[data-token-id]").querySelector("[data-action=item]").value;
    const item = this.ids[tokenId].token.actor.items.get(itemId);
    if (!item) return;
    const atk = await item.rollAttack({event: event});
    if (!atk) return;
    foundry.utils.setProperty(this, `ids.${tokenId}.attack`, atk.total);
    this.render();
  }

  /**
   * Unset attack and damage when changing the item, then re-render.
   * @param {Event} event     Initiating change event.
   */
  _onItem(event) {
    const value = event.currentTarget.value;
    const tokenId = event.currentTarget.closest("[data-token-id]").dataset.tokenId;
    foundry.utils.setProperty(this, `ids.${tokenId}.selected`, value);
    foundry.utils.setProperty(this, `ids.${tokenId}.attack`, null);
    foundry.utils.setProperty(this, `ids.${tokenId}.damage`, null);
    this.render();
  }

  /**
   * Get token documents you are owner of and whose actor have an item with an attack and damage roll.
   * @type {Set<TokenDocument5e>}
   */
  get tokens() {
    const tokens = new Set();
    const actors = new Set();
    for (const token of canvas.scene.tokens) {
      if (!token.actor) continue;
      const isOwner = token.actor.isOwner;
      const isPlayer = game.user.isGM && game.users.some(user => {
        user.active && token.actor.testUserPermission(user, "OWNER");
      });
      if (!isOwner || isPlayer) continue;
      const hasItem = token.actor.items.some(item => item.hasAttack && item.hasDamage);
      if (hasItem && !actors.has(token.actor)) {
        actors.add(token.actor);
        tokens.add(token);
      }
    }
    return tokens;
  }

  /**
   * Get select options for the items with an attack and damage roll from a token.
   * @param {TokenDocument5e} token     The token document.
   * @returns {string}                  Select options with item id and item name.
   */
  itemSelectOptions(token) {
    const choices = token.actor.items.reduce((acc, item) => {
      const valid = item.hasAttack && item.hasDamage;
      if (valid) acc[item.id] = item.name;
      return acc;
    }, {});
    const selected = this.ids?.[token.id]?.selected || null;
    const options = {hash: {selected: selected, blank: "-"}};
    return HandlebarsHelpers.selectOptions(choices, options);
  }

  /**
   * Disable the select for this token?
   * @param {TokenDocument5e} token     The token document.
   * @returns {boolean}
   */
  disableSelect(token) {
    return this.getAttackRoll(token) !== null;
  }

  /**
   * Get the attack roll's value for this token.
   * @param {TokenDocument5e} token     The token document.
   * @returns {number|null}             The rolled value or null if not rolled.
   */
  getAttackRoll(token) {
    const atk = this.ids?.[token.id]?.attack;
    return parseInt(atk) || null;
  }

  /**
   * Get the damage roll's value for this token.
   * @param {TokenDocument5e} token     The token document.
   * @returns {number|null}             The rolled value or null if not rolled.
   */
  getDamageRoll(token) {
    const atk = this.ids?.[token.id]?.damage;
    return parseInt(atk) || null;
  }

  /**
   * Retrieve the current data model in use.
   * @type {PackAttackModel}
   */
  get tokenData() {
    const oldids = this.ids || {};
    const ids = {};
    for (const token of this.tokens) {
      const options = this.itemSelectOptions(token);
      ids[token.id] = {};
      if (token.id in oldids) {
        ids[token.id] = {...oldids[token.id]};
      }
      ids[token.id].options = options;
      ids[token.id].token = token;
      ids[token.id].disableSelect = this.disableSelect(token);
      ids[token.id].attack = this.getAttackRoll(token);
      ids[token.id].damage = this.getDamageRoll(token);
    }
    return this.ids = ids;
  }

  /** @override */
  render(force = false, options = {}) {
    this.data.content = this.getContent();
    return super.render(force, options);
  }

  /**
   * Construct the 'template' of this dialog.
   * @returns {string}      The content property.
   */
  getContent() {
    const style = `
    <style>
    .pack-attack .form-fields a[data-action] {
      flex: 0 0 40px;
      text-align: center;
      border: 1px #c1b7b7 groove;
      border-radius: 5px;
      background-color: rgba(0, 0, 0, 0.15);
      font-family: 'Bruno Ace';
    }
    </style>`;

    let content = `<form class="dnd5e">`;
    for (const {options, token, disableSelect, attack, damage} of Object.values(this.tokenData)) {
      content += `
      <div class="form-group" data-token-id="${token.id}">
        <label><a data-action="ping">${token.name}</a></label>
        <div class="form-fields">
          <select data-action="item" ${disableSelect ? "disabled" : ""}>${options}</select>
          <a data-action="attack">${attack ?? "<i class='fa-solid fa-dice-d20'></i>"}</a>
          <a data-action="damage">${damage ?? "<i class='fa-solid fa-dice'></i>"}</a>
        </div>
      </div>`;
    }
    content += "</form>";
    return style + content;
  }
}
PackAttack.create();
