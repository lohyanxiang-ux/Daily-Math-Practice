import { renderDashboard } from "./views/dashboardView.js";
import { renderDailyPractice } from "./views/dailyView.js";

const routes = {
  dashboard: renderDashboard,
  daily: renderDailyPractice
};

export function navigateTo(viewName, params = {}) {
  const viewport = document.getElementById("app-viewport");
  if (!viewport || !routes[viewName]) return;

  viewport.innerHTML = ""; // Clear active view
  routes[viewName](viewport, params); // Render target view
}
