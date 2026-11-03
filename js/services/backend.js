const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwEsVnKapmwUFuv0vyG1wFvyAXoFKQMrpsNxibUqYh891PHXzFgmBThnT62lGoEPo_xiQ/exec";

/**
 * Sends authentication token to fetch user profile & curriculum.
 */
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
 * Writes updated XP and Streak values back to Google Sheets.
 */
export async function syncUserProgress(idToken, xp, streakCount) {
  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        token: idToken,
        action: "updateProgress",
        xp: xp,
        streakCount: streakCount
      })
    });
    return await response.json();
  } catch (err) {
    console.error("Failed to sync progress to Google Sheet:", err);
  }
}
