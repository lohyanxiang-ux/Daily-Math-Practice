const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwEsVnKapmwUFuv0vyG1wFvyAXoFKQMrpsNxibUqYh891PHXzFgmBThnT62lGoEPo_xiQ/exec";

export async function fetchUserData(idToken) {
  const response = await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ idToken })
  });
  return await response.json();
}
