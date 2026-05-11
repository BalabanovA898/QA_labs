package v1

import (
	"server/server/internal/domain"
	"server/server/internal/repository"
	"server/server/internal/usecase"

	"github.com/google/uuid"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func successResponse(data any) gin.H {
	return gin.H{
		"success": true,
		"data":    data,
		"error":   nil,
	}
}

func failureResponse(code, message string) gin.H {
	return gin.H{
		"success": false,
		"data":    nil,
		"error": gin.H{
			"code":    code,
			"message": message,
		},
	}
}

type ProductUsecase interface {
	CreateProduct(input usecase.CreateProductInput) error
	SortProducts(criterias *usecase.SortingCriteria, products *[]domain.Product) ([]domain.Product, error)
	GetAllProductsFiltered(filter repository.ProductFilter) ([]domain.Product, error)
	DeleteProduct(id uuid.UUID) error
	UpdateProduct(id uuid.UUID, input usecase.UpdateProductInput) error
	GetProductById(id uuid.UUID) (*domain.Product, error)
	GetAllDishesWithProduct(productId uuid.UUID) ([]domain.Dish, error)
}

type ProductHandler struct {
	usecase ProductUsecase
}

func NewProductHandler(u ProductUsecase) *ProductHandler {
	return &ProductHandler{u}
}

func (h *ProductHandler) Register(router *gin.RouterGroup) {
	products := router.Group("/products")
	{
		products.POST("", h.Create)
		products.GET("", h.Get)
		products.GET("/:id", h.GetById)
		products.PUT("/:id", h.Update)
		products.DELETE("/:id", h.Delete)
		products.GET("/:id/dishes", h.GetDishesWithProduct)
	}
}

type createProductRequest struct {
	Name                   string                        `json:"name" binding:"min=2"`
	Photos                 []string                      `json:"photos"`
	Calories               float64                       `json:"calories"`
	Proteins               float64                       `json:"proteins"`
	Fats                   float64                       `json:"fats"`
	Carbs                  float64                       `json:"carbs"`
	Composition            string                        `json:"composition"`
	Category               domain.ProductCategory        `json:"category"`
	ReadinessForConsuption domain.ReadinessForConsuption `json:"readiness_for_consumption"`
	IsVegan                bool                          `json:"is_vegan"`
	IsSugarFree            bool                          `json:"is_sugar_free"`
	IsGlutenFree           bool                          `json:"is_gluten_free"`
}

// Create godoc
// @Summary      Создать продукт
// @Description  Создает новый продукт по данным из JSON.
// @Tags         products
// @Accept       json
// @Produce      json
// @Param        input  body      createProductRequest  true  "Данные продукта"
// @Success      201    {object}  messageResponse
// @Failure      400    {object}  errorResponse
// @Failure      422    {object}  errorResponse
// @Router       /products [post]
func (h *ProductHandler) Create(c *gin.Context) {
	var req createProductRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, failureResponse("VALIDATION_ERROR", "Некорректные данные: "+err.Error()))
		return
	}

	err := h.usecase.CreateProduct(req.toCreateProductInput())
	if err != nil {
		c.JSON(422, failureResponse("UNPROCESSABLE_ENTITY", err.Error()))
		return
	}

	c.JSON(201, successResponse(gin.H{"message": "product created"}))
}

func (r *createProductRequest) toCreateProductInput() usecase.CreateProductInput {
	return usecase.CreateProductInput{
		Name:                   r.Name,
		Calories:               r.Calories,
		Proteins:               r.Proteins,
		Carbs:                  r.Carbs,
		Fats:                   r.Fats,
		Photos:                 &r.Photos,
		Category:               r.Category,
		Composition:            r.Composition,
		ReadinessForConsuption: r.ReadinessForConsuption,
		IsVegan:                r.IsVegan,
		IsSugarFree:            r.IsSugarFree,
		IsGlutenFree:           r.IsGlutenFree,
	}
}

type ProductSortedFilteredQuery struct {
	Name                   *bool                          `form:"name"`
	Calories               *bool                          `form:"calories"`
	Proteins               *bool                          `form:"proteins"`
	Fats                   *bool                          `form:"fats"`
	Carbs                  *bool                          `form:"carbs"`
	Find                   *string                        `form:"find"`
	Category               *domain.ProductCategory        `form:"category"`
	ReadinessForConsuption *domain.ReadinessForConsuption `form:"readiness_for_consumption"`
	IsVegan                *bool                          `form:"is_vegan"`
	IsSugarFree            *bool                          `form:"is_sugar_free"`
	IsGlutenFree           *bool                          `form:"is_gluten_free"`
}

// Get godoc
// @Summary      Получить список продуктов
// @Description  Возвращает продукты с фильтрацией по подстроке и сортировкой по макронутриентам.
// @Tags         products
// @Produce      json
// @Param        name      query     bool  false  "Сортировать по имени (не используется в usecase)"
// @Param        calories  query     bool  false  "Сортировать по калориям (desc)"
// @Param        proteins  query     bool  false  "Сортировать по белкам (desc)"
// @Param        fats      query     bool  false  "Сортировать по жирам (desc)"
// @Param        carbs     query     bool  false  "Сортировать по углеводам (desc)"
// @Param        find      query     string false "Подстрока для поиска по имени"
// @Success      200       {object}  productsResponse
// @Failure      400       {object}  errorResponse
// @Failure      422       {object}  errorResponse
// @Router       /products [get]
func (h *ProductHandler) Get(c *gin.Context) {
	var query ProductSortedFilteredQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(400, failureResponse("VALIDATION_ERROR", err.Error()))
		return
	}

	products, err := h.usecase.GetAllProductsFiltered(repository.ProductFilter{
		SearchQuery:            query.Find,
		Category:               query.Category,
		ReadinessForConsuption: query.ReadinessForConsuption,
		IsVegan:                query.IsVegan,
		IsSugarFree:            query.IsSugarFree,
		IsGlutenFree:           query.IsGlutenFree,
	})
	if err != nil {
		c.JSON(422, failureResponse("UNPROCESSABLE_ENTITY", err.Error()))
		return
	}

	sorted, err := h.usecase.SortProducts(&usecase.SortingCriteria{
		Name:     query.Name,
		Calories: query.Calories,
		Proteins: query.Proteins,
		Fats:     query.Fats,
		Carbs:    query.Carbs,
	}, &products)

	if err != nil {
		c.JSON(422, failureResponse("UNPROCESSABLE_ENTITY", err.Error()))
		return
	}

	c.JSON(200, successResponse(gin.H{"products": sorted}))
}

// GetById godoc
// @Summary      Получить продукт по ID
// @Description  Возвращает один продукт по UUID.
// @Tags         products
// @Produce      json
// @Param        id       path      string  true  "UUID продукта"
// @Success      200      {object}  productResponse
// @Failure      400      {object}  errorResponse
// @Failure      404      {object}  errorResponse
// @Failure      500      {object}  errorResponse
// @Router       /products/{id} [get]
func (h *ProductHandler) GetById(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(400, failureResponse("VALIDATION_ERROR", err.Error()))
		return
	}

	product, err := h.usecase.GetProductById(id)
	if err != nil {
		if err.Error() == "product not found" {
			c.JSON(404, failureResponse("NOT_FOUND", err.Error()))
			return
		}
		c.JSON(500, failureResponse("INTERNAL_ERROR", err.Error()))
		return
	}
	c.JSON(200, successResponse(gin.H{"product": product}))
}

type UpdateProductInput struct {
	Name                   *string                        `json:"name" binding:"min=2"`
	Photos                 *[]string                      `json:"photos"`
	Calories               *float64                       `json:"calories"`
	Proteins               *float64                       `json:"proteins"`
	Fats                   *float64                       `json:"fats"`
	Carbs                  *float64                       `json:"carbs"`
	Composition            *string                        `json:"composition"`
	Category               *domain.ProductCategory        `json:"category"`
	ReadinessForConsuption *domain.ReadinessForConsuption `json:"readiness_for_consumption"`
	IsVegan                *bool                          `json:"is_vegan"`
	IsSugarFree            *bool                          `json:"is_sugar_free"`
	IsGlutenFree           *bool                          `json:"is_gluten_free"`
}

// Update godoc
// @Summary      Обновить продукт
// @Description  Частично обновляет данные существующего продукта.
// @Tags         products
// @Accept       json
// @Produce      json
// @Param        id     path      string              true  "UUID продукта"
// @Param        input  body      UpdateProductInput  true  "Поля для обновления"
// @Success      200    {object}  messageResponse
// @Failure      400    {object}  errorResponse
// @Failure      500    {object}  errorResponse
// @Router       /products/{id} [put]
func (h *ProductHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(400, failureResponse("VALIDATION_ERROR", err.Error()))
		return
	}

	var req UpdateProductInput
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, failureResponse("VALIDATION_ERROR", err.Error()))
		return
	}

	err = h.usecase.UpdateProduct(id, usecase.UpdateProductInput{
		Name:                   req.Name,
		Calories:               req.Calories,
		Proteins:               req.Proteins,
		Carbs:                  req.Carbs,
		Fats:                   req.Fats,
		Photos:                 req.Photos,
		Category:               req.Category,
		Composition:            req.Composition,
		ReadinessForConsuption: req.ReadinessForConsuption,
		IsVegan:                req.IsVegan,
		IsSugarFree:            req.IsSugarFree,
		IsGlutenFree:           req.IsGlutenFree,
	})
	if err != nil {
		c.JSON(500, failureResponse("INTERNAL_ERROR", err.Error()))
		return
	}
	c.JSON(200, successResponse(gin.H{"message": "product updated"}))
}

// Delete godoc
// @Summary      Удалить продукт
// @Description  Удаляет продукт по UUID, если он не используется в блюдах.
// @Tags         products
// @Produce      json
// @Param        id       path      string  true  "UUID продукта"
// @Success      200      {object}  messageResponse
// @Failure      400      {object}  errorResponse
// @Failure      404      {object}  errorResponse
// @Failure      422      {object}  errorResponse
// @Failure      500      {object}  errorResponse
// @Router       /products/{id} [delete]
func (h *ProductHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(400, failureResponse("VALIDATION_ERROR", err.Error()))
		return
	}

	err = h.usecase.DeleteProduct(id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(404, failureResponse("NOT_FOUND", err.Error()))
			return
		}
		if err.Error() == "product is in use" {
			c.JSON(422, failureResponse("UNPROCESSABLE_ENTITY", err.Error()))
			return
		}
		c.JSON(500, failureResponse("INTERNAL_ERROR", err.Error()))
		return
	}
	c.JSON(200, successResponse(gin.H{"message": "product deleted"}))
}

func (h *ProductHandler) GetDishesWithProduct(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(400, failureResponse("VALIDATION_ERROR", err.Error()))
		return
	}

	dishes, err := h.usecase.GetAllDishesWithProduct(id)
	if err != nil {
		if err.Error() == "product not found" {
			c.JSON(404, failureResponse("NOT_FOUND", err.Error()))
			return
		}
		c.JSON(500, failureResponse("INTERNAL_ERROR", err.Error()))
		return
	}
	c.JSON(200, successResponse(gin.H{"dishes": dishes}))
}
