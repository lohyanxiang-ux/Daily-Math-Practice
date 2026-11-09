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

export async function loginWithPin(pin) {
  const response = await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action: "pinLogin", pin })
  });

  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return await response.json();
}

export async function syncUserProgress(idToken, xp, streakCount, lastDailyQuestDate = null, gems = null, activeTheme = null) {
  try {
    const payload = {
      token: idToken,
      action: "updateProgress",
      xp: xp,
      streakCount: streakCount
    };

    if (lastDailyQuestDate) payload.lastDailyQuestDate = lastDailyQuestDate;
    if (gems !== null) payload.gems = gems;
    if (activeTheme) payload.activeTheme = activeTheme;

    await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.error("Failed to sync progress:", err);
  }
}

export async function redeemShopItem(idToken, itemId) {
  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        token: idToken,
        action: "redeemShopItem",
        itemId: itemId
      })
    });
    return await response.json();
  } catch (err) {
    console.error("Failed to redeem shop item:", err);
  }
}

export async function adjustStudentBalance(idToken, studentEmail, xpDelta, gemDelta, reason) {
  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        token: idToken,
        action: "adjustStudentBalance",
        studentEmail: studentEmail,
        xpDelta: xpDelta,
        gemDelta: gemDelta,
        reason: reason
      })
    });
    return await response.json();
  } catch (err) {
    console.error("Failed to adjust student balance:", err);
  }
}

export async function processRedemptionClaim(idToken, redemptionId, status) {
  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        token: idToken,
        action: "processRedemptionClaim",
        redemptionId: redemptionId,
        status: status
      })
    });
    return await response.json();
  } catch (err) {
    console.error("Failed to process redemption claim:", err);
  }
}

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

export async function saveClassSkillTags(idToken, className, tagsMap) {
  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        token: idToken,
        action: "saveClassSkillTags",
        className: className,
        tags: tagsMap
      })
    });
    return await response.json();
  } catch (err) {
    console.error("Failed to save class skill tags to Google Sheets:", err);
  }
}
