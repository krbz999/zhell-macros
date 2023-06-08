// combat dice for 2d20 system.
// roll variable number of d6; result: [1, 2, 0, 0, 1, 1], and number of effects: [0, 0, 0, 0, 1, 1]

const content = `
<form>
  <div class="form-group">
    <label>Amount</label>
    <div class="form-fields">
      <input type="number" autofocus>
    </div>
  </div>
</form>`;
new Dialog({
  title: "Combat Dice",
  content,
  buttons: {
    go: {
      icon: `<i class="fa-solid fa-check"></i>`,
      label: "Roll",
      callback: async (html) => {
        const diceCount = html[0].querySelector("input").value;
        const roll = await new Roll(`${diceCount}d6`).evaluate();
        const sum = roll.dice[0].results.reduce((acc, res) => {
          if ([1, 5, 6].includes(res.result)) return acc + 1;
          if ([3, 4].includes(res.result)) {
            res.active = false;
            res.discarded = true;
            return acc;
          }
          if (res.result === 2) return acc + 2;
        }, 0);
        const effects = roll.dice[0].results.reduce((acc, {result}) => acc + (result > 4 ? 1 : 0), 0);
        roll._total = sum;
        return roll.toMessage({flavor: `You rolled a total of ${sum} and got ${effects} effects.`});
      }
    }
  }
}).render(true);
