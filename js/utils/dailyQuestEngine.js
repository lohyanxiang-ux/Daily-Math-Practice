import { state } from "../state.js";

/**
 * Builds a 5-question Bento Box queue for Daily Quest habit building:
 * - 2 High-Score Confidence questions (Score >= 70)
 * - 3 Current / Recent Topic questions (Practiced < 14 days or active curriculum frontier)
 */
export function buildDailyQuestQueue(userState = state) {
  const curriculum = userState.curriculum || [];
  const mastery = userState.mastery || {};
  
  const now = Date.now();
  const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;

  const highScorePool = [];
  const currentRecentPool = [];
  const fallbackPool = [];

  curriculum.forEach((skill, index) => {
    const path = skill.generatorPath;
    const record = mastery[path];
    const score = record ? (Number(record.score) || 0) : 0;
    
    const lastPracticedMs = record && record.lastPracticed ? new Date(record.lastPracticed).getTime() : 0;
    const isRecent = (now - lastPracticedMs) <= FOURTEEN_DAYS_MS && lastPracticedMs > 0;
    const isCurriculumFrontier = index < 3 || skill.isCurrentUnit === true;

    const queueItem = { generatorPath: path, skill, score, primaryReason: "Daily Quest Practice" };

    if (score >= 70) {
      highScorePool.push({ ...queueItem, primaryReason: "⭐ High Score Confidence" });
    }

    if (isRecent || isCurriculumFrontier) {
      currentRecentPool.push({ ...queueItem, primaryReason: "📌 Current/Recent Topic" });
    }

    fallbackPool.push(queueItem);
  });

  const shuffle = (arr) => arr.sort(() => 0.5 - Math.random());

  const selectedQueue = [];
  const usedPaths = new Set();

  // 1. Select up to 2 High-Score Questions
  const shuffledHigh = shuffle([...highScorePool]);
  for (const item of shuffledHigh) {
    if (selectedQueue.length < 2 && !usedPaths.has(item.generatorPath)) {
      selectedQueue.push(item);
      usedPaths.add(item.generatorPath);
    }
  }

  // 2. Select up to 3 Current/Recent Questions
  const shuffledRecent = shuffle([...currentRecentPool]);
  for (const item of shuffledRecent) {
    if (selectedQueue.length < 5 && !usedPaths.has(item.generatorPath)) {
      selectedQueue.push(item);
      usedPaths.add(item.generatorPath);
    }
  }

  // 3. Fill remaining slots up to 5 questions from fallback pool
  const shuffledFallback = shuffle([...fallbackPool]);
  for (const item of shuffledFallback) {
    if (selectedQueue.length < 5 && !usedPaths.has(item.generatorPath)) {
      selectedQueue.push(item);
      usedPaths.add(item.generatorPath);
    }
  }

  return selectedQueue;
}
