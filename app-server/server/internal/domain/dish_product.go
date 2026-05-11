package domain

import "github.com/google/uuid"

type DishProduct struct {
	ProductId uuid.UUID `gorm:"type:uuid;not null;primaryKey;column:product_id" json:"product_id"`
	DishId    uuid.UUID `gorm:"type:uuid;not null;primaryKey;column:dish_id" json:"dish_id"`
	Amount    float64   `gorm:"not null" json:"amount"`
}
