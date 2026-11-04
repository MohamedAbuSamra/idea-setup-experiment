import { mobileSurface } from "../features/mobile/surface.js";
import { websiteSurface } from "../features/website/surface.js";
import { mobileEpics } from "../features/mobile/epics.js";
import { websiteEpics } from "../features/website/epics.js";
import { signupScreens } from "../features/mobile/signup/screens.js";
import { signupCurrentScreens } from "../features/mobile/signup-current/screens.js";
import { dashboardSetupScreens } from "../features/website/dashboard-setup/screens.js";

export const SURFACES = {
  [mobileSurface.id]: mobileSurface,
  [websiteSurface.id]: websiteSurface,
};

export const EPICS = {
  mobile: mobileEpics,
  website: websiteEpics,
};

export const EPIC_SCREENS = {
  mobile: {
    signup: signupScreens,
    "signup-current": signupCurrentScreens,
  },
  website: {
    "dashboard-setup": dashboardSetupScreens,
  },
};

export function epicsFor(surfaceId) {
  return EPICS[surfaceId] || {};
}

export function firstEpicId(surfaceId) {
  return Object.keys(epicsFor(surfaceId))[0] || "";
}

export function screensFor(surfaceId, epicId) {
  return EPIC_SCREENS[surfaceId]?.[epicId] || [];
}
