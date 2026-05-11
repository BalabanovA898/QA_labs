import { useNavigate, useParams } from "react-router-dom";
import { useProduct } from "../hooks/Products";
import { ProductCreateDTO } from "../http/models/Products";
import { useEffect, useState } from "react";
import ProductService from "../http/services/ProductsService";
import { ImageUploader } from "../components/ImageUploader";
import { validateMacroSum } from "../utils/computeDishStats";
import notify from "../store/notify";

export const ProductEdit = () => {
  const { id } = useParams<{ id: string }>();
  const { product, error } = useProduct(id || "");
  const navigate = useNavigate();

  const [formState, setFormState] = useState<ProductCreateDTO>({
    calories: product?.calories || 0,
    carbs: product?.carbs || 0,
    category: product?.category || 0,
    composition: product?.composition || "",
    fats: product?.fats || 0,
    is_vegan: product?.is_vegan || false,
    is_sugar_free: product?.is_sugar_free || false,
    is_gluten_free: product?.is_gluten_free || false,
    name: product?.name || "",
    photos: product?.photos || [],
    proteins: product?.proteins || 0,
    readiness_for_consumption: product?.readiness_for_consumption || 0,
  });

  useEffect(() => {
    if (product) {
      setFormState({
        calories: product.calories,
        carbs: product.carbs,
        category: product.category,
        composition: product.composition,
        fats: product.fats,
        is_vegan: product.is_vegan,
        is_sugar_free: product.is_sugar_free,
        is_gluten_free: product.is_gluten_free,
        name: product.name,
        photos: product.photos,
        proteins: product.proteins,
        readiness_for_consumption: product.readiness_for_consumption,
      });
    }
  }, [product]);

  const [macroError, setMacroError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (macroError) return;
    event.stopPropagation();
    event.preventDefault();
    if (macroError) {
      notify.error(macroError);
      return;
    }
    try {
      const res = await ProductService.updateProduct(id || "", formState);
      if (res.success) navigate("/products");
      else console.error(res.error);
    } catch (error) {
      console.error(error);
    }
  }

  if (error) return <p className="text-muted">Продукт не найден</p>;

  return (
    <div className="page">
      <div className="card">
        <h2 className="card-title">Редактировать продукт</h2>

        <form className="form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-label">Название</label>
            <input
              className="input"
              type="text"
              value={formState.name}
              onChange={(e) => {
                if (e.target.value.trim().length < 2) {
                  setMacroError("Минимальная длина названия - 2 символа");
                } else {
                  setMacroError(null);
                }
                setFormState({ ...formState, name: e.target.value });
              }}
            />
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label className="form-label">Калории (ккал / 100 г)</label>
              <input
                className="input"
                type="number"
                value={formState.calories}
                step="any"
                min="0"
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    calories: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="form-field">
              <label className="form-label">Белки (г / 100 г)</label>
              <input
                className="input"
                type="number"
                value={formState.proteins}
                step="any"
                min="0"
                onChange={(e) => {
                  setFormState({
                    ...formState,
                    proteins: Number(e.target.value),
                  });
                  setMacroError(
                    validateMacroSum(
                      Number(e.target.value),
                      formState.fats,
                      formState.carbs,
                    ),
                  );
                }}
              />
            </div>
            <div className="form-field">
              <label className="form-label">Жиры (г / 100 г)</label>
              <input
                className="input"
                type="number"
                value={formState.fats}
                step="any"
                min="0"
                onChange={(e) => {
                  setFormState({ ...formState, fats: Number(e.target.value) });
                  setMacroError(
                    validateMacroSum(
                      formState.proteins,
                      Number(e.target.value),
                      formState.carbs,
                    ),
                  );
                }}
              />
            </div>
            <div className="form-field">
              <label className="form-label">Углеводы (г / 100 г)</label>
              <input
                className="input"
                type="number"
                value={formState.carbs}
                step="any"
                min="0"
                onChange={(e) => {
                  setFormState({ ...formState, carbs: Number(e.target.value) });
                  setMacroError(
                    validateMacroSum(
                      formState.proteins,
                      formState.fats,
                      Number(e.target.value),
                    ),
                  );
                }}
              />
            </div>
          </div>

          <div className="form-field">
            <label className="form-label">Состав</label>
            <textarea
              className="textarea"
              value={formState.composition}
              onChange={(e) =>
                setFormState({ ...formState, composition: e.target.value })
              }
            />
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label className="form-label">Категория</label>
              <select
                className="select"
                value={formState.category || 0}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    category: Number(e.target.value),
                  })
                }
              >
                <option value="0">Замороженный</option>
                <option value="1">Мясной</option>
                <option value="2">Овощи</option>
                <option value="3">Специи</option>
                <option value="4">Консервы</option>
                <option value="5">Крупы</option>
                <option value="6">Сладости</option>
                <option value="7">Жидкость</option>
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Готовность</label>
              <select
                className="select"
                value={formState.readiness_for_consumption || 0}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    readiness_for_consumption: Number(e.target.value),
                  })
                }
              >
                <option value="0">Готов к употреблению</option>
                <option value="1">Полуфабрикат</option>
                <option value="2">Требует приготовления</option>
              </select>
            </div>
          </div>

          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formState.is_vegan}
                onChange={(e) =>
                  setFormState({ ...formState, is_vegan: e.target.checked })
                }
              />
              Веганский
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formState.is_sugar_free}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    is_sugar_free: e.target.checked,
                  })
                }
              />
              Без сахара
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formState.is_gluten_free}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    is_gluten_free: e.target.checked,
                  })
                }
              />
              Без глютена
            </label>
          </div>

          <ImageUploader
            defaultValue={product?.photos}
            onChange={(item) => setFormState({ ...formState, photos: item })}
          />

          {macroError && <div className="form-error">{macroError}</div>}

          <button
            className="btn btn--primary"
            type="submit"
            disabled={!!macroError}
          >
            Сохранить
          </button>
        </form>
      </div>
    </div>
  );
};
