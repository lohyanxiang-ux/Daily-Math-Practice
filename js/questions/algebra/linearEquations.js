// Foundation Generator (Sec 1 G1)
export const sec1_g1_alg_linear = {
  levels: {
    basic: [
      {
        typeId: "lin_add_basic",
        generate: () => {
          const a = Math.floor(Math.random() * 8) + 1;
          const x = Math.floor(Math.random() * 10) + 1;
          return { prompt: `Solve: x + ${a} = ${x + a}`, expectedAnswer: `${x}` };
        }
      }
    ],
    intermediate: [
      {
        typeId: "lin_mult_basic",
        generate: () => {
          const a = Math.floor(Math.random() * 4) + 2;
          const x = Math.floor(Math.random() * 8) + 1;
          return { prompt: `Solve: ${a}x = ${a * x}`, expectedAnswer: `${x}` };
        }
      }
    ],
    advanced: [ /* ... */ ]
  }
};

// Standard Generator (Reused for Sec 1 G2 and Sec 1 G3)
export const sec1_g2_alg_linear = {
  levels: {
    basic: [
      {
        typeId: "lin_two_step",
        generate: () => {
          const a = Math.floor(Math.random() * 4) + 2;
          const b = Math.floor(Math.random() * 5) + 1;
          const x = Math.floor(Math.random() * 6) + 1;
          return { prompt: `Solve: ${a}x + ${b} = ${a * x + b}`, expectedAnswer: `${x}` };
        }
      }
    ],
    intermediate: [ /* ... */ ],
    advanced: [ /* ... */ ]
  }
};
