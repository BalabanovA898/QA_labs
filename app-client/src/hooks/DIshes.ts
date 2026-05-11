import { useEffect, useState } from "react";
import { Dish, DishProduct, DishQueryParams } from "../http/models/Dishes";
import DishService from "../http/services/DishService";

export const useDishes = (query?: DishQueryParams) => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    DishService.getDishes(query)
      .then((res) => {
        if (res.success) {
          setDishes(res.data?.dishes || []);
        } else {
          setError(res.error);
        }
      })
      .catch((e) => setError(e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(query)]);

  return { dishes, setDishes, error };
};

export const useDishProducts = (id: string) => {
  const [products, setProducts] = useState<DishProduct[]>([]);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    DishService.getDishProducts(id)
      .then((res) => {
        if (res.success) {
          setProducts(res.data?.products || []);
        } else {
          setError(res.error);
        }
      })
      .catch((e) => setError(e));
  }, [id]);

  return { products, error };
};
