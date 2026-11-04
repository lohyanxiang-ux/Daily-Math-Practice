import { getAutoDefaultTag } from "./helperUtils.js";

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
      
      <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px; border-bottom: 2px solid #f1f5f9; padding-bottom: 16px;">
        <div>
          <h3 style="margin: 0; font-size: 1.2rem; color: #0f172a; font-weight: 800;">
            📌 Class Skill Tagging for ${selectedClass === 'All' ? 'All Classes' : `Class ${selectedClass}`}
          </h3>
          <p style="margin: 4px 0 0 0; font-size: 0.86rem; color: #64748b;">
            Tag skills as <strong>Current</strong> (Daily quest priority), <strong>Past</strong> (Spaced review), or <strong>Future</strong> (Excluded from Daily Quest & greyed out in Skill Tree).
          </p>
        </div>

        ${selectedClass !== "All" ? `
          <button id="btn-save-class-tags" style="background: #2563eb; color: #ffffff; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25); transition: background 0.15s;">
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
              <option value="All">Level: All</option>
              ${levels.map(l => `<option value="${l}" ${String(l) === String(tagFilterLevel) ? 'selected' : ''}>Level ${l}</option>`).join('')}
            </select>

            <select id="tag-filter-stream" style="padding: 6px 10px; border-radius: 8px; border: 1.5px solid #cbd5e1; font-size: 0.84rem; font-weight: 700; background: #ffffff; color: #1e293b; cursor: pointer;">
              <option value="All">Stream: All</option>
              ${streams.map(s => `<option value="${s}" ${s === tagFilterStream ? 'selected' : ''}>${s}</option>`).join('')}
            </select>

            <select id="tag-filter-strand" style="padding: 6px 10px; border-radius: 8px; border: 1.5px solid #cbd5e1; font-size: 0.84rem; font-weight: 700; background: #ffffff; color: #1e293b; cursor: pointer;">
              <option value="All">Strand: All</option>
              ${strands.map(s => `<option value="${s}" ${s === tagFilterStrand ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
          </div>

          <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
            <span style="font-weight: 800; font-size: 0.82rem; color: #64748b;">Bulk Tag (${taggingSkills.length}):</span>
            <button type="button" id="btn-mass-past" style="padding: 6px 12px; border-radius: 8px; border: 1px solid #0284c7; background: #e0f2fe; color: #0369a1; font-weight: 700; font-size: 0.82rem; cursor: pointer;">🔵 Set All Past</button>
            <button type="button" id="btn-mass-current" style="padding: 6px 12px; border-radius: 8px; border: 1px solid #16a34a; background: #dcfce7; color: #15803d; font-weight: 700; font-size: 0.82rem; cursor: pointer;">🟢 Set All Current</button>
            <button type="button" id="btn-mass-future" style="padding: 6px 12px; border-radius: 8px; border: 1px solid #64748b; background: #f1f5f9; color: #475569; font-weight: 700; font-size: 0.82rem; cursor: pointer;">⚪ Set All Future</button>
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
                        <button type="button" class="btn-tag-toggle ${currentTag === 'Past' ? 'active' : ''}" data-tag="Past" style="padding: 6px 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.82rem; font-weight: 700; cursor: pointer; ${currentTag === 'Past' ? 'background:#0284c7; color:#fff; border-color:#0284c7;' : 'background:#fff; color:#475569;'}">
                          🔵 Past Topic
                        </button>
                        <button type="button" class="btn-tag-toggle ${currentTag === 'Current' ? 'active' : ''}" data-tag="Current" style="padding: 6px 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.82rem; font-weight: 700; cursor: pointer; ${currentTag === 'Current' ? 'background:#16a34a; color:#fff; border-color:#16a34a;' : 'background:#fff; color:#475569;'}">
                          🟢 Current Unit
                        </button>
                        <button type="button" class="btn-tag-toggle ${currentTag === 'Future' ? 'active' : ''}" data-tag="Future" style="padding: 6px 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.82rem; font-weight: 700; cursor: pointer; ${currentTag === 'Future' ? 'background:#64748b; color:#fff; border-color:#64748b;' : 'background:#fff; color:#475569;'}">
                          ⚪ Future Unit
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
