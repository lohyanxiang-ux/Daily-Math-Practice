/**
 * Question Generator: Indices Mastery Trainer
 * Curriculum Skill: Sec 3 G3 - Indices & Exponential Equations
 */

function randInt(min, max, excludeZero = false) {
  let val;
  do {
    val = Math.floor(Math.random() * (max - min + 1)) + min;
  } while (excludeZero && val === 0);
  return val;
}

function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}

export function generateQuestion(tier = 1) {
  const extraKeys = ["a", "b", "m", "n", "p", "q", "x", "y", "^"];

  // =========================================================
  // TIER 1: BASIC (Multiplication, Division & Power of a Product Laws)
  // =========================================================
  if (tier === 1) {
    const subType = randInt(1, 3);

    if (subType === 1) {
      // Multiplication law: x^m * x^n
      const m = randInt(2, 7);
      const n = randInt(2, 7);
      const sum = m + n;
      const ans = `x^${sum}`;
      const step1 = `x^{${m} + ${n}}`;

      return {
        strand: "Algebra",
        tier: 1,
        tierName: "Basic",
        skillTitle: "Indices Mastery Trainer",
        prompt: `Simplify the expression:\n\n$$x^{${m}} \\times x^{${n}}$$`,
        diagramSvg: null,
        inputCount: 1,
        inputLabels: ["="],
        expectedAnswer: ans,
        displayAnswer: `x^{${sum}}`,
        extraKeys,
        steps: [
          `Apply the multiplication law of indices ($x^m \\times x^n = x^{m+n}$): $$${step1}$$`,
          `Simplify the exponent: $$x^{${sum}}$$`
        ]
      };
    }

    if (subType === 2) {
      // Division law: y^m / y^n
      const m = randInt(6, 12);
      const n = randInt(2, 5);
      const diff = m - n;
      const ans = `y^${diff}`;
      const step1 = `y^{${m} - ${n}}`;

      return {
        strand: "Algebra",
        tier: 1,
        tierName: "Basic",
        skillTitle: "Indices Mastery Trainer",
        prompt: `Simplify the expression:\n\n$$\\frac{y^{${m}}}{y^{${n}}}$$`,
        diagramSvg: null,
        inputCount: 1,
        inputLabels: ["="],
        expectedAnswer: ans,
        displayAnswer: `y^{${diff}}`,
        extraKeys,
        steps: [
          `Apply the division law of indices ($\\frac{y^m}{y^n} = y^{m-n}$): $$${step1}$$`,
          `Simplify the exponent: $$y^{${diff}}$$`
        ]
      };
    }

    // subType === 3: Power of a product: (c * p^m)^n
    const c = randInt(2, 4);
    const m = randInt(2, 5);
    const n = randInt(2, 3);
    const c_pow = Math.pow(c, n);
    const m_tot = m * n;
    const ans = `${c_pow}p^${m_tot}`;
    const step1 = `${c}^{${n}} \\times p^{${m} \\times ${n}}`;

    return {
      strand: "Algebra",
      tier: 1,
      tierName: "Basic",
      skillTitle: "Indices Mastery Trainer",
      prompt: `Simplify the expression:\n\n$$(${c}p^{${m}})^{${n}}$$`,
      diagramSvg: null,
      inputCount: 1,
      inputLabels: ["="],
      expectedAnswer: ans,
      displayAnswer: `${c_pow}p^{${m_tot}}`,
      extraKeys,
      steps: [
        `Raise both the coefficient and variable term to the power of $${n}$: $$${step1}$$`,
        `Simplify: $$${c_pow}p^{${m_tot}}$$`
      ]
    };
  }

  // =========================================================
  // TIER 2: INTERMEDIATE (Negative Indices & Surd to Fractional Index)
  // =========================================================
  if (tier === 2) {
    const subType = randInt(1, 3);

    if (subType === 1) {
      // Division with negative indices: (-ap^-m) / (-bp^n)
      const primes = [7, 11, 13, 17, 19];
      const a = primes[randInt(0, primes.length - 1)];
      const b = randInt(2, 5);
      const m = randInt(2, 6);
      const n = randInt(2, 6);
      const denomExp = m + n;

      const ans = `${a}/${b}p^${denomExp}`;
      const step1 = `\\frac{${a}}{${b}p^{${n}} \\times p^{${m}}}`;
      const step2 = `\\frac{${a}}{${b}p^{${m} + ${n}}}`;

      return {
        strand: "Algebra",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Indices Mastery Trainer",
        prompt: `Simplify the expression, leaving your answer in positive index form:\n\n$$\\frac{-${a}p^{-${m}}}{-${b}p^{${n}}}$$`,
        diagramSvg: null,
        inputCount: 1,
        inputLabels: ["="],
        expectedAnswer: ans,
        displayAnswer: `\\frac{${a}}{${b}p^{${denomExp}}}`,
        extraKeys,
        steps: [
          `Cancel negative signs $\\frac{-${a}}{-${b}} = \\frac{${a}}{${b}}$ and move $p^{-${m}}$ into the denominator: $$${step1}$$`,
          `Combine exponents in the denominator: $$${step2}$$`,
          `Final positive index form: $$\\frac{${a}}{${b}p^{${denomExp}}}$$`
        ]
      };
    }

    if (subType === 2) {
      // Power with negative index: (ax^m)^(-n)
      const a = randInt(2, 5);
      const m = randInt(2, 4);
      const n = randInt(2, 3);
      const denomCoeff = Math.pow(a, n);
      const denomExp = m * n;

      const ans = `1/${denomCoeff}x^${denomExp}`;
      const step1 = `\\frac{1}{(${a}x^{${m}})^{${n}}}`;
      const step2 = `\\frac{1}{${denomCoeff}x^{${denomExp}}}`;

      return {
        strand: "Algebra",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Indices Mastery Trainer",
        prompt: `Express the expression using a positive index:\n\n$$(${a}x^{${m}})^{-${n}}$$`,
        diagramSvg: null,
        inputCount: 1,
        inputLabels: ["="],
        expectedAnswer: ans,
        displayAnswer: `\\frac{1}{${denomCoeff}x^{${denomExp}}}`,
        extraKeys,
        steps: [
          `Apply the negative index law ($x^{-n} = \\frac{1}{x^n}$): $$${step1}$$`,
          `Simplify the denominator: $$${step2}$$`
        ]
      };
    }

    // subType === 3: Surd to fractional index: nth-root(y^m_eff)
    const n = randInt(3, 6);
    const m = randInt(2, 5);
    const m_eff = m === n ? m + 1 : m;
    const g = gcd(m_eff, n);
    const num = m_eff / g;
    const den = n / g;

    const ans =
      den === 1 ? (num === 1 ? "y" : `y^${num}`) : `y^${num}/${den}`;
    const step1 = `y^{\\frac{${m_eff}}{${n}}}`;
    const step2Tex =
      den === 1
        ? num === 1
          ? "y"
          : `y^{${num}}`
        : `y^{\\frac{${num}}{${den}}}`;

    return {
      strand: "Algebra",
      tier: 2,
      tierName: "Intermediate",
      skillTitle: "Indices Mastery Trainer",
      prompt: `Express in index form:\n\n$$\\sqrt[${n}]{y^{${m_eff}}}$$`,
      diagramSvg: null,
      inputCount: 1,
      inputLabels: ["="],
      expectedAnswer: ans,
      displayAnswer: step2Tex,
      extraKeys,
      steps: [
        `Apply the fractional index law ($\\sqrt[n]{y^m} = y^{\\frac{m}{n}}$): $$${step1}$$`,
        `Simplify the fractional index to lowest terms: $$${step2Tex}$$`
      ]
    };
  }

  // =========================================================
  // TIER 3: ADVANCED (Exponential Equations & Complex Surd/Index Expressions)
  // =========================================================
  const subType = randInt(1, 11);
  const smallBases = [2, 3, 5];

  if (subType === 1) {
    // Exponential equation - addition: a^(x + b) = c
    const a = smallBases[randInt(0, smallBases.length - 1)];
    const k = randInt(2, 4);
    const b = randInt(1, 5);
    const c = Math.pow(a, k);
    const ans = (k - b).toString();

    return {
      strand: "Algebra",
      tier: 3,
      tierName: "Advanced",
      skillTitle: "Indices Mastery Trainer",
      prompt: `Solve for $x$ in the exponential equation:\n\n$$${a}^{x + ${b}} = ${c}$$`,
      diagramSvg: null,
      inputCount: 1,
      inputLabels: ["x ="],
      expectedAnswer: ans,
      displayAnswer: `x = ${ans}`,
      extraKeys,
      steps: [
        `Express both sides with base ${a}: $$${a}^{x + ${b}} = ${a}^{${k}}$$`,
        `Equate the exponents: $$x + ${b} = ${k}$$`,
        `Solve for $x$: $$x = ${ans}$$`
      ]
    };
  }

  if (subType === 2) {
    // Exponential equation - subtraction: a^(x - b) = c
    const a = smallBases[randInt(0, smallBases.length - 1)];
    const k = randInt(2, 4);
    const b = randInt(1, 5);
    const c = Math.pow(a, k);
    const ans = (k + b).toString();

    return {
      strand: "Algebra",
      tier: 3,
      tierName: "Advanced",
      skillTitle: "Indices Mastery Trainer",
      prompt: `Solve for $x$ in the exponential equation:\n\n$$${a}^{x - ${b}} = ${c}$$`,
      diagramSvg: null,
      inputCount: 1,
      inputLabels: ["x ="],
      expectedAnswer: ans,
      displayAnswer: `x = ${ans}`,
      extraKeys,
      steps: [
        `Express both sides with base ${a}: $$${a}^{x - ${b}} = ${a}^{${k}}$$`,
        `Equate the exponents: $$x - ${b} = ${k}$$`,
        `Solve for $x$: $$x = ${ans}$$`
      ]
    };
  }

  if (subType === 3) {
    // Exponential equation - product of powers: a^x * c = d
    const a = smallBases[randInt(0, smallBases.length - 1)];
    const k = randInt(1, 3);
    const m = randInt(4, 6);
    const c = Math.pow(a, k);
    const d = Math.pow(a, m);
    const ans = (m - k).toString();

    return {
      strand: "Algebra",
      tier: 3,
      tierName: "Advanced",
      skillTitle: "Indices Mastery Trainer",
      prompt: `Solve for $x$ in the exponential equation:\n\n$$${a}^x \\times ${c} = ${d}$$`,
      diagramSvg: null,
      inputCount: 1,
      inputLabels: ["x ="],
      expectedAnswer: ans,
      displayAnswer: `x = ${ans}`,
      extraKeys,
      steps: [
        `Express all numbers with base ${a}: $$${a}^x \\times ${a}^{${k}} = ${a}^{${m}}$$`,
        `Apply the multiplication law of indices: $$${a}^{x + ${k}} = ${a}^{${m}}$$`,
        `Equate exponents: $$x + ${k} = ${m}$$`,
        `Solve for $x$: $$x = ${ans}$$`
      ]
    };
  }

  if (subType === 4) {
    // Exponential equation - bases on both sides: (base^p)^(x - b) = (base^q)^x
    const twoFive = [2, 5];
    const base = twoFive[randInt(0, 1)];
    const p = randInt(2, 3);
    const b = randInt(1, 4);
    const q = p === 2 ? 3 : 2;
    const lhsBase = Math.pow(base, p);
    const rhsBase = Math.pow(base, q);
    const ans = ((p * b) / (p - q)).toString();

    return {
      strand: "Algebra",
      tier: 3,
      tierName: "Advanced",
      skillTitle: "Indices Mastery Trainer",
      prompt: `Solve for $x$ in the exponential equation:\n\n$$${lhsBase}^{x - ${b}} = ${rhsBase}^x$$`,
      diagramSvg: null,
      inputCount: 1,
      inputLabels: ["x ="],
      expectedAnswer: ans,
      displayAnswer: `x = ${ans}`,
      extraKeys,
      steps: [
        `Rewrite both sides with base ${base}: $$(${base}^{${p}})^{x - ${b}} = (${base}^{${q}})^x$$`,
        `Apply the power of a power law: $$${base}^{${p}(x - ${b})} = ${base}^{${q}x}$$`,
        `Equate exponents: $$${p}(x - ${b}) = ${q}x$$`,
        `Solve for $x$: $$x = ${ans}$$`
      ]
    };
  }

  if (subType === 5) {
    // Exponential equation - reciprocal exponent: base^(x + b) = 1 / rhs_expr
    const threeFive = [3, 5];
    const base = threeFive[randInt(0, 1)];
    const k = randInt(1, 2);
    const mult = randInt(1, 4);
    const b = mult * (1 + k);
    const ans = (-mult).toString();
    const rhs_expr = k === 1 ? `${base}^x` : `${Math.pow(base, 2)}^x`;
    const negExpStr = k === 1 ? "-x" : `-${k}x`;

    return {
      strand: "Algebra",
      tier: 3,
      tierName: "Advanced",
      skillTitle: "Indices Mastery Trainer",
      prompt: `Solve for $x$ in the exponential equation:\n\n$$${base}^{x + ${b}} = \\frac{1}{${rhs_expr}}$$`,
      diagramSvg: null,
      inputCount: 1,
      inputLabels: ["x ="],
      expectedAnswer: ans,
      displayAnswer: `x = ${ans}`,
      extraKeys,
      steps: [
        `Express the denominator on the RHS using base ${base}: $$${base}^{x + ${b}} = \\frac{1}{(${base}^{${k}})^x}$$`,
        `Apply negative index law: $$${base}^{x + ${b}} = ${base}^{${negExpStr}}$$`,
        `Equate exponents: $$x + ${b} = ${negExpStr}$$`,
        `Solve for $x$: $$x = ${ans}$$`
      ]
    };
  }

  if (subType === 6) {
    // Exponential equation - repeated addition: a * a^m = a^x
    const a = randInt(2, 5);
    const m = randInt(10, 45);
    const ans = (m + 1).toString();
    const term = `${a}^{${m}}`;
    const terms = Array(a).fill(term).join(" + ");

    return {
      strand: "Algebra",
      tier: 3,
      tierName: "Advanced",
      skillTitle: "Indices Mastery Trainer",
      prompt: `Solve for $x$ in the exponential equation:\n\n$$${terms} = ${a}^x$$`,
      diagramSvg: null,
      inputCount: 1,
      inputLabels: ["x ="],
      expectedAnswer: ans,
      displayAnswer: `x = ${ans}`,
      extraKeys,
      steps: [
        `Combine the repeated addition of ${a} identical terms into multiplication: $$${a} \\times ${a}^{${m}} = ${a}^x$$`,
        `Apply the multiplication law of indices ($x^1 \\times x^m = x^{1+m}$): $$${a}^{1 + ${m}} = ${a}^x$$`,
        `Simplify the exponent: $$${a}^{${m + 1}} = ${a}^x$$`,
        `Equate exponents: $$x = ${ans}$$`
      ]
    };
  }

  if (subType === 7) {
    // Surd division with fractional indices: p-th root(a^m) / q-th root(a^n)
    const p = randInt(3, 5);
    const m = randInt(1, 4);
    const q = randInt(2, 4);
    const n = randInt(3, 5);

    const rad2 = q === 2 ? `\\sqrt{a^{${n}}}` : `\\sqrt[${q}]{a^{${n}}}`;
    const raw_num = m * q - n * p;
    const raw_den = p * q;
    const g = gcd(raw_num, raw_den);
    const num = raw_num / g;
    const den = raw_den / g;

    const ans = den === 1 ? `a^${num}` : `a^(${num}/${den})`;
    const step1 = `a^{\\frac{${m}}{${p}}} \\div a^{\\frac{${n}}{${q}}}`;
    const step2 = `a^{\\frac{${m}}{${p}} - \\frac{${n}}{${q}}}`;
    const step3Tex =
      den === 1
        ? `a^{${num}}`
        : num < 0
          ? `a^{-\\frac{${Math.abs(num)}}{${den}}}`
          : `a^{\\frac{${num}}{${den}}}`;

    return {
      strand: "Algebra",
      tier: 3,
      tierName: "Advanced",
      skillTitle: "Indices Mastery Trainer",
      prompt: `Simplify the following, expressing your answer in index form:\n\n$$\\sqrt[${p}]{a^{${m}}} \\div ${rad2}$$`,
      diagramSvg: null,
      inputCount: 1,
      inputLabels: ["="],
      expectedAnswer: ans,
      displayAnswer: step3Tex,
      extraKeys,
      steps: [
        `Convert surds into fractional index form: $$${step1}$$`,
        `Apply the division law of indices ($a^m \\div a^n = a^{m-n}$): $$${step2}$$`,
        `Simplify the fractional exponent: $$${step3Tex}$$`
      ]
    };
  }

  if (subType === 8) {
    // Product of power with radical and fractional exponent: (ca)^(-1/k) * p-th root(d / a^m)
    const c_base = randInt(2, 3);
    const k = randInt(2, 3);
    const d_base = randInt(2, 4);
    const p = randInt(2, 4);
    const m = randInt(1, 5);

    const c = Math.pow(c_base, k);
    const d = Math.pow(d_base, p);

    const coeff_gcd = gcd(d_base, c_base);
    const coeff_num = d_base / coeff_gcd;
    const coeff_den = c_base / coeff_gcd;
    const coeff_str =
      coeff_den === 1 ? coeff_num.toString() : `${coeff_num}/${coeff_den}`;
    const coeff_latex =
      coeff_den === 1
        ? coeff_num === 1
          ? ""
          : coeff_num.toString()
        : `\\frac{${coeff_num}}{${coeff_den}}`;

    const exp_num_raw = -p - m * k;
    const exp_den_raw = k * p;
    const exp_gcd = gcd(exp_num_raw, exp_den_raw);
    const exp_num = exp_num_raw / exp_gcd;
    const exp_den = exp_den_raw / exp_gcd;

    const exp_str =
      exp_den === 1
        ? `a^{${exp_num}}`
        : `a^{-\\frac{${Math.abs(exp_num)}}{${exp_den}}}`;
    const ans = `${coeff_str}a^${exp_num}/${exp_den}`;

    const step1 = `\\frac{1}{${c_base}} a^{-\\frac{1}{${k}}} \\times \\frac{${d_base}}{a^{\\frac{${m}}{${p}}}}`;
    const step2 = `${coeff_latex ? `${coeff_latex} ` : ""}a^{-\\frac{1}{${k}} - \\frac{${m}}{${p}}}`;
    const step3 = `${coeff_latex ? `${coeff_latex} ` : ""}${exp_str}`;

    return {
      strand: "Algebra",
      tier: 3,
      tierName: "Advanced",
      skillTitle: "Indices Mastery Trainer",
      prompt: `Simplify the following, expressing your answer in index form:\n\n$$(${c}a)^{-\\frac{1}{${k}}} \\times \\sqrt[${p}]{\\frac{${d}}{a^{${m}}}}$$`,
      diagramSvg: null,
      inputCount: 1,
      inputLabels: ["="],
      expectedAnswer: ans,
      displayAnswer: step3,
      extraKeys,
      steps: [
        `Evaluate numerical roots and convert surds to fractional index form: $$${step1}$$`,
        `Multiply numerical coefficients and combine powers of $a$: $$${step2}$$`,
        `Simplify the exponent: $$${step3}$$`
      ]
    };
  }

  if (subType === 9) {
    // Multivariable fractional indices with powers
    const a1 = randInt(-2, -1);
    const b1 = randInt(1, 3);
    const c1 = randInt(2, 3);
    const p1 = randInt(2, 4);
    const a2 = randInt(-3, -1);
    const b2 = randInt(-4, -2);
    const c2 = randInt(3, 5);
    const p2_num = -1;
    const p2_den = 2;

    const m_exp_raw_num = a1 * p1 * p2_den + a2 * p2_num;
    const m_exp_raw_den = p2_den;
    const m_gcd = gcd(m_exp_raw_num, m_exp_raw_den);
    const m_num = m_exp_raw_num / m_gcd;
    const m_den = m_exp_raw_den / m_gcd;

    const m_str =
      m_den === 1
        ? m_num === 1
          ? "m"
          : m_num === 0
            ? ""
            : `m^{${m_num}}`
        : m_num < 0
          ? `m^{-\\frac{${Math.abs(m_num)}}{${m_den}}}`
          : `m^{\\frac{${m_num}}{${m_den}}}`;

    const n_exp_raw_num = b1 * p1 * c2 * p2_den + b2 * p2_num * c1;
    const n_exp_raw_den = c1 * c2 * p2_den;
    const n_gcd = gcd(n_exp_raw_num, n_exp_raw_den);
    const n_num = n_exp_raw_num / n_gcd;
    const n_den = n_exp_raw_den / n_gcd;

    const n_str =
      n_den === 1
        ? n_num === 1
          ? "n"
          : n_num === 0
            ? ""
            : `n^{${n_num}}`
        : n_num < 0
          ? `n^{-\\frac{${Math.abs(n_num)}}{${n_den}}}`
          : `n^{\\frac{${n_num}}{${n_den}}}`;

    const ans = `${m_str}${n_str}`;
    const m2_num_raw = a2 * p2_num;
    const m2_tex =
      m2_num_raw % p2_den === 0
        ? `m^{${m2_num_raw / p2_den}}`
        : `m^{\\frac{${m2_num_raw}}{${p2_den}}}`;

    const step1 = `(m^{${a1 * p1}} n^{\\frac{${b1 * p1}}{${c1}}})(${m2_tex} n^{\\frac{${b2 * p2_num}}{${c2 * p2_den}}})`;

    return {
      strand: "Algebra",
      tier: 3,
      tierName: "Advanced",
      skillTitle: "Indices Mastery Trainer",
      prompt: `Simplify the following, expressing your answer in index form:\n\n$$(m^{${a1}} n^{\\frac{${b1}}{${c1}}})^{${p1}} (m^{${a2}} n^{\\frac{${b2}}{${c2}}})^{\\frac{${p2_num}}{${p2_den}}}$$`,
      diagramSvg: null,
      inputCount: 1,
      inputLabels: ["="],
      expectedAnswer: ans,
      displayAnswer: ans,
      extraKeys,
      steps: [
        `Apply power of a power law to expand brackets: $$${step1}$$`,
        `Combine like bases by adding exponents: $$${ans}$$`
      ]
    };
  }

  if (subType === 10) {
    // Multivariable product, quotient, or power of product in positive index form
    const variant = randInt(1, 3);

    if (variant === 1) {
      const m1 = randInt(2, 5);
      const n1 = randInt(1, 4);
      const m2 = randInt(2, 5);
      const n2 = randInt(1, 4);
      const m_sum = m1 + m2;
      const n_sum = n1 + n2;
      const ans = `x^${m_sum}y^${n_sum}`;

      return {
        strand: "Algebra",
        tier: 3,
        tierName: "Advanced",
        skillTitle: "Indices Mastery Trainer",
        prompt: `Simplify the following, expressing your answer in positive index form:\n\n$$(x^{${m1}} y^{${n1}})(x^{${m2}} y^{${n2}})$$`,
        diagramSvg: null,
        inputCount: 1,
        inputLabels: ["="],
        expectedAnswer: ans,
        displayAnswer: `x^{${m_sum}} y^{${n_sum}}`,
        extraKeys,
        steps: [
          `Apply the multiplication law ($x^a \\times x^b = x^{a+b}$): $$x^{${m1} + ${m2}} y^{${n1} + ${n2}}$$`,
          `Simplify exponents: $$x^{${m_sum}} y^{${n_sum}}$$`
        ]
      };
    }

    if (variant === 2) {
      const m1 = randInt(4, 7);
      const n1 = randInt(2, 5);
      const m2 = randInt(1, 3);
      const n2 = randInt(6, 9);
      const m_diff = m1 - m2;
      const n_diff = n1 - n2;
      const n_pos = Math.abs(n_diff);
      const ans = `a^${m_diff}/b^${n_pos}`;

      return {
        strand: "Algebra",
        tier: 3,
        tierName: "Advanced",
        skillTitle: "Indices Mastery Trainer",
        prompt: `Simplify the following, expressing your answer in positive index form:\n\n$$(a^{${m1}} b^{${n1}}) \\div (a^{${m2}} b^{${n2}})$$`,
        diagramSvg: null,
        inputCount: 1,
        inputLabels: ["="],
        expectedAnswer: ans,
        displayAnswer: `\\frac{a^{${m_diff}}}{b^{${n_pos}}}`,
        extraKeys,
        steps: [
          `Apply the division law ($a^m \\div a^n = a^{m-n}$): $$a^{${m1} - ${m2}} b^{${n1} - ${n2}}$$`,
          `Simplify exponents: $$a^{${m_diff}} b^{-${n_pos}}$$`,
          `Convert negative exponent to positive index form: $$\\frac{a^{${m_diff}}}{b^{${n_pos}}}$$`
        ]
      };
    }

    const c = randInt(2, 4);
    const m = randInt(2, 4);
    const n = randInt(2, 5);
    const k = randInt(2, 3);
    const c_pow = Math.pow(c, k);
    const m_tot = m * k;
    const n_tot = n * k;
    const ans = `${c_pow}a^${m_tot}b^${n_tot}`;

    return {
      strand: "Algebra",
      tier: 3,
      tierName: "Advanced",
      skillTitle: "Indices Mastery Trainer",
      prompt: `Simplify the following, expressing your answer in positive index form:\n\n$$(${c}a^{${m}} b^{${n}})^{${k}}$$`,
      diagramSvg: null,
      inputCount: 1,
      inputLabels: ["="],
      expectedAnswer: ans,
      displayAnswer: `${c_pow}a^{${m_tot}}b^{${n_tot}}`,
      extraKeys,
      steps: [
        `Apply power of a product law to coefficient and each variable: $$${c}^{${k}} a^{${m} \\times ${k}} b^{${n} \\times ${k}}$$`,
        `Simplify: $$${c_pow}a^{${m_tot}}b^{${n_tot}}$$`
      ]
    };
  }

  // subType === 11: Complex rational expression with powers
  const c1 = randInt(-3, -2);
  const m1 = randInt(2, 4);
  const n1 = randInt(2, 3);
  const k1 = 2;
  const c2 = randInt(2, 4);
  const m2 = randInt(2, 4);
  const n2 = randInt(4, 6);
  const k2 = randInt(2, 3);

  const c1_k1 = Math.pow(c1, k1);
  const c2_k2 = Math.pow(c2, k2);
  const c_gcd = gcd(c1_k1, c2_k2);
  const c_num = c1_k1 / c_gcd;
  const c_den = c2_k2 / c_gcd;

  const p_num_exp = m1 * k1;
  const p_den_exp = m2 * k2;
  const p_diff = p_num_exp - p_den_exp;

  const q_num_exp = n1 * k1;
  const q_den_exp = n2 * k2;
  const q_diff = q_num_exp - q_den_exp;

  const p_top = p_diff > 0 ? (p_diff === 1 ? "p" : `p^{${p_diff}}`) : "";
  const p_bot = p_diff < 0 ? (p_diff === -1 ? "p" : `p^{${Math.abs(p_diff)}}`) : "";
  const q_top = q_diff > 0 ? (q_diff === 1 ? "q" : `q^{${q_diff}}`) : "";
  const q_bot = q_diff < 0 ? (q_diff === -1 ? "q" : `q^{${Math.abs(q_diff)}}`) : "";

  const top_coeff = c_num === 1 && (p_top || q_top) ? "" : c_num.toString();
  const bot_coeff = c_den === 1 && (p_bot || q_bot) ? "" : c_den.toString();

  const top_str = `${top_coeff}${p_top}${q_top}`;
  const bot_str = `${bot_coeff}${p_bot}${q_bot}`;

  const ans = bot_str ? `${top_str || "1"}/${bot_str}` : top_str;
  const step1 = `\\frac{${c1_k1} p^{${p_num_exp}} q^{${q_num_exp}}}{${c2_k2} p^{${p_den_exp}} q^{${q_den_exp}}}`;
  const step2 = `\\frac{${top_str || "1"}}{${bot_str || "1"}}`;

  return {
    strand: "Algebra",
    tier: 3,
    tierName: "Advanced",
    skillTitle: "Indices Mastery Trainer",
    prompt: `Simplify the following, expressing your answer in positive index form:\n\n$$\\frac{(${c1}p^{${m1}} q^{${n1}})^{${k1}}}{(${c2}p^{${m2}} q^{${n2}})^{${k2}}}$$`,
    diagramSvg: null,
    inputCount: 1,
    inputLabels: ["="],
    expectedAnswer: ans,
    displayAnswer: step2,
    extraKeys,
    steps: [
      `Expand powers in numerator and denominator: $$${step1}$$`,
      `Simplify numerical coefficients and move negative indices: $$${step2}$$`
    ]
  };
}

export const indices = { generate: generateQuestion };
export default generateQuestion;
