// Replace with your active Google Apps Script Web App URL (must end in /exec)
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwEsVnKapmwUFuv0vyG1wFvyAXoFKQMrpsNxibUqYh891PHXzFgmBThnT62lGoEPo_xiQ/exec";

/**
 * Sends the Google ID token to the Google Apps Script backend.
 * Uses 'text/plain' to avoid CORS preflight (OPTIONS) triggers.
 */
export async function fetchUserData(tokenInput) {
  // Extract token string if an object was passed
  let idToken = tokenInput;
  if (typeof tokenInput === "object" && tokenInput !== null) {
    idToken = tokenInput.credential || tokenInput.token;
  }

  if (!idToken) {
    throw new Error("Token extraction failed before sending request.");
  }

  const response = await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify({ token: idToken })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}
