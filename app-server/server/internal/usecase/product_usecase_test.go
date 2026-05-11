package usecase

import (
	"errors"
	"server/server/internal/domain"
	"server/server/internal/repository"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

type MockProductRepository struct {
	mock.Mock
}

func (m *MockProductRepository) CreateProduct(product *domain.Product) error {
	args := m.Called(product)
	return args.Error(0)
}

func (m *MockProductRepository) IsProductExist(productName string) (bool, error) {
	args := m.Called(productName)
	return args.Bool(0), args.Error(1)
}

func (m *MockProductRepository) DeleteProduct(productId uuid.UUID) error {
	return m.Called(productId).Error(0)
}
func (m *MockProductRepository) UpdateProduct(product *domain.Product) error {
	return m.Called(product).Error(0)
}
func (m *MockProductRepository) IsProductInUse(productId uuid.UUID) (bool, error) {
	args := m.Called(productId)
	return args.Bool(0), args.Error(1)
}
func (m *MockProductRepository) GetProductById(productId uuid.UUID) (*domain.Product, error) {
	args := m.Called(productId)
	if args.Get(0) != nil {
		return args.Get(0).(*domain.Product), args.Error(1)
	}
	return nil, args.Error(1)
}
func (m *MockProductRepository) GetAllProducts() ([]domain.Product, error) {
	args := m.Called()
	return args.Get(0).([]domain.Product), args.Error(1)
}
func (m *MockProductRepository) FindProducts(filter repository.ProductFilter) ([]domain.Product, error) {
	args := m.Called(filter)
	return args.Get(0).([]domain.Product), args.Error(1)
}
func (m *MockProductRepository) GetAllDishesWithProduct(productId uuid.UUID) ([]domain.Dish, error) {
	args := m.Called(productId)
	return args.Get(0).([]domain.Dish), args.Error(1)
}

func TestProductUsecase_CreateProduct(t *testing.T) {
	photos := []string{"some_base64_string"}

	tests := []struct {
		name          string
		input         CreateProductInput
		mockSetup     func(repo *MockProductRepository)
		expectedError string
	}{
		{
			name: "sum 100: Product successfully created",
			input: CreateProductInput{
				Name:     "test",
				Photos:   &photos,
				Proteins: 50.0,
				Fats:     25.0,
				Carbs:    25.0,
			},
			mockSetup: func(repo *MockProductRepository) {
				repo.On("IsProductExist", "test").Return(false, nil)
				repo.On("CreateProduct", mock.AnythingOfType("*domain.Product")).Return(nil)
			},
			expectedError: "",
		},
		{
			name: "sum 99.9: Product successfully created",
			input: CreateProductInput{
				Name:     "test",
				Photos:   &photos,
				Proteins: 50.0,
				Fats:     25.0,
				Carbs:    24.9,
			},
			mockSetup: func(repo *MockProductRepository) {
				repo.On("IsProductExist", "test").Return(false, nil)
				repo.On("CreateProduct", mock.AnythingOfType("*domain.Product")).Return(nil)
			},
			expectedError: "",
		},
		{
			name: "sum 0: Product successfully created",
			input: CreateProductInput{
				Name:     "test",
				Photos:   &photos,
				Proteins: 0,
				Fats:     0,
				Carbs:    0,
			},
			mockSetup: func(repo *MockProductRepository) {
				repo.On("IsProductExist", "test").Return(false, nil)
				repo.On("CreateProduct", mock.AnythingOfType("*domain.Product")).Return(nil)
			},
			expectedError: "",
		},
		{
			name: "sum 0.1: Product successfully created",
			input: CreateProductInput{
				Name:     "test",
				Photos:   &photos,
				Proteins: 0,
				Fats:     0,
				Carbs:    0.1,
			},
			mockSetup: func(repo *MockProductRepository) {
				repo.On("IsProductExist", "test").Return(false, nil)
				repo.On("CreateProduct", mock.AnythingOfType("*domain.Product")).Return(nil)
			},
			expectedError: "",
		},
		{
			name: "sum 100.1: Validation error sum greater than 100",
			input: CreateProductInput{
				Name:     "test",
				Proteins: 50.0,
				Fats:     25.0,
				Carbs:    25.1,
			},
			mockSetup: func(repo *MockProductRepository) {
				repo.On("IsProductExist", "test").Return(false, nil)
			},
			expectedError: "sum of fats, proteins and carbs must be less than 100",
		},
		{
			name: "sum 150: Validation error sum greater than 100",
			input: CreateProductInput{
				Name:     "test",
				Proteins: 50.0,
				Fats:     50.0,
				Carbs:    50.0,
			},
			mockSetup: func(repo *MockProductRepository) {
				repo.On("IsProductExist", "test").Return(false, nil)
			},
			expectedError: "sum of fats, proteins and carbs must be less than 100",
		},
		{
			name: "carbs -0.1: Validation error negative params",
			input: CreateProductInput{
				Name:     "test",
				Proteins: 0,
				Fats:     0,
				Carbs:    -0.1,
			},
			mockSetup: func(repo *MockProductRepository) {
				repo.On("IsProductExist", "test").Return(false, nil)
			},
			expectedError: "carbs, fats and proteins must be greater than 0",
		},
		{
			name: "fats -50: Validation error negative params",
			input: CreateProductInput{
				Name:     "test",
				Proteins: 25,
				Fats:     -50,
				Carbs:    0,
			},
			mockSetup: func(repo *MockProductRepository) {
				repo.On("IsProductExist", "test").Return(false, nil)
			},
			expectedError: "carbs, fats and proteins must be greater than 0",
		},
		{
			name: "Error: Product already exists",
			input: CreateProductInput{
				Name:     "test",
				Proteins: 10,
				Fats:     10,
				Carbs:    10,
			},
			mockSetup: func(repo *MockProductRepository) {
				repo.On("IsProductExist", "test").Return(true, nil)
			},
			expectedError: "product with that name already exists",
		},
		{
			name: "Error: Database connection failed",
			input: CreateProductInput{
				Name: "test",
			},
			mockSetup: func(repo *MockProductRepository) {
				repo.On("IsProductExist", "test").Return(false, errors.New("database connection failed"))
			},
			expectedError: "database connection failed",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel();
			mockRepo := new(MockProductRepository)
			tt.mockSetup(mockRepo)

			usecase := NewProductUsecase(mockRepo)

			err := usecase.CreateProduct(tt.input)

			if tt.expectedError != "" {
				assert.EqualError(t, err, tt.expectedError)
			} else {
				assert.NoError(t, err)
			}

			mockRepo.AssertExpectations(t)
		})
	}
}

func TestProductUsecase_SortProducts(t *testing.T) {
	usecase := NewProductUsecase(nil)

	products := []domain.Product{
		{Name: "Куриная грудка", Proteins: 23.0},
		{Name: "Творог", Proteins: 18.0},
		{Name: "Соевое мясо", Proteins: 52.0},
	}

	sortByProteins := true
	criteria := &SortingCriteria{Proteins: &sortByProteins}

	sortedProducts, err := usecase.SortProducts(criteria, &products)

	assert.NoError(t, err)
	assert.Len(t, sortedProducts, 3)

	assert.Equal(t, "Соевое мясо", sortedProducts[0].Name, "Самый белковый продукт должен быть первым")
	assert.Equal(t, "Куриная грудка", sortedProducts[1].Name)
	assert.Equal(t, "Творог", sortedProducts[2].Name)
}
