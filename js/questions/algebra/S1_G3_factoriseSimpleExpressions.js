/**
 * Standalone ES Module Question Generator: Factorising Simple Expressions
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
  let prompt = "";
  let expectedAnswer = "";
  let displayAnswer = "";
  let steps = [];

  if (tier === 1) {
    // Level 1: Numerical HCF of two terms
    const k = randInt(2, 6);
    const p = randInt(1, 5);
    const q = randInt(-5, 5, true);

    const g = gcd(p, q);
    const real_k = k * g;
    const real_p = p / g;
    const real_q = q / g;

    const c1 = real_k * real_p;
    const c2 = real_k * real_q;

    const t1 = c1 === 1 ? 'a' : (c1 === -1 ? '-a' : c1 + 'a');
    const t2 = c2 > 0 ? `+ ${c2}b` : `- ${Math.abs(c2)}b`;
    const expr_tex = `${t1} ${t2}`;

    const in1 = real_p === 1 ? 'a' : (real_p === -1 ? '-a' : real_p + 'a');
    const in2_term = Math.abs(real_q) === 1 ? 'b' : Math.abs(real_q) + 'b';
    const in2 = (real_q > 0 ? '+' : '-') + in2_term;
    const hcf = real_k.toString();

    expectedAnswer = `${real_k}(${in1}${in2})`;
    displayAnswer = expectedAnswer;
    prompt = `Factorise the expression:\n\n$$${expr_tex}$$`;

    steps = [
      `Identify the highest common numerical factor of both terms: $$${hcf}$$`,
      `Factorise out the common factor and write the remaining terms inside brackets: $$${expectedAnswer}$$`
    ];
  } else if (tier === 2) {
    // Level 2: Variable HCF or Negative HCF
    const subType = randInt(0, 1);

    if (subType === 0) {
      // Variable HCF
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
      const var2 = has_y === 1 ? 'y' : '';

      const t1 = c1 === 1 ? 'ax' : (c1 === -1 ? '-ax' : `${c1}ax`);
      const t2 = c2 > 0 ? `+ ${c2}a${var2}` : `- ${Math.abs(c2)}a${var2}`;
      const expr_tex = `${t1} ${t2}`;

      const in1 = real_p === 1 ? 'x' : (real_p === -1 ? '-x' : `${real_p}x`);
      const in2_num = Math.abs(real_q);
      const in2_term = has_y === 0 ? in2_num.toString() : (in2_num === 1 ? 'y' : `${in2_num}y`);
      const in2 = (real_q > 0 ? '+' : '-') + in2_term;
      const hcf = `${real_k}a`;

      expectedAnswer = `${hcf}(${in1}${in2})`;
      displayAnswer = expectedAnswer;
      prompt = `Factorise the expression completely:\n\n$$${expr_tex}$$`;

      steps = [
        `Identify the highest common factor including variables: $$${hcf}$$`,
        `Factorise out $$${hcf}$$ from each term: $$${expectedAnswer}$$`
      ];
    } else {
      // Negative HCF
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
      const var2 = has_y === 1 ? 'y' : '';

      const t1 = `${c1}ax`;
      const t2 = `${c2}a${var2}`;
      const expr_tex = `${t1} ${c2 > 0 ? '+ ' + c2 : c2}a${var2}`;

      const in1 = real_p === 1 ? 'x' : `${real_p}x`;
      const in2_term = has_y === 0 ? real_q.toString() : (real_q === 1 ? 'y' : `${real_q}y`);
      const in2 = `+${in2_term}`;
      const hcf = `-${real_k}a`;

      expectedAnswer = `${hcf}(${in1}${in2})`;
      displayAnswer = expectedAnswer;
      prompt = `Factorise the expression completely:\n\n$$${expr_tex}$$`;

      steps = [
        `Identify the negative highest common factor: $$${hcf}$$`,
        `Factorise out $$${hcf}$$, making the remaining terms inside the bracket positive: $$${expectedAnswer}$$`
      ];
    }
  } else {
    // Level 3: 3 Terms or Binomial Common Factor
    const subType = randInt(0, 1);

    if (subType === 0) {
      // 3 terms HCF
      const k = randInt(2, 5);
      const p = randInt(1, 4);
      const q = randInt(-4, 4, true);
      const r = randInt(-4, 4, true);

      const g = gcd3(p, q, r);
      const real_k = k * g;
      const real_p = p / g;
      const real_q = q / g;
      const real_r = r / g;

      const c1 = real_k * real_p;
      const c2 = real_k * real_q;
      const c3 = real_k * real_r;

      const t1 = c1 === 1 ? 'a' : (c1 === -1 ? '-a' : `${c1}a`);
      const t2 = c2 > 0 ? `+ ${c2}b` : `- ${Math.abs(c2)}b`;
      const t3 = c3 > 0 ? `+ ${c3}c` : `- ${Math.abs(c3)}c`;
      const expr_tex = `${t1} ${t2} ${t3}`;

      const in1 = real_p === 1 ? 'a' : (real_p === -1 ? '-a' : `${real_p}a`);
      const in2 = real_q > 0 ? `+${real_q === 1 ? 'b' : real_q + 'b'}` : `-${real_q === -1 ? 'b' : Math.abs(real_q) + 'b'}`;
      const in3 = real_r > 0 ? `+${real_r === 1 ? 'c' : real_r + 'c'}` : `-${real_r === -1 ? 'c' : Math.abs(real_r) + 'c'}`;
      const hcf = real_k.toString();

      expectedAnswer = `${real_k}(${in1}${in2}${in3})`;
      displayAnswer = expectedAnswer;
      prompt = `Factorise the expression:\n\n$$${expr_tex}$$`;

      steps = [
        `Find the highest common factor of all three terms: $$${hcf}$$`,
        `Divide each term by $$${hcf}$$ and write inside brackets: $$${expectedAnswer}$$`
      ];
    } else {
      // Binomial Common Factor
      const p = randInt(1, 4);
      const q = randInt(-5, 5, true);
      const var_type = randInt(0, 1);
      const c = randInt(-6, 6, true);

      const bracket_tex = var_type === 0 ? '(x + y)' : `(x ${c > 0 ? '+ ' + c : '- ' + Math.abs(c)})`;
      const bracket_ans = var_type === 0 ? '(x+y)' : `(x${c > 0 ? '+' + c : c})`;
      const term1_coeff = p === 1 ? 'a' : `${p}a`;
      const term2_sign = q > 0 ? '+ ' : '- ';
      const term2_coeff = Math.abs(q) === 1 ? 'b' : `${Math.abs(q)}b`;
      const expr_tex = `${term1_coeff}${bracket_tex} ${term2_sign}${term2_coeff}${bracket_tex}`;

      const first_factor_ans = `(${term1_coeff}${q > 0 ? '+' : '-'}${Math.abs(q) === 1 ? 'b' : Math.abs(q) + 'b'})`;
      const hcf = bracket_tex;

      expectedAnswer = `${first_factor_ans}${bracket_ans}`;
      displayAnswer = expectedAnswer;
      prompt = `Factorise the expression completely:\n\n$$${expr_tex}$$`;

      steps = [
        `Identify the common binomial factor in both terms: $$${hcf}$$`,
        `Factorise out $$${hcf}$$ to combine remaining coefficients into a second bracket: $$${expectedAnswer}$$`
      ];
    }
  }

  return {
    strand: "Algebra & Functions",
    tier: tier,
    tierName: tier === 1 ? "Basic" : (tier === 2 ? "Intermediate" : "Advanced"),
    skillTitle: "Factorising Simple Expressions",
    prompt: prompt,
    inputCount: 1,
    inputLabels: ["="],
    expectedAnswer: expectedAnswer,
    displayAnswer: displayAnswer,
    requiredForm: "factorised",
    extraKeys: ["a", "b", "c", "x", "y"],
    steps: steps
  };
}

export const factorisingSimpleExpressionsGenerator = { generate: generateQuestion };
export default generateQuestion;
