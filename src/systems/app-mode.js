/* global AFRAME, console, setTimeout, clearTimeout */

const AppModes = Object.freeze({ DEFAULT: "default", HUD: "hud" });
AFRAME.registerSystem("app-mode", {
  init() {
    console.log("init app mode system");
    this.setMode(AppModes.DEFAULT);
  },

  setMode(newMode) {
    if (Object.values(AppModes).includes(newMode) && newMode !== this.mode) {
      this.mode = newMode;
      this.el.emit("appmode-change", { mode: this.mode });
    }
  }
});

AFRAME.registerComponent("mode-responder-toggle", {
  multiple: true,
  schema: {
    mode: { type: "string" },
    invert: { type: "boolean", default: false }
  },

  init() {
    const AppModeSystem = this.el.sceneEl.systems["app-mode"];
    this.el.sceneEl.addEventListener("appmode-change", e => {
      this.updateComponentState(e.detail.mode === this.data.mode);
    });
    this.updateComponentState(AppModeSystem.mode === this.data.mode);
  },

  updateComponentState(isModeActive) {
    const componentName = this.id;
    this.el.components[componentName][isModeActive !== this.data.invert ? "play" : "pause"]();
  }
});

AFRAME.registerComponent("mode-responder-hudstate", {
  init() {
    this.el.sceneEl.addEventListener("appmode-change", e => {
      switch (e.detail.mode) {
        case AppModes.HUD:
          this.el.setAttribute("material", "color", "green");
          this.el.setAttribute("scale", "2 1 1");
          break;
        case AppModes.DEFAULT:
          this.el.setAttribute("material", "color", "white");
          this.el.setAttribute("scale", "0.3 0.3 1");
          break;
      }
    });
  }
});

AFRAME.registerComponent("hud-detector", {
  dependencies: ["raycaster"],

  init() {
    const AppModeSystem = this.el.sceneEl.systems["app-mode"];

    let hoverTimeout;
    this.el.addEventListener("raycaster-intersection", e => {
      console.log("raycast hit", e.detail.els, e.detail.intersections);
      hoverTimeout = setTimeout(() => {
        AppModeSystem.setMode(AppModes.HUD);
      }, 500);
    });
    this.el.addEventListener("raycaster-intersection-cleared", e => {
      console.log("raycast clear", e.detail.clearedEls);
      AppModeSystem.setMode(AppModes.DEFAULT);
      clearTimeout(hoverTimeout);
    });
  }
});