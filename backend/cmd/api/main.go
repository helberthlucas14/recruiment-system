package main

import (
	"log"

	"github.com/helberthlucas14/internal/domain"

	"github.com/helberthlucas14/internal/infra/database"

	"github.com/helberthlucas14/internal/infra/web"

	"github.com/helberthlucas14/internal/infra/repository"

	"github.com/helberthlucas14/internal/usecase"

	"github.com/helberthlucas14/internal/config"

	"github.com/gin-gonic/gin"
	"github.com/helberthlucas14/docs"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// @title Recruitment System API
// @version 1.0
// @description Backend for Recruitment and Selection System
// @host localhost:8080
// @BasePath /
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
func main() {
	// 0. Config
	cfg := config.LoadConfig()

	docs.SwaggerInfo.Host = "localhost:" + cfg.Port

	// 1. Database
	database.Connect(cfg)
	database.Migrate(&domain.User{})

	// Initialize Repositories (Infra)
	userRepo := &repository.UserRepository{}

	// Initialize UseCases
	authUseCase := usecase.NewAuthUseCase(userRepo, cfg.JWTSecret)

	// Initialize Handlers
	authHandler := web.NewAuthHandler(authUseCase)

	// Setup Router
	r := gin.Default()

	// CORS (Simplified)
	r.Use(func(c *gin.Context) {
		origin := c.GetHeader("Origin")
		if origin == "" {
			origin = "*"
		}
		c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Swagger
	docs.SwaggerInfo.BasePath = "/"
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Public Routes
	r.POST("/register", authHandler.Register)

	port := ":" + cfg.Port
	log.Println("Server executing on port", port)
	r.Run(port)
}
