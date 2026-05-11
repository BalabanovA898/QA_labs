package domain

import (
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
)

type Dish struct {
	ID           uuid.UUID      `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Name         string         `gorm:"type:varchar(255);not null" json:"name"`
	Photos       pq.StringArray `gorm:"type:text[]" json:"photos" swaggertype:"array,string"`
	Calories     float64        `gorm:"not null" json:"calories"`
	Proteins     float64        `gorm:"not null" json:"proteins"`
	Fats         float64        `gorm:"not null" json:"fats"`
	Carbs        float64        `gorm:"not null" json:"carbs"`
	ServingSize  float64        `gorm:"not null" json:"serving_size"`
	Category     DishCategory   `gorm:"not null" json:"category"`
	IsVegan      bool           `gorm:"not null;default:false" json:"is_vegan"`
	IsSugarFree  bool           `gorm:"not null;default:false" json:"is_sugar_free"`
	IsGlutenFree bool           `gorm:"not null;default:false" json:"is_gluten_free"`
	CreatedAt    time.Time      `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt    time.Time      `gorm:"autoUpdateTime" json:"updated_at"`
}
