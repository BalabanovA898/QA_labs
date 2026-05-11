export type Product = {
  calories: number;
  carbs: number;
  category: number;
  composition: string;
  created_at: string;
  fats: number;
  is_vegan: boolean;
  is_sugar_free: boolean;
  is_gluten_free: boolean;
  id: string;
  name: string;
  photos: string[];
  proteins: number;
  readiness_for_consumption: number;
  updated_at: string;
};

export type ProductCreateDTO = {
  calories: number;
  carbs: number;
  category: number;
  composition: string;
  fats: number;
  is_vegan: boolean;
  is_sugar_free: boolean;
  is_gluten_free: boolean;
  name: string;
  photos: string[];
  proteins: number;
  readiness_for_consumption: number;
};

export type ProductsQuery = {
  name?: boolean;
  calories?: boolean;
  proteins?: boolean;
  fats?: boolean;
  carbs?: boolean;
  find?: string;
  is_vegan?: boolean;
  is_sugar_free?: boolean;
  is_gluten_free?: boolean;
  category?: number;
};

export function getProductCatgegoryName(caategory: number): string {
  switch (caategory) {
    case 0:
      return "Замороженный";
    case 1:
      return "Мясной";
    case 2:
      return "Овощи";
    case 3:
      return "Специи";
    case 4:
      return "Консервы";
    case 5:
      return "Крупы";
    case 6:
      return "Сладости";
    case 7:
      return "Жидкости";
    default:
      return "Неизвестно";
  }
}

export function getRFCName(category: number): string {
  switch (category) {
    case 0:
      return "Готовое к употреблению";
    case 1:
      return "Полуфабрикат";
    case 2:
      return "Требует приготовления";
    default:
      return "Неизвестно";
  }
}
