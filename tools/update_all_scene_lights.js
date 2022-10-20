// update all lights for a specific configuration, and unhide them.
const updates = canvas.scene.lights.map(i => ({
  _id: i.id,
  hidden: false,
  config: {
    animation: { type: "torch", speed: 1, intensity: 5 },
    color: "#FF00FF",
    dim: 15,
    bright: 7.5,
    darkness: { min: 0.35, max: 1 }
  }
}));
await canvas.scene.updateEmbeddedDocuments("AmbientLight", updates);
