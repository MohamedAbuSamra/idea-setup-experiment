import { state, els } from "../../js/state.js";
import { SURFACES, epicsFor, firstEpicId } from "../../js/registry.js";
import {
  activeFlow,
  activeEpic,
  currentScreenId,
  routeHash,
  isWebsite,
  isDualJourney,
  setJourneySolo,
  stepJourney,
  stepBoth,
  playDemo,
  pauseDemo,
  setupAutoplay,
  onRouteChange,
} from "../../js/nav.js";

const ELEMENT_IDS = [
  "epicChips",
  "sidebarEpicName",
  "sidebarEpicDesc",
  "scopeHint",
  "flowProgress",
  "progressFill",
  "progressTrack",
  "oldFlowProgress",
  "oldProgressFill",
  "oldProgressTrack",
  "phoneScreen",
  "oldPhoneScreen",
  "journeyRow",
  "soloOldBtn",
  "soloNewBtn",
  "undoSoloBtn",
  "phoneColumn",
  "webColumn",
  "webScreen",
  "webUrl",
  "surfaceSwitch",
  "scopeEmptyPhone",
  "demoBar",
  "btnPlay",
  "btnPause",
  "autoplayHint",
  "autoplaySpeed",
  "prevBtn",
  "nextBtn",
];

export function cacheElements() {
  ELEMENT_IDS.forEach((id) => {
    els[id] = document.getElementById(id);
  });
}

export function applySurfaceClass() {
  const root = document.documentElement.classList;
  root.toggle("surface-mobile", state.surface === "mobile");
  root.toggle("surface-website", state.surface === "website");
  root.toggle("journey-solo-old", state.journeySolo === "old");
  root.toggle("journey-solo-new", state.journeySolo === "new");
  root.toggle("journey-dual", isDualJourney());
}

function renderEpicChips() {
  const epics = epicsFor(state.surface);
  const ids = Object.keys(epics);
  if (!els.epicChips) return;
  if (!ids.length) {
    els.epicChips.innerHTML = `<span class="chip chip-muted">No epics yet</span>`;
    return;
  }
  els.epicChips.innerHTML = ids
    .map((id) => {
      const epic = epics[id];
      const on = id === state.epic ? " active" : "";
      const screen = id === state.epic ? currentScreenId() : "";
      return `<a class="chip ${epic.chipClass || ""}${on}" data-epic="${id}" href="${routeHash(state.surface, id, screen)}">${epic.label}</a>`;
    })
    .join("");
}

function epicDescription(epic) {
  if (state.journeySolo === "old") return "Current journey only";
  if (state.journeySolo === "new") return "New idea only";
  return epic?.description || "Add an epic for this surface to start.";
}

function scopeHintText(flow) {
  const label = SURFACES[state.surface]?.label || "";
  if (!flow.length) return `${label} — no steps yet`;
  if (!isDualJourney()) return `${label} · ${flow.length} steps`;
  if (state.journeySolo === "old") return `${label} · current journey`;
  if (state.journeySolo === "new") return `${label} · new idea`;
  return `${label} · current vs idea`;
}

function syncJourneyButtons() {
  const dual = isDualJourney();
  if (els.journeyRow) els.journeyRow.hidden = !dual;
  els.soloOldBtn?.classList.toggle("is-active", state.journeySolo === "old");
  els.soloNewBtn?.classList.toggle("is-active", state.journeySolo === "new");
  if (els.undoSoloBtn) els.undoSoloBtn.hidden = !state.journeySolo;
  document.querySelectorAll(".phone-label[data-solo]").forEach((btn) => {
    btn.classList.toggle("is-active", state.journeySolo === btn.dataset.solo);
  });
  document.querySelectorAll(".phone-stage[data-journey]").forEach((stage) => {
    const back = stage.querySelector(".phone-back");
    if (back) back.hidden = state.journeySolo !== stage.dataset.journey;
  });
}

function syncSurfaceSwitch() {
  els.surfaceSwitch?.querySelectorAll("[data-surface]").forEach((btn) => {
    const id = btn.dataset.surface;
    const on = id === state.surface;
    btn.classList.toggle("active", on);
    btn.setAttribute("aria-selected", String(on));
    btn.setAttribute("href", routeHash(id, on ? state.epic : firstEpicId(id), on ? currentScreenId() : ""));
  });
}

function syncScenario() {
  document.documentElement.classList.toggle("scenario-error", state.scenario === "error");
  document.querySelectorAll("#demoBar [data-scenario]").forEach((btn) => {
    const on = btn.dataset.scenario === state.scenario;
    btn.classList.toggle("active", on);
    btn.setAttribute("aria-pressed", String(on));
  });
}

export function updateChips() {
  const epic = activeEpic();
  const flow = activeFlow();
  const empty = !flow.length;
  const mobile = !isWebsite();
  renderEpicChips();
  if (els.sidebarEpicName) els.sidebarEpicName.textContent = epic?.label || "No epic yet";
  if (els.sidebarEpicDesc) els.sidebarEpicDesc.textContent = epicDescription(epic);
  if (els.scopeHint) els.scopeHint.textContent = scopeHintText(flow);
  syncJourneyButtons();
  syncSurfaceSwitch();
  syncScenario();
  if (els.phoneColumn) els.phoneColumn.hidden = !mobile || empty;
  if (els.webColumn) els.webColumn.hidden = mobile;
  if (els.scopeEmptyPhone) els.scopeEmptyPhone.hidden = !mobile || !empty;
  syncDemoControls(empty);
}

function visibleDemoControls() {
  const requested = activeEpic()?.demoControls || [];
  return requested.filter((id) => id !== "scenario" || state.journeySolo !== "old");
}

function autoplayHintText() {
  if (!isDualJourney()) return activeEpic()?.autoplayHint || "Walks the screens in order";
  if (state.journeySolo === "old") return "Walks the current journey";
  if (state.journeySolo === "new") return "Walks the new idea";
  return "Walks both phones through the steps";
}

function syncDemoControls(empty) {
  const controls = visibleDemoControls();
  document.querySelectorAll("[data-demo-control]").forEach((line) => {
    line.hidden = !controls.includes(line.dataset.demoControl);
  });
  if (els.autoplayHint) els.autoplayHint.textContent = autoplayHintText();
  if (els.demoBar) els.demoBar.hidden = empty || !controls.length;
}

export function fitPreview() {
  if (isWebsite()) {
    fitToStage(els.webColumn, "--web-scale", 0.25);
    return;
  }
  if (isDualJourney()) {
    fitDualPhones();
    return;
  }
  fitToStage(els.phoneColumn, "--phone-scale", 0.32);
}

function fitDualPhones() {
  const stage = document.querySelector(".stage-inner");
  const sample = document.querySelector(".phone-stage .phone");
  if (!stage || !sample) return;
  document.documentElement.style.setProperty("--phone-scale", "1");
  const cellWidth = state.journeySolo ? stage.clientWidth : stage.clientWidth / 2;
  const margin = 32;
  const pills = 48;
  const scale = Math.min(
    (cellWidth - margin) / sample.offsetWidth,
    (stage.clientHeight - margin - pills) / sample.offsetHeight
  );
  document.documentElement.style.setProperty("--phone-scale", String(Math.max(0.28, Math.min(1, scale))));
}

function fitToStage(column, cssVar, minScale) {
  const stage = document.querySelector(".stage-inner");
  if (!stage || !column || column.hidden) return;
  document.documentElement.style.setProperty(cssVar, "1");
  const margin = 16;
  const scale = Math.min(
    (stage.clientWidth - margin) / column.offsetWidth,
    (stage.clientHeight - margin) / column.offsetHeight
  );
  document.documentElement.style.setProperty(cssVar, String(Math.max(minScale, scale)));
}

function isTyping() {
  const active = document.activeElement;
  return /^(INPUT|TEXTAREA|SELECT)$/.test(active?.tagName || "") || Boolean(active?.isContentEditable);
}

function onKeydown(event) {
  if (isTyping()) return;
  if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
    event.preventDefault();
    stepBoth(event.key === "ArrowRight" ? 1 : -1);
  }
  if (event.key === " ") {
    event.preventDefault();
    if (state.isPlaying) pauseDemo();
    else playDemo();
  }
}

export function bindEvents() {
  window.addEventListener("hashchange", onRouteChange);
  window.addEventListener("popstate", onRouteChange);
  window.addEventListener("resize", fitPreview);
  document.addEventListener("keydown", onKeydown);

  document.querySelectorAll("#demoBar [data-scenario]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.scenario = btn.dataset.scenario;
      syncScenario();
    });
  });
  els.btnPlay.addEventListener("click", playDemo);
  els.btnPause.addEventListener("click", pauseDemo);
  els.autoplaySpeed.addEventListener("change", setupAutoplay);

  els.soloOldBtn?.addEventListener("click", () => setJourneySolo("old"));
  els.soloNewBtn?.addEventListener("click", () => setJourneySolo("new"));
  els.undoSoloBtn?.addEventListener("click", () => setJourneySolo(null));
  document.querySelectorAll(".phone-label[data-solo]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const which = btn.dataset.solo;
      setJourneySolo(state.journeySolo === which ? null : which);
    });
  });
  document.querySelectorAll(".phone-back[data-back]").forEach((btn) => {
    btn.addEventListener("click", () => setJourneySolo(null));
  });
  document.querySelectorAll("[data-step-journey]").forEach((btn) => {
    btn.addEventListener("click", () => stepJourney(btn.dataset.stepJourney, Number(btn.dataset.stepDelta)));
  });
  els.prevBtn?.addEventListener("click", () => stepBoth(-1));
  els.nextBtn?.addEventListener("click", () => stepBoth(1));
}
