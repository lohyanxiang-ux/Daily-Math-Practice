import { state } from "../../state.js";

let livePollInterval = null;
let isProjectorMode = false; // Suggestion 2: Anonymized leaderboard view toggle

// Deterministic Fun Alias Generator for Projector Mode
const ANONYMOUS_ALIASES = [
  "Clever Panda 🐼", "Swift Falcon 🦅", "Math Wizard 🧙‍♂️", "Brave Tiger 🐯",
  "Cosmic Otter 🦦", "Starlight Koala 🐨", "Quantum Dragon 🐉", "Laser Cheetah 🐆",
  "Golden Bear 🐻", "Solar Eagle 🦅", "Cyber Dolphin 🐬", "Turbo Fox 🦊"
];

function getAnonymizedName(email, index) {
  const hash = String(email).split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return ANONYMOUS_ALIASES[(hash + index) % ANONYMOUS_ALIASES.length];
}

export function renderLiveTabHTML(props) {
  const {
    selectedClass,
    classes,
    curriculum,
    students,
    activeSession,
    liveAttempts,
    onStartSession,
    onEndSession
  } = props;

  const isActive = activeSession && activeSession.status === "ACTIVE";

  // Filter students for the selected class
  const classStudents = students.filter(s => {
    const c = String(s.className || s.class || s.grade || "").trim();
    return selectedClass === "All" || c === selectedClass;
  });

  // ---------------------------------------------------------
  // MODE A: SETUP FORM (No Active Live Session)
  // ---------------------------------------------------------
  if (!isActive) {
    // Group skills by topic for multi-select checklist
    const skillsByTopic = {};
    curriculum.forEach(sk => {
      const topic = sk.topic || "General Topics";
      if (!skillsByTopic[topic]) skillsByTopic[topic] = [];
      skillsByTopic[topic].push(sk);
    });

    return `
      <div style="background: #ffffff; border-radius: 16px; padding: 24px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); max-width: 900px; margin: 0 auto;">
        
        <div style="display: flex; align-items: center; gap: 12px; border-bottom: 2px solid #f1f5f9; padding-bottom: 14px; margin-bottom: 20px;">
          <span style="font-size: 2rem;">📡</span>
          <div>
            <h3 style="font-size: 1.3rem; color: #0f172a; margin: 0; font-weight: 800;">Launch Teacher-Directed Live Practice</h3>
            <p style="color: #64748b; font-size: 0.88rem; margin: 2px 0 0 0;">Select the class and skill(s) you want your students to focus on right now in class.</p>
          </div>
        </div>

        <form id="form-start-live-session" style="display: flex; flex-direction: column; gap: 20px;">
          
          <!-- CLASS SELECTION -->
          <div>
            <label style="display: block; font-weight: 700; color: #334155; margin-bottom: 6px; font-size: 0.9rem;">1. Select Target Class:</label>
            <select id="live-select-class" style="width: 100%; max-width: 320px; padding: 10px 14px; border-radius: 10px; border: 1.5px solid #cbd5e1; font-weight: 700; font-size: 0.95rem; background: #fff; color: #0f172a;">
              ${classes.map(c => `<option value="${c}" ${c === selectedClass ? 'selected' : ''}>Class ${c}</option>`).join('')}
            </select>
          </div>

          <!-- MULTI-SKILL SELECTION (Grouped by Topic) -->
          <div>
            <label style="display: block; font-weight: 700; color: #334155; margin-bottom: 6px; font-size: 0.9rem;">
              2. Select Skill(s) to Practice (Choose 1 to 3):
            </label>

            <div style="max-height: 320px; overflow-y: auto; border: 1.5px solid #cbd5e1; border-radius: 12px; padding: 16px; background: #f8fafc; display: flex; flex-direction: column; gap: 16px;">
              ${Object.entries(skillsByTopic).map(([topicName, skills]) => `
                <div>
                  <div style="font-weight: 800; color: #1e293b; font-size: 0.88rem; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">
                    📂 ${topicName}
                  </div>
                  <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 8px;">
                    ${skills.map(sk => `
                      <label style="display: flex; align-items: center; gap: 8px; background: #ffffff; padding: 8px 12px; border-radius: 8px; border: 1px solid #e2e8f0; cursor: pointer; font-size: 0.85rem; font-weight: 600;">
                        <input type="checkbox" class="chk-live-skill" value="${sk.generatorPath}" style="width: 16px; height: 16px; accent-color: #2563eb;" />
                        <span>${sk.title}</span>
                      </label>
                    `).join('')}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- LAUNCH BUTTON -->
          <div style="display: flex; justify-content: flex-end; margin-top: 10px;">
            <button type="submit" id="btn-launch-live" style="background: #16a34a; color: #ffffff; border: none; padding: 14px 28px; border-radius: 12px; font-weight: 800; font-size: 1rem; cursor: pointer; box-shadow: 0 4px 12px rgba(22, 163, 74, 0.25); transition: transform 0.15s;">
              🚀 Start Live Class Practice
            </button>
          </div>

        </form>

      </div>
    `;
  }

  // ---------------------------------------------------------
  // MODE B: LIVE MONITORING DASHBOARD (Active Session)
  // ---------------------------------------------------------

  // Process live student attempt metrics
  const studentMetrics = classStudents.map((st, idx) => {
    const emailKey = (st.email || st.id || "").toLowerCase();
    const stAttempts = liveAttempts.filter(a => (a.studentEmail || "").toLowerCase() === emailKey);
    
    let totalAttempted = stAttempts.length;
    let totalCorrect = stAttempts.filter(a => a.isCorrect).length;
    let consecutiveWrong = 0;
    let highHintCount = 0;
    let latestScore = stAttempts.length > 0 ? stAttempts[stAttempts.length - 1].newScore : 0;
    let latestSkillPath = stAttempts.length > 0 ? stAttempts[stAttempts.length - 1].generatorPath : "";

    // Count consecutive wrong answers from latest attempts
    for (let i = stAttempts.length - 1; i >= 0; i--) {
      if (!stAttempts[i].isCorrect) consecutiveWrong++;
      else break;
    }

    // Check hint reliance
    stAttempts.forEach(a => {
      if (a.hintsUsed >= 3) highHintCount++;
    });

    // Check stalled time (no attempt in last 3 minutes)
    const lastAttemptTime = stAttempts.length > 0 ? new Date(stAttempts[stAttempts.length - 1].timestamp).getTime() : 0;
    const isStalled = totalAttempted > 0 && (Date.now() - lastAttemptTime > 3 * 60 * 1000);

    // Determine Intervention Priority Alert
    let alertLevel = null; // "RED", "YELLOW", "ORANGE", null
    let alertMsg = "";

    if (consecutiveWrong >= 2) {
      alertLevel = "RED";
      alertMsg = `🚨 ${consecutiveWrong} Wrong Row`;
    } else if (highHintCount >= 2) {
      alertLevel = "YELLOW";
      alertMsg = `💡 Heavy Hints (${highHintCount})`;
    } else if (isStalled) {
      alertLevel = "ORANGE";
      alertMsg = `⏱️ Stalled (>3m)`;
    }

    const displayName = isProjectorMode ? getAnonymizedName(emailKey, idx) : (st.displayName || st.name || "Student");

    return {
      student: st,
      displayName,
      emailKey,
      totalAttempted,
      totalCorrect,
      latestScore,
      latestSkillPath,
      alertLevel,
      alertMsg,
      priority: alertLevel === "RED" ? 3 : (alertLevel === "YELLOW" ? 2 : (alertLevel === "ORANGE" ? 1 : 0))
    };
  });

  // Sort students: Needing intervention at the top!
  studentMetrics.sort((a, b) => b.priority - a.priority || b.latestScore - a.latestScore);

  const activeSkillsList = activeSession.skillPaths.map(p => {
    const sk = curriculum.find(c => c.generatorPath === p);
    return sk ? sk.title : p;
  }).join(", ");

  return `
    <div style="display: flex; flex-direction: column; gap: 16px;">
      
      <!-- ACTIVE CONTROL HEADER BAR -->
      <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; background: #1e293b; color: #ffffff; padding: 18px 24px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); gap: 12px;">
        <div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: #22c55e; animation: pulse 1.5s infinite;"></span>
            <h3 style="font-size: 1.25rem; margin: 0; font-weight: 800; color: #ffffff;">LIVE PRACTICE: Class ${activeSession.className}</h3>
          </div>
          <p style="color: #94a3b8; font-size: 0.88rem; margin: 4px 0 0 0;">
            Assigned Skills: <strong style="color: #60a5fa;">${activeSkillsList}</strong>
          </p>
        </div>

        <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
          
          <!-- SUGGESTION 2: PROJECTOR / LEADERBOARD MODE TOGGLE -->
          <button id="btn-toggle-projector" style="padding: 10px 18px; border-radius: 10px; border: 1.5px solid ${isProjectorMode ? '#8b5cf6' : '#475569'}; font-weight: 800; background: ${isProjectorMode ? '#7c3aed' : '#334155'}; color: #ffffff; cursor: pointer; display: flex; align-items: center; gap: 8px;">
            ${isProjectorMode ? '📽️ Projector Mode: ON (Names Anonymized)' : '👁️ Projector Mode: OFF'}
          </button>

          <!-- SUGGESTION 3: END SESSION (WITH SMART AUTOSAVE) -->
          <button id="btn-stop-live-session" style="background: #dc2626; color: #ffffff; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 10px rgba(220, 38, 38, 0.3);">
            🛑 End Live Session
          </button>
        </div>
      </div>

      <!-- LIVE MONITOR STUDENT CARDS GRID -->
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr)); gap: 14px;">
        ${studentMetrics.map(m => {
          let cardBg = "#ffffff";
          let borderCss = "1px solid #e2e8f0";
          
          if (m.alertLevel === "RED") { cardBg = "#fff1f2"; borderCss = "2px solid #f43f5e"; }
          else if (m.alertLevel === "YELLOW") { cardBg = "#fffbeb"; borderCss = "2px solid #f59e0b"; }
          else if (m.alertLevel === "ORANGE") { cardBg = "#fff7ed"; borderCss = "2px solid #fb923c"; }

          return `
            <div style="background: ${cardBg}; border: ${borderCss}; border-radius: 14px; padding: 16px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 4px rgba(0,0,0,0.03);">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                  <span style="font-weight: 800; color: #0f172a; font-size: 1rem;">${m.displayName}</span>
                  ${m.alertMsg ? `<span style="background: #ffffff; padding: 2px 8px; border-radius: 6px; font-size: 0.74rem; font-weight: 800; border: 1px solid #cbd5e1;">${m.alertMsg}</span>` : ''}
                </div>

                <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 10px;">
                  <span style="font-size: 0.82rem; color: #64748b; font-weight: 600;">Live Mastery:</span>
                  <span style="font-size: 1.2rem; font-weight: 900; color: #2563eb;">${m.latestScore} <span style="font-size: 0.75rem; color: #64748b;">/100</span></span>
                </div>

                <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 6px; font-size: 0.8rem; color: #475569;">
                  <span>Attempted: <strong>${m.totalAttempted}</strong></span>
                  <span>Correct: <strong>${m.totalCorrect}</strong></span>
                </div>
              </div>

              <div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid rgba(0,0,0,0.06); font-size: 0.75rem; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${m.latestSkillPath ? `Practicing: ${curriculum.find(c => c.generatorPath === m.latestSkillPath)?.title || m.latestSkillPath}` : 'Awaiting first answer...'}
              </div>
            </div>
          `;
        }).join('')}
      </div>

    </div>

    <style>
      @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
    </style>
  `;
}

/**
 * Event Binding & Live Polling Initializer
 */
export function initLiveTabEvents(container, props) {
  const { onStartSession, onEndSession, onToggleProjector } = props;

  // Form Submission -> Start Session
  const form = container.querySelector("#form-start-live-session");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const selectedClass = container.querySelector("#live-select-class")?.value;
      const checkedBoxes = Array.from(container.querySelectorAll(".chk-live-skill:checked")).map(cb => cb.value);

      if (!checkedBoxes || checkedBoxes.length === 0) {
        alert("Please select at least 1 skill to assign for live practice.");
        return;
      }
      if (checkedBoxes.length > 3) {
        alert("Please select a maximum of 3 skills for live practice.");
        return;
      }

      onStartSession(selectedClass, checkedBoxes);
    });
  }

  // End Session Button
  container.querySelector("#btn-stop-live-session")?.addEventListener("click", () => {
    if (confirm("End live practice session? Assigned skills will automatically be saved as 'Current' in teacher tags.")) {
      onEndSession();
    }
  });

  // Toggle Projector Mode Button
  container.querySelector("#btn-toggle-projector")?.addEventListener("click", () => {
    isProjectorMode = !isProjectorMode;
    if (typeof onToggleProjector === "function") onToggleProjector(isProjectorMode);
  });
}
