package domain

type DishCategory int

const (
	DishCategoryDessert DishCategory = iota      
	DishCategoryMainCourse                       
	DishCategoryAppetizer                        
	DishCategorySalad                            
	DishCategorySoup                             
	DishCategoryDrink                            
	DishCategoryStarter                          
	DishCategoryUnknown                          
)

var dishCategoryName = map[DishCategory]string{
	DishCategoryDessert:    "dessert",
	DishCategoryMainCourse: "main_course",
	DishCategoryAppetizer:  "appetizer",
	DishCategorySalad:      "salad",
	DishCategorySoup:       "soup",
	DishCategoryDrink:      "drink",
	DishCategoryStarter:    "starter",
	DishCategoryUnknown:    "unknown",
}

func DishCategoryFromString(name string) DishCategory {
	switch name {
	case "dessert":   return DishCategoryDessert
	case "main_course":   return DishCategoryMainCourse
	case "appetizer":   return DishCategoryAppetizer
	case "salad":   return DishCategorySalad
	case "soup":      return DishCategorySoup
	case "drink":  return DishCategoryDrink
	case "starter":  return DishCategoryStarter
	case "unknown":  return DishCategoryUnknown
	default: return DishCategoryUnknown
	}
}

func (dc DishCategory) String() string {
	return dishCategoryName[dc]
}