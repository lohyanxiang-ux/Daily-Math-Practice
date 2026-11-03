/**
 * Dynamically imports a question generator JS file on demand.
 * @param {string} relativePath - e.g. "algebra/quadraticFactorisation.js"
 */
export async function loadQuestionGenerator(relativePath) {
  if (!relativePath) {
    throw new Error("No generator path provided.");
  }

  // Clean relative path string
  let cleanPath = relativePath.trim()
    .replace(/^js\/questions\//, '')
    .replace(/^\/+/, '');

  if (!cleanPath.endsWith('.js')) {
    cleanPath += '.js';
  }

  let module;
  try {
    module = await import(`./${cleanPath}`);
  } catch (importErr) {
    console.warn(`Could not load [${cleanPath}]. Falling back to algebra/quadraticFactorisation.js`, importErr);
    module = await import(`./algebra/quadraticFactorisation.js`);
  }

  // Extract generator export
  const generator = module.quadraticFactorisation || module.linearEquations || module.default || Object.values(module)[0];

  if (!generator) {
    throw new Error(`No valid generator found in module '${cleanPath}'.`);
  }

  // Return a standardized generator module wrapper
  return {
    generateQuestion: (tier = 1) => {
      if (typeof generator.generateQuestion === "function") return generator.generateQuestion(tier);
      if (typeof generator.generate === "function") return generator.generate(tier);
      if (typeof generator === "function") return generator(tier);
      throw new Error(`Generator at ${cleanPath} lacks a valid generation function.`);
    },
    generate: (tier = 1) => {
      if (typeof generator.generate === "function") return generator.generate(tier);
      if (typeof generator.generateQuestion === "function") return generator.generateQuestion(tier);
      if (typeof generator === "function") return generator(tier);
      throw new Error(`Generator at ${cleanPath} lacks a valid generation function.`);
    }
  };
}

// ALIAS EXPORTS
export const loadGenerator = loadQuestionGenerator;
export const getQuestionGenerator = loadQuestionGenerator;
export default loadQuestionGenerator;
