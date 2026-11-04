import { state, els, hooks } from "./state.js";
import {
  SURFACES,
  epicsFor,
  firstEpicId,
  screensFor,
} from "./registry.js";

export function isWebsite() {
  return state.surface === "website";
}

export function activeEpic() {
  return epicsFor(state.surface)[state.epic] || null;
}

export function activeFlow() {
  return screensFor(state.surface, state.epic);
}

function compareFlowId() {
  return isWebsite() ? "" : activeEpic()?.compareFlow || "";
}

export function oldFlow() {
  const id = compareFlowId();
  return id ? screensFor("mobile", id) : [];
}

export function isDualJourney() {
  return Boolean(compareFlowId());
}

export function isComparing() {
  return isDualJourney() && !state.journeySolo;
}

function isSoloOld() {
  return isDualJourney() && state.journeySolo === "old";
}

export function previewRoot() {
  return isWebsite() ? els.webScreen : els.phoneScreen;
}

export function currentScreenId() {
  return activeFlow()[state.current]?.id || "";
}

export function routeHash(surface, epic, screen) {
  const parts = [surface, epic];
  if (screen) parts.push(screen);
  return `#/${parts.join("/")}`;
}

export function parseRoute() {
  const raw = (window.location.hash || "").replace(/^#\/?/, "").trim();
  const parts = raw.split("/").filter(Boolean);
  let surface = parts[0];
  let epic = parts[1];
  const screen = parts[2] || "";
  if (!SURFACES[surface]) surface = "mobile";
  if (!epicsFor(surface)[epic]) epic = firstEpicId(surface) || "";
  const flow = screensFor(surface, epic);
  let index = screen ? flow.findIndex((step) => step.id === screen) : 0;
  if (index < 0) index = 0;
  return { surface, epic, index };
}

export function writeRoute(mode = "replace") {
  const hash = routeHash(state.surface, state.epic, currentScreenId());
  if (window.location.hash === hash) return;
  if (mode === "push") history.pushState(null, "", hash);
  else history.replaceState(null, "", hash);
}

function routeMatchesState(route) {
  return state.surface === route.surface
    && state.epic === route.epic
    && state.current === route.index;
}

function showFirstSteps(index, oldIndex) {
  goTo(index, { fromRoute: true, skipBind: isDualJourney() });
  if (isDualJourney()) goToOld(oldIndex, { fromRoute: true });
}

export function applyRoute() {
  const route = parseRoute();
  const switched = state.surface !== route.surface || state.epic !== route.epic;
  state.surface = route.surface;
  state.epic = route.epic;
  if (switched) {
    pauseDemo();
    state.journeySolo = null;
    state.oldCurrent = 0;
  }
  hooks.applySurfaceClass();
  showFirstSteps(route.index, state.oldCurrent);
  writeRoute("replace");
  if (switched) hooks.fitPreview();
}

export function onRouteChange() {
  if (routeMatchesState(parseRoute())) return;
  applyRoute();
}

export function updatePlayState() {
  if (!els.btnPlay || !els.btnPause) return;
  els.btnPlay.classList.toggle("active", state.isPlaying);
  els.btnPlay.setAttribute("aria-pressed", String(state.isPlaying));
  els.btnPause.classList.toggle("active", !state.isPlaying);
  els.btnPause.setAttribute("aria-pressed", String(!state.isPlaying));
}

export function playDemo() {
  state.isPlaying = true;
  setupAutoplay();
  updatePlayState();
}

export function pauseDemo() {
  state.isPlaying = false;
  clearInterval(state.autoplayTimer);
  updatePlayState();
}

function nextIndex(index, length) {
  return index < length - 1 ? index + 1 : 0;
}

export function setupAutoplay() {
  clearInterval(state.autoplayTimer);
  if (!state.isPlaying || !activeFlow().length) return;
  const seconds = Number(els.autoplaySpeed.value);
  state.autoplayTimer = setInterval(() => {
    if (isComparing()) {
      goTo(nextIndex(state.current, activeFlow().length), { skipBind: true, skipChrome: true });
      goToOld(nextIndex(state.oldCurrent, oldFlow().length));
      return;
    }
    if (isSoloOld()) {
      goToOld(nextIndex(state.oldCurrent, oldFlow().length));
      return;
    }
    goTo(nextIndex(state.current, activeFlow().length));
  }, seconds * 1000);
}

function showPhoneStep(host, flowId, stepId) {
  if (!host) return;
  host.querySelectorAll(".screen").forEach((el) => {
    el.classList.toggle("active", el.dataset.flow === flowId && el.dataset.screen === stepId);
  });
}

function isOldHost(host) {
  return Boolean(
    host && els.oldPhoneScreen && (host === els.oldPhoneScreen || els.oldPhoneScreen.contains(host))
  );
}

function setBar(label, fill, text, ratio) {
  if (label) label.textContent = text;
  if (fill) fill.style.width = `${ratio * 100}%`;
}

function updateProgress() {
  const flow = activeFlow();
  const old = oldFlow();
  const comparing = isComparing();
  const soloOld = isSoloOld();
  const showOldBar = comparing || soloOld;
  const showNewBar = !soloOld;

  if (els.oldFlowProgress) els.oldFlowProgress.hidden = !showOldBar;
  if (els.oldProgressTrack) els.oldProgressTrack.hidden = !showOldBar;
  if (els.flowProgress) els.flowProgress.hidden = !showNewBar;
  if (els.progressTrack) els.progressTrack.hidden = !showNewBar;

  const prefix = isDualJourney() ? "Idea " : "";
  setBar(
    els.flowProgress,
    els.progressFill,
    flow.length ? `${prefix}${state.current + 1} / ${flow.length}` : "0 / 0",
    flow.length ? (state.current + 1) / flow.length : 0
  );
  if (showOldBar && old.length) {
    setBar(
      els.oldFlowProgress,
      els.oldProgressFill,
      `Current ${state.oldCurrent + 1} / ${old.length}`,
      (state.oldCurrent + 1) / old.length
    );
  }

  const atStart = soloOld ? state.oldCurrent === 0 : state.current === 0;
  const atEnd = soloOld ? state.oldCurrent >= old.length - 1 : state.current >= flow.length - 1;
  if (els.prevBtn) els.prevBtn.disabled = comparing ? atStart && state.oldCurrent === 0 : atStart;
  if (els.nextBtn) {
    els.nextBtn.disabled = comparing ? atEnd && state.oldCurrent >= old.length - 1 : atEnd;
  }
  syncPhoneSteppers(old, flow);
}

function syncPhoneSteppers(old, flow) {
  document.querySelectorAll("[data-step-journey]").forEach((btn) => {
    const which = btn.dataset.stepJourney;
    const delta = Number(btn.dataset.stepDelta);
    const atStart = which === "old" ? state.oldCurrent === 0 : state.current === 0;
    const atEnd = which === "old"
      ? !old.length || state.oldCurrent >= old.length - 1
      : !flow.length || state.current >= flow.length - 1;
    btn.disabled = delta < 0 ? atStart : atEnd;
  });
}

function refreshAfterGo(opts = {}) {
  if (!opts.skipBind) {
    try {
      hooks.bindActiveScreen();
    } catch (err) {
      console.error("bindActiveScreen failed", err);
    }
  }
  if (!opts.fromRoute) writeRoute("replace");
  if (!opts.skipChrome) {
    updateProgress();
    hooks.updateChrome();
    requestAnimationFrame(() => hooks.fitPreview());
  }
}

export function goTo(index, opts = {}) {
  const flow = activeFlow();
  if (!flow.length) {
    state.current = 0;
    updateProgress();
    hooks.updateChrome();
    if (!opts.fromRoute) writeRoute("replace");
    requestAnimationFrame(() => hooks.fitPreview());
    return;
  }

  state.current = Math.max(0, Math.min(flow.length - 1, index));
  const step = flow[state.current];
  showPhoneStep(previewRoot(), state.epic, step.id);
  if (els.webUrl && step.url) els.webUrl.textContent = step.url;
  refreshAfterGo(opts);
}

export function goToOld(index, opts = {}) {
  const flow = oldFlow();
  if (!flow.length || !els.oldPhoneScreen) return;
  state.oldCurrent = Math.max(0, Math.min(flow.length - 1, index));
  showPhoneStep(els.oldPhoneScreen, compareFlowId(), flow[state.oldCurrent].id);
  refreshAfterGo({ ...opts, fromRoute: true });
}

export function setJourneySolo(which) {
  if (!isDualJourney() && which) return;
  state.journeySolo = which || null;
  hooks.applySurfaceClass();
  updateProgress();
  hooks.updateChrome();
  requestAnimationFrame(() => hooks.fitPreview());
}

export function stepJourney(which, delta) {
  if (which === "old") {
    goToOld(state.oldCurrent + delta);
    return;
  }
  goTo(state.current + delta);
}

function clampStep(index, length, delta) {
  return Math.max(0, Math.min(length - 1, index + delta));
}

export function stepBoth(delta) {
  if (isSoloOld()) {
    goToOld(state.oldCurrent + delta);
    return;
  }
  if (!isComparing()) {
    goTo(state.current + delta);
    return;
  }
  goTo(clampStep(state.current, activeFlow().length, delta), { skipBind: true, skipChrome: true });
  goToOld(clampStep(state.oldCurrent, oldFlow().length, delta), { skipBind: true, skipChrome: true });
  refreshAfterGo();
}

function activateLooseScreen(host, id) {
  const el = host?.querySelector(`.screen[data-screen="${id}"]`);
  if (!el) return;
  el.parentElement?.querySelectorAll(".screen").forEach((screen) => screen.classList.remove("active"));
  el.classList.add("active");
}

export function goToId(id, opts = {}) {
  const host = opts.host;
  if (isOldHost(host)) {
    const oldIndex = oldFlow().findIndex((step) => step.id === id);
    if (oldIndex >= 0) goToOld(oldIndex);
    else activateLooseScreen(els.oldPhoneScreen, id);
    return;
  }
  const index = activeFlow().findIndex((step) => step.id === id);
  if (index >= 0) {
    goTo(index);
    return;
  }
  activateLooseScreen(host || previewRoot(), id);
}
