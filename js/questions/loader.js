/**
 * Dynamically imports a question generator JS file on demand and generates a question for a specific tier.
 * @param {string} relativePath - e.g. "algebra/quadraticFactorisation.js"
 * @param {number} tier - Difficulty level (1 = Basic, 2 = Intermediate, 3 = Advanced)
 */
export async function loadQuestionGenerator(relativePath, tier = 1) {
  try {
    if (!relativePath) throw new Error("No generator path provided.");

    // Clean relative path string
    let cleanPath = relativePath.trim()
      .replace(/^js\/questions\//, '')
      .replace(/^\//, '');

    let module;
    try {
      module = await import(`./${cleanPath}`);
    } catch (importErr) {
      console.warn(`Could not load [${cleanPath}]. Falling back to quadraticFactorisation.js`, importErr);
      module = await import(`./algebra/quadraticFactorisation.js`);
    }

    const generator = module.quadraticFactorisation || module.linearEquations || module.default || Object.values(module)[0];

    if (generator && typeof generator.generate === "function") {
      // Pass the difficulty tier to the generator
      return generator.generate(tier);
    } else {
      throw new Error(`Generator at ${cleanPath} is missing a .generate() method.`);
    }
  } catch (err) {
    console.error(`Error in loadAndGenerateQuestion [${relativePath}]:`, err);
    return null;
  }
}
