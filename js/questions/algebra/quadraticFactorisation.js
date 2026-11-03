const quadraticData = {
  "skillTitle": "Factorising Quadratic Expressions",
  "keypad": [
    "x", "y", "p", "q",
    "m", "n", "(", ")",
    "7", "8", "9", "/",
    "4", "5", "6", "+",
    "1", "2", "3", "-",
    "0", "^", "⌫", "Clear"
  ],
  "structures": [
    {
      "level": 1,
      "variables": {
        "p": { "type": "randInt", "min": -7, "max": 7, "excludeZero": true },
        "q": { "type": "randInt", "min": -7, "max": 7, "excludeZero": true }
      },
      "derived": {
        "q_raw": "(scope.p + scope.q === 0) ? (scope.q > 0 ? scope.q + 1 : scope.q - 1) : scope.q",
        "q_eff": "(Math.abs(scope.p + scope.q_raw) === 10) ? (scope.q_raw > 0 ? scope.q_raw + 1 : scope.q_raw - 1) : scope.q_raw",
        "sum": "scope.p + scope.q_eff",
        "prod": "scope.p * scope.q_eff",
        "p_str": "scope.p > 0 ? '+' + scope.p : scope.p.toString()",
        "q_str": "scope.q_eff > 0 ? '+' + scope.q_eff : scope.q_eff.toString()",
        "px_str": "scope.p === 1 ? '+x' : (scope.p === -1 ? '-x' : (scope.p > 0 ? '+' + scope.p + 'x' : scope.p + 'x'))",
        "qx_str": "scope.q_eff === 1 ? '+x' : (scope.q_eff === -1 ? '-x' : (scope.q_eff > 0 ? '+' + scope.q_eff + 'x' : scope.q_eff + 'x'))",
        "prod_str": "scope.prod > 0 ? '+' + scope.prod : scope.prod.toString()",
        "sumX_str": "scope.sum === 0 ? '0x' : (scope.sum === 1 ? '+x' : (scope.sum === -1 ? '-x' : (scope.sum > 0 ? '+' + scope.sum + 'x' : scope.sum + 'x')))",
        "partX": "scope.sum === 0 ? '' : (scope.sum === 1 ? '+ x' : (scope.sum === -1 ? '- x' : (scope.sum > 0 ? '+ ' + scope.sum + 'x' : '- ' + Math.abs(scope.sum) + 'x')))",
        "partC": "scope.prod > 0 ? '+ ' + scope.prod : '- ' + Math.abs(scope.prod)",
        "expr": "'x^2 ' + scope.partX + ' ' + scope.partC",
        "fact1": "'x' + (scope.p > 0 ? '+' + scope.p : scope.p)",
        "fact2": "'x' + (scope.q_eff > 0 ? '+' + scope.q_eff : scope.q_eff)",
        "ans": "'(' + scope.fact1 + ')(' + scope.fact2 + ')'",
        "factors_list": "(function(n){ let pos=[], neg=[]; let absN=Math.abs(n); for(let i=1; i*i<=absN; i++){ if(absN%i===0){ let j=absN/i; if(n>0){ pos.push(i+' \\\\times '+j); neg.push((-i)+' \\\\times '+(-j)); } else { pos.push(i+' \\\\times ' + (-j)); neg.push((-i)+' \\\\times '+j); } } } return pos.concat(neg).join(', '); })(scope.prod)",
        "table": "'$$\\\\begin{array}{c|c|r} x & ' + scope.p_str + ' & ' + scope.px_str + ' \\\\\\\\ x & ' + scope.q_str + ' & ' + scope.qx_str + ' \\\\\\\\ \\\\hline x^2 & ' + scope.prod_str + ' & ' + scope.sumX_str + ' \\\\end{array}$$'",
        "blankTable": "'$$\\\\begin{array}{c|c|r} & & \\\\\\\\ & & \\\\\\\\ \\\\hline x^2 & ' + scope.prod_str + ' & ' + scope.sumX_str + ' \\\\end{array}$$'"
      },
      "questionTemplate": "Factorise the expression completely:\n\n$$${scope.expr}$$",
      "inputs": [{ "label": "=", "answer": "${scope.ans}" }],
      "steps": [
        "Set up the cross method frame with the quadratic expression terms:\n\n${scope.blankTable}",
        "Identify possible factor pairs for the constant term $$${scope.prod_str}$$: $$${scope.factors_list}$$.",
        "Fill in the cross method frame:\n\n${scope.table}",
        "Check that $$${scope.px_str}$$ and $$${scope.qx_str}$$ add up to $$${scope.sumX_str}$$.",
        "Identify horizontal factors $$(${scope.fact1})$$ and $$(${scope.fact2})$$ from the frame rows.",
        "Write down the final answer: $$${scope.ans}$$"
      ]
    },
    {
      "level": 2,
      "variables": {
        "k": { "type": "randInt", "min": 2, "max": 4 },
        "p": { "type": "randInt", "min": -6, "max": 6, "excludeZero": true },
        "q": { "type": "randInt", "min": -6, "max": 6, "excludeZero": true }
      },
      "derived": {
        "q_eff": "(scope.p + scope.q === 0) ? (scope.q > 0 ? scope.q + 1 : scope.q - 1) : scope.q",
        "sum": "scope.p + scope.q_eff",
        "prod": "scope.p * scope.q_eff",
        "c1": "scope.k * scope.sum",
        "c0": "scope.k * scope.prod",
        "partX2": "scope.k + 'x^2'",
        "partX": "scope.c1 === 0 ? '' : (scope.c1 === 1 ? '+ x' : (scope.c1 === -1 ? '- x' : (scope.c1 > 0 ? '+ ' + scope.c1 + 'x' : '- ' + Math.abs(scope.c1) + 'x')))",
        "partC": "scope.c0 > 0 ? '+ ' + scope.c0 : '- ' + Math.abs(scope.c0)",
        "expr": "scope.partX2 + ' ' + scope.partX + ' ' + scope.partC",
        "innerX": "scope.sum === 0 ? '' : (scope.sum === 1 ? '+ x' : (scope.sum === -1 ? '- x' : (scope.sum > 0 ? '+ ' + scope.sum + 'x' : '- ' + Math.abs(scope.sum) + 'x')))",
        "innerC": "scope.prod > 0 ? '+ ' + scope.prod : '- ' + Math.abs(scope.prod)",
        "innerExpr": "'x^2 ' + scope.innerX + ' ' + scope.innerC",
        "fact1": "'x' + (scope.p > 0 ? '+' + scope.p : scope.p)",
        "fact2": "'x' + (scope.q_eff > 0 ? '+' + scope.q_eff : scope.q_eff)",
        "ans": "scope.k + '(' + scope.fact1 + ')(' + scope.fact2 + ')'",
        "p_str": "scope.p > 0 ? '+' + scope.p : scope.p.toString()",
        "q_str": "scope.q_eff > 0 ? '+' + scope.q_eff : scope.q_eff.toString()",
        "px_str": "scope.p === 1 ? '+x' : (scope.p === -1 ? '-x' : (scope.p > 0 ? '+' + scope.p + 'x' : scope.p + 'x'))",
        "qx_str": "scope.q_eff === 1 ? '+x' : (scope.q_eff === -1 ? '-x' : (scope.q_eff > 0 ? '+' + scope.q_eff + 'x' : scope.q_eff + 'x'))",
        "prod_str": "scope.prod > 0 ? '+' + scope.prod : scope.prod.toString()",
        "sumX_str": "scope.sum === 0 ? '0x' : (scope.sum === 1 ? '+x' : (scope.sum === -1 ? '-x' : (scope.sum > 0 ? '+' + scope.sum + 'x' : scope.sum + 'x')))",
        "table": "'$$\\\\begin{array}{c|c|r} x & ' + scope.p_str + ' & ' + scope.px_str + ' \\\\\\\\ x & ' + scope.q_str + ' & ' + scope.qx_str + ' \\\\\\\\ \\\\hline x^2 & ' + scope.prod_str + ' & ' + scope.sumX_str + ' \\\\end{array}$$'"
      },
      "questionTemplate": "Factorise the expression completely:\n\n$$${scope.expr}$$",
      "inputs": [{ "label": "=", "answer": "${scope.ans}" }],
      "steps": [
        "Factorise out the common factor $$${scope.k}$$ from all terms:\n\n$$${scope.k}(${scope.innerExpr})$$",
        "Factorise the quadratic expression $$${scope.innerExpr}$$ inside the brackets using the cross method frame:\n\n${scope.table}",
        "Combine the common factor with the factorised expression: $$${scope.ans}$$"
      ]
    }
  ]
};

function randInt(min, max, excludeZero = false) {
  let val;
  do {
    val = Math.floor(Math.random() * (max - min + 1)) + min;
  } while (excludeZero && val === 0);
  return val;
}

function gcd(x, y) {
  x = Math.abs(x); y = Math.abs(y);
  while (y) { let t = y; y = x % y; x = t; }
  return x;
}

export const quadraticFactorisation = {
  generate: () => {
    // Pick random structure template
    const index = Math.floor(Math.random() * quadraticData.structures.length);
    const struct = quadraticData.structures[index];

    const scope = {};

    // 1. Evaluate variables
    for (const [vName, vDef] of Object.entries(struct.variables)) {
      if (vDef.type === "randInt") {
        scope[vName] = randInt(vDef.min, vDef.max, vDef.excludeZero);
      }
    }

    // 2. Evaluate derived properties sequentially
    for (const [dName, dExpr] of Object.entries(struct.derived)) {
      try {
        const fn = new Function("scope", "gcd", `return (${dExpr});`);
        scope[dName] = fn(scope, gcd);
      } catch (err) {
        console.error(`Error calculating derived property ${dName}:`, err);
      }
    }

    // Helper for template interpolation
    const interpolate = (tpl) => {
      return tpl.replace(/\$\{scope\.([a-zA-Z0-9_]+)\}/g, (_, key) => {
        return scope[key] !== undefined ? scope[key] : "";
      });
    };

    const prompt = interpolate(struct.questionTemplate);
    const expectedAnswer = interpolate(struct.inputs[0].answer);
    const steps = struct.steps.map(stepTpl => interpolate(stepTpl));

    return {
      strand: "Algebra",
      skillTitle: quadraticData.skillTitle,
      prompt: prompt,
      expectedAnswer: expectedAnswer,
      steps: steps,
      keypad: quadraticData.keypad
    };
  }
};
