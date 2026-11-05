import { state } from "../state.js";
import { getStudentClass, getAutoDefaultTag } from "./teacher/helperUtils.js";
import { renderOverviewTabHTML } from "./teacher/overviewTab.js";
import { renderTaggingTabHTML } from "./teacher/taggingTab.js";
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

export function renderTeacherDashboard(container, onLogout) {
  if (!container) return;

  const globalShellNav = document.querySelector(".top-nav");
  if (globalShellNav) {
    globalShellNav.style.display = "none";
  }

  const teacherData = state.teacherData || {};
  const students = teacherData.students || [];
  const classMastery = teacherData.classMastery || {};
  const classSkillTags = teacherData.classSkillTags || {};
  const curriculum = state.curriculum || [];
  const currentUser = state.currentUser || {};

  const teacherName = currentUser.displayName || currentUser.name || state.user?.name || "Teacher Account";

  let activeTab = "overview"; // "overview" | "tagging" | "live"
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

  // Live Session State
  let activeLiveSession = null;
  let liveAttempts = [];
  let livePollTimer = null;

  const revealedPins = new Set();

  const classes = Array.from(new Set(students.map(getStudentClass))).sort();
  const levels = Array.from(new Set(curriculum.map(c => c.level || c.year).filter(Boolean))).sort();
  const streams = Array.from(new Set(curriculum.map(c => c.stream).filter(Boolean))).sort();
  const strands = Array.from(new Set(curriculum.map(c => c.strand).filter(Boolean))).sort();
  const topics = Array.from(new Set(curriculum.map(c => c.topic).filter(Boolean))).sort();

  function syncClassFilters(className) {
    if (!className || className === "All") {
      selectedLevel = "All";
      selectedStream = "All";
      tagFilterLevel = "All";
      tagFilterStream = "All";
      return;
    }
    const representativeStudent = students.find(s => getStudentClass(s) === className);
    if (representativeStudent) {
      if (representativeStudent.year || representativeStudent.level || representativeStudent.grade) {
        const parsedLevel = String(representativeStudent.year || representativeStudent.level || representativeStudent.grade).trim();
        tagFilterLevel = parsedLevel;
        selectedLevel = parsedLevel;
      }
      if (representativeStudent.stream) {
        const parsedStream = String(representativeStudent.stream).trim();
        tagFilterStream = parsedStream;
        selectedStream = parsedStream;
      }
    }
  }

  function getFilteredStudents() {
    return students.filter(s => selectedClass === "All" || getStudentClass(s) === selectedClass);
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

  // ---------------------------------------------------------------------------
  // LIVE POLLING MANAGEMENT
  // ---------------------------------------------------------------------------
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
      }
    } catch (err) {
      console.error("Error fetching live session data:", err);
    }
  }

  function startLivePolling() {
    stopLivePolling();
    fetchLiveSessionData().then(() => renderTabContentOnly());
    livePollTimer = setInterval(async () => {
      if (activeTab === "live" && selectedClass !== "All") {
        await fetchLiveSessionData();
        renderTabContentOnly();
      }
    }, 3000);
  }

  function stopLivePolling() {
    if (livePollTimer) {
      clearInterval(livePollTimer);
      livePollTimer = null;
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
      bindTaggingEvents();
    } else if (activeTab === "live") {
      tabContainer.innerHTML = renderLiveTabHTML({
        selectedClass,
        classes,
        curriculum,
        students,
        activeSession: activeLiveSession,
        liveAttempts
      });

      // BIND EVENTS WITH ONSTARTSESSION AND ONENDSESSION HANDLERS
      initLiveTabEvents(tabContainer, {
        onStartSession: async (targetClass, skillPaths) => {
          try {
            const submitBtn = tabContainer.querySelector("#btn-launch-live");
            if (submitBtn) {
              submitBtn.disabled = true;
              submitBtn.innerText = "⏳ Launching Session...";
            }

            const response = await fetch(getApiUrl(), {
              method: "POST",
              headers: { "Content-Type": "text/plain;charset=utf-8" },
              body: JSON.stringify({
                action: "setLiveSession",
                token: state.userToken || state.token || "TEACHER_SESSION",
                className: targetClass,
                skillPaths: skillPaths,
                status: "ACTIVE"
              })
            });

            const resData = await response.json();
            if (resData.status === "success") {
              await fetchLiveSessionData();
              startLivePolling();
              render();
            } else {
              alert("Failed to start live session: " + (resData.message || "Unknown error"));
              if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerText = "🚀 Start Live Class Practice";
              }
            }
          } catch (e) {
            console.error("Start live session error:", e);
            alert("Error starting live session: " + e.message);
            const submitBtn = tabContainer.querySelector("#btn-launch-live");
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.innerText = "🚀 Start Live Class Practice";
            }
          }
        },
        onEndSession: async () => {
          if (!activeLiveSession) return;
          try {
            await fetch(getApiUrl(), {
              method: "POST",
              headers: { "Content-Type": "text/plain;charset=utf-8" },
              body: JSON.stringify({
                action: "setLiveSession",
                token: state.userToken || state.token || "TEACHER_SESSION",
                className: activeLiveSession.className,
                skillPaths: activeLiveSession.skillPaths,
                status: "ENDED",
                autoTagCurrent: true // Smart Session Autosave
              })
            });
            activeLiveSession = null;
            liveAttempts = [];
            stopLivePolling();
            render();
          } catch (e) {
            alert("Error ending live session: " + e.message);
          }
        },
        onToggleProjector: () => renderTabContentOnly()
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

    const drawerEl = container.querySelector("#student-detail-drawer");
    container.querySelector("#btn-close-drawer")?.addEventListener("click", () => {
      if (drawerEl) drawerEl.style.display = "none";
    });

    container.querySelectorAll(".skill-header-cell").forEach(cell => {
      cell.addEventListener("click", () => {
        const generatorPath = cell.getAttribute("data-path");
        const skillObj = curriculum.find(c => c.generatorPath === generatorPath);
        if (skillObj) {
          initQuestionPreviewModal(container, skillObj);
        }
      });
    });
  }

  function bindTaggingEvents() {
    container.querySelector("#tag-filter-level")?.addEventListener("change", (e) => { tagFilterLevel = e.target.value; renderTabContentOnly(); });
    container.querySelector("#tag-filter-stream")?.addEventListener("change", (e) => { tagFilterStream = e.target.value; renderTabContentOnly(); });
    container.querySelector("#tag-filter-strand")?.addEventListener("change", (e) => { tagFilterStrand = e.target.value; renderTabContentOnly(); });

    function applyMassTag(targetTag) {
      const skillsToTag = getTaggingFilteredSkills();
      if (skillsToTag.length === 0) {
        alert("No skills match the current filters.");
        return;
      }
      skillsToTag.forEach(sk => { currentClassTagsBuffer[sk.generatorPath] = targetTag; });
      renderTabContentOnly();
    }

    container.querySelector("#btn-mass-past")?.addEventListener("click", () => applyMassTag("Past"));
    container.querySelector("#btn-mass-current")?.addEventListener("click", () => applyMassTag("Current"));
    container.querySelector("#btn-mass-future")?.addEventListener("click", () => applyMassTag("Future"));

    container.querySelectorAll(".tag-toggle-group").forEach(group => {
      const path = group.getAttribute("data-path");
      const buttons = group.querySelectorAll(".btn-tag-toggle");

      buttons.forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const selectedTag = btn.getAttribute("data-tag");

          if (path && selectedTag) {
            currentClassTagsBuffer[path] = selectedTag;

            buttons.forEach(b => {
              const t = b.getAttribute("data-tag");
              if (t === selectedTag) {
                b.classList.add("active");
                if (t === "Past") { b.style.background = "#0284c7"; b.style.color = "#fff"; b.style.borderColor = "#0284c7"; }
                else if (t === "Current") { b.style.background = "#16a34a"; b.style.color = "#fff"; b.style.borderColor = "#16a34a"; }
                else if (t === "Future") { b.style.background = "#64748b"; b.style.color = "#fff"; b.style.borderColor = "#64748b"; }
              } else {
                b.classList.remove("active");
                b.style.background = "#ffffff";
                b.style.color = "#475569";
                b.style.borderColor = "#cbd5e1";
              }
            });
          }
        });
      });
    });

    container.querySelector("#btn-save-class-tags")?.addEventListener("click", async (e) => {
      const saveBtn = e.target;
      const apiUrl = getApiUrl();

      saveBtn.disabled = true;
      saveBtn.innerText = "⏳ Saving...";

      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({
            action: "saveClassSkillTags",
            token: state.userToken || state.token || (state.profile?.email ? ("PIN_AUTH_" + state.profile.email) : "TEACHER_SESSION"),
            className: selectedClass,
            tags: currentClassTagsBuffer
          })
        });

        const resData = await response.json();

        if (resData.status === "success") {
          if (!state.teacherData.classSkillTags) state.teacherData.classSkillTags = {};
          state.teacherData.classSkillTags[selectedClass] = { ...currentClassTagsBuffer };
          saveBtn.innerText = "✅ Saved Successfully!";
          setTimeout(() => {
            saveBtn.disabled = false;
            saveBtn.innerText = "💾 Save Skill Tags to Google Sheet";
          }, 2000);
        } else {
          alert("Failed to save tags: " + (resData.message || "Unknown error"));
          saveBtn.disabled = false;
          saveBtn.innerText = "💾 Save Skill Tags to Google Sheet";
        }
      } catch (err) {
        console.error("Save class tags error:", err);
        alert("Network error while saving skill tags: " + err.message);
        saveBtn.disabled = false;
        saveBtn.innerText = "💾 Save Skill Tags to Google Sheet";
      }
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

            <button id="btn-dashboard-logout" style="background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; padding: 8px 16px; border-radius: 10px; font-weight: 700; cursor: pointer; transition: background 0.15s;">
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
            📡 Live Practice Stream ${isLiveActive ? '🔴' : ''}
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
