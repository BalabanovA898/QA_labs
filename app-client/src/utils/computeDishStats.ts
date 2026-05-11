import { Product } from "../http/models/Products";
import { DishProduct } from "../http/models/Dishes";

export type DishStats = {
  calories: number;
  fats: number;
  carbs: number;
  proteins: number;
  servingSize: number;
  isVegan: boolean;
  isSugarFree: boolean;
  isGlutenFree: boolean;
};

export function computeDishStats(
  dishProducts: DishProduct[],
  productList: Product[],
): DishStats {
  let calories = 0;
  let fats = 0;
  let carbs = 0;
  let proteins = 0;
  let servingSize = 0;

  const resolved = dishProducts
    .map((dp) => productList.find((p) => p.id === dp.product_id))
    .filter((p): p is Product => p !== undefined);

  for (const info of resolved) {
    const amount =
      dishProducts.find((dp) => dp.product_id === info.id)?.amount ?? 0;
    calories += (info.calories * amount) / 100;
    fats += (info.fats * amount) / 100;
    carbs += (info.carbs * amount) / 100;
    proteins += (info.proteins * amount) / 100;
    servingSize += amount;
  }

  const hasProducts = resolved.length > 0;

  return {
    calories,
    fats,
    carbs,
    proteins,
    servingSize,
    isVegan: hasProducts && resolved.every((p) => p.is_vegan),
    isSugarFree: hasProducts && resolved.every((p) => p.is_sugar_free),
    isGlutenFree: hasProducts && resolved.every((p) => p.is_gluten_free),
  };
}

export function validateMacroSum(
  proteins: number,
  fats: number,
  carbs: number,
): string | null {
  const sum = proteins + fats + carbs;
  if (sum > 100)
    return "Сумма белков, жиров и углеводов не может превышать 100 г";
  if (proteins < 0 || fats < 0 || carbs < 0)
    return "Значения белков, жиров и углеводов не могут быть отрицательными";
  return null;
}
