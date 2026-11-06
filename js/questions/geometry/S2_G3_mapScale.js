/**
 * Question Generator: Map Scale
 * Curriculum Skill: Sec 3 G3 - Geometry & Measurement
 */

function randInt(min, max, excludeZero = false) {
  let val;
  do {
    val = Math.floor(Math.random() * (max - min + 1)) + min;
  } while (excludeZero && val === 0);
  return val;
}

export function generateQuestion(tier = 1) {
  // =========================================================
  // TIER 1: BASIC (Level 1 - Direct Linear Scale Calculations)
  // =========================================================
  if (tier === 1) {
    const subType = randInt(1, 3);

    if (subType === 1) {
      // Structure 1: Find scale r given map cm and ground km
      const x_options = [2, 4, 5, 8, 10];
      const x_code = randInt(1, 5);
      const x_cm = x_options[x_code - 1];
      const y_km = randInt(1, 10);

      const y_cm = y_km * 100000;
      const r_val = Math.round(y_cm / x_cm);
      const ans = r_val.toString();

      return {
        strand: "Geometry & Measurement",
        tier: 1,
        tierName: "Basic",
        skillTitle: "Map Scale",
        prompt: `A line of length $${x_cm}\\text{ cm}$ on a map represents an actual distance of $${y_km}\\text{ km}$.\n\nFind the scale of the map in the form $1 : r$. (State the value of $r$)`,
        inputCount: 1,
        inputLabels: ["r ="],
        expectedAnswer: ans,
        displayAnswer: ans,
        steps: [
          `Convert the actual ground distance from kilometres to centimetres:\n\n$$${y_km}\\text{ km} = ${y_cm}\\text{ cm}$$`,
          `Divide the actual distance in centimetres by the map distance:\n\n$$r = \\frac{${y_cm}}{${x_cm}} = ${r_val}$$`,
          `State the scale ratio: $1\\text{ cm}$ on the map represents $${r_val}\\text{ cm}$ on the ground, so $r = ${r_val}$.`
        ]
      };
    } else if (subType === 2) {
      // Structure 2: Given scale 1 : n and map cm, find actual distance in km
      const k_km = randInt(1, 8);
      const map_cm = randInt(3, 15);

      const scale_n = k_km * 100000;
      const ans_num = map_cm * k_km;
      const ans = ans_num.toString();

      return {
        strand: "Geometry & Measurement",
        tier: 1,
        tierName: "Basic",
        skillTitle: "Map Scale",
        prompt: `The scale of a map is $1 : ${scale_n}$. The distance between two points on the map is $${map_cm}\\text{ cm}$.\n\nFind the actual distance between the two points in kilometres.`,
        inputCount: 1,
        inputLabels: ["Actual distance (km) ="],
        expectedAnswer: ans,
        displayAnswer: ans,
        steps: [
          `Convert the scale ratio to find the actual distance represented by $1\\text{ cm}$:\n\n$$1\\text{ cm} = ${scale_n}\\text{ cm} = ${k_km}\\text{ km}$$`,
          `Multiply by the map distance:\n\n$$\\text{Actual distance} = ${map_cm} \\times ${k_km} = ${ans_num}\\text{ km}$$`
        ]
      };
    } else {
      // Structure 3: Given scale 1 : n and actual distance km, find map cm
      const k_km = randInt(1, 5);
      const map_cm_val = randInt(4, 12);

      const scale_n = k_km * 100000;
      const actual_km = map_cm_val * k_km;
      const ans = map_cm_val.toString();

      return {
        strand: "Geometry & Measurement",
        tier: 1,
        tierName: "Basic",
        skillTitle: "Map Scale",
        prompt: `The scale of a map is $1 : ${scale_n}$. The actual distance between two towns is $${actual_km}\\text{ km}$.\n\nCalculate the distance between the two towns on the map in centimetres.`,
        inputCount: 1,
        inputLabels: ["Map distance (cm) ="],
        expectedAnswer: ans,
        displayAnswer: ans,
        steps: [
          `Convert the actual distance to centimetres:\n\n$$${actual_km}\\text{ km} = ${actual_km * 100000}\\text{ cm}$$`,
          `Divide by the scale factor $r = ${scale_n}$:\n\n$$\\text{Map distance} = \\frac{${actual_km * 100000}}{${scale_n}} = ${map_cm_val}\\text{ cm}$$`
        ]
      };
    }
  }

  // =========================================================
  // TIER 2: INTERMEDIATE (Level 2 - Area & Plan Scale Conversions)
  // =========================================================
  if (tier === 2) {
    const subType = randInt(1, 3);

    if (subType === 1) {
      // Structure 1: Map area (cm²) to actual area (km²)
      const k_km = randInt(1, 5);
      const map_area = randInt(2, 12);

      const scale_n = k_km * 100000;
      const sq_km = k_km * k_km;
      const ans_num = map_area * sq_km;
      const ans = ans_num.toString();

      return {
        strand: "Geometry & Measurement",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Map Scale",
        prompt: `The scale of a map is $1 : ${scale_n}$. An island is represented on the map by an area of $${map_area}\\text{ cm}^2$.\n\nFind the actual area of the island in square kilometres ($\\text{km}^2$).`,
        inputCount: 1,
        inputLabels: ["Actual area (km²) ="],
        expectedAnswer: ans,
        displayAnswer: ans,
        steps: [
          `Find the linear distance represented by $1\\text{ cm}$:\n\n$$1\\text{ cm} = ${scale_n}\\text{ cm} = ${k_km}\\text{ km}$$`,
          `Square both sides to find the area scale:\n\n$$1\\text{ cm}^2 = (${k_km}\\text{ km})^2 = ${sq_km}\\text{ km}^2$$`,
          `Multiply by the map area:\n\n$$\\text{Actual area} = ${map_area} \\times ${sq_km} = ${ans_num}\\text{ km}^2$$`
        ]
      };
    } else if (subType === 2) {
      // Structure 2: Actual area (km²) to map area (cm²)
      const k_km = randInt(1, 4);
      const map_area_val = randInt(3, 10);

      const scale_n = k_km * 100000;
      const sq_km = k_km * k_km;
      const actual_area = map_area_val * sq_km;
      const ans = map_area_val.toString();

      return {
        strand: "Geometry & Measurement",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Map Scale",
        prompt: `A map is drawn to a scale of $1 : ${scale_n}$. A park has an actual area of $${actual_area}\\text{ km}^2$.\n\nFind the area of the park on the map in square centimetres ($\\text{cm}^2$).`,
        inputCount: 1,
        inputLabels: ["Area on map (cm²) ="],
        expectedAnswer: ans,
        displayAnswer: ans,
        steps: [
          `Find the area represented by $1\\text{ cm}^2$ on the map:\n\n$$1\\text{ cm} = ${k_km}\\text{ km} \\implies 1\\text{ cm}^2 = ${sq_km}\\text{ km}^2$$`,
          `Divide the actual area by the area scale factor:\n\n$$\\text{Area on map} = \\frac{${actual_area}}{${sq_km}} = ${map_area_val}\\text{ cm}^2$$`
        ]
      };
    } else {
      // Structure 3: Dimensions conversion on a floor plan
      const scale_options = [20, 50, 100];
      const scale_code = randInt(1, 3);
      const scale_n = scale_options[scale_code - 1];
      const l_mult = randInt(2, 8);
      const w_mult = randInt(2, 6);

      const l_cm = l_mult * (scale_n / 2);
      const w_cm = w_mult * (scale_n / 2);
      const l_m = l_cm / 100;
      const w_m = w_cm / 100;
      const map_l = l_cm / scale_n;
      const map_w = w_cm / scale_n;
      const ans_num = Math.round(map_l * map_w * 100) / 100;
      const ans = ans_num.toString();

      return {
        strand: "Geometry & Measurement",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Map Scale",
        prompt: `An object measures $${l_m}\\text{ m}$ by $${w_m}\\text{ m}$. It is drawn on a floor plan with a scale of $1 : ${scale_n}$.\n\nWhat will be the area representing the object on the floor plan in $\\text{cm}^2$?`,
        inputCount: 1,
        inputLabels: ["Plan area (cm²) ="],
        expectedAnswer: ans,
        displayAnswer: ans,
        steps: [
          `Convert the actual dimensions from metres to centimetres:\n\n$$${l_m}\\text{ m} = ${l_cm}\\text{ cm} \\quad \\text{and} \\quad ${w_m}\\text{ m} = ${w_cm}\\text{ cm}$$`,
          `Divide each dimension by the scale factor $${scale_n}$ to find the plan dimensions:\n\n$$\\text{Plan length} = \\frac{${l_cm}}{${scale_n}} = ${map_l}\\text{ cm}, \\quad \\text{Plan width} = \\frac{${w_cm}}{${scale_n}} = ${map_w}\\text{ cm}$$`,
          `Multiply the plan length and width to find the area:\n\n$$\\text{Plan area} = ${map_l} \\times ${map_w} = ${ans_num}\\text{ cm}^2$$`
        ]
      };
    }
  }

  // =========================================================
  // TIER 3: ADVANCED (Level 3 - Reverse Area Scale & Dual Map Transfers)
  // =========================================================
  const subType = randInt(1, 2);

  if (subType === 1) {
    // Structure 1: Find linear scale r from actual area km² and map area cm²
    const k_km = randInt(1, 5);
    const map_factor = randInt(1, 4);

    const map_area = map_factor * 2;
    const sq_km_per_cm2 = k_km * k_km;
    const actual_area = map_area * sq_km_per_cm2;
    const r_val = k_km * 100000;
    const ans = r_val.toString();

    return {
      strand: "Geometry & Measurement",
      tier: 3,
      tierName: "Advanced",
      skillTitle: "Map Scale",
      prompt: `A region of actual area $${actual_area}\\text{ km}^2$ is represented by an area of $${map_area}\\text{ cm}^2$ on a map.\n\nFind the scale of the map in the form $1 : r$. (State the value of $r$)`,
      inputCount: 1,
      inputLabels: ["r ="],
      expectedAnswer: ans,
      displayAnswer: ans,
      steps: [
        `Find the ground area represented by $1\\text{ cm}^2$ on the map:\n\n$$1\\text{ cm}^2 = \\frac{${actual_area}}{${map_area}} = ${sq_km_per_cm2}\\text{ km}^2$$`,
        `Take the square root to find the linear distance represented by $1\\text{ cm}$:\n\n$$1\\text{ cm} = \\sqrt{${sq_km_per_cm2}} = ${k_km}\\text{ km}$$`,
        `Convert kilometres to centimetres:\n\n$$${k_km}\\text{ km} = ${r_val}\\text{ cm}$$`,
        `State the scale ratio value $r$: $1 : ${r_val} \\implies r = ${r_val}$.`
      ]
    };
  } else {
    // Structure 2: Convert area between two maps with different scales
    const k_a = randInt(1, 3);
    const mult_b = randInt(2, 3);
    const area_a = randInt(4, 16);

    const k_b = k_a * mult_b;
    const scale_a = k_a * 100000;
    const scale_b = k_b * 100000;
    const actual_area_km2 = area_a * (k_a * k_a);
    const area_b_num = actual_area_km2 / (k_b * k_b);
    const ans = area_b_num.toString();

    return {
      strand: "Geometry & Measurement",
      tier: 3,
      tierName: "Advanced",
      skillTitle: "Map Scale",
      prompt: `Map A is drawn to a scale of $1 : ${scale_a}$. Map B is drawn to a scale of $1 : ${scale_b}$.\n\nA lake has an area of $${area_a}\\text{ cm}^2$ on Map A. Calculate the area of the lake on Map B in $\\text{cm}^2$.`,
      inputCount: 1,
      inputLabels: ["Area on Map B (cm²) ="],
      expectedAnswer: ans,
      displayAnswer: ans,
      steps: [
        `Find the actual area using Map A:\n\n$$1\\text{ cm (Map A)} = ${k_a}\\text{ km} \\implies 1\\text{ cm}^2 = ${k_a * k_a}\\text{ km}^2$$\n\n$$\\text{Actual area} = ${area_a} \\times ${k_a * k_a} = ${actual_area_km2}\\text{ km}^2$$`,
        `Find the area scale for Map B:\n\n$$1\\text{ cm (Map B)} = ${k_b}\\text{ km} \\implies 1\\text{ cm}^2 = ${k_b * k_b}\\text{ km}^2$$`,
        `Calculate the area on Map B:\n\n$$\\text{Area on Map B} = \\frac{${actual_area_km2}}{${k_b * k_b}} = ${area_b_num}\\text{ cm}^2$$`
      ]
    };
  }
}

export const mapScale = { generate: generateQuestion };
export default generateQuestion;
