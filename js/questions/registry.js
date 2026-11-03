import { sec1_g1_alg_linear, sec1_g2_alg_linear } from "./algebra/linearEquations.js";
import { sec2_g2_alg_quad, sec2_g3_alg_quad } from "./algebra/quadraticFactorisation.js";

class QuestionRegistry {
  constructor() {
    this.map = {
      // Direct 1-to-1 SkillID Mapping
      "sec1_g1_alg_linear": sec1_g1_alg_linear,
      "sec1_g2_alg_linear": sec1_g2_alg_linear,
      "sec1_g3_alg_linear": sec1_g2_alg_linear, // G3 shares the standard module

      "sec2_g2_alg_quad": sec2_g2_alg_quad,
      "sec2_g3_alg_quad": sec2_g3_alg_quad
    };
  }

  getGenerator(skillId) {
    return this.map[skillId] || null;
  }

  generateQuestion(skillId, level = "basic") {
    const module = this.getGenerator(skillId);
    if (!module || !module.levels[level]) return null;

    const generators = module.levels[level];
    const selected = generators[Math.floor(Math.random() * generators.length)];
    return selected.generate();
  }
}

export const registry = new QuestionRegistry();
