export type Dish = {
  calories: number;
  carbs: number;
  category: number;
  created_at: string;
  fats: number;
  is_vegan: boolean;
  is_sugar_free: boolean;
  is_gluten_free: boolean;
  id: string;
  name: string;
  photos: string[];
  proteins: number;
  serving_size: number;
  updated_at: string;
};

export type DishQueryParams = {
  category?: number;
  name?: string;
  is_vegan?: boolean;
  is_sugar_free?: boolean;
  is_gluten_free?: boolean;
};

export type DishProduct = {
  product_id: string;
  amount: number;
};

export type DishCreateDTO = {
  calories: number;
  carbs: number;
  category: number;
  fats: number;
  is_vegan: boolean;
  is_sugar_free: boolean;
  is_gluten_free: boolean;
  name: string;
  photos: string[];
  proteins: number;
  serving_size: number;
  products: DishProduct[];
};

export function getDishCategoryName(category: number): string {
  switch (category) {
    case 0:
      return "Десерт";
    case 1:
      return "Первое";
    case 2:
      return "Второе";
    case 3:
      return "Напиток";
    case 4:
      return "Салат";
    case 5:
      return "Суп";
    case 6:
      return "Перекус";
    default:
      return "Неизвестно";
  }
}
