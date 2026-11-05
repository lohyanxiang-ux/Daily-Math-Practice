import { state } from "../state.js";
import { getStudentClass, getAutoDefaultTag } from "./teacher/helperUtils.js";
import { renderOverviewTabHTML } from "./teacher/overviewTab.js";
import { renderTaggingTabHTML, initTaggingTabEvents } from "./teacher/taggingTab.js";
import { renderLiveTabHTML, initLiveTabEvents } from "./teacher/liveTab.js";
import { renderStudentDrawerHTML, openStudentDrawer } from "./teacher/studentDrawer.js";
import { renderQuestionPreviewModalHTML, initQuestionPreviewModal } from "./teacher/questionPreviewModal.js";

const DEFAULT_API_URL = "https://script.google.com/macros/s/AKfycbwEsVnKapmwUFuv0vyG1wFvyAXoFKQMrpsNxibUqYh891PHXzFgmBThnT62lGoEPo_xiQ/exec";

function getApiUrl() {
  let apiUrl = state.apiUrl || 
               state.config?.apiUrl || 
               state.backendUrl || 
               state.scriptUrl || 
               window.APP_CONFIG?.apiUrl || 
               window.API_URL || 
               localStorage.getItem("math_app_api_url") || 
               DEFAULT_API_URL;
  if (apiUrl && !apiUrl.startsWith("http://") && !apiUrl.startsWith("https://")) {
    apiUrl = "https://" + apiUrl;
  }
  return apiUrl;
}

function cleanClassStr(c) {
  return String(c || "").trim().toLowerCase().replace(/^class\s*/i, "");
}

export function renderTeacherDashboard(container, onLogout) {
  if (!container) return;

  const globalShellNav = document.querySelector(".top-nav");
  if (globalShellNav) globalShellNav.style.display = "none";

  const teacherData = state.teacherData || {};
  const students = teacherData.students || [];
  const classMastery = teacherData.classMastery || {};
  const classSkillTags = teacherData.classSkillTags || {};
  const curriculum = state.curriculum || [];
  const currentUser = state.currentUser || {};

  const teacherName = currentUser.displayName || currentUser.name || state.user?.name || "Teacher Account";

  let activeTab = "overview"; 
  let selectedClass = "All";
  
  let selectedLevel = "All";
  let selectedStream = "All";
  let selectedStrand = "All";
  let selectedTopic = "All";
  let selectedMatrixTag = "All";

  let tagFilterLevel = "All";
  let tagFilterStream = "All";
  let tagFilterStrand = "All";

  let currentClassTagsBuffer = {};
  let lastLoadedClassForBuffer = null;

  // Live Session & Summary State
  let activeLiveSession = null;
  let liveAttempts = [];
  let livePollTimer = null;
  let targetTimePromptShown = false;
  let isLoadingSummary = false;
  let postSessionSummaryData = null;

  const revealedPins = new Set();

  const classes = Array.from(new Set(students.map(getStudentClass))).sort();
  const levels = Array.from(new Set(curriculum.map(c => c.level || c.year).filter(Boolean))).sort();
  const streams = Array.from(new Set(curriculum.map(c => c.stream).filter(Boolean))).sort();
  const strands = Array.from(new Set(curriculum.map(c => c.strand).filter(Boolean))).sort();
  const topics = Array.from(new Set(curriculum.map(c => c.topic).filter(Boolean))).sort();

  function syncClassFilters(className) {
    if (!className || className === "All") return;
    const repStudent = students.find(s => cleanClassStr(getStudentClass(s)) === cleanClassStr(className));
    if (repStudent) {
      if (repStudent.year || repStudent.level || repStudent.grade) {
        const parsedLevel = String(repStudent.year || repStudent.level || repStudent.grade).trim();
        tagFilterLevel = parsedLevel;
        selectedLevel = parsedLevel;
      }
      if (repStudent.stream) {
        const parsedStream = String(repStudent.stream).trim();
        tagFilterStream = parsedStream;
        selectedStream = parsedStream;
      }
    }
  }

  function getFilteredStudents() {
    return students.filter(s => selectedClass === "All" || cleanClassStr(getStudentClass(s)) === cleanClassStr(selectedClass));
  }

  function getFilteredSkills() {
    return curriculum.filter(c => {
      const matchLevel = selectedLevel === "All" || String(c.level || c.year) === String(selectedLevel);
      const matchStream = selectedStream === "All" || String(c.stream) === String(selectedStream);
      const matchStrand = selectedStrand === "All" || String(c.strand) === String(selectedStrand);
      const matchTopic = selectedTopic === "All" || String(c.topic) === String(selectedTopic);
      const skillTagVal = currentClassTagsBuffer[c.generatorPath] || getAutoDefaultTag(c, selectedClass);
      const matchTag = selectedMatrixTag === "All" || String(skillTagVal).toUpperCase() === String(selectedMatrixTag).toUpperCase();
      return matchLevel && matchStream && matchStrand && matchTopic && matchTag;
    });
  }

  function getTaggingFilteredSkills() {
    return curriculum.filter(c => {
      const matchLevel = tagFilterLevel === "All" || String(c.level || c.year) === String(tagFilterLevel);
      const matchStream = tagFilterStream === "All" || String(c.stream) === String(tagFilterStream);
      const matchStrand = tagFilterStrand === "All" || String(c.strand) === String(tagFilterStrand);
      return matchLevel && matchStream && matchStrand;
    });
  }

  function syncClassTagsBufferIfNeeded() {
    if (selectedClass !== lastLoadedClassForBuffer) {
      if (selectedClass !== "All") {
        const savedTags = classSkillTags[selectedClass] || {};
        currentClassTagsBuffer = { ...savedTags };
        curriculum.forEach(sk => {
          if (!currentClassTagsBuffer[sk.generatorPath]) {
            currentClassTagsBuffer[sk.generatorPath] = getAutoDefaultTag(sk, selectedClass);
          }
        });
        syncClassFilters(selectedClass);
      } else {
        currentClassTagsBuffer = {};
      }
      lastLoadedClassForBuffer = selectedClass;
    }
  }

  async function fetchLiveSessionData() {
    if (selectedClass === "All") return;
    try {
      const response = await fetch(getApiUrl(), {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "getLiveSessionData",
          token: state.userToken || state.token || "TEACHER_SESSION",
          className: selectedClass
        })
      });
      const resData = await response.json();
      if (resData.status === "success") {
        activeLiveSession = resData.activeSession || null;
        liveAttempts = resData.attempts || [];

        if (activeLiveSession && activeLiveSession.targetType === "TIME" && activeLiveSession.targetTime && activeLiveSession.startTime && !targetTimePromptShown) {
          const startTimeMs = new Date(activeLiveSession.startTime).getTime();
          const targetMins = Number(activeLiveSession.targetTime);
          const targetDurationMs = targetMins * 60 * 1000;

          if (Date.now() - startTimeMs >= targetDurationMs) {
            targetTimePromptShown = true;
            setTimeout(() => {
              if (confirm(`⏱️ Target time of ${targetMins} minutes reached! End the live practice session now?`)) {
                endLiveSessionAndSummarize();
              }
            }, 200);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching live session data:", err);
    }
  }

  function startLivePolling() {
    stopLivePolling();
    fetchLiveSessionData().then(() => renderTabContentOnly());
    
    livePollTimer = setInterval(async () => {
      if (activeTab === "live" && selectedClass !== "All" && !postSessionSummaryData && !isLoadingSummary) {
        const prevStatus = activeLiveSession?.status;
        await fetchLiveSessionData();
        const currentStatus = activeLiveSession?.status;

        if (currentStatus === "ACTIVE" || prevStatus !== currentStatus) {
          renderTabContentOnly();
        }
      }
    }, 3000);
  }

  function stopLivePolling() {
    if (livePollTimer) {
      clearInterval(livePollTimer);
      livePollTimer = null;
    }
  }

  async function endLiveSessionAndSummarize() {
    if (!activeLiveSession) return;
    const sessionToSummarize = { ...activeLiveSession };

    isLoadingSummary = true;
    renderTabContentOnly();

    try {
      await fetchLiveSessionData();
      const attemptsToSummarize = [...liveAttempts];

      await fetch(getApiUrl(), {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "setLiveSession",
          token: state.userToken || state.token || "TEACHER_SESSION",
          className: sessionToSummarize.className,
          skillPaths: sessionToSummarize.skillPaths,
          status: "ENDED",
          autoTagCurrent: true
        })
      });

      const sessionClassClean = cleanClassStr(sessionToSummarize.className);
      const attemptedEmails = new Set(attemptsToSummarize.map(a => (a.studentEmail || "").toLowerCase()));
      const classSts = students.filter(s => {
        const sClassClean = cleanClassStr(getStudentClass(s));
        const sEmailClean = (s.email || s.id || "").toLowerCase();
        return (sessionClassClean === "all" || sClassClean === sessionClassClean) || attemptedEmails.has(sEmailClean);
      });

      const durationMins = sessionToSummarize.startTime 
        ? Math.max(1, Math.round((Date.now() - new Date(sessionToSummarize.startTime).getTime()) / (60 * 1000))) 
        : 15;

      const totalAttemptsCount = attemptsToSummarize.length;
      const totalCorrectCount = attemptsToSummarize.filter(a => a.isCorrect).length;
      const overallAccuracy = totalAttemptsCount > 0 ? Math.round((totalCorrectCount / totalAttemptsCount) * 100) : 0;

      const studentStats = classSts.map(st => {
        const eKey = (st.email || st.id || "").toLowerCase();
        const stAtt = attemptsToSummarize.filter(a => (a.studentEmail || "").toLowerCase() === eKey);
        const tAtt = stAtt.length;
        const tCorr = stAtt.filter(a => a.isCorrect).length;
        const acc = tAtt > 0 ? Math.round((tCorr / tAtt) * 100) : 0;
        const startScore = stAtt.length > 0 ? stAtt[0].oldScore : 0;
        const endScore = stAtt.length > 0 ? stAtt[stAtt.length - 1].newScore : startScore;

        let status = "SOLID";
        if (tAtt > 0 && acc >= 85 && (endScore - startScore) >= 15) status = "TOP_PERFORMER";
        else if (tAtt > 0 && (acc < 50 || stAtt.filter(a => a.hintsUsed >= 3).length >= 2)) status = "NEEDS_SUPPORT";

        return {
          name: st.displayName || st.name || "Student",
          email: eKey,
          totalAttempted: tAtt,
          totalCorrect: tCorr,
          accuracy: acc,
          startScore,
          endScore,
          status
        };
      });

      const activeParticipants = studentStats.filter(s => s.totalAttempted > 0);
      const startScores = activeParticipants.map(s => s.startScore);
      const endScores = activeParticipants.map(s => s.endScore);
      const avgScoreStart = startScores.length > 0 ? Math.round(startScores.reduce((a, b) => a + b, 0) / startScores.length) : 0;
      const avgScoreEnd = endScores.length > 0 ? Math.round(endScores.reduce((a, b) => a + b, 0) / endScores.length) : 0;

      postSessionSummaryData = {
        className: sessionToSummarize.className,
        durationMins,
        skillPaths: sessionToSummarize.skillPaths,
        studentStats: studentStats,
        overallAccuracy,
        avgScoreStart,
        avgScoreEnd
      };

      activeLiveSession = null;
      liveAttempts = [];
      stopLivePolling();

      isLoadingSummary = false;
      render();

    } catch (e) {
      isLoadingSummary = false;
      alert("Error ending live session: " + e.message);
      renderTabContentOnly();
    }
  }

  function renderTabContentOnly() {
    const tabContainer = container.querySelector("#teacher-tab-content-container");
    if (!tabContainer) return;

    const filteredStudents = getFilteredStudents();
    const filteredSkills = getFilteredSkills();
    const taggingSkills = getTaggingFilteredSkills();

    if (activeTab === "overview") {
      tabContainer.innerHTML = renderOverviewTabHTML({
        filteredStudents,
        filteredSkills,
        classMastery,
        curriculum,
        levels,
        streams,
        strands,
        topics,
        selectedClass,
        selectedLevel,
        selectedStream,
        selectedStrand,
        selectedTopic,
        selectedMatrixTag,
        currentClassTagsBuffer,
        revealedPins
      });
      bindOverviewEvents();
    } else if (activeTab === "tagging") {
      tabContainer.innerHTML = renderTaggingTabHTML({
        selectedClass,
        taggingSkills,
        levels,
        streams,
        strands,
        tagFilterLevel,
        tagFilterStream,
        tagFilterStrand,
        currentClassTagsBuffer
      });

      // WIRED DIRECTLY TO initTaggingTabEvents TO GUARANTEE CLICK/TAP RESPONSIVENESS
      initTaggingTabEvents(tabContainer, {
        currentClassTagsBuffer,
        taggingSkills,
        onFilterChange: (type, val) => {
          if (type === "level") tagFilterLevel = val;
          if (type === "stream") tagFilterStream = val;
          if (type === "strand") tagFilterStrand = val;
          renderTabContentOnly();
        },
        onSaveClassTags: async (saveBtn) => {
          saveBtn.disabled = true;
          saveBtn.innerText = "⏳ Saving...";
          try {
            await fetch(getApiUrl(), {
              method: "POST",
              headers: { "Content-Type": "text/plain;charset=utf-8" },
              body: JSON.stringify({
                action: "saveClassSkillTags",
                token: state.userToken || state.token || "TEACHER_SESSION",
                className: selectedClass,
                tags: currentClassTagsBuffer
              })
            });
            if (!state.teacherData.classSkillTags) state.teacherData.classSkillTags = {};
            state.teacherData.classSkillTags[selectedClass] = { ...currentClassTagsBuffer };
            saveBtn.innerText = "✅ Saved Successfully!";
            setTimeout(() => { saveBtn.disabled = false; saveBtn.innerText = "💾 Save Skill Tags to Google Sheet"; }, 2000);
          } catch (err) {
            alert("Error saving skill tags: " + err.message);
            saveBtn.disabled = false;
            saveBtn.innerText = "💾 Save Skill Tags to Google Sheet";
          }
        }
      });
    } else if (activeTab === "live") {
      tabContainer.innerHTML = renderLiveTabHTML({
        selectedClass,
        classes,
        curriculum,
        students,
        activeSession: activeLiveSession,
        liveAttempts,
        summaryData: postSessionSummaryData,
        isLoadingSummary: isLoadingSummary
      });

      initLiveTabEvents(tabContainer, {
        onFilterChange: () => renderTabContentOnly(),
        onStartSession: async (targetClass, skillPaths, targetType, targetVal) => {
          try {
            const submitBtn = tabContainer.querySelector("#btn-launch-live");
            if (submitBtn) { submitBtn.disabled = true; submitBtn.innerText = "⏳ Launching Session..."; }

            postSessionSummaryData = null;
            targetTimePromptShown = false;

            const response = await fetch(getApiUrl(), {
              method: "POST",
              headers: { "Content-Type": "text/plain;charset=utf-8" },
              body: JSON.stringify({
                action: "setLiveSession",
                token: state.userToken || state.token || "TEACHER_SESSION",
                className: targetClass,
                skillPaths: skillPaths,
                status: "ACTIVE",
                targetType: targetType,
                targetScore: targetType === "SCORE" ? targetVal : null,
                targetTime: targetType === "TIME" ? targetVal : null
              })
            });

            const resData = await response.json();
            if (resData.status === "success") {
              await fetchLiveSessionData();
              startLivePolling();
              render();
            } else {
              alert("Failed to start live session: " + (resData.message || "Unknown error"));
              if (submitBtn) { submitBtn.disabled = false; submitBtn.innerText = "🚀 Start Live Class Practice"; }
            }
          } catch (e) {
            alert("Error starting live session: " + e.message);
          }
        },
        onEndSession: () => endLiveSessionAndSummarize(),
        onToggleProjector: () => renderTabContentOnly(),
        onDoneSummary: () => {
          postSessionSummaryData = null;
          activeTab = "overview";
          render();
        },
        onSaveAutoTags: async () => {
          if (!postSessionSummaryData || !postSessionSummaryData.skillPaths) return;
          const tagsToSave = { ...(classSkillTags[selectedClass] || {}) };
          postSessionSummaryData.skillPaths.forEach(p => { tagsToSave[p] = "Current"; });
          
          try {
            await fetch(getApiUrl(), {
              method: "POST",
              headers: { "Content-Type": "text/plain;charset=utf-8" },
              body: JSON.stringify({
                action: "saveClassSkillTags",
                token: state.userToken || state.token || "TEACHER_SESSION",
                className: selectedClass,
                tags: tagsToSave
              })
            });
            if (!state.teacherData.classSkillTags) state.teacherData.classSkillTags = {};
            state.teacherData.classSkillTags[selectedClass] = tagsToSave;
          } catch (err) {
            alert("Error saving skill tags: " + err.message);
          }
        }
      });
    }
  }

  function bindOverviewEvents() {
    container.querySelector("#filter-matrix-tag")?.addEventListener("change", (e) => { selectedMatrixTag = e.target.value; renderTabContentOnly(); });
    container.querySelector("#filter-level")?.addEventListener("change", (e) => { selectedLevel = e.target.value; renderTabContentOnly(); });
    container.querySelector("#filter-stream")?.addEventListener("change", (e) => { selectedStream = e.target.value; renderTabContentOnly(); });
    container.querySelector("#filter-strand")?.addEventListener("change", (e) => { selectedStrand = e.target.value; renderTabContentOnly(); });
    container.querySelector("#filter-topic")?.addEventListener("change", (e) => { selectedTopic = e.target.value; renderTabContentOnly(); });

    container.querySelectorAll(".btn-toggle-pin").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const email = btn.getAttribute("data-email");
        if (revealedPins.has(email)) revealedPins.delete(email);
        else revealedPins.add(email);
        renderTabContentOnly();
      });
    });

    container.querySelectorAll(".student-matrix-row").forEach(row => {
      row.addEventListener("click", (e) => {
        if (e.target.classList.contains("btn-toggle-pin")) return;
        const email = row.getAttribute("data-email");
        openStudentDrawer(container, email, students, classMastery, curriculum);
      });
    });

    container.querySelector("#btn-close-drawer")?.addEventListener("click", () => {
      const drawerEl = container.querySelector("#student-detail-drawer");
      if (drawerEl) drawerEl.style.display = "none";
    });

    container.querySelectorAll(".skill-header-cell").forEach(cell => {
      cell.addEventListener("click", () => {
        const generatorPath = cell.getAttribute("data-path");
        const skillObj = curriculum.find(c => c.generatorPath === generatorPath);
        if (skillObj) initQuestionPreviewModal(container, skillObj);
      });
    });
  }

  function render() {
    if (state.isLoadingTeacherData) {
      container.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; min-height: 60vh; flex-direction: column; gap: 12px; background: #f8fafc; padding: 24px;">
          <div style="width: 44px; height: 44px; border: 4px solid #cbd5e1; border-top-color: #2563eb; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
          <p style="color: #475569; font-weight: 700; font-size: 1rem;">Loading Teacher Dashboard & Student Data...</p>
          <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
        </div>
      `;
      return;
    }

    syncClassTagsBufferIfNeeded();

    const filteredStudents = getFilteredStudents();
    const isLiveActive = activeLiveSession && activeLiveSession.status === "ACTIVE";

    container.innerHTML = `
      <div class="teacher-dashboard-container" style="display: flex; flex-direction: column; gap: 16px; padding: 20px; height: 100%; box-sizing: border-box; background: #f8fafc; overflow-y: auto;">
        
        <!-- HEADER BAR -->
        <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; background: #ffffff; padding: 16px 24px; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; gap: 12px;">
          <div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <h2 style="font-size: 1.35rem; color: #0f172a; margin: 0; font-weight: 800;">🏫 ${teacherName}</h2>
              <span style="background: #2563eb; color: #ffffff; padding: 3px 10px; border-radius: 12px; font-weight: 800; font-size: 0.75rem;">TEACHER DASHBOARD</span>
            </div>
            <p style="color: #64748b; font-size: 0.88rem; margin: 2px 0 0 0;">Monitoring <strong>${filteredStudents.length}</strong> students across <strong>${curriculum.length}</strong> total skills</p>
          </div>
          
          <div style="display: flex; gap: 14px; align-items: center;">
            <div style="display: flex; gap: 8px; align-items: center;">
              <label style="font-weight: 700; font-size: 0.88rem; color: #334155;">Class Filter:</label>
              <select id="select-class-filter" style="padding: 8px 14px; border-radius: 10px; border: 1.5px solid #cbd5e1; font-weight: 700; cursor: pointer; background: #fff; color: #1e293b;">
                <option value="All">All Classes (${students.length} Students)</option>
                ${classes.map(c => `<option value="${c}" ${c === selectedClass ? 'selected' : ''}>Class ${c}</option>`).join('')}
              </select>
            </div>

            <button id="btn-dashboard-logout" style="background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; padding: 8px 16px; border-radius: 10px; font-weight: 700; cursor: pointer;">
              🚪 Logout
            </button>
          </div>
        </div>

        <!-- DASHBOARD TABS -->
        <div style="display: flex; gap: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 2px;">
          <button id="tab-btn-overview" style="padding: 10px 20px; border-radius: 12px 12px 0 0; border: none; font-weight: 800; font-size: 0.95rem; cursor: pointer; display: flex; align-items: center; gap: 8px; ${activeTab === 'overview' ? 'background: #2563eb; color: #ffffff;' : 'background: #ffffff; color: #64748b; border: 1px solid #e2e8f0; border-bottom: none;'}">
            📊 Student Class Overview
          </button>
          <button id="tab-btn-tagging" style="padding: 10px 20px; border-radius: 12px 12px 0 0; border: none; font-weight: 800; font-size: 0.95rem; cursor: pointer; display: flex; align-items: center; gap: 8px; ${activeTab === 'tagging' ? 'background: #2563eb; color: #ffffff;' : 'background: #ffffff; color: #64748b; border: 1px solid #e2e8f0; border-bottom: none;'}">
            📌 Class Skill Tagging ${selectedClass !== 'All' ? `(${selectedClass})` : ''}
          </button>
          <button id="tab-btn-live" style="padding: 10px 20px; border-radius: 12px 12px 0 0; border: none; font-weight: 800; font-size: 0.95rem; cursor: pointer; display: flex; align-items: center; gap: 8px; ${activeTab === 'live' ? 'background: #2563eb; color: #ffffff;' : 'background: #ffffff; color: #64748b; border: 1px solid #e2e8f0; border-bottom: none;'}">
            📡 Live Practice ${isLiveActive ? '🔴' : ''}
          </button>
        </div>

        <!-- TAB CONTENT CONTAINER -->
        <div id="teacher-tab-content-container"></div>

      </div>

      <!-- STUDENT DETAIL DRAWER -->
      ${renderStudentDrawerHTML()}

      <!-- SKILL QUESTION PREVIEW MODAL -->
      ${renderQuestionPreviewModalHTML()}
    `;

    // Global Event Bindings
    container.querySelector("#tab-btn-overview")?.addEventListener("click", () => {
      activeTab = "overview";
      stopLivePolling();
      render();
    });

    container.querySelector("#tab-btn-tagging")?.addEventListener("click", () => {
      activeTab = "tagging";
      stopLivePolling();
      render();
    });

    container.querySelector("#tab-btn-live")?.addEventListener("click", () => {
      activeTab = "live";
      startLivePolling();
      render();
    });

    container.querySelector("#btn-dashboard-logout")?.addEventListener("click", () => {
      stopLivePolling();
      if (typeof onLogout === "function") onLogout();
      else if (typeof state.logout === "function") state.logout();
      else window.location.reload();
    });

    container.querySelector("#select-class-filter")?.addEventListener("change", (e) => {
      selectedClass = e.target.value;
      syncClassFilters(selectedClass);
      if (activeTab === "live") {
        fetchLiveSessionData().then(() => render());
      } else {
        render();
      }
    });

    renderTabContentOnly();
  }

  render();
}
