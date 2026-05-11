import { Link, useNavigate, useParams } from "react-router-dom";
import { useProduct } from "../hooks/Products";
import { getProductCatgegoryName, getRFCName } from "../http/models/Products";
import ProductService from "../http/services/ProductsService";
import { isAxiosError } from "axios";

export const ProductInfo = () => {
  const { id } = useParams<{ id: string }>();
  const { product, error } = useProduct(id || "");
  const navigate = useNavigate();

  if (error) return <p className="text-muted">Продукт не найден</p>;

  return (
    <div className="page">
      <div className="card">
        <h1 className="detail-title">{product?.name}</h1>

        <div className="detail-grid">
          <div>
            <div className="detail-label">Калории</div>
            <div className="detail-value">{product?.calories} ккал</div>
          </div>
          <div>
            <div className="detail-label">Белки</div>
            <div className="detail-value">{product?.proteins} г</div>
          </div>
          <div>
            <div className="detail-label">Жиры</div>
            <div className="detail-value">{product?.fats} г</div>
          </div>
          <div>
            <div className="detail-label">Углеводы</div>
            <div className="detail-value">{product?.carbs} г</div>
          </div>
          <div>
            <div className="detail-label">БЖУ / 100 г</div>
            <div className="detail-value">
              {(
                (product?.proteins || 0) +
                (product?.carbs || 0) +
                (product?.fats || 0)
              ).toFixed(1)}{" "}
              г
            </div>
          </div>
          <div>
            <div className="detail-label">Категория</div>
            <div className="detail-value">
              {getProductCatgegoryName(product?.category || 0)}
            </div>
          </div>
          <div>
            <div className="detail-label">Готовность</div>
            <div className="detail-value">
              {getRFCName(product?.readiness_for_consumption || 0)}
            </div>
          </div>
          <div>
            <div className="detail-label">Время создания</div>
            <div className="detail-value">
              {new Date(product?.created_at || "").toLocaleDateString("ru-RU")}{" "}
              {new Date(product?.created_at || "").toLocaleTimeString("ru-RU")}
            </div>
          </div>
          {product?.created_at !== product?.updated_at && (
            <div>
              <div className="detail-label">Время обновления</div>
              <div className="detail-value">
                {new Date(product?.updated_at || "").toLocaleDateString(
                  "ru-RU",
                )}{" "}
                {new Date(product?.updated_at || "").toLocaleTimeString(
                  "ru-RU",
                )}
              </div>
            </div>
          )}
        </div>

        {product?.composition && (
          <div className="mt-sm">
            <div className="detail-label">Состав</div>
            <div className="detail-value">{product.composition}</div>
          </div>
        )}

        <div className="badges mt-sm">
          {product?.is_vegan && (
            <span className="badge badge--vegan">🌱 Веганский</span>
          )}
          {product?.is_sugar_free && (
            <span className="badge badge--sugar-free">🚫🍬 Без сахара</span>
          )}
          {product?.is_gluten_free && (
            <span className="badge badge--gluten-free">🌾✗ Без глютена</span>
          )}
        </div>

        {product?.photos && product.photos.length > 0 && (
          <div className="photo-grid mt-sm">
            {product.photos.map((src, i) => (
              <img key={i} src={src} alt="" className="photo-thumb" />
            ))}
          </div>
        )}

        <div className="detail-actions">
          <Link to="edit" className="btn btn--ghost">
            Редактировать
          </Link>
          <button
            className="btn btn--danger"
            onClick={async () => {
              try {
                const res = await ProductService.deleteProduct(id || "");
                if (res.success) navigate("/products");
              } catch (error) {
                if (
                  isAxiosError(error) &&
                  error.response?.data.error.message === "product is in use"
                ) {
                  try {
                    const res = await ProductService.getProductDishes(id || "");
                    if (res.success) {
                      const dishNames = res.data?.dishes
                        .map((d) => d.name)
                        .join(", ");
                      alert(`Продукт используется в блюдах: ${dishNames}`);
                    } else {
                      console.error(res.error.message);
                    }
                  } catch (e) {
                    console.error(e);
                  }
                } else {
                  console.error(error);
                }
              }
            }}
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
};
