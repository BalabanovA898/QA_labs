package v1

import (
	"server/server/internal/domain"
	"server/server/internal/repository"
	"server/server/internal/usecase"

	"github.com/google/uuid"
	"github.com/lib/pq"

	"github.com/gin-gonic/gin"
)

type DishUsecase interface {
	CreateDish(input usecase.CreateDishInput) (*domain.Dish, error)
	UpdateDish(id uuid.UUID, input usecase.UpdateDishInput) error
	DeleteDish(id uuid.UUID) error
	GetDishes(filter repository.DishFilter) ([]domain.Dish, error)
	GetDishProducts(id uuid.UUID) ([]domain.DishProduct, error)
}

type DishHandler struct {
	usecase DishUsecase
}

func NewDishHandler(u DishUsecase) *DishHandler { return &DishHandler{u} }

func (h *DishHandler) Register(router *gin.RouterGroup) {
	dishes := router.Group("/dishes")
	{
		dishes.GET("", h.Get)
		dishes.POST("", h.Create)
		dishes.PUT("/:id", h.Update)
		dishes.DELETE("/:id", h.Delete)
		dishes.GET("/:id/products", h.GetProducts)
	}
}

type DishFilterQuery struct {
	Category     *domain.DishCategory `form:"category"`
	IsVegan      *bool                `form:"is_vegan"`
	IsSugarFree  *bool                `form:"is_sugar_free"`
	IsGlutenFree *bool                `form:"is_gluten_free"`
	SearchQuery  string               `form:"name"`
}

// Get godoc
// @Summary      Получить список блюд
// @Description  Возвращает блюда с фильтрацией по категории, флагам и имени.
// @Tags         dishes
// @Produce      json
// @Param        category  query     string  false  "Категория блюда"
// @Param        flags     query     []string false "Флаги блюда"
// @Param        name      query     string  false  "Подстрока для поиска по имени"
// @Success      200       {object}  dishesResponse
// @Failure      400       {object}  errorResponse
// @Failure      422       {object}  errorResponse
// @Router       /dishes [get]
func (h *DishHandler) Get(c *gin.Context) {
	var query DishFilterQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(400, failureResponse("VALIDATION_ERROR", err.Error()))
		return
	}

	dishes, err := h.usecase.GetDishes(repository.DishFilter{
		Category:     query.Category,
		IsVegan:      query.IsVegan,
		IsSugarFree:  query.IsSugarFree,
		IsGlutenFree: query.IsGlutenFree,
		SearchQuery:  &query.SearchQuery,
	})
	if err != nil {
		c.JSON(422, failureResponse("UNPROCESSABLE_ENTITY", err.Error()))
		return
	}

	c.JSON(200, successResponse(gin.H{"dishes": dishes}))
}

type createDishRequest struct {
	Name         string                   `json:"name"`
	Products     []usecase.DishProductDTO `json:"products"`
	Photos       []string                 `json:"photos"`
	Calories     float64                  `json:"calories"`
	Proteins     float64                  `json:"proteins"`
	Fats         float64                  `json:"fats"`
	Carbs        float64                  `json:"carbs"`
	ServingSize  float64                  `json:"serving_size"`
	Category     domain.DishCategory      `json:"category"`
	IsVegan      bool                     `json:"is_vegan"`
	IsSugarFree  bool                     `json:"is_sugar_free"`
	IsGlutenFree bool                     `json:"is_gluten_free"`
}

// Create godoc
// @Summary      Создать блюдо
// @Description  Создает новое блюдо с составом продуктов.
// @Tags         dishes
// @Accept       json
// @Produce      json
// @Param        input  body      createDishRequest  true  "Данные блюда"
// @Success      201    {object}  dishResponse
// @Failure      400    {object}  errorResponse
// @Failure      500    {object}  errorResponse
// @Router       /dishes [post]
func (h *DishHandler) Create(c *gin.Context) {
	var req createDishRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, failureResponse("VALIDATION_ERROR", "Некорректные данные: "+err.Error()))
		return
	}

	res, err := h.usecase.CreateDish(usecase.CreateDishInput{
		Name:         req.Name,
		Products:     req.Products,
		Photos:       pq.StringArray(req.Photos),
		Calories:     req.Calories,
		Proteins:     req.Proteins,
		Fats:         req.Fats,
		Carbs:        req.Carbs,
		ServingSize:  req.ServingSize,
		Category:     req.Category,
		IsVegan:      req.IsVegan,
		IsSugarFree:  req.IsSugarFree,
		IsGlutenFree: req.IsGlutenFree,
	})
	if err != nil {
		c.JSON(500, failureResponse("INTERNAL_ERROR", err.Error()))
		return
	}
	c.JSON(201, successResponse(gin.H{"dish": res}))
}

type updateDishRequest struct {
	Name         *string                   `json:"name"`
	Products     *[]usecase.DishProductDTO `json:"products"`
	Photos       *[]string                 `json:"photos"`
	Calories     *float64                  `json:"calories"`
	Proteins     *float64                  `json:"proteins"`
	Fats         *float64                  `json:"fats"`
	Carbs        *float64                  `json:"carbs"`
	ServingSize  *float64                  `json:"serving_size"`
	Category     *domain.DishCategory      `json:"category"`
	IsVegan      *bool                     `json:"is_vegan"`
	IsSugarFree  *bool                     `json:"is_sugar_free"`
	IsGlutenFree *bool                     `json:"is_gluten_free"`
}

// Update godoc
// @Summary      Обновить блюдо
// @Description  Частично обновляет данные блюда по UUID.
// @Tags         dishes
// @Accept       json
// @Produce      json
// @Param        id     path      string             true  "UUID блюда"
// @Param        input  body      updateDishRequest  true  "Поля для обновления"
// @Success      200    {object}  messageResponse
// @Failure      400    {object}  errorResponse
// @Failure      404    {object}  errorResponse
// @Failure      500    {object}  errorResponse
// @Router       /dishes/{id} [put]
func (h *DishHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(400, failureResponse("VALIDATION_ERROR", err.Error()))
		return
	}

	var req updateDishRequest
	if err = c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, failureResponse("VALIDATION_ERROR", "Некорректные данные: "+err.Error()))
		return
	}
	input := usecase.UpdateDishInput{
		Name:         req.Name,
		Products:     req.Products,
		Calories:     req.Calories,
		Proteins:     req.Proteins,
		Fats:         req.Fats,
		Carbs:        req.Carbs,
		ServingSize:  req.ServingSize,
		Category:     req.Category,
		IsVegan:      req.IsVegan,
		IsSugarFree:  req.IsSugarFree,
		IsGlutenFree: req.IsGlutenFree,
	}
	if req.Photos != nil {
		input.Photos = pq.StringArray(*req.Photos)
	}

	err = h.usecase.UpdateDish(id, input)
	if err != nil {
		if err.Error() == "dish not found" {
			c.JSON(404, failureResponse("NOT_FOUND", err.Error()))
			return
		}
		c.JSON(500, failureResponse("INTERNAL_ERROR", err.Error()))
		return
	}
	c.JSON(200, successResponse(gin.H{"message": "dish updated"}))
}

// Delete godoc
// @Summary      Удалить блюдо
// @Description  Удаляет блюдо по UUID.
// @Tags         dishes
// @Produce      json
// @Param        id       path      string  true  "UUID блюда"
// @Success      200      {object}  messageResponse
// @Failure      400      {object}  errorResponse
// @Failure      404      {object}  errorResponse
// @Failure      500      {object}  errorResponse
// @Router       /dishes/{id} [delete]
func (h *DishHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(400, failureResponse("VALIDATION_ERROR", err.Error()))
		return
	}

	err = h.usecase.DeleteDish(id)
	if err != nil {
		if err.Error() == "dish not found" {
			c.JSON(404, failureResponse("NOT_FOUND", err.Error()))
			return
		}
		c.JSON(500, failureResponse("INTERNAL_ERROR", err.Error()))
		return
	}
	c.JSON(200, successResponse(gin.H{"message": "dish deleted"}))
}

// GetDishProducts godoc
// @Summary      Получить продукты входящие в состав блюда.
// @Description  Получить продукты, которые используются для приготовления блюда с UUID.
// @Tags         dishes
// @Produce      json
// @Param        id       path      string  true  "UUID блюда"
// @Success      200      {object}  messageResponse
// @Failure      500      {object}  errorResponse
// @Router       /dishes/{id}/products [get]
func (h *DishHandler) GetProducts(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(400, failureResponse("VALIDATION_ERROR", err.Error()))
		return
	}

	products, err := h.usecase.GetDishProducts(id)

	if err != nil {
		c.JSON(500, failureResponse("INTERNAL_ERROR", err.Error()))
		return
	}
	c.JSON(200, successResponse(gin.H{"products": products}))
}
