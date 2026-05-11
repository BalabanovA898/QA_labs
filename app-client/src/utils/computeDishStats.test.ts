import { computeDishStats, validateMacroSum } from "./computeDishStats";
import { Product } from "../http/models/Products";
import { DishProduct } from "../http/models/Dishes";

const makeProduct = (
  overrides: Partial<Product> & { id: string },
): Product => ({
  name: "Тестовый продукт",
  calories: 100,
  proteins: 20,
  fats: 10,
  carbs: 30,
  photos: [],
  composition: "",
  category: 0,
  readiness_for_consumption: 0,
  is_vegan: false,
  is_sugar_free: false,
  is_gluten_free: false,
  created_at: "",
  updated_at: "",
  ...overrides,
});

const dp = (product_id: string, amount: number): DishProduct => ({
  product_id,
  amount,
});

describe("computeDishStats", () => {
  describe("Macros calculation", () => {
    const p1 = makeProduct({
      id: "p1",
      calories: 200,
      proteins: 20,
      fats: 10,
      carbs: 30,
    });

    const tests: {
      name: string;
      dishProducts: DishProduct[];
      expectedCalories: number;
      expectedProteins: number;
      expectedFats: number;
      expectedCarbs: number;
      expectedServingSize: number;
    }[] = [
      {
        name: "Empty product list: all zeros",
        dishProducts: [],
        expectedCalories: 0,
        expectedProteins: 0,
        expectedFats: 0,
        expectedCarbs: 0,
        expectedServingSize: 0,
      },
      {
        name: "Single product 100g: same values",
        dishProducts: [dp("p1", 100)],
        expectedCalories: 200,
        expectedProteins: 20,
        expectedFats: 10,
        expectedCarbs: 30,
        expectedServingSize: 100,
      },
      {
        name: "Single product 200g: doubled values",
        dishProducts: [dp("p1", 200)],
        expectedCalories: 400,
        expectedProteins: 40,
        expectedFats: 20,
        expectedCarbs: 60,
        expectedServingSize: 200,
      },
      {
        name: "Single product 50g: halved values",
        dishProducts: [dp("p1", 50)],
        expectedCalories: 100,
        expectedProteins: 10,
        expectedFats: 5,
        expectedCarbs: 15,
        expectedServingSize: 50,
      },
    ];

    tests.forEach(
      ({
        name,
        dishProducts,
        expectedCalories,
        expectedProteins,
        expectedFats,
        expectedCarbs,
        expectedServingSize,
      }) => {
        test(name, () => {
          const result = computeDishStats(dishProducts, [p1]);
          expect(result.calories).toBeCloseTo(expectedCalories);
          expect(result.proteins).toBeCloseTo(expectedProteins);
          expect(result.fats).toBeCloseTo(expectedFats);
          expect(result.carbs).toBeCloseTo(expectedCarbs);
          expect(result.servingSize).toBeCloseTo(expectedServingSize);
        });
      },
    );
  });

  describe("Multiple products", () => {
    const p1 = makeProduct({
      id: "p1",
      calories: 100,
      proteins: 10,
      fats: 5,
      carbs: 20,
    });
    const p2 = makeProduct({
      id: "p2",
      calories: 200,
      proteins: 30,
      fats: 15,
      carbs: 40,
    });

    const tests: {
      name: string;
      dishProducts: DishProduct[];
      expectedCalories: number;
      expectedProteins: number;
      expectedFats: number;
      expectedCarbs: number;
      expectedServingSize: number;
    }[] = [
      {
        name: "two products different amounts: correctly calculated",
        dishProducts: [dp("p1", 100), dp("p2", 200)],
        expectedCalories: 500,
        expectedProteins: 70,
        expectedFats: 35,
        expectedCarbs: 100,
        expectedServingSize: 300,
      },
      {
        name: "Two products same amount: correctly summed",
        dishProducts: [dp("p1", 50), dp("p2", 50)],
        expectedCalories: 150,
        expectedProteins: 20,
        expectedFats: 10,
        expectedCarbs: 30,
        expectedServingSize: 100,
      },
    ];

    tests.forEach(
      ({
        name,
        dishProducts,
        expectedCalories,
        expectedProteins,
        expectedFats,
        expectedCarbs,
        expectedServingSize,
      }) => {
        test(name, () => {
          const result = computeDishStats(dishProducts, [p1, p2]);
          expect(result.calories).toBeCloseTo(expectedCalories);
          expect(result.proteins).toBeCloseTo(expectedProteins);
          expect(result.fats).toBeCloseTo(expectedFats);
          expect(result.carbs).toBeCloseTo(expectedCarbs);
          expect(result.servingSize).toBeCloseTo(expectedServingSize);
        });
      },
    );
  });

  describe("Unknown product_id", () => {
    const p1 = makeProduct({ id: "p1", calories: 200 });

    const tests: {
      name: string;
      dishProducts: DishProduct[];
      expectedCalories: number;
      expectedServingSize: number;
    }[] = [
      {
        name: "Unknown product_id: all zeroes",
        dishProducts: [dp("does-not-exist", 100)],
        expectedCalories: 0,
        expectedServingSize: 0,
      },
      {
        name: "Known and unknown product_id: unknown skipped, known counted",
        dishProducts: [dp("p1", 100), dp("does-not-exist", 200)],
        expectedCalories: 200,
        expectedServingSize: 100,
      },
    ];

    tests.forEach(
      ({ name, dishProducts, expectedCalories, expectedServingSize }) => {
        test(name, () => {
          const result = computeDishStats(dishProducts, [p1]);
          expect(result.calories).toBeCloseTo(expectedCalories);
          expect(result.servingSize).toBeCloseTo(expectedServingSize);
        });
      },
    );
  });

  describe("Dietary flags", () => {
    const pAll = makeProduct({
      id: "all",
      is_vegan: true,
      is_sugar_free: true,
      is_gluten_free: true,
    });
    const pNone = makeProduct({
      id: "none",
      is_vegan: false,
      is_sugar_free: false,
      is_gluten_free: false,
    });
    const pVeganOnly = makeProduct({
      id: "vegan-only",
      is_vegan: true,
      is_sugar_free: false,
      is_gluten_free: false,
    });
    const pSugarGluten = makeProduct({
      id: "sugar-gluten",
      is_vegan: false,
      is_sugar_free: true,
      is_gluten_free: true,
    });

    const catalog = [pAll, pNone, pVeganOnly, pSugarGluten];

    const tests: {
      name: string;
      dishProducts: DishProduct[];
      expectedIsVegan: boolean;
      expectedIsSugarFree: boolean;
      expectedIsGlutenFree: boolean;
    }[] = [
      {
        name: "No products: all flags false",
        dishProducts: [],
        expectedIsVegan: false,
        expectedIsSugarFree: false,
        expectedIsGlutenFree: false,
      },
      {
        name: "Single product all-true: all flags true",
        dishProducts: [dp("all", 100)],
        expectedIsVegan: true,
        expectedIsSugarFree: true,
        expectedIsGlutenFree: true,
      },
      {
        name: "Single product all-false: all flags false",
        dishProducts: [dp("none", 100)],
        expectedIsVegan: false,
        expectedIsSugarFree: false,
        expectedIsGlutenFree: false,
      },
      {
        name: "Single product vegan-only: only isVegan true",
        dishProducts: [dp("vegan-only", 100)],
        expectedIsVegan: true,
        expectedIsSugarFree: false,
        expectedIsGlutenFree: false,
      },
      {
        name: "Two products both all-true: all flags true",
        dishProducts: [dp("all", 100), dp("all", 50)],
        expectedIsVegan: true,
        expectedIsSugarFree: true,
        expectedIsGlutenFree: true,
      },
      {
        name: "Two products all-true + all-false: all flags false",
        dishProducts: [dp("all", 100), dp("none", 100)],
        expectedIsVegan: false,
        expectedIsSugarFree: false,
        expectedIsGlutenFree: false,
      },
      {
        name: "Two products vegan-only + sugar-gluten: each flag requires all products",
        dishProducts: [dp("vegan-only", 100), dp("sugar-gluten", 100)],
        expectedIsVegan: false,
        expectedIsSugarFree: false,
        expectedIsGlutenFree: false,
      },
      {
        name: "Two products all-true + sugar-gluten: only non-vegan flag fails",
        dishProducts: [dp("all", 100), dp("sugar-gluten", 100)],
        expectedIsVegan: false,
        expectedIsSugarFree: true,
        expectedIsGlutenFree: true,
      },
    ];

    tests.forEach(
      ({
        name,
        dishProducts,
        expectedIsVegan,
        expectedIsSugarFree,
        expectedIsGlutenFree,
      }) => {
        test(name, () => {
          const result = computeDishStats(dishProducts, catalog);
          expect(result.isVegan).toBe(expectedIsVegan);
          expect(result.isSugarFree).toBe(expectedIsSugarFree);
          expect(result.isGlutenFree).toBe(expectedIsGlutenFree);
        });
      },
    );
  });
});

describe("validateMacroSum", () => {
  const validTests: {
    name: string;
    proteins: number;
    fats: number;
    carbs: number;
  }[] = [
    { name: "sum 100", proteins: 50, fats: 25, carbs: 25 },
    { name: "sum 99.9", proteins: 50, fats: 25, carbs: 24.9 },
    { name: "sum 50", proteins: 50, fats: 0, carbs: 0 },
    { name: "sum 0", proteins: 0, fats: 0, carbs: 0 },
    { name: "sum 0.1", proteins: 0, fats: 0, carbs: 0.1 },
  ];

  validTests.forEach(({ name, proteins, fats, carbs }) => {
    test(`Valid ${name}`, () => {
      expect(validateMacroSum(proteins, fats, carbs)).toBeNull();
    });
  });

  const overHundredTests: {
    name: string;
    proteins: number;
    fats: number;
    carbs: number;
  }[] = [
    { name: "sum 100.1", proteins: 50, fats: 25, carbs: 25.1 },
    { name: "sum 150", proteins: 50, fats: 50, carbs: 50 },
  ];

  overHundredTests.forEach(({ name, proteins, fats, carbs }) => {
    test(`Validation error sum greater than 100: ${name}`, () => {
      expect(validateMacroSum(proteins, fats, carbs)).toBe(
        "Сумма белков, жиров и углеводов не может превышать 100 г",
      );
    });
  });

  const negativeTests: {
    name: string;
    proteins: number;
    fats: number;
    carbs: number;
  }[] = [
    { name: "sum -0.1", proteins: 0, fats: 0, carbs: -0.1 },
    { name: "sum -50", proteins: 25, fats: -50, carbs: 0 },
  ];

  negativeTests.forEach(({ name, proteins, fats, carbs }) => {
    test(`Validation error sum less than 0: ${name}`, () => {
      expect(validateMacroSum(proteins, fats, carbs)).toBe(
        "Значения белков, жиров и углеводов не могут быть отрицательными",
      );
    });
  });
});
