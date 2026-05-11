package usecase

import (
	"errors"
	"server/server/internal/domain"
	"server/server/internal/repository"
	"slices"

	"github.com/google/uuid"
	"github.com/lib/pq"
)

type ProductRepository interface {
	CreateProduct(product *domain.Product) error
	DeleteProduct(productId uuid.UUID) error
	UpdateProduct(product *domain.Product) error
	IsProductInUse(productId uuid.UUID) (bool, error)
	GetProductById(productId uuid.UUID) (*domain.Product, error)
	GetAllProducts() ([]domain.Product, error)
	FindProducts(filter repository.ProductFilter) ([]domain.Product, error)
	IsProductExist(productName string) (bool, error)
	GetAllDishesWithProduct(productId uuid.UUID) ([]domain.Dish, error)
}

type ProductUsecase struct {
	repository ProductRepository
}

func NewProductUsecase(repository ProductRepository) *ProductUsecase {
	return &ProductUsecase{repository: repository}
}

type SortingCriteria struct {
	Name     *bool
	Calories *bool
	Proteins *bool
	Fats     *bool
	Carbs    *bool
}

type CreateProductInput struct {
	Name                   string
	Photos                 *[]string
	Calories               float64
	Proteins               float64
	Fats                   float64
	Carbs                  float64
	Composition            string
	Category               domain.ProductCategory
	ReadinessForConsuption domain.ReadinessForConsuption
	IsVegan                bool
	IsSugarFree            bool
	IsGlutenFree           bool
}

type UpdateProductInput struct {
	Name                   *string
	Photos                 *[]string
	Calories               *float64
	Proteins               *float64
	Fats                   *float64
	Carbs                  *float64
	Composition            *string
	Category               *domain.ProductCategory
	ReadinessForConsuption *domain.ReadinessForConsuption
	IsVegan                *bool
	IsSugarFree            *bool
	IsGlutenFree           *bool
}

func (u *ProductUsecase) SortProducts(criterias *SortingCriteria, products *[]domain.Product) ([]domain.Product, error) {
	if criterias == nil {
		return *products, nil
	}

	if criterias.Proteins != nil && *criterias.Proteins {
		slices.SortFunc(*products, func(a, b domain.Product) int {
			if a.Proteins < b.Proteins {
				return 1
			}
			return -1
		})
		return *products, nil
	}

	if criterias.Calories != nil && *criterias.Calories {
		slices.SortFunc(*products, func(a, b domain.Product) int {
			if a.Calories < b.Calories {
				return 1
			}
			return -1
		})
		return *products, nil
	}

	if criterias.Fats != nil && *criterias.Fats {
		slices.SortFunc(*products, func(a, b domain.Product) int {
			if a.Fats < b.Fats {
				return 1
			}
			return -1
		})
		return *products, nil
	}

	if criterias.Carbs != nil && *criterias.Carbs {
		slices.SortFunc(*products, func(a, b domain.Product) int {
			if a.Carbs < b.Carbs {
				return 1
			}
			return -1
		})
		return *products, nil
	}

	return *products, nil
}

func (u *ProductUsecase) GetAllProductsFiltered(filter repository.ProductFilter) ([]domain.Product, error) {
	products, err := u.repository.FindProducts(filter)
	if err != nil {
		return nil, err
	}
	return products, nil
}

func (u *ProductUsecase) CreateProduct(input CreateProductInput) error {
	res, err := u.repository.IsProductExist(input.Name)

	if err != nil {
		return err
	}
	if res {
		return errors.New("product with that name already exists")
	}
	if (input.Fats + input.Proteins + input.Carbs) > 100 {
		return errors.New("sum of fats, proteins and carbs must be less than 100")
	}
	if input.Carbs < 0 || input.Fats < 0 || input.Proteins < 0 {
		return errors.New("carbs, fats and proteins must be greater than 0")
	}
	err = u.repository.CreateProduct(&domain.Product{
		Name:                   input.Name,
		Photos:                 pq.StringArray(*input.Photos),
		Calories:               input.Calories,
		Proteins:               input.Proteins,
		Fats:                   input.Fats,
		Carbs:                  input.Carbs,
		Composition:            input.Composition,
		Category:               input.Category,
		ReadinessForConsuption: input.ReadinessForConsuption,
		IsVegan:                input.IsVegan,
		IsSugarFree:            input.IsSugarFree,
		IsGlutenFree:           input.IsGlutenFree,
	})
	if err != nil {
		return err
	}
	return nil
}

func (u *ProductUsecase) DeleteProduct(id uuid.UUID) error {
	res, err := u.repository.IsProductInUse(id)
	if err != nil {
		return err
	}
	if res {
		return errors.New("product is in use")
	}
	err = u.repository.DeleteProduct(id)
	if err != nil {
		return err
	}
	return nil
}

func (u *ProductUsecase) UpdateProduct(id uuid.UUID, input UpdateProductInput) error {
	res, err := u.repository.GetProductById(id)
	if err != nil {
		return err
	}
	if input.Name != nil {
		res.Name = *input.Name
	}
	if input.Calories != nil {
		res.Calories = *input.Calories
	}
	if input.Proteins != nil {
		res.Proteins = *input.Proteins
	}
	if input.Carbs != nil {
		res.Carbs = *input.Carbs
	}
	if input.Fats != nil {
		res.Fats = *input.Fats
	}
	if input.Photos != nil {
		res.Photos = pq.StringArray(*input.Photos)
	}
	if input.IsVegan != nil {
		res.IsVegan = *input.IsVegan
	}
	if input.IsSugarFree != nil {
		res.IsSugarFree = *input.IsSugarFree
	}
	if input.IsGlutenFree != nil {
		res.IsGlutenFree = *input.IsGlutenFree
	}
	if input.Category != nil {
		res.Category = *input.Category
	}
	if input.ReadinessForConsuption != nil {
		res.ReadinessForConsuption = *input.ReadinessForConsuption
	}
	if input.Composition != nil {
		res.Composition = *input.Composition
	}
	if (res.Fats + res.Proteins + res.Carbs) > 100 {
		return errors.New("sum of fats, proteins and carbs must be less than 100")
	}
	err = u.repository.UpdateProduct(res)
	if err != nil {
		return err
	}
	return nil
}

func (u *ProductUsecase) GetProductById(id uuid.UUID) (*domain.Product, error) {
	product, err := u.repository.GetProductById(id)
	if err != nil {
		return nil, err
	}
	return product, nil
}

func (u *ProductUsecase) GetAllDishesWithProduct(productId uuid.UUID) ([]domain.Dish, error) {
	dishes, err := u.repository.GetAllDishesWithProduct(productId)
	if err != nil {
		return nil, err
	}
	return dishes, nil
}
