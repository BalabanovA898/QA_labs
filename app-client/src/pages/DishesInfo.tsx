import { Link, useNavigate, useParams } from "react-router-dom";
import { useDishes } from "../hooks/DIshes";
import DishService from "../http/services/DishService";
import { DishProduct, getDishCategoryName } from "../http/models/Dishes";
import { useProduct, useProducts } from "../hooks/Products";
import { useEffect, useState } from "react";

export const DishesInfo = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { dishes, error } = useDishes();
  const dish = dishes.find((d) => d.id === id);
  const { products: productList } = useProducts();
  const [products, setProducts] = useState<DishProduct[]>([]);

  useEffect(() => {
    DishService.getDishProducts(id || "").then((res) => {
      if (res.success) {
        setProducts(res.data?.products || []);
      } else {
        console.error(res.error);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (error) return <p className="text-muted">Ошибка загрузки</p>;
  if (!dish) return <p className="text-muted">Загрузка...</p>;

  return (
    <div className="page">
      <div className="card">
        <h1 className="detail-title">{dish.name}</h1>

        <div className="detail-grid">
          <div>
            <div className="detail-label">Калории</div>
            <div className="detail-value">{dish.calories} ккал</div>
          </div>
          <div>
            <div className="detail-label">Белки</div>
            <div className="detail-value">{dish.proteins} г</div>
          </div>
          <div>
            <div className="detail-label">Жиры</div>
            <div className="detail-value">{dish.fats} г</div>
          </div>
          <div>
            <div className="detail-label">Углеводы</div>
            <div className="detail-value">{dish.carbs} г</div>
          </div>
          <div>
            <div className="detail-label">Категория</div>
            <div className="detail-value">
              {getDishCategoryName(dish.category)}
            </div>
          </div>
          <div>
            <div className="detail-label">Размер порции</div>
            <div className="detail-value">{dish.serving_size} г</div>
          </div>
          <div>
            <div className="detail-label">Время создания</div>
            <div className="detail-value">
              {new Date(dish?.created_at || "").toLocaleDateString("ru-RU")}{" "}
              {new Date(dish?.created_at || "").toLocaleTimeString("ru-RU")}
            </div>
          </div>
          {dish?.created_at !== dish?.updated_at && (
            <div>
              <div className="detail-label">Время обновления</div>
              <div className="detail-value">
                {new Date(dish?.updated_at || "").toLocaleDateString("ru-RU")}{" "}
                {new Date(dish?.updated_at || "").toLocaleTimeString("ru-RU")}
              </div>
            </div>
          )}
        </div>

        <div className="badges mt-sm">
          {dish.is_vegan && (
            <span className="badge badge--vegan">🌱 Веганское</span>
          )}
          {dish.is_sugar_free && (
            <span className="badge badge--sugar-free">🚫🍬 Без сахара</span>
          )}
          {dish.is_gluten_free && (
            <span className="badge badge--gluten-free">🌾✗ Без глютена</span>
          )}
        </div>

        {dish.photos && dish.photos.length > 0 && (
          <div className="photo-grid mt-sm">
            {dish.photos.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`Фото ${i + 1}`}
                className="photo-thumb"
              />
            ))}
          </div>
        )}

        <div className="detail-actions">
          <Link to={`/dishes/${dish.id}/edit`} className="btn btn--ghost">
            Редактировать
          </Link>
          <button
            className="btn btn--danger"
            onClick={async () => {
              try {
                const res = await DishService.deleteDish(id || "");
                if (res.success) navigate("/dishes");
                else console.error(res.error);
              } catch (error) {
                console.error(error);
              }
            }}
          >
            Удалить
          </button>
        </div>
        {products.length > 0 && (
          <div className="product-rows">
            {products
              .sort((a, b) =>
                String(a.product_id).localeCompare(String(b.product_id)),
              )
              .map((item) => (
                <div className="product-row" key={item.product_id}>
                  <span className="product-row-name">
                    {productList.find((i) => i.id === item.product_id)?.name}
                  </span>
                  <p>{item.amount} г.</p>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};
