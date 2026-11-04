const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwEsVnKapmwUFuv0vyG1wFvyAXoFKQMrpsNxibUqYh891PHXzFgmBThnT62lGoEPo_xiQ/exec";

export async function fetchUserData(tokenInput) {
  let idToken = typeof tokenInput === "object" ? tokenInput.credential || tokenInput.token : tokenInput;

  const response = await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ token: idToken })
  });

  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return await response.json();
}

/**
 * Authenticates students using 4-digit PIN only (Column L PIN & Column K Active Status verification).
 */
export async function loginWithPin(pin) {
  const response = await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action: "pinLogin", pin })
  });

  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return await response.json();
}

/**
 * Syncs user XP, Streak, and optional Daily Quest completion date.
 */
export async function syncUserProgress(idToken, xp, streakCount, lastDailyQuestDate = null) {
  try {
    const payload = {
      token: idToken,
      action: "updateProgress",
      xp: xp,
      streakCount: streakCount
    };

    if (lastDailyQuestDate) {
      payload.lastDailyQuestDate = lastDailyQuestDate;
    }

    await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.error("Failed to sync progress:", err);
  }
}

/**
 * Transmits dirty skill mastery records in a single batch request.
 */
export async function syncBatchMastery(idToken, updatesArray) {
  if (!updatesArray || updatesArray.length === 0) return;

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        token: idToken,
        action: "batchUpdateMastery",
        updates: updatesArray
      })
    });
    return await response.json();
  } catch (err) {
    console.error("Failed to sync batch mastery to Google Sheets:", err);
  }
}
