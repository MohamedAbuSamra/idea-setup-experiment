import { bindStudioTemplate } from "./studio-template/studio-template.js";
import { bindStudioDashboard } from "./studio-dashboard/studio-dashboard.js";

export { dashboardSetupScreens } from "./screens.js";

export function bindDashboardSetup() {
  bindStudioTemplate();
  bindStudioDashboard();
}
