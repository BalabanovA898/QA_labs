import { useState } from "react";
import { ProductCreateDTO } from "../http/models/Products";
import ProductService from "../http/services/ProductsService";
import { ImageUploader } from "./ImageUploader";
import { validateMacroSum } from "../utils/computeDishStats";
import notify from "../store/notify";

export const CreateProductForm = () => {
  const [formState, setFormState] = useState<ProductCreateDTO>({
    calories: 0,
    carbs: 0,
    category: 0,
    composition: "",
    fats: 0,
    is_vegan: false,
    is_sugar_free: false,
    is_gluten_free: false,
    name: "",
    photos: [],
    proteins: 0,
    readiness_for_consumption: 0,
  });

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
      await ProductService.createProduct(formState);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label className="form-label">Название</label>
        <input
          className="input"
          type="text"
          value={formState.name}
          placeholder="Например: Куриная грудка"
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
            placeholder="0"
            onChange={(e) => {
              if (Number(e.target.value) < 0) {
                setMacroError("Калории не могут быть отрицательными");
              } else {
                setMacroError(
                  validateMacroSum(
                    Number(e.target.value),
                    formState.fats,
                    formState.carbs,
                  ),
                );
              }
              setFormState({ ...formState, calories: Number(e.target.value) });
            }}
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
            placeholder="0"
            onChange={(e) => {
              setFormState({ ...formState, proteins: Number(e.target.value) });
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
            placeholder="0"
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
            placeholder="0"
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
          placeholder="Перечислите ингредиенты..."
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
            value={formState.category}
            onChange={(e) =>
              setFormState({ ...formState, category: Number(e.target.value) })
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
            value={formState.readiness_for_consumption}
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
              setFormState({ ...formState, is_sugar_free: e.target.checked })
            }
          />
          Без сахара
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={formState.is_gluten_free}
            onChange={(e) =>
              setFormState({ ...formState, is_gluten_free: e.target.checked })
            }
          />
          Без глютена
        </label>
      </div>

      <ImageUploader
        onChange={(item) => setFormState({ ...formState, photos: item })}
      />

      {macroError && <div className="form-error">{macroError}</div>}

      <button
        className="btn btn--primary"
        type="submit"
        disabled={!!macroError}
      >
        Создать продукт
      </button>
    </form>
  );
};
