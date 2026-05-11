package usecase

import (
	"server/server/internal/domain"
	"server/server/internal/repository"
	"testing"

	"github.com/google/uuid"
	"github.com/lib/pq"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

type MockDishRepository struct {
	mock.Mock
}

func (m *MockDishRepository) CreateDish(dish *domain.Dish) error {
	args := m.Called(dish)
	return args.Error(0)
}

func (m *MockDishRepository) AddProductToDish(dishProduct *domain.DishProduct) error {
	args := m.Called(dishProduct)
	return args.Error(0)
}

func (m *MockDishRepository) GetProductsByIds(productIds []uuid.UUID) ([]domain.Product, error) {
	args := m.Called(productIds)
	return args.Get(0).([]domain.Product), args.Error(1)
}

func (m *MockDishRepository) GetDishById(dishId uuid.UUID) (*domain.Dish, error) {
	args := m.Called(dishId)
	if args.Get(0) != nil {
		return args.Get(0).(*domain.Dish), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockDishRepository) UpdateDish(dish *domain.Dish) error {
	args := m.Called(dish)
	return args.Error(0)
}

func (m *MockDishRepository) DeleteDish(dishId uuid.UUID) error {
	args := m.Called(dishId)
	return args.Error(0)
}

func (m *MockDishRepository) DeleteAllProductsFromDish(dishId uuid.UUID) error {
	args := m.Called(dishId)
	return args.Error(0)
}

func (m *MockDishRepository) FindDishes(filter repository.DishFilter) ([]domain.Dish, error) {
	args := m.Called(filter)
	return args.Get(0).([]domain.Dish), args.Error(1)
}

func (m *MockDishRepository) GetProductsByDishId(dishId uuid.UUID) ([]domain.DishProduct, error) {
	args := m.Called(dishId)
	return args.Get(0).([]domain.DishProduct), args.Error(1)
}

func TestDishUsecase_CreateDish(t *testing.T) {
	photos := pq.StringArray([]string{"some_base64_string"})

	tests := []struct {
		name          string
		input         CreateDishInput
		mockSetup     func(repo *MockDishRepository)
		expectedError string
	}{
		{
			name: "sum 100: Dish successfully created",
			input: CreateDishInput{
				Name:     "test",
				Photos:   photos,
				Proteins: 50.0,
				Fats:     25.0,
				Carbs:    25.0,
			},
			mockSetup: func(repo *MockDishRepository) {
				repo.On("CreateDish", mock.AnythingOfType("*domain.Dish")).Return(nil)
			},
			expectedError: "",
		},
		{
			name: "sum 99.9: Dish successfully created ",
			input: CreateDishInput{
				Name:     "test",
				Photos:   photos,
				Proteins: 50.0,
				Fats:     25.0,
				Carbs:    24.9,
			},
			mockSetup: func(repo *MockDishRepository) {
				repo.On("CreateDish", mock.AnythingOfType("*domain.Dish")).Return(nil)
			},
			expectedError: "",
		},
		{
			name: "sum 0: Dish successfully created",
			input: CreateDishInput{
				Name:     "test",
				Photos:   photos,
				Proteins: 0,
				Fats:     0,
				Carbs:    0,
			},
			mockSetup: func(repo *MockDishRepository) {
				repo.On("CreateDish", mock.AnythingOfType("*domain.Dish")).Return(nil)
			},
			expectedError: "",
		},
		{
			name: "sum 0.1: Dish successfully created",
			input: CreateDishInput{
				Name:     "test",
				Photos:   photos,
				Proteins: 0,
				Fats:     0,
				Carbs:    0.1,
			},
			mockSetup: func(repo *MockDishRepository) {
				repo.On("CreateDish", mock.AnythingOfType("*domain.Dish")).Return(nil)
			},
			expectedError: "",
		},
		{
			name: "negative carbs: Validation error params less than 0",
			input: CreateDishInput{
				Name:     "test",
				Photos:   photos,
				Proteins: 0,
				Fats:     0,
				Carbs:    -0.1,
			},
			mockSetup:     func(repo *MockDishRepository) {},
			expectedError: "carbs, fats and proteins must be greater than 0",
		},
		{
			name: "fats -50: Validation error sum less than 0",
			input: CreateDishInput{
				Name:     "test",
				Photos:   photos,
				Proteins: 25,
				Fats:     -50,
				Carbs:    0,
			},
			mockSetup:     func(repo *MockDishRepository) {},
			expectedError: "carbs, fats and proteins must be greater than 0",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := new(MockDishRepository)
			tt.mockSetup(mockRepo)

			usecase := NewDishUsecase(mockRepo)

			_, err := usecase.CreateDish(tt.input)
			if err != nil {
				assert.Equal(t, tt.expectedError, err.Error())
			} else {
				assert.NoError(t, err)
			}

			mockRepo.AssertExpectations(t)
		})
	}
}
