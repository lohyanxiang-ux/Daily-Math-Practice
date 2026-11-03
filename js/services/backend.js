const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwEsVnKapmwUFuv0vyG1wFvyAXoFKQMrpsNxibUqYh891PHXzFgmBThnT62lGoEPo_xiQ/exec";

export async function fetchUserData(tokenInput) {
  // Extract string token if an object was passed
  const idToken = (typeof tokenInput === "object" && tokenInput !== null) 
    ? (tokenInput.credential || tokenInput.token) 
    : tokenInput;

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
