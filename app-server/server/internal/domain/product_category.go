package domain

type ProductCategory int;

const (
	ProductCategoryFreezed ProductCategory = iota 
	ProductCategoryVegetables
	ProductCategoryMeat
	ProductCategorySpices
	ProductCategoryPreserves
	ProductCategoryCereals
	ProductCategorySweets
	ProductCategoryLiquids
)

var productCategoryName = map[ProductCategory]string{
	ProductCategoryFreezed: "freezed",
	ProductCategoryVegetables: "vegetables",
	ProductCategoryMeat: "meat",
	ProductCategorySpices: "spices",
	ProductCategoryPreserves: "preserves",
	ProductCategoryCereals: "cereals",
	ProductCategorySweets: "sweets",
	ProductCategoryLiquids: "liquids",
}

func (pc ProductCategory) String() string {
	return productCategoryName[pc]
}