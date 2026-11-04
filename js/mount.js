import { els } from "./state.js";
import { screensFor, epicsFor } from "./registry.js";
import { screenTemplates } from "./generated/templates.js";

const EMPTY_HTML = `
  <div class="screen active" data-screen="empty">
    <div class="screen-code">
      <div class="phone-empty">
        <p class="phone-empty-label">Ready</p>
        <p class="phone-empty-hint">Add your first screen to start</p>
      </div>
    </div>
  </div>`;

const WEB_EMPTY_HTML = `
  <div class="web-empty">
    <p class="web-empty-label">Desktop</p>
    <p class="web-empty-hint">Add your first screen to start</p>
  </div>`;

function screenMarkup(id) {
  return `<div class="screen-code">${screenTemplates[id] || ""}</div>`;
}

function flowScreens(surfaceId, flowId) {
  return screensFor(surfaceId, flowId).map((screen) => ({ ...screen, flow: flowId }));
}

function mountFlow(host, screens, emptyHtml) {
  if (!host) return;
  if (!screens.length) {
    host.innerHTML = emptyHtml;
    return;
  }
  host.innerHTML = "";
  screens.forEach((screen, index) => {
    const el = document.createElement("div");
    el.className = "screen" + (index === 0 ? " active" : "");
    el.dataset.screen = screen.id;
    el.dataset.flow = screen.flow;
    el.innerHTML = screenMarkup(screen.id);
    host.appendChild(el);
  });
}

function mountMobileScreens() {
  const epics = Object.values(epicsFor("mobile"));
  const ideaScreens = epics.flatMap((epic) => flowScreens("mobile", epic.id));
  const currentScreens = epics
    .filter((epic) => epic.compareFlow)
    .flatMap((epic) => flowScreens("mobile", epic.compareFlow));
  mountFlow(els.phoneScreen, ideaScreens, EMPTY_HTML);
  mountFlow(els.oldPhoneScreen, currentScreens, EMPTY_HTML);
}

function mountWebsiteScreens() {
  const screens = Object.keys(epicsFor("website")).flatMap((epicId) => flowScreens("website", epicId));
  mountFlow(els.webScreen, screens, WEB_EMPTY_HTML);
}

export function mountScreens() {
  mountMobileScreens();
  mountWebsiteScreens();
}
