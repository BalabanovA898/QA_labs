package usecase

import (
	"errors"
	"server/server/internal/domain"
	"server/server/internal/repository"

	"github.com/google/uuid"
	"github.com/lib/pq"
)

type DishRepository interface {
	CreateDish(dish *domain.Dish) error
	AddProductToDish(dishProduct *domain.DishProduct) error
	GetProductsByIds(productIds []uuid.UUID) ([]domain.Product, error)
	GetDishById(dishId uuid.UUID) (*domain.Dish, error)
	UpdateDish(dish *domain.Dish) error
	DeleteDish(dishId uuid.UUID) error
	DeleteAllProductsFromDish(dishId uuid.UUID) error
	FindDishes(filter repository.DishFilter) ([]domain.Dish, error)
	GetProductsByDishId(dishId uuid.UUID) ([]domain.DishProduct, error)
}

type DishUsecase struct {
	repository DishRepository
}

func NewDishUsecase(repository DishRepository) *DishUsecase {
	return &DishUsecase{repository: repository}
}

type DishProductDTO struct {
	ProductId uuid.UUID `json:"product_id"`
	Amount    float64   `json:"amount"`
}

type CreateDishInput struct {
	Name         string
	Photos       pq.StringArray
	Calories     float64
	Proteins     float64
	Fats         float64
	Carbs        float64
	ServingSize  float64
	Category     domain.DishCategory
	IsVegan      bool
	IsSugarFree  bool
	IsGlutenFree bool
	Products     []DishProductDTO
}

func (u *DishUsecase) CreateDish(input CreateDishInput) (*domain.Dish, error) {
	dish := &domain.Dish{
		ID:           uuid.New(),
		Name:         input.Name,
		Photos:       input.Photos,
		Calories:     input.Calories,
		Proteins:     input.Proteins,
		Fats:         input.Fats,
		Carbs:        input.Carbs,
		ServingSize:  input.ServingSize,
		Category:     input.Category,
		IsVegan:      input.IsVegan,
		IsSugarFree:  input.IsSugarFree,
		IsGlutenFree: input.IsGlutenFree,
	}

	if dish.Carbs < 0 || dish.Fats < 0 || dish.Proteins < 0 {
		return nil, errors.New("carbs, fats and proteins must be greater than 0")
	}
	err := u.repository.CreateDish(dish)
	if err != nil {
		return nil, err
	}
	for _, product := range input.Products {
		err := u.repository.AddProductToDish(&domain.DishProduct{
			DishId:    dish.ID,
			ProductId: product.ProductId,
			Amount:    product.Amount,
		})
		if err != nil {
			return nil, err
		}
	}
	return dish, nil
}

type UpdateDishInput struct {
	Name         *string
	Photos       pq.StringArray
	Calories     *float64
	Proteins     *float64
	Fats         *float64
	Carbs        *float64
	ServingSize  *float64
	Category     *domain.DishCategory
	IsVegan      *bool
	IsSugarFree  *bool
	IsGlutenFree *bool
	Products     *[]DishProductDTO
}

func (u *DishUsecase) UpdateDish(id uuid.UUID, input UpdateDishInput) error {
	dish, err := u.repository.GetDishById(id)
	if err != nil {
		return err
	}
	if input.Name != nil {
		dish.Name = *input.Name
	}
	if input.Products != nil {
		err := u.repository.DeleteAllProductsFromDish(id)
		if err != nil {
			return err
		}
		for _, product := range *input.Products {
			err := u.repository.AddProductToDish(&domain.DishProduct{
				DishId:    dish.ID,
				ProductId: product.ProductId,
				Amount:    product.Amount,
			})
			if err != nil {
				return err
			}
		}
	}
	if input.Photos != nil {
		dish.Photos = input.Photos
	}
	if input.Category != nil {
		dish.Category = *input.Category
	}
	if input.IsVegan != nil {
		dish.IsVegan = *input.IsVegan
	}
	if input.IsSugarFree != nil {
		dish.IsSugarFree = *input.IsSugarFree
	}
	if input.IsGlutenFree != nil {
		dish.IsGlutenFree = *input.IsGlutenFree
	}
	if input.Calories != nil {
		dish.Calories = *input.Calories
	}
	if input.Proteins != nil {
		dish.Proteins = *input.Proteins
	}
	if input.Fats != nil {
		dish.Fats = *input.Fats
	}
	if input.ServingSize != nil {
		dish.ServingSize = *input.ServingSize
	}
	if input.Carbs != nil {
		dish.Carbs = *input.Carbs
	}
	err = u.repository.UpdateDish(dish)
	if err != nil {
		return err
	}
	return nil
}

func (u *DishUsecase) DeleteDish(id uuid.UUID) error {
	err := u.repository.DeleteAllProductsFromDish(id)
	if err != nil {
		return err
	}
	err = u.repository.DeleteDish(id)
	if err != nil {
		return err
	}
	return nil
}

func (u *DishUsecase) GetDishes(filter repository.DishFilter) ([]domain.Dish, error) {
	return u.repository.FindDishes(filter)
}

func (u *DishUsecase) GetDishProducts(id uuid.UUID) ([]domain.DishProduct, error) {
	return u.repository.GetProductsByDishId(id)
}
