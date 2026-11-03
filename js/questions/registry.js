import { linearEquations } from "./algebra/linearEquations.js";

class QuestionRegistry {
  constructor() {
    this.map = {
      // Map your SkillIDs from Google Sheets to this generator
      "sec1_g1_alg_linear": linearEquations,
      "sec1_g2_alg_linear": linearEquations,
      "sec1_g3_alg_linear": linearEquations
    };
  }

  generateQuestion(skillId, level = "basic") {
    // If exact skillId isn't found, fallback to linearEquations for testing
    const module = this.map[skillId] || linearEquations;
    if (!module || !module.levels || !module.levels[level]) return null;

    const generators = module.levels[level];
    const selected = generators[Math.floor(Math.random() * generators.length)];
    return { strand: "Algebra", skillId: skillId, ...selected.generate() };
  }
}

export const registry = new QuestionRegistry();
