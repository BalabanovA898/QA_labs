import { useState } from "react";
import { useProducts } from "../hooks/Products";
import { CreateProductForm } from "../components/CreateProductForm";
import { ProductsQuery } from "../http/models/Products";
import { ProductPreview } from "../components/ProductPreview";
import ProductService from "../http/services/ProductsService";

export const ProductsPage = () => {
  const { products, setProducts } = useProducts();
  const [queryParams, setQueryParams] = useState<ProductsQuery>({});

  async function handleSearch() {
    try {
      const res = await ProductService.getAll(queryParams);
      if (res.success) setProducts(res.data?.products || []);
      else console.error(res.error.message);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="page">
      <section className="card">
        <h2 className="card-title">Новый продукт</h2>
        <CreateProductForm />
      </section>

      <section className="card">
        <h2 className="card-title">Продукты</h2>

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
              setQueryParams((prev) => ({ ...prev, find: e.target.value }))
            }
          />

          <select
            className="select"
            onChange={(e) => {
              const val = e.target.value;
              setQueryParams((prev) => ({
                ...prev,
                proteins: val === "proteins" ? true : undefined,
                fats: val === "fats" ? true : undefined,
                carbs: val === "carbs" ? true : undefined,
                calories: val === "calories" ? true : undefined,
              }));
            }}
          >
            <option value="">Сортировать по</option>
            <option value="calories">Калориям</option>
            <option value="proteins">Белкам</option>
            <option value="fats">Жирам</option>
            <option value="carbs">Углеводам</option>
          </select>

          <select
            className="select"
            onChange={(e) => {
              if (e.target.value !== "-1")
                setQueryParams({
                  ...queryParams,
                  category: Number(e.target.value),
                });
              else {
                setQueryParams((val) => ({
                  ...queryParams,
                  category: undefined,
                }));
              }
            }}
          >
            <option value="-1">Фильтрация по категории</option>
            <option value="0">Замороженный</option>
            <option value="1">Овощи</option>
            <option value="2">Мясной</option>
            <option value="3">Специи</option>
            <option value="4">Консервы</option>
            <option value="5">Крупы</option>
            <option value="6">Сладости</option>
            <option value="7">Жидкость</option>
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

        <div className="item-list">
          {products.map((item) => (
            <ProductPreview name={item.name} id={item.id} key={item.id} />
          ))}
        </div>
      </section>
    </div>
  );
};
