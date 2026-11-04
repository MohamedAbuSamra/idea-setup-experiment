import { hooks } from "./state.js";
import { applyRoute, updatePlayState } from "./nav.js";
import { mountScreens } from "./mount.js";
import { bindActiveScreen } from "./bind.js";
import { shellHtml } from "./generated/templates.js";
import {
  cacheElements,
  bindEvents,
  updateChips,
  fitPreview,
  applySurfaceClass,
} from "../features/shell/shell.js";

hooks.bindActiveScreen = bindActiveScreen;
hooks.updateChrome = updateChips;
hooks.fitPreview = fitPreview;
hooks.applySurfaceClass = applySurfaceClass;

function init() {
  document.getElementById("app").innerHTML = shellHtml;
  cacheElements();
  mountScreens();
  bindEvents();
  applyRoute();
  updatePlayState();
}

init();
