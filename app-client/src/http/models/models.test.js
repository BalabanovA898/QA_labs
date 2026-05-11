import { getDishCategoryName } from "./Dishes";
import { getProductCatgegoryName, getRFCName } from "./Products";

describe("getDishCategoryName", () => {
  test("correct values", () => {
    expect(getDishCategoryName(0)).toBe("Десерт");
    expect(getDishCategoryName(1)).toBe("Первое");
    expect(getDishCategoryName(2)).toBe("Второе");
    expect(getDishCategoryName(3)).toBe("Напиток");
    expect(getDishCategoryName(4)).toBe("Салат");
    expect(getDishCategoryName(5)).toBe("Суп");
    expect(getDishCategoryName(6)).toBe("Перекус");
  });

  test("incorrect values", () => {
    expect(getDishCategoryName(-1)).toBe("Неизвестно");
    expect(getDishCategoryName(7)).toBe("Неизвестно");
    expect(getDishCategoryName(100)).toBe("Неизвестно");
  });
});

describe("getProductCategoryName", () => {
  test("correct values", () => {
    expect(getProductCatgegoryName(0)).toBe("Замороженный");
    expect(getProductCatgegoryName(1)).toBe("Мясной");
    expect(getProductCatgegoryName(2)).toBe("Овощи");
    expect(getProductCatgegoryName(3)).toBe("Специи");
    expect(getProductCatgegoryName(4)).toBe("Консервы");
    expect(getProductCatgegoryName(5)).toBe("Крупы");
    expect(getProductCatgegoryName(6)).toBe("Сладости");
    expect(getProductCatgegoryName(7)).toBe("Жидкости");
  });

  test("incorrect values", () => {
    expect(getProductCatgegoryName(-1)).toBe("Неизвестно");
    expect(getProductCatgegoryName(8)).toBe("Неизвестно");
    expect(getProductCatgegoryName(100)).toBe("Неизвестно");
  });
});

describe("getRFCNames", () => {
  test("correct values", () => {
    expect(getRFCName(0)).toBe("Готовое к употреблению");
    expect(getRFCName(1)).toBe("Полуфабрикат");
    expect(getRFCName(2)).toBe("Требует приготовления");
  });

  test("incorrect values", () => {
    expect(getRFCName(-1)).toBe("Неизвестно");
    expect(getRFCName(3)).toBe("Неизвестно");
    expect(getRFCName(100)).toBe("Неизвестно");
  });
});
