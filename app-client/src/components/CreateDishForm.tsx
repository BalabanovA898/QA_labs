import { useState } from "react";
import { useProducts } from "../hooks/Products";
import { DishCreateDTO, DishProduct } from "../http/models/Dishes";
import { ImageUploader } from "./ImageUploader";
import DishService from "../http/services/DishService";
import { useNavigate } from "react-router-dom";
import { computeDishStats, validateMacroSum } from "../utils/computeDishStats";

export const CreateDishForm = () => {
  const { products: productList } = useProducts();
  const navigate = useNavigate();

  const [name, setName] = useState<string>("");
  const [calories, setCalories] = useState<string>("");
  const [fats, setFats] = useState<string>("");
  const [proteins, setProteins] = useState<string>("");
  const [carbs, setCarbs] = useState<string>("");
  const [servingSize, setServingSize] = useState<number>();
  const [category, setCategory] = useState<number>(0);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isVegan, setIsVegan] = useState<boolean>(false);
  const [isSugarFree, setIsSugarFree] = useState<boolean>(false);
  const [isGlutenFree, setIsGlutenFree] = useState<boolean>(false);
  const [products, setProducts] = useState<DishProduct[]>([]);

  const [placeholderFats, setPlaceholderFats] = useState<number>(0);
  const [placeholderCarbs, setPlaceholderCarbs] = useState<number>(0);
  const [placeholderProteins, setPlaceholderProteins] = useState<number>(0);
  const [placeholderCalories, setPlaceholderCalories] = useState<number>(0);
  const [placeholderServingSize, setPlaceholderServingSize] =
    useState<number>(0);

  // Derived: the values that will actually be submitted
  const effectiveProteins = Number(proteins) || placeholderProteins;
  const effectiveFats = Number(fats) || placeholderFats;
  const effectiveCarbs = Number(carbs) || placeholderCarbs;

  /** Calls computeDishStats and fans the result out to all local state setters */
  function applyStats(dishProducts: DishProduct[]) {
    const stats = computeDishStats(dishProducts, productList);
    setPlaceholderCalories(stats.calories);
    setPlaceholderFats(stats.fats);
    setPlaceholderCarbs(stats.carbs);
    setPlaceholderProteins(stats.proteins);
    setPlaceholderServingSize(stats.servingSize);
    setIsVegan(stats.isVegan);
    setIsSugarFree(stats.isSugarFree);
    setIsGlutenFree(stats.isGlutenFree);
  }

  async function handleSubmit() {
    const data: DishCreateDTO = {
      name: name.trim(),
      calories: Number(calories) || placeholderCalories,
      fats: effectiveFats,
      carbs: effectiveCarbs,
      proteins: effectiveProteins,
      serving_size: servingSize || placeholderServingSize,
      category,
      photos,
      is_vegan: isVegan,
      is_sugar_free: isSugarFree,
      is_gluten_free: isGlutenFree,
      products,
    };
    try {
      const macrosList = [
        "!десерт",
        "!первое",
        "!второе",
        "!напиток",
        "!салат",
        "!суп",
        "!перекус",
      ];

      for (let macro = 0; macro < macrosList.length; macro++) {
        while (data.name.includes(macrosList[macro])) {
          data.name = data.name.replace(macrosList[macro], "").trim();
          data.category = macro;
        }
      }

      const res = await DishService.createDishe(data);
      if (res.success) navigate("/dishes");
      else console.error(res.error);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <div className="form-field">
        <label className="form-label">Название</label>
        <input
          className="input"
          type="text"
          value={name}
          placeholder="Например: Паста болоньезе"
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="form-grid">
        <div className="form-field">
          <label className="form-label">Калории</label>
          <input
            className="input"
            type="text"
            value={calories}
            placeholder={placeholderCalories.toFixed(1)}
            onChange={(e) => setCalories(e.target.value)}
          />
        </div>
        <div className="form-field">
          <label className="form-label">Белки (г)</label>
          <input
            className="input"
            type="text"
            value={proteins}
            placeholder={placeholderProteins.toFixed(1)}
            onChange={(e) => setProteins(e.target.value)}
          />
        </div>
        <div className="form-field">
          <label className="form-label">Жиры (г)</label>
          <input
            className="input"
            type="text"
            value={fats}
            placeholder={placeholderFats.toFixed(1)}
            onChange={(e) => setFats(e.target.value)}
          />
        </div>
        <div className="form-field">
          <label className="form-label">Углеводы (г)</label>
          <input
            className="input"
            type="text"
            value={carbs}
            placeholder={placeholderCarbs.toFixed(1)}
            onChange={(e) => setCarbs(e.target.value)}
          />
        </div>
      </div>

      <div className="form-grid">
        <div className="form-field">
          <label className="form-label">Размер порции (г)</label>
          <input
            className="input"
            type="number"
            value={servingSize}
            placeholder={placeholderServingSize.toFixed(1)}
            onChange={(e) => {
              setServingSize(Number(e.target.value));
              //let newProteins = 0,
              //  newCalories = 0,
              //  newCarbs = 0,
              //  newFats = 0;
              //for (let item of products) {
              //  const product = productList.filter(
              //    (i) => i.id === item.product_id,
              //  )[0];
              //  const proportionInServing =
              //    (item.amount / placeholderServingSize) *
              //    Number(e.target.value);
              //  newCalories += (product.calories / 100) * proportionInServing;
              //  newProteins += (product.proteins / 100) * proportionInServing;
              //  newCarbs += (product.carbs / 100) * proportionInServing;
              //  newFats += (product.fats / 100) * proportionInServing;
              //}
              //setPlaceholderCalories(newCalories);
              //setPlaceholderProteins(newProteins);
              //setPlaceholderCarbs(newCarbs);
              //setPlaceholderFats(newFats);
            }}
          />
        </div>
        <div className="form-field">
          <label className="form-label">Категория</label>
          <select
            className="select"
            onChange={(e) => setCategory(Number(e.target.value))}
          >
            <option value={0}>Десерт</option>
            <option value={1}>Первое</option>
            <option value={2}>Второе</option>
            <option value={3}>Напиток</option>
            <option value={4}>Салат</option>
            <option value={5}>Суп</option>
            <option value={6}>Перекус</option>
          </select>
        </div>
      </div>

      <div className="checkbox-group">
        <label
          className="checkbox-label"
          title="Определяется автоматически по составу продуктов"
        >
          <input
            type="checkbox"
            checked={isVegan}
            disabled
            onChange={() => {}}
          />
          Веганское
        </label>
        <label
          className="checkbox-label"
          title="Определяется автоматически по составу продуктов"
        >
          <input
            type="checkbox"
            checked={isSugarFree}
            disabled
            onChange={() => {}}
          />
          Без сахара
        </label>
        <label
          className="checkbox-label"
          title="Определяется автоматически по составу продуктов"
        >
          <input
            type="checkbox"
            checked={isGlutenFree}
            disabled
            onChange={() => {}}
          />
          Без глютена
        </label>
      </div>

      <div className="form-field">
        <label className="form-label">Добавить продукт</label>
        <select
          className="select"
          onChange={(e) => {
            if (e.target.value === "") return;
            if (products.some((i) => i.product_id === e.target.value)) return;
            const updated = [
              ...products,
              { product_id: e.target.value, amount: 0 },
            ];
            setProducts(updated);
            applyStats(updated);
            e.target.value = "";
          }}
        >
          <option value="">Выберите продукт...</option>
          {productList.map((item) => (
            <option value={item.id} key={item.id}>
              {item.name}
            </option>
          ))}
        </select>
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
                <input
                  className="input"
                  type="number"
                  value={item.amount}
                  placeholder="г"
                  onChange={(e) => {
                    const updated = [
                      ...products.filter(
                        (i) => i.product_id !== item.product_id,
                      ),
                      {
                        product_id: item.product_id,
                        amount: Number(e.target.value),
                      },
                    ];
                    setProducts(updated);
                    applyStats(updated);
                  }}
                />
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => {
                    const updated = products.filter(
                      (i) => i.product_id !== item.product_id,
                    );
                    setProducts(updated);
                    applyStats(updated);
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
        </div>
      )}

      <ImageUploader onChange={setPhotos} />

      <button className="btn btn--primary" type="submit">
        Сохранить блюдо
      </button>
    </form>
  );
};
