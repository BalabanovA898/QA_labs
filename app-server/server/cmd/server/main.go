package main

import (
	"os"
	_ "server/docs"
	v1 "server/server/internal/delivery/http/v1"
	"server/server/internal/repository"
	"server/server/internal/usecase"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

type Config struct {
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
}

func LoadConfig() *Config {
	return &Config{
		DBHost:     getEnv("DB_HOST", "postgres"),
		DBPort:     getEnv("DB_PORT", "5432"),
		DBUser:     getEnv("DB_USER", "postgres"),
		DBPassword: getEnv("DB_PASSWORD", "password"),
		DBName:     getEnv("DB_NAME", "mydb"),
	}
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

type ProductHandler interface {
	Register(*gin.RouterGroup)
}

type DishHandler interface {
	Register(*gin.RouterGroup)
}

// @title           Recipe Book API
// @version         1.0
// @description     Это сервер для книги рецептов (лабораторная работа).
// @host            localhost:8080
// @BasePath        /api/v1

func main() {
	db_config := LoadConfig()

	repo, err := repository.NewPostgresRepository(
		db_config.DBHost,
		db_config.DBPort,
		db_config.DBUser,
		db_config.DBPassword,
		db_config.DBName)

	if err != nil {
		panic(err)
	}

	productUsecase := usecase.NewProductUsecase(repo)
	dishUsecase := usecase.NewDishUsecase(repo)

	productHandler := v1.NewProductHandler(productUsecase)
	dishHandler := v1.NewDishHandler(dishUsecase)

	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowAllOrigins: true,
		AllowMethods:    []string{"POST", "GET", "DELETE", "PUT"},
		AllowHeaders:    []string{"Origin", "Content-Type", "Authorization"},
	}))

	api := router.Group("/api/v1")

	productHandler.Register(api)
	dishHandler.Register(api)

	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	router.Run(":8080")
}
