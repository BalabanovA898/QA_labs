package repository

import (
	"fmt"
	"server/server/internal/domain"

	"github.com/google/uuid"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type PostgresRepository struct {
	db *gorm.DB
}

func NewPostgresRepository(host, port, user, password, dbname string) (*PostgresRepository, error) {
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		host, user, password, dbname, port)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	if err = db.AutoMigrate(&domain.Product{}); err != nil {
		return nil, err
	}
	if err = db.AutoMigrate(&domain.Dish{}); err != nil {
		return nil, err
	}
	if err = db.AutoMigrate(&domain.DishProduct{}); err != nil {
		return nil, err
	}

	return &PostgresRepository{db: db}, nil
}

func (r *PostgresRepository) CreateProduct(product *domain.Product) error {
	result := r.db.Create(product)
	return result.Error
}

func (r *PostgresRepository) GetAllProducts() ([]domain.Product, error) {
	var products []domain.Product
	result := r.db.Find(&products)
	return products, result.Error
}

func (r *PostgresRepository) GetProductById(productId uuid.UUID) (*domain.Product, error) {
	var product domain.Product
	result := r.db.Where("id = ?", productId).First(&product)
	return &product, result.Error
}

func (r *PostgresRepository) GetProductsByIds(productIds []uuid.UUID) ([]domain.Product, error) {
	var products []domain.Product
	for _, id := range productIds {
		var product domain.Product
		result := r.db.Where("id = ?", id).First(&product)
		if result.Error != nil {
			return nil, result.Error
		}
		products = append(products, product)
	}
	return products, nil
}

func (r *PostgresRepository) IsProductInUse(productId uuid.UUID) (bool, error) {
	var count int64
	err := r.db.Table("dish_products").Where("product_id = ?", productId).Count(&count).Error
	if err != nil {
		return false, err
	}
	return count > 0, nil
}
func (r *PostgresRepository) IsProductExist(name string) (bool, error) {
	var count int64
	res := r.db.Table("products").Where("name = ?", name).Count(&count)
	if res.Error != nil {
		return false, res.Error
	}
	return count > 0, nil
}

func (r *PostgresRepository) GetAllDishesWithProduct(productId uuid.UUID) ([]domain.Dish, error) {
	var dishes []domain.Dish
	err := r.db.Joins("JOIN dish_products ON dishes.id = dish_products.dish_id").
		Where("dish_products.product_id = ?", productId).
		Find(&dishes).Error
	return dishes, err
}

func (r *PostgresRepository) DeleteProduct(productId uuid.UUID) error {
	res := r.db.Delete(&domain.Product{}, productId)
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

func (r *PostgresRepository) UpdateProduct(product *domain.Product) error {
	res := r.db.Save(product)

	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

func (r *PostgresRepository) CreateDish(dish *domain.Dish) error {
	result := r.db.Create(dish)
	return result.Error
}

func (r *PostgresRepository) GetDishById(dishId uuid.UUID) (*domain.Dish, error) {
	var dish domain.Dish
	result := r.db.Where("id = ?", dishId).First(&dish)
	return &dish, result.Error
}

func (r *PostgresRepository) DeleteDish(dishId uuid.UUID) error {
	res := r.db.Delete(&domain.Dish{}, dishId)
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

func (r *PostgresRepository) UpdateDish(dish *domain.Dish) error {
	res := r.db.Save(dish)
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

func (r *PostgresRepository) AddProductToDish(dishProduct *domain.DishProduct) error {
	result := r.db.Create(dishProduct)
	return result.Error
}

func (r *PostgresRepository) GetProductsByDishId(dishId uuid.UUID) ([]domain.DishProduct, error) {
	var dishProducts []domain.DishProduct
	result := r.db.Where("dish_id = ?", dishId).Find(&dishProducts)
	return dishProducts, result.Error
}

func (r *PostgresRepository) DeleteAllProductsFromDish(dishId uuid.UUID) error {
	result := r.db.Where("dish_id = ?", dishId).Delete(&domain.DishProduct{})
	return result.Error
}

type ProductFilter struct {
	Category               *domain.ProductCategory
	ReadinessForConsuption *domain.ReadinessForConsuption
	IsVegan                *bool
	IsSugarFree            *bool
	IsGlutenFree           *bool
	SearchQuery            *string
}

type DishFilter struct {
	Category     *domain.DishCategory
	IsVegan      *bool
	IsSugarFree  *bool
	IsGlutenFree *bool
	SearchQuery  *string
}

func (r *PostgresRepository) FindProducts(filter ProductFilter) ([]domain.Product, error) {
	var products []domain.Product
	query := r.db.Model(&domain.Product{})

	if filter.SearchQuery != nil && len(*filter.SearchQuery) > 0 {
		query = query.Where("name ILIKE ?", "%"+*filter.SearchQuery+"%")
	}

	if filter.Category != nil {
		query = query.Where("category = ?", *filter.Category)
	}

	if filter.ReadinessForConsuption != nil {
		query = query.Where("readiness_for_consuption = ?", *filter.ReadinessForConsuption)
	}

	if filter.IsVegan != nil {
		query = query.Where("is_vegan = ?", *filter.IsVegan)
	}

	if filter.IsSugarFree != nil {
		query = query.Where("is_sugar_free = ?", *filter.IsSugarFree)
	}

	if filter.IsGlutenFree != nil {
		query = query.Where("is_gluten_free = ?", *filter.IsGlutenFree)
	}

	result := query.Find(&products)
	return products, result.Error
}

func (r *PostgresRepository) FindDishes(filter DishFilter) ([]domain.Dish, error) {
	var dishes []domain.Dish
	query := r.db.Model(&domain.Dish{})

	if filter.Category != nil {
		query = query.Where("category = ?", *filter.Category)
	}

	if filter.SearchQuery != nil && len(*filter.SearchQuery) > 0 {
		query = query.Where("name ILIKE ?", "%"+*filter.SearchQuery+"%")
	}

	if filter.IsVegan != nil {
		query = query.Where("is_vegan = ?", *filter.IsVegan)
	}

	if filter.IsSugarFree != nil {
		query = query.Where("is_sugar_free = ?", *filter.IsSugarFree)
	}

	if filter.IsGlutenFree != nil {
		query = query.Where("is_gluten_free = ?", *filter.IsGlutenFree)
	}

	result := query.Find(&dishes)
	return dishes, result.Error
}
