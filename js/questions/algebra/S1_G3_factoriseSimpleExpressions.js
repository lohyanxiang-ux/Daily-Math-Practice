/**
 * Question Generator: Factorising Simple Expressions
 * Curriculum Skill: Sec 3 G3 - Algebra
 */

function randInt(min, max, excludeZero = false) {
  let val;
  do {
    val = Math.floor(Math.random() * (max - min + 1)) + min;
  } while (excludeZero && val === 0);
  return val;
}

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

function gcd3(a, b, c) {
  return gcd(gcd(a, b), c);
}

export function generateQuestion(tier = 1) {
  // =========================================================
  // TIER 1: BASIC (Level 1 - Numerical HCF of 2 Terms)
  // =========================================================
  if (tier === 1) {
    const k = randInt(2, 6);
    const p = randInt(1, 5);
    const q = randInt(-5, 5, true);

    const g = gcd(p, q);
    const real_k = k * g;
    const real_p = p / g;
    const real_q = q / g;

    const c1 = real_k * real_p;
    const c2 = real_k * real_q;

    const t1 = c1 === 1 ? "a" : (c1 === -1 ? "-a" : `${c1}a`);
    const t2 = c2 > 0 ? `+ ${c2}b` : `- ${Math.abs(c2)}b`;
    const expr_tex = `${t1} ${t2}`;

    const in1 = real_p === 1 ? "a" : (real_p === -1 ? "-a" : `${real_p}a`);
    const in2_term = Math.abs(real_q) === 1 ? "b" : `${Math.abs(real_q)}b`;
    const in2 = (real_q > 0 ? "+" : "-") + in2_term;
    const hcf = real_k.toString();
    const ans = `${real_k}(${in1}${in2})`;

    return {
      strand: "Algebra",
      tier: 1,
      tierName: "Basic",
      skillTitle: "Factorising Simple Expressions",
      prompt: `Factorise the expression:\n\n$$${expr_tex}$$`,
      inputCount: 1,
      inputLabels: ["="],
      expectedAnswer: ans,
      displayAnswer: ans,
      requiredForm: "factorised",
      extraKeys: ["a", "b", "c", "p", "q", "x", "y"],
      steps: [
        `Identify the highest common numerical factor of both terms: $$${hcf}$$`,
        `Factorise out the common factor and write the remaining terms inside brackets: $$${ans}$$`
      ]
    };
  }

  // =========================================================
  // TIER 2: INTERMEDIATE (Level 2 - Variable HCF or Negative HCF)
  // =========================================================
  if (tier === 2) {
    const subType = randInt(1, 2);

    if (subType === 1) {
      // Structure 1: Variable HCF (e.g. ax^2 + ay or ax^2 + a)
      const k = randInt(2, 5);
      const p = randInt(1, 5);
      const q = randInt(-5, 5, true);
      const has_y = randInt(0, 1);

      const g = gcd(p, q);
      const real_k = k * g;
      const real_p = p / g;
      const real_q = q / g;

      const c1 = real_k * real_p;
      const c2 = real_k * real_q;
      const var2 = has_y === 1 ? "y" : "";

      const t1 = c1 === 1 ? "ax" : (c1 === -1 ? "-ax" : `${c1}ax`);
      const t2 = c2 > 0 ? `+ ${c2}a${var2}` : `- ${Math.abs(c2)}a${var2}`;
      const expr_tex = `${t1} ${t2}`;

      const in1 = real_p === 1 ? "x" : (real_p === -1 ? "-x" : `${real_p}x`);
      const in2_num = Math.abs(real_q);
      const in2_term = has_y === 0 ? in2_num.toString() : (in2_num === 1 ? "y" : `${in2_num}y`);
      const in2 = (real_q > 0 ? "+" : "-") + in2_term;
      const hcf = `${real_k}a`;
      const ans = `${hcf}(${in1}${in2})`;

      return {
        strand: "Algebra",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Factorising Simple Expressions",
        prompt: `Factorise the expression completely:\n\n$$${expr_tex}$$`,
        inputCount: 1,
        inputLabels: ["="],
        expectedAnswer: ans,
        displayAnswer: ans,
        requiredForm: "factorised",
        extraKeys: ["a", "b", "c", "p", "q", "x", "y"],
        steps: [
          `Identify the highest common factor including variables: $$${hcf}$$`,
          `Factorise out $$${hcf}$$ from each term: $$${ans}$$`
        ]
      };
    } else {
      // Structure 2: Negative HCF (e.g. -ax - ay)
      const k = randInt(2, 5);
      const p = randInt(1, 5);
      const q = randInt(1, 5);
      const has_y = randInt(0, 1);

      const g = gcd(p, q);
      const real_k = k * g;
      const real_p = p / g;
      const real_q = q / g;

      const c1 = -1 * real_k * real_p;
      const c2 = -1 * real_k * real_q;
      const var2 = has_y === 1 ? "y" : "";

      const t1 = `${c1}ax`;
      const t2 = `- ${Math.abs(c2)}a${var2}`;
      const expr_tex = `${t1} ${t2}`;

      const in1 = real_p === 1 ? "x" : `${real_p}x`;
      const in2_term = has_y === 0 ? real_q.toString() : (real_q === 1 ? "y" : `${real_q}y`);
      const in2 = `+${in2_term}`;
      const hcf = `-${real_k}a`;
      const ans = `${hcf}(${in1}${in2})`;

      return {
        strand: "Algebra",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Factorising Simple Expressions",
        prompt: `Factorise the expression completely:\n\n$$${expr_tex}$$`,
        inputCount: 1,
        inputLabels: ["="],
        expectedAnswer: ans,
        displayAnswer: ans,
        requiredForm: "factorised",
        extraKeys: ["a", "b", "c", "p", "q", "x", "y"],
        steps: [
          `Identify the negative highest common factor: $$${hcf}$$`,
          `Factorise out $$${hcf}$$, making the remaining terms inside the bracket positive: $$${ans}$$`
        ]
      };
    }
  }

  // =========================================================
  // TIER 3: ADVANCED (Level 3 - 3-Term HCF or Binomial Common Factor)
  // =========================================================
  const subType = randInt(1, 2);

  if (subType === 1) {
    // Structure 1: 3-Term Expression Factorisation
    const k = randInt(2, 5);
    const p = randInt(1, 4);
    const q = randInt(-4, 4, true);
    const r = randInt(-4, 4, true);

    const gcd3_val = gcd3(p, q, r);
    const real_k = k * gcd3_val;
    const real_p = p / gcd3_val;
    const real_q = q / gcd3_val;
    const real_r = r / gcd3_val;

    const c1 = real_k * real_p;
    const c2 = real_k * real_q;
    const c3 = real_k * real_r;

    const t1 = c1 === 1 ? "a" : (c1 === -1 ? "-a" : `${c1}a`);
    const t2 = c2 > 0 ? `+ ${c2}b` : `- ${Math.abs(c2)}b`;
    const t3 = c3 > 0 ? `+ ${c3}c` : `- ${Math.abs(c3)}c`;
    const expr_tex = `${t1} ${t2} ${t3}`;

    const in1 = real_p === 1 ? "a" : (real_p === -1 ? "-a" : `${real_p}a`);
    const in2 = real_q > 0 ? `+${real_q === 1 ? "b" : real_q + "b"}` : `-${real_q === -1 ? "b" : Math.abs(real_q) + "b"}`;
    const in3 = real_r > 0 ? `+${real_r === 1 ? "c" : real_r + "c"}` : `-${real_r === -1 ? "c" : Math.abs(real_r) + "c"}`;
    const hcf = real_k.toString();
    const ans = `${real_k}(${in1}${in2}${in3})`;

    return {
      strand: "Algebra",
      tier: 3,
      tierName: "Advanced",
      skillTitle: "Factorising Simple Expressions",
      prompt: `Factorise the expression:\n\n$$${expr_tex}$$`,
      inputCount: 1,
      inputLabels: ["="],
      expectedAnswer: ans,
      displayAnswer: ans,
      requiredForm: "factorised",
      extraKeys: ["a", "b", "c", "p", "q", "x", "y"],
      steps: [
        `Find the highest common factor of all three terms: $$${hcf}$$`,
        `Divide each term by $$${hcf}$$ and write inside brackets: $$${ans}$$`
      ]
    };
  } else {
    // Structure 2: Binomial Common Factor
    const p = randInt(1, 4);
    const q = randInt(-5, 5, true);
    const var_type = randInt(0, 1);
    const c = randInt(-6, 6, true);

    const bracket_tex = var_type === 0 ? "(x + y)" : `(x ${c > 0 ? '+ ' + c : '- ' + Math.abs(c)})`;
    const bracket_ans = var_type === 0 ? "(x+y)" : `(x${c > 0 ? '+' + c : c})`;
    const term1_coeff = p === 1 ? "a" : `${p}a`;
    const term2_sign = q > 0 ? "+ " : "- ";
    const term2_coeff = Math.abs(q) === 1 ? "b" : `${Math.abs(q)}b`;
    const expr_tex = `${term1_coeff}${bracket_tex} ${term2_sign}${term2_coeff}${bracket_tex}`;

    const first_factor_ans = `(${term1_coeff}${q > 0 ? '+' : '-'}${Math.abs(q) === 1 ? 'b' : Math.abs(q) + 'b'})`;
    const hcf = bracket_tex;
    const ans = `${first_factor_ans}${bracket_ans}`;

    return {
      strand: "Algebra",
      tier: 3,
      tierName: "Advanced",
      skillTitle: "Factorising Simple Expressions",
      prompt: `Factorise the expression completely:\n\n$$${expr_tex}$$`,
      inputCount: 1,
      inputLabels: ["="],
      expectedAnswer: ans,
      displayAnswer: ans,
      requiredForm: "factorised",
      extraKeys: ["a", "b", "c", "p", "q", "x", "y"],
      steps: [
        `Identify the common binomial factor in both terms: $$${hcf}$$`,
        `Factorise out $$${hcf}$$ to combine remaining coefficients into a second bracket: $$${ans}$$`
      ]
    };
  }
}

export const factorisingSimpleExpressions = { generate: generateQuestion };
export default generateQuestion;
