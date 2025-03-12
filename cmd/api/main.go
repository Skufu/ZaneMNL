package main

import (
	"log"

	"go_module/internal/database"
	"go_module/internal/handlers"
	"go_module/internal/middleware"

	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize database
	database.InitDB()

	// Create router
	r := gin.Default()

	// Public routes
	r.POST("/register", handlers.RegisterUser)
	r.POST("/login", handlers.LoginUser)
	r.GET("/products", handlers.GetProducts)
	r.GET("/products/:id", handlers.GetProduct)

	// Protected routes
	auth := r.Group("/")
	auth.Use(middleware.AuthMiddleware())
	{
		auth.GET("/users/:id", handlers.GetUser)
		auth.POST("/cart/add", handlers.AddToCart)
		auth.GET("/cart", handlers.GetCart)
		auth.POST("/checkout", handlers.Checkout)
		auth.GET("/orders", handlers.GetOrders)
	}

	// Admin routes
	admin := r.Group("/admin")
	admin.Use(middleware.AuthMiddleware(), middleware.AdminMiddleware())
	{
		admin.POST("/products", handlers.CreateProduct)
		admin.PUT("/products/:id", handlers.UpdateProduct)
		admin.DELETE("/products/:id", handlers.DeleteProduct)
		admin.GET("/orders", handlers.GetAllOrders)
		admin.PUT("/orders/:id/status", handlers.UpdateOrderStatus)
	}

	// Start server
	log.Println("Server starting on :8080")
	r.Run(":8080")
}
