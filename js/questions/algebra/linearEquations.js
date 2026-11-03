export const linearEquations = {
  levels: {
    basic: [
      {
        typeId: "lin_add_basic",
        generate: () => {
          const a = Math.floor(Math.random() * 8) + 1;
          const x = Math.floor(Math.random() * 10) + 1;
          return {
            prompt: `Solve for x: x + ${a} = ${x + a}`,
            expectedAnswer: `${x}`
          };
        }
      }
    ]
  }
};
