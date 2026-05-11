import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { DishCreateDTO, DishProduct } from "../http/models/Dishes";
import { useProducts } from "../hooks/Products";
import DishService from "../http/services/DishService";
import { ImageUploader } from "../components/ImageUploader";
import { computeDishStats, validateMacroSum } from "../utils/computeDishStats";

export const DishEdit = () => {
  const { id } = useParams<{ id: string }>();
  const { products: productList } = useProducts();
  const navigate = useNavigate();

  const [name, setName] = useState<string>("");
  const [calories, setCalories] = useState<string>("");
  const [fats, setFats] = useState<string>("");
  const [proteins, setProteins] = useState<string>("");
  const [carbs, setCarbs] = useState<string>("");
  const [servingSize, setServingSize] = useState<number>(0);
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

  // Derived: the values that will actually be submitted
  const effectiveProteins = Number(proteins) || placeholderProteins;
  const effectiveFats = Number(fats) || placeholderFats;
  const effectiveCarbs = Number(carbs) || placeholderCarbs;

  useEffect(() => {
    DishService.getDishProducts(id || "")
      .then((res) => {
        if (res.success) {
          setProducts(res.data?.products || []);
          applyStats(res.data?.products || []);
        } else {
          console.error(res.error);
        }
      })
      .then(() => {
        DishService.getDishes().then((res) => {
          if (res.success) {
            const dish = res.data?.dishes.find((i) => i.id === id);
            setName(dish?.name || "");
            setCalories(dish?.calories?.toString() || "");
            setFats(dish?.fats?.toString() || "");
            setProteins(dish?.proteins?.toString() || "");
            setCarbs(dish?.carbs?.toString() || "");
            setServingSize(dish?.serving_size || 0);
            setCategory(dish?.category || 0);
            setPhotos(dish?.photos || []);
            setIsVegan(dish?.is_vegan || false);
            setIsSugarFree(dish?.is_sugar_free || false);
            setIsGlutenFree(dish?.is_gluten_free || false);
          } else {
            console.error(res.error);
          }
        });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /** Calls computeDishStats and fans the result out to all local state setters */
  function applyStats(dishProducts: DishProduct[]) {
    const stats = computeDishStats(dishProducts, productList);
    setPlaceholderCalories(stats.calories);
    setPlaceholderFats(stats.fats);
    setPlaceholderCarbs(stats.carbs);
    setPlaceholderProteins(stats.proteins);
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
      serving_size: servingSize,
      category,
      photos,
      is_vegan: isVegan,
      is_sugar_free: isSugarFree,
      is_gluten_free: isGlutenFree,
      products,
    };
    const res = await DishService.updateDishe(id || "", data);
    if (res.success) navigate("/dishes");
    else console.error(res.error);
  }

  return (
    <div className="page">
      <div className="card">
        <h2 className="card-title">Редактировать блюдо</h2>

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
                onChange={(e) => setServingSize(Number(e.target.value))}
              />
            </div>
            <div className="form-field">
              <label className="form-label">Категория</label>
              <select
                className="select"
                value={category}
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
                if (products.some((i) => i.product_id === e.target.value))
                  return;
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

          <ImageUploader onChange={setPhotos} defaultValue={photos} />

          <button className="btn btn--primary" type="submit">
            Сохранить
          </button>
        </form>
      </div>
    </div>
  );
};
