import { renderStudentDashboard } from "./views/studentDashboardView.js";
import { renderDailyPractice } from "./views/dailyView.js";
import { renderSkillTree } from "./views/skillTreeView.js";
import { renderSmartReviewSetup } from "./views/smartReviewView.js";
import { renderTeacherDashboard } from "./views/teacherDashboardView.js";

const routes = {
  "dashboard": renderStudentDashboard, // Point to studentDashboardView.js
  "daily": renderDailyPractice,
  "dailyPractice": renderDailyPractice,
  "skillTree": renderSkillTree,
  "smartReviewSetup": renderSmartReviewSetup,
  "teacherDashboard": renderTeacherDashboard
};

export function navigateTo(viewName, params = {}) {
  const viewport = document.getElementById("app-viewport");
  if (!viewport) return;

  const renderFn = routes[viewName] || routes["dashboard"];
  viewport.innerHTML = "";
  renderFn(viewport, params);
}
