import { getAutoDefaultTag } from "./helperUtils.js";

/**
 * Renders HTML for Tab 2: Class Skill Tagging
 */
export function renderTaggingTabHTML(props) {
  const {
    selectedClass,
    taggingSkills,
    levels,
    streams,
    strands,
    tagFilterLevel,
    tagFilterStream,
    tagFilterStrand,
    currentClassTagsBuffer
  } = props;

  const skillsByTopic = {};
  taggingSkills.forEach(sk => {
    const topic = sk.topic || "General Mathematics";
    if (!skillsByTopic[topic]) skillsByTopic[topic] = [];
    skillsByTopic[topic].push(sk);
  });

  return `
    <div style="background: #ffffff; border-radius: 16px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 16px;">
      
      <!-- HEADER & SAVE BUTTON -->
      <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px; border-bottom: 2px solid #f1f5f9; padding-bottom: 16px;">
        <div>
          <h3 style="margin: 0; font-size: 1.2rem; color: #0f172a; font-weight: 800;">
            📌 Class Skill Tagging for ${selectedClass === 'All' ? 'All Classes' : `Class ${selectedClass}`}
          </h3>
          <p style="margin: 4px 0 0 0; font-size: 0.86rem; color: #64748b;">
            Tag skills as <strong>Current Skill</strong> (Daily quest priority), <strong>Past Skill</strong> (Spaced review), or <strong>Future Skill</strong> (Excluded from Daily Quest & greyed out in Skill Tree).
          </p>
        </div>

        ${selectedClass !== "All" ? `
          <button id="btn-save-class-tags" type="button" style="background: #2563eb; color: #ffffff; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25); transition: all 0.15s ease;">
            💾 Save Skill Tags to Google Sheet
          </button>
        ` : ''}
      </div>

      ${selectedClass === "All" ? `
        <div style="background: #fffbebf5; border: 1px solid #fde047; padding: 16px 20px; border-radius: 12px; font-size: 0.9rem; color: #854d0e; font-weight: 600;">
          ⚠️ Please select a specific class from the top <strong>Class Filter</strong> dropdown above to configure skill tags for that class.
        </div>
      ` : `
        <!-- TAGGING CONTROLS: FILTERS & MASS SETTING -->
        <div style="display: flex; flex-wrap: wrap; gap: 12px; justify-content: space-between; align-items: center; background: #f8fafc; padding: 14px 18px; border-radius: 12px; border: 1px solid #e2e8f0;">
          
          <div style="display: flex; flex-wrap: wrap; gap: 10px; align-items: center;">
            <span style="font-weight: 800; font-size: 0.86rem; color: #0f172a;">Filter Skills:</span>

            <select id="tag-filter-level" style="padding: 6px 10px; border-radius: 8px; border: 1.5px solid #cbd5e1; font-size: 0.84rem; font-weight: 700; background: #ffffff; color: #1e293b; cursor: pointer;">
              <option value="All">All Levels</option>
              ${levels.map(l => `<option value="${l}" ${String(l) === String(tagFilterLevel) ? 'selected' : ''}>${l}</option>`).join('')}
            </select>

            <select id="tag-filter-stream" style="padding: 6px 10px; border-radius: 8px; border: 1.5px solid #cbd5e1; font-size: 0.84rem; font-weight: 700; background: #ffffff; color: #1e293b; cursor: pointer;">
              <option value="All">All Streams</option>
              ${streams.map(s => `<option value="${s}" ${s === tagFilterStream ? 'selected' : ''}>${s}</option>`).join('')}
            </select>

            <select id="tag-filter-strand" style="padding: 6px 10px; border-radius: 8px; border: 1.5px solid #cbd5e1; font-size: 0.84rem; font-weight: 700; background: #ffffff; color: #1e293b; cursor: pointer;">
              <option value="All">All Strands</option>
              ${strands.map(s => `<option value="${s}" ${s === tagFilterStrand ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
          </div>

          <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
            <span style="font-weight: 800; font-size: 0.82rem; color: #64748b;">Bulk Tag (${taggingSkills.length}):</span>
            <button type="button" id="btn-mass-past" style="padding: 6px 12px; border-radius: 8px; border: 1px solid #0284c7; background: #e0f2fe; color: #0369a1; font-weight: 700; font-size: 0.82rem; cursor: pointer; touch-action: manipulation;">🔵 Set All Past</button>
            <button type="button" id="btn-mass-current" style="padding: 6px 12px; border-radius: 8px; border: 1px solid #16a34a; background: #dcfce7; color: #15803d; font-weight: 700; font-size: 0.82rem; cursor: pointer; touch-action: manipulation;">🟢 Set All Current</button>
            <button type="button" id="btn-mass-future" style="padding: 6px 12px; border-radius: 8px; border: 1px solid #64748b; background: #f1f5f9; color: #475569; font-weight: 700; font-size: 0.82rem; cursor: pointer; touch-action: manipulation;">⚪ Set All Future</button>
          </div>

        </div>

        <!-- GROUPED SKILLS BY TOPIC -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          ${Object.keys(skillsByTopic).length === 0 ? `
            <div style="background: #ffffff; padding: 40px; text-align: center; border-radius: 12px; color: #64748b; border: 1px solid #e2e8f0;">
              No skills match the selected Level, Stream, or Strand filters.
            </div>
          ` : Object.entries(skillsByTopic).map(([topicName, skills]) => `
            <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; background: #fafafa;">
              <h4 style="margin: 0 0 12px 0; font-size: 1.05rem; color: #0f172a; font-weight: 800; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
                📂 ${topicName} (${skills.length} Skills)
              </h4>

              <div style="display: flex; flex-direction: column; gap: 10px;">
                ${skills.map(sk => {
                  const currentTag = currentClassTagsBuffer[sk.generatorPath] || getAutoDefaultTag(sk, selectedClass);

                  return `
                    <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; padding: 12px 16px; background: #ffffff; border-radius: 10px; border: 1px solid #e2e8f0; gap: 12px;">
                      
                      <div style="flex: 1; min-width: 240px;">
                        <div style="font-size: 0.95rem; font-weight: 700; color: #0f172a; line-height: 1.4; word-break: break-word;">
                          ${sk.title}
                        </div>
                        <div style="font-size: 0.78rem; color: #64748b; margin-top: 2px;">
                          Strand: <strong>${sk.strand || 'General'}</strong> | Level: <strong>${sk.year || sk.level || 'All'}</strong> (${sk.stream || 'Express'})
                        </div>
                      </div>

                      <div style="display: flex; gap: 6px; flex-shrink: 0;" class="tag-toggle-group" data-path="${sk.generatorPath}">
                        <button type="button" class="btn-tag-toggle ${currentTag === 'Past' ? 'active' : ''}" data-tag="Past" style="padding: 6px 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.82rem; font-weight: 700; cursor: pointer; touch-action: manipulation; ${currentTag === 'Past' ? 'background:#0284c7; color:#fff; border-color:#0284c7;' : 'background:#fff; color:#475569;'}">
                          <span style="pointer-events: none;">🔵 Past Skill</span>
                        </button>
                        <button type="button" class="btn-tag-toggle ${currentTag === 'Current' ? 'active' : ''}" data-tag="Current" style="padding: 6px 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.82rem; font-weight: 700; cursor: pointer; touch-action: manipulation; ${currentTag === 'Current' ? 'background:#16a34a; color:#fff; border-color:#16a34a;' : 'background:#fff; color:#475569;'}">
                          <span style="pointer-events: none;">🟢 Current Skill</span>
                        </button>
                        <button type="button" class="btn-tag-toggle ${currentTag === 'Future' ? 'active' : ''}" data-tag="Future" style="padding: 6px 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.82rem; font-weight: 700; cursor: pointer; touch-action: manipulation; ${currentTag === 'Future' ? 'background:#64748b; color:#fff; border-color:#64748b;' : 'background:#fff; color:#475569;'}">
                          <span style="pointer-events: none;">⚪ Future Skill</span>
                        </button>
                      </div>

                    </div>
                  `;
                }).join('')}
              </div>

            </div>
          `).join('')}
        </div>
      `}

    </div>
  `;
}

/**
 * Initializes Event Handlers using Event Delegation (Guarantees touch/click responsiveness)
 */
export function initTaggingTabEvents(container, props) {
  const {
    currentClassTagsBuffer,
    taggingSkills,
    onFilterChange,
    onSaveClassTags
  } = props;

  // 1. Filter Dropdowns
  container.querySelector("#tag-filter-level")?.addEventListener("change", (e) => {
    if (typeof onFilterChange === "function") onFilterChange("level", e.target.value);
  });
  container.querySelector("#tag-filter-stream")?.addEventListener("change", (e) => {
    if (typeof onFilterChange === "function") onFilterChange("stream", e.target.value);
  });
  container.querySelector("#tag-filter-strand")?.addEventListener("change", (e) => {
    if (typeof onFilterChange === "function") onFilterChange("strand", e.target.value);
  });

  // Helper to visually update button group styles
  function updateGroupUI(group, activeTag) {
    group.querySelectorAll(".btn-tag-toggle").forEach(btn => {
      const bTag = btn.getAttribute("data-tag");
      if (bTag === activeTag) {
        btn.classList.add("active");
        if (bTag === "Past") {
          btn.style.background = "#0284c7"; btn.style.color = "#ffffff"; btn.style.borderColor = "#0284c7";
        } else if (bTag === "Current") {
          btn.style.background = "#16a34a"; btn.style.color = "#ffffff"; btn.style.borderColor = "#16a34a";
        } else if (bTag === "Future") {
          btn.style.background = "#64748b"; btn.style.color = "#ffffff"; btn.style.borderColor = "#64748b";
        }
      } else {
        btn.classList.remove("active");
        btn.style.background = "#ffffff";
        btn.style.color = "#475569";
        btn.style.borderColor = "#cbd5e1";
      }
    });
  }

  // Helper to apply bulk tags across all currently filtered skills
  function applyBulkTag(targetTag) {
    if (!taggingSkills || taggingSkills.length === 0) return;

    taggingSkills.forEach(sk => {
      currentClassTagsBuffer[sk.generatorPath] = targetTag;
    });

    container.querySelectorAll(".tag-toggle-group").forEach(group => {
      const path = group.getAttribute("data-path");
      if (path && currentClassTagsBuffer[path]) {
        updateGroupUI(group, currentClassTagsBuffer[path]);
      }
    });
  }

  // 2. EVENT DELEGATION: Catches ALL taps & clicks on individual skill buttons & bulk buttons
  container.addEventListener("click", (e) => {
    // Individual Tag Toggle Button Tapped/Clicked
    const tagBtn = e.target.closest(".btn-tag-toggle");
    if (tagBtn) {
      e.preventDefault();
      const group = tagBtn.closest(".tag-toggle-group");
      if (!group) return;

      const generatorPath = group.getAttribute("data-path");
      const selectedTag = tagBtn.getAttribute("data-tag");

      if (generatorPath && selectedTag) {
        currentClassTagsBuffer[generatorPath] = selectedTag;
        updateGroupUI(group, selectedTag);
      }
      return;
    }

    // Bulk Mass Tag Button Tapped/Clicked
    const massBtn = e.target.closest("#btn-mass-past, #btn-mass-current, #btn-mass-future");
    if (massBtn) {
      e.preventDefault();
      if (massBtn.id === "btn-mass-past") applyBulkTag("Past");
      else if (massBtn.id === "btn-mass-current") applyBulkTag("Current");
      else if (massBtn.id === "btn-mass-future") applyBulkTag("Future");
      return;
    }

    // Save to Google Sheet Button Tapped/Clicked
    const saveBtn = e.target.closest("#btn-save-class-tags");
    if (saveBtn && typeof onSaveClassTags === "function") {
      e.preventDefault();
      onSaveClassTags(saveBtn);
    }
  });
}
