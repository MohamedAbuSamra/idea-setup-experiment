import { goToId } from "./nav.js";
import { bindDashboardSetup } from "../features/website/dashboard-setup/index.js";

export function bindActiveScreen() {
  document.querySelectorAll("[data-goto]").forEach((el) => {
    el.onclick = (event) => {
      event.preventDefault();
      goToId(el.dataset.goto, { host: el.closest(".phone-screen") });
    };
  });
  bindDashboardSetup();
}
