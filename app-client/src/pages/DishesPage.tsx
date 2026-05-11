import { useState } from "react";
import { useDishes } from "../hooks/DIshes";
import { CreateDishForm } from "../components/CreateDishForm";
import { Link } from "react-router-dom";
import { DishQueryParams, getDishCategoryName } from "../http/models/Dishes";
import DishService from "../http/services/DishService";

export const DishesPage = () => {
  const { dishes, setDishes, error } = useDishes();
  const [queryParams, setQueryParams] = useState<DishQueryParams>({});

  async function handleSearch() {
    try {
      const res = await DishService.getDishes(queryParams);
      if (res.success) setDishes(res.data?.dishes || []);
      else console.error(res.error);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="page">
      <section className="card">
        <h2 className="card-title">Новое блюдо</h2>
        <CreateDishForm />
      </section>

      <section className="card">
        <h2 className="card-title">Блюда</h2>

        <form
          className="filter-bar"
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
        >
          <input
            className="input"
            placeholder="Поиск по названию"
            onChange={(e) =>
              setQueryParams((prev) => ({
                ...prev,
                name: e.target.value || undefined,
              }))
            }
          />

          <select
            className="select"
            onChange={(e) =>
              setQueryParams((prev) => ({
                ...prev,
                category:
                  e.target.value !== "" ? Number(e.target.value) : undefined,
              }))
            }
          >
            <option value="">Любая категория</option>
            <option value={0}>Десерт</option>
            <option value={1}>Первое</option>
            <option value={2}>Второе</option>
            <option value={3}>Напиток</option>
            <option value={4}>Салат</option>
            <option value={5}>Суп</option>
            <option value={6}>Перекус</option>
          </select>

          <label className="checkbox-label">
            <input
              type="checkbox"
              onChange={(e) =>
                setQueryParams((prev) => ({
                  ...prev,
                  is_vegan: e.target.checked || undefined,
                }))
              }
            />
            Веганские
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              onChange={(e) =>
                setQueryParams((prev) => ({
                  ...prev,
                  is_sugar_free: e.target.checked || undefined,
                }))
              }
            />
            Без сахара
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              onChange={(e) =>
                setQueryParams((prev) => ({
                  ...prev,
                  is_gluten_free: e.target.checked || undefined,
                }))
              }
            />
            Без глютена
          </label>

          <button className="btn btn--primary" type="submit">
            Найти
          </button>
        </form>

        {!error ? (
          <div className="dish-list">
            {dishes.map((dish) => (
              <div className="dish-card" key={dish.id}>
                <Link className="dish-card-name" to={`/dishes/${dish.id}`}>
                  {dish.name}
                </Link>
                <div className="dish-card-meta">
                  <span>{getDishCategoryName(dish.category)}</span>
                  <span>{dish.calories} ккал</span>
                  <span>Б {dish.proteins}г</span>
                  <span>Ж {dish.fats}г</span>
                  <span>У {dish.carbs}г</span>
                </div>
                <div className="badges">
                  {dish.is_vegan && (
                    <span className="badge badge--vegan">🌱 Веганское</span>
                  )}
                  {dish.is_sugar_free && (
                    <span className="badge badge--sugar-free">
                      🚫🍬 Без сахара
                    </span>
                  )}
                  {dish.is_gluten_free && (
                    <span className="badge badge--gluten-free">
                      🌾✗ Без глютена
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted">
            {error?.response?.data?.error?.message ?? "Ошибка загрузки"}
          </p>
        )}
      </section>
    </div>
  );
};
