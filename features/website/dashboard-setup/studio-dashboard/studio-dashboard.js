import { studioTemplateName } from "../shared/studio-state.js";

export function bindStudioDashboard() {
  const label = document.getElementById("studioDashboardTemplate");
  if (label) label.textContent = studioTemplateName();
}
