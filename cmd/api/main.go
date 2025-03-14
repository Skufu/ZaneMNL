package main

import (
	"log"

	"go_module/internal/database"
	"go_module/internal/handlers"
	"go_module/internal/middleware"

	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize SQLite database (stored in ./data/lab.db)
	database.InitDB()

	// Create Gin router with default middleware
	r := gin.Default()

	// Add CORS middleware
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Public routes - no authentication needed
	// POST /register - Create a new user account
	r.POST("/register", handlers.RegisterUser)
	// POST /login - Login and get JWT token
	r.POST("/login", handlers.LoginUser)
	// GET /products - List all products
	r.GET("/products", handlers.GetProducts)
	// GET /products/:id - Get single product details
	r.GET("/products/:id", handlers.GetProduct)

	// Customer routes - requires valid JWT token
	auth := r.Group("/")
	auth.Use(middleware.AuthMiddleware())
	{
		// GET /users/:id - Get user profile
		auth.GET("/users/:id", handlers.GetUser)
		// POST /cart/add - Add item to cart
		auth.POST("/cart/add", handlers.AddToCart)
		// GET /cart - View cart contents
		auth.GET("/cart", handlers.GetCart)
		// POST /checkout - Place order
		auth.POST("/checkout", handlers.Checkout)
		// GET /orders - View user's orders
		auth.GET("/orders", handlers.GetOrders)
	}

	// Admin routes - requires valid JWT token with admin role
	admin := r.Group("/admin")
	admin.Use(middleware.AuthMiddleware(), middleware.AdminMiddleware())
	{
		// POST /admin/products - Create product
		admin.POST("/products", handlers.CreateProduct)
		// PUT /admin/products/:id - Update product
		admin.PUT("/products/:id", handlers.UpdateProduct)
		// DELETE /admin/products/:id - Delete product
		admin.DELETE("/products/:id", handlers.DeleteProduct)
		// GET /admin/orders - View all orders
		admin.GET("/orders", handlers.GetAllOrders)
		// PUT /admin/orders/:id/status - Update order status
		admin.PUT("/orders/:id/status", handlers.UpdateOrderStatus)
	}

	// Start server on port 8080
	log.Println("Lab project server starting on http://localhost:8080")
	r.Run(":8080")
}
