/**
 * Dynamically imports a question generator JS file on demand.
 * @param {string} relativePath - e.g. "algebra/quadraticFactorisation.js"
 */
export async function loadAndGenerateQuestion(relativePath) {
  try {
    // Dynamic import relative to js/questions/
    const module = await import(`./${relativePath}`);

    // Automatically find exported generator object
    const generator = module.quadraticFactorisation || module.default || Object.values(module)[0];

    if (generator && typeof generator.generate === "function") {
      return generator.generate();
    } else {
      throw new Error(`Generator at ${relativePath} missing .generate() method.`);
    }
  } catch (err) {
    console.error(`Error dynamically importing module [${relativePath}]:`, err);
    return null;
  }
}
