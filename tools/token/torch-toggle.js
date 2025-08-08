/**
 * Macro to toggle light animation on a token.
 * Different configurations can be entered in the `configs` object.
 * The default is 0 dim and 0 bright.
 */

const configs = {
  def: {
    label: "Default",
    config: { dim:   0, bright:  0 },
  },
  candle: {
    label: "Candle",
    config: {
      angle: 360,
      dim: 10,
      bright: 5,
      color: "#a2642a",
      luminosity: 0,
      animation: {
        type: "flame",
        intensity: 4,
        speed: 10,
      },
    },
  },
  burningTorch: {
    label: "Burning Torch", 
    config: {
      angle: 360,
      dim: 40,
      bright: 20,
      color: "#7f4a14",
      luminosity: 0,
      animation: {
        type: "flame",
        intensity: 2,
      },
    },
  },
  bullseye: {
    label: "Bullseye",
    config: {
      angle: 60,
      dim: 120,
      bright: 60,
      color: "#b79471",
      luminosity: 0,
      animation: {
        type: "torch",
        intensity: 2,
        speed: 8,
      },
    },
  },
  lantern: {
    label: "Lantern",
    config: {
      dim: 60,
      bright: 30,
      color: "#b79471",
      luminosity: 0,
      animation: {
        type: "torch",
        intensity: 2,
        speed: 8,
      },
    },
  },
  lanternHooded: {
    label: "Hooded Lantern",
    config: {
      dim: 5,
      bright: 0,
      color: "#b79471",
      luminosity: 0,
      animation: {
        type: "torch",
        intensity: 2,
        speed: 8,
      },
    },
  },
  moonTouched: {
    label: "Moon-Touched",
    config: {
      angle: 360,
      dim: 15,
      bright: 15,
      color: "#a8a8a8",
      luminosity: 3,
      animation: {
        type: "torch",
      },
    },
  },
  lightSpell: {
    label: "Light Spell",
    config: {
      angle: 360,
      dim: 20,
      bright: 20,
      color: "#a8a8a8",
      luminosity: 3,
      animation: {
        type: "fog",
        intensity: 2,
      },
    },
  },
  faerieFire: {
    label: "Faerie Fire",
    config: {
      angle: 360,
      dim: 0,
      bright: 1,
      color: "#8135c0",
      animation: {
        type: "fairy",
        intensity: 8,
        speed: 8,
      },
    },
  },
  daylight: {
    label: "Daylight",
    config: {
      angle: 360,
      dim: 120,
      bright: 60,
      color: "#a8a8a8",
      luminosity: 3,
      animation: {
        type: "fog",
        intensity: 2,
      },
    },
  },
};

const states = new Set(Object.keys(configs));
states.delete("def");

const state = token.document.flags.world?.light ?? null;
if ( states.has(state) )
  return token.document.update({ light: configs.def.config, "flags.world.light": null });

return foundry.applications.api.DialogV2.wait({
  window: {
    title: "Configure Token Light",
    icon: "fa-solid fa-lightbulb"
  },
  position: {
    width: 400,
  },
  buttons: Array.from(states).map(action => {
    const label = configs[action].label || CONFIG.Canvas.lightAnimations[action]?.label || action.capitalize();
    return { action, callback, label };
  }),
  render: (event, dialog) => {
    const footer = dialog.element.querySelector(".form-footer");
    footer.style.setProperty("display", "grid");
    footer.style.setProperty("grid-template-columns", "1fr 1fr");
  },
});

function callback(event, button) {
  const state = button.dataset.action;
  const light = configs[state].config;
  token.document.update({ light, "flags.world.light": state });
}

// Internal keys of different light animations:
// "flame": "Torch",
// "torch": "Flickering Light",
// "revolving": "Revolving Light",
// "siren": "Siren Light",
// "pulse": "Pulse",
// "chroma": "Chroma",
// "wave": "Pulsing Wave",
// "fog": "Swirling Fog",
// "sunburst": "Sunburst",
// "dome": "Light Dome",
// "emanation": "Mysterious Emanation",
// "hexa": "Hexa Dome",
// "ghost": "Ghostly Light",
// "energy": "Energy Field",
// "vortex": "Vortex",
// "witchwave": "Bewitching Wave",
// "rainbowswirl": "Swirling Rainbow",
// "radialrainbow": "Radial Rainbow",
// "fairy": "Fairy Light",
// "grid": "Force Grid",
// "starlight": "Star Light",
// "smokepatch": "Smoke Patch"
