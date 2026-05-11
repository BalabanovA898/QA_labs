package v1

import "server/server/internal/domain"

type apiError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

type errorResponse struct {
	Success bool      `json:"success"`
	Data    any       `json:"data"`
	Error   *apiError `json:"error"`
}

type productData struct {
	Product *domain.Product `json:"product"`
}

type productResponse struct {
	Success bool       `json:"success"`
	Data    productData `json:"data"`
	Error   *apiError  `json:"error"`
}

type productsData struct {
	Products []domain.Product `json:"products"`
}

type productsResponse struct {
	Success bool        `json:"success"`
	Data    productsData `json:"data"`
	Error   *apiError   `json:"error"`
}

type dishData struct {
	Dish *domain.Dish `json:"dish"`
}

type dishResponse struct {
	Success bool     `json:"success"`
	Data    dishData `json:"data"`
	Error   *apiError `json:"error"`
}

type dishesData struct {
	Dishes []domain.Dish `json:"dishes"`
}

type dishesResponse struct {
	Success bool       `json:"success"`
	Data    dishesData `json:"data"`
	Error   *apiError  `json:"error"`
}

type messageData struct {
	Message string `json:"message"`
}

type messageResponse struct {
	Success bool       `json:"success"`
	Data    messageData `json:"data"`
	Error   *apiError  `json:"error"`
}
