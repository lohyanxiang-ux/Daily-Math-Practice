/**
 * Question Generator: Factorising by Grouping
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
  return a || 1;
}

export function generateQuestion(tier = 1) {
  // =========================================================
  // TIER 1: BASIC (Level 1 - Direct Grouping & Common Binomial Factors)
  // =========================================================
  if (tier === 1) {
    const subType = randInt(1, 2);

    if (subType === 1) {
      // Structure: kx + ax + ky + ay
      const k = randInt(2, 9);

      const expr = `${k}x + ax + ${k}y + ay`;
      const step1 = `x(${k} + a) + y(${k} + a)`;
      const ans = `(${k}+a)(x+y)`;

      return {
        strand: "Algebra",
        tier: 1,
        tierName: "Basic",
        skillTitle: "Factorising by Grouping",
        prompt: `Factorise the expression:\n\n$$${expr}$$`,
        expectedAnswer: ans,
        steps: [
          `Group terms with common variables: $$${step1}$$`,
          `Factorise out the common factor $(${k} + a)$: $$(${k} + a)(x + y)$$`
        ]
      };
    } else {
      // Structure: a(p + kq) + cb(p + kq)
      const k = randInt(-7, 7, true);
      const c = randInt(2, 6);

      const k_eff = Math.abs(k) === 1 ? (k > 0 ? 2 : -2) : k;
      const kq_str = k_eff > 0 ? `+ ${k_eff}q` : `- ${Math.abs(k_eff)}q`;
      const kq_ans = k_eff > 0 ? `+${k_eff}q` : `-${Math.abs(k_eff)}q`;

      const expr = `a(p ${kq_str}) + ${c}b(p ${kq_str})`;
      const step1 = `(p ${kq_str})(a + ${c}b)`;
      const ans = `(p${kq_ans})(a+${c}b)`;

      return {
        strand: "Algebra",
        tier: 1,
        tierName: "Basic",
        skillTitle: "Factorising by Grouping",
        prompt: `Factorise the expression:\n\n$$${expr}$$`,
        expectedAnswer: ans,
        steps: [
          `Identify and factorise out the common binomial term $(p ${kq_str})$: $$${step1}$$`
        ]
      };
    }
  }

  // =========================================================
  // TIER 2: INTERMEDIATE (Level 2 - Term Rearrangement & 4-Term Grouping)
  // =========================================================
  if (tier === 2) {
    const subType = randInt(1, 2);

    if (subType === 1) {
      // Structure: ax - kay - kby + bx
      const k = randInt(2, 8);

      const expr = `ax - ${k}ay - ${k}by + bx`;
      const step1 = `ax + bx - ${k}ay - ${k}by`;
      const step2 = `x(a + b) - ${k}y(a + b)`;
      const ans = `(a+b)(x-${k}y)`;

      return {
        strand: "Algebra",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Factorising by Grouping",
        prompt: `Factorise the expression:\n\n$$${expr}$$`,
        expectedAnswer: ans,
        steps: [
          `Rearrange terms to group terms with common variables together: $$${step1}$$`,
          `Factorise each pair of terms: $$${step2}$$`,
          `Factorise out the common binomial factor: $$(a+b)(x-${k}y)$$`
        ]
      };
    } else {
      // Structure: c1*k1 px + c2*k1 qx + c1*k2 py + c2*k2 qy
      const c1 = randInt(2, 5);
      let c2_raw = randInt(3, 7);
      while (gcd(c1, c2_raw) > 1) {
        c2_raw++;
      }
      const c2 = c2_raw;

      const k1 = randInt(2, 5);
      let k2_raw = randInt(-5, 5, true);
      while (gcd(k1, Math.abs(k2_raw)) > 1 || k2_raw === 0) {
        k2_raw = k2_raw > 0 ? k2_raw + 1 : k2_raw - 1;
      }
      const k2 = k2_raw;

      const t1 = c1 * k1;
      const t2 = c2 * k1;
      const t3 = c1 * k2;
      const t4 = c2 * k2;

      const t3_str = t3 > 0 ? `+ ${t3}py` : `- ${Math.abs(t3)}py`;
      const t4_str = t4 > 0 ? `+ ${t4}qy` : `- ${Math.abs(t4)}qy`;

      const expr = `${t1}px + ${t2}qx ${t3_str} ${t4_str}`;
      const group1 = `${k1}x(${c1}p + ${c2}q)`;
      const group2 = `${k2 > 0 ? '+ ' + k2 : '- ' + Math.abs(k2)}y(${c1}p + ${c2}q)`;
      const step1 = `${group1} ${group2}`;

      const ans = `(${c1}p+${c2}q)(${k1}x${k2 > 0 ? '+' + k2 : '-' + Math.abs(k2)}y)`;

      return {
        strand: "Algebra",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Factorising by Grouping",
        prompt: `Factorise the expression:\n\n$$${expr}$$`,
        expectedAnswer: ans,
        steps: [
          `Factorise common terms from the first pair and second pair: $$${step1}$$`,
          `Factorise out the common binomial factor: $$(${c1}p + ${c2}q)(${k1}x ${k2 > 0 ? '+ ' + k2 : '- ' + Math.abs(k2)}y)$$`
        ]
      };
    }
  }

  // =========================================================
  // TIER 3: ADVANCED (Level 3 - Sign-Reversal Grouping & Highest Common Factor Extraction)
  // =========================================================
  const subType = randInt(1, 2);

  if (subType === 1) {
    // Structure: ack - ac + b - bk (Requires sign flip: 1 - k -> -(k - 1))
    const a = randInt(2, 9);
    const b_raw = randInt(2, 9);
    const b = b_raw === a ? (a === 9 ? 8 : a + 1) : b_raw;

    const term1 = `${a}ck`;
    const term2 = `- ${a}c`;
    const term3 = `+ ${b}`;
    const term4 = `- ${b}k`;

    const expr = `${term1} ${term2} ${term3} ${term4}`;
    const step1 = `(${term1} ${term2}) + (${b} - ${b}k)`;
    const step2 = `${a}c(k - 1) + ${b}(1 - k)`;
    const step3 = `${a}c(k - 1) - ${b}(k - 1)`;
    const ans = `(k-1)(${a}c-${b})`;

    return {
      strand: "Algebra",
      tier: 3,
      tierName: "Advanced",
      skillTitle: "Factorising by Grouping",
      prompt: `Factorise the expression:\n\n$$${expr}$$`,
      expectedAnswer: ans,
      steps: [
        `Group into pairs of terms: $$${step1}$$`,
        `Factorise each pair: $$${step2}$$`,
        `Reverse the sign of the second term so both terms share $(k - 1)$: $$${step3}$$`,
        `Factorise out $(k - 1)$: $$(k - 1)(${a}c - ${b})$$`
      ]
    };
  } else {
    // Structure: Global HCF extraction + 4-term grouping
    const g = randInt(2, 5);
    const c1 = randInt(2, 4);
    let c2_raw = randInt(3, 5);
    const c2 = c1 === c2_raw ? c2_raw + 1 : c2_raw;

    const k1 = randInt(1, 3);
    let k2_raw = randInt(-3, 3, true);
    const k2 = k1 === Math.abs(k2_raw) ? (k2_raw > 0 ? k2_raw + 1 : k2_raw - 1) : k2_raw;

    const t1 = g * c1 * k1;
    const t2 = g * c2 * k1;
    const t3 = g * c1 * k2;
    const t4 = g * c2 * k2;

    const t3_str = t3 > 0 ? `+ ${t3}py` : `- ${Math.abs(t3)}py`;
    const t4_str = t4 > 0 ? `+ ${t4}qy` : `- ${Math.abs(t4)}qy`;

    const expr = `${t1}px + ${t2}qx ${t3_str} ${t4_str}`;

    const inner_t3 = c1 * k2 > 0 ? `+ ${c1 * k2}py` : `- ${Math.abs(c1 * k2)}py`;
    const inner_t4 = c2 * k2 > 0 ? `+ ${c2 * k2}qy` : `- ${Math.abs(c2 * k2)}qy`;
    const inner_expr = `${c1 * k1}px + ${c2 * k1}qx ${inner_t3} ${inner_t4}`;

    const step1 = `${g}(${inner_expr})`;
    const k1_x = k1 === 1 ? 'x' : `${k1}x`;
    const step2 = `${g}[${k1_x}(${c1}p + ${c2}q) ${k2 > 0 ? '+ ' + k2 : '- ' + Math.abs(k2)}y(${c1}p + ${c2}q)]`;

    const f1 = `(${c1}p+${c2}q)`;
    const f2 = `(${k1 === 1 ? 'x' : k1 + 'x'}${k2 > 0 ? '+' + k2 + 'y' : '-' + Math.abs(k2) + 'y'})`;
    const ans = `${g}${f1}${f2}`;

    return {
      strand: "Algebra",
      tier: 3,
      tierName: "Advanced",
      skillTitle: "Factorising by Grouping",
      prompt: `Factorise the expression:\n\n$$${expr}$$`,
      expectedAnswer: ans,
      steps: [
        `Factorise out the common factor $${g}$ across all 4 terms first: $$${step1}$$`,
        `Group terms inside the brackets: $$${step2}$$`,
        `Factorise completely: $$${g}${f1}${f2}$$`
      ]
    };
  }
}

export const factorisingGrouping = { generate: generateQuestion };
export default generateQuestion;
