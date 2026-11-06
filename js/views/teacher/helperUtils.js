import { state } from "../../state.js";
import { getMasteryMetadata } from "../../utils/masteryScoreEngine.js";

export function safeGetMasteryMetadata(score) {
  try {
    const meta = getMasteryMetadata(score);
    if (meta && meta.badgeCss) return meta;
  } catch (e) {
    console.warn("Mastery score metadata fallback:", e);
  }
  return {
    score: score || 0,
    tierName: "Unrated",
    badgeCss: "background: #f1f5f9; color: #64748b;"
  };
}

export function getStudentClass(st) {
  if (!st) return "Unassigned";
  const c = st.class || st.className || st.gradeClass;
  return (c && String(c).trim()) ? String(c).trim() : "Unassigned";
}

/**
 * Calculates default tag fallback when a skill has no saved tag in ClassSkillTags.
 * Resolves:
 * - skillLevel < classLevel   => "Past"
 * - skillLevel === classLevel => "Current"
 * - skillLevel > classLevel   => "Future"
 */
export function getAutoDefaultTag(skill, className) {
  if (!className || className === "All") return "Future";
  
  const classNumMatch = String(className).match(/\d+/);
  const skillYearMatch = String(skill.year || skill.level || "").match(/\d+/);

  if (classNumMatch && skillYearMatch) {
    const classLevel = parseInt(classNumMatch[0], 10);
    const skillLevel = parseInt(skillYearMatch[0], 10);

    if (skillLevel < classLevel) {
      return "Past";
    } else if (skillLevel === classLevel) {
      return "Current";
    } else {
      return "Future";
    }
  }

  return "Future";
}

export function findGeneratorFunction(path) {
  if (!path) return null;

  const generators = state.skillGenerators || window.skillGenerators || {};
  const clean = path.trim().replace(/\\/g, '/');
  const filename = clean.split('/').pop().replace(/\.js$/, '');

  if (typeof generators[clean] === 'function') return generators[clean];

  const withPrefix = clean.startsWith('js/questions/') ? clean : `js/questions/${clean}`;
  if (typeof generators[withPrefix] === 'function') return generators[withPrefix];

  const withJs = clean.endsWith('.js') ? clean : `${clean}.js`;
  if (typeof generators[withJs] === 'function') return generators[withJs];

  const withPrefixAndJs = withPrefix.endsWith('.js') ? withPrefix : `${withPrefix}.js`;
  if (typeof generators[withPrefixAndJs] === 'function') return generators[withPrefixAndJs];

  for (const key of Object.keys(generators)) {
    if (typeof generators[key] === 'function') {
      const keyFilename = key.split('/').pop().replace(/\.js$/, '');
      if (keyFilename === filename || key.endsWith(clean)) {
        return generators[key];
      }
    }
  }

  return null;
}

export function analyzeAtRiskStudents(filteredStudents, classMastery, curriculum) {
  const alerts = [];

  filteredStudents.forEach(st => {
    if (!st) return;
    const emailKey = (st.email || st.id || "").toLowerCase();
    const stMastery = emailKey ? (classMastery[emailKey] || {}) : {};
    
    Object.values(stMastery).forEach(m => {
      if (!m) return;
      if (m.totalAttempted >= 8 && m.score < 40) {
        const skillObj = curriculum.find(c => c.generatorPath === m.generatorPath);
        alerts.push({
          student: st.displayName || st.name || "Student",
          class: getStudentClass(st),
          type: "struggling",
          icon: "⚠️",
          message: `Struggling on <strong>${skillObj?.title || 'a skill'}</strong> (${m.score}/100 score, ${m.accuracy || 0}% accuracy after ${m.totalAttempted} attempts).`
        });
      }

      if (m.rollingHistory && Array.isArray(m.rollingHistory) && m.rollingHistory.length >= 5) {
        const hintHeavyAttempts = m.rollingHistory.filter(h => h && h.hints >= 2).length;
        if (hintHeavyAttempts / m.rollingHistory.length >= 0.6) {
          const skillObj = curriculum.find(c => c.generatorPath === m.generatorPath);
          alerts.push({
            student: st.displayName || st.name || "Student",
            class: getStudentClass(st),
            type: "hints",
            icon: "💡",
            message: `Relying heavily on step hints for <strong>${skillObj?.title || 'skills'}</strong>.`
          });
        }
      }
    });

    if (st.lastActive) {
      const daysInactive = Math.floor((new Date() - new Date(st.lastActive)) / (1000 * 60 * 60 * 24));
      if (daysInactive >= 5) {
        alerts.push({
          student: st.displayName || st.name || "Student",
          class: getStudentClass(st),
          type: "inactive",
          icon: "💤",
          message: `Inactive for <strong>${daysInactive} days</strong>. Skill scores are actively decaying.`
        });
      }
    }
  });

  return alerts;
}
