/**
 * Dynamically imports a question generator JS file on demand.
 * @param {string} relativePath - e.g. "algebra/linearEquations.js"
 */
export async function loadAndGenerateQuestion(relativePath) {
  try {
    if (!relativePath) throw new Error("No generator path provided.");

    // Strip leading 'js/questions/' or '/' if present in Google Sheets
    let cleanPath = relativePath.trim()
      .replace(/^js\/questions\//, '')
      .replace(/^\//, '');

    let module;
    try {
      // Dynamic import relative to js/questions/
      module = await import(`./${cleanPath}`);
    } catch (importErr) {
      console.warn(`Could not load [${cleanPath}]. Falling back to quadraticFactorisation.js`, importErr);
      // Fallback generator so the UI never breaks while building new topics
      module = await import(`./algebra/quadraticFactorisation.js`);
    }

    // Automatically locate exported generator object
    const generator = module.quadraticFactorisation || module.linearEquations || module.default || Object.values(module)[0];

    if (generator && typeof generator.generate === "function") {
      return generator.generate();
    } else {
      throw new Error(`Generator at ${cleanPath} is missing a .generate() method.`);
    }
  } catch (err) {
    console.error(`Error in loadAndGenerateQuestion [${relativePath}]:`, err);
    return null;
  }
}
