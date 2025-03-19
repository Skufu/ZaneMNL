package main

import (
	"log"
	"time"

	"go_module/internal/database"
	"go_module/internal/handlers"
	"go_module/internal/middleware"
	"go_module/internal/models"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize SQLite database (stored in ./data/lab.db)
	database.InitDB()

	// Ensure admin user exists
	if err := models.EnsureAdminExists(); err != nil {
		log.Printf("Warning: Failed to ensure admin exists: %v", err)
	}

	// Create Gin router with default middleware
	r := gin.Default()

	// Configure CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Content-Length", "Accept-Encoding", "X-CSRF-Token", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Global OPTIONS handler for CORS preflight requests
	r.OPTIONS("/*path", func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
		c.Status(204)
	})

	// Serve static files from public directory
	r.Static("/assets", "./public/assets")

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

		// Cart routes
		// POST /cart/add - Add item to cart
		auth.POST("/cart/add", handlers.AddToCart)
		// PUT /cart/update - Update cart item quantity
		auth.PUT("/cart/update", handlers.UpdateCartItem)
		// POST /cart/decrease - Decrease cart item quantity
		auth.POST("/cart/decrease", handlers.DecreaseCartItem)
		// DELETE /cart/:id - Remove item from cart
		auth.DELETE("/cart/:id", handlers.RemoveCartItem)
		// DELETE /cart - Clear cart
		auth.DELETE("/cart", handlers.ClearCart)
		// GET /cart - View cart contents
		auth.GET("/cart", handlers.GetCart)

		// Checkout and orders
		// POST /checkout - Place order
		auth.POST("/checkout", handlers.Checkout)
		// GET /orders - View user's orders
		auth.GET("/orders", handlers.GetOrders)
	}

	// Admin routes - requires valid JWT token with admin role
	admin := r.Group("/admin")
	admin.Use(middleware.AuthMiddleware(), middleware.AdminMiddleware())
	{
		// GET /admin/dashboard - Get dashboard metrics
		admin.GET("/dashboard", handlers.GetDashboardMetrics)

		// Products management
		// GET /admin/products - Get all products (admin view)
		admin.GET("/products", handlers.GetAdminProducts)
		// POST /admin/products - Create product
		admin.POST("/products", handlers.CreateProduct)
		// PUT /admin/products/:id - Update product
		admin.PUT("/products/:id", handlers.UpdateProduct)
		// DELETE /admin/products/:id - Delete product
		admin.DELETE("/products/:id", handlers.DeleteProduct)

		// Orders management
		// GET /admin/orders - View all orders
		admin.GET("/orders", handlers.AdminGetOrders)
		// PUT /admin/orders/:id/status - Update order status
		admin.PUT("/orders/:id/status", handlers.AdminUpdateOrderStatus)
		// PUT /admin/orders/:id/verify - Verify order payment
		admin.PUT("/orders/:id/verify", handlers.VerifyPayment)
	}

	// Test endpoint
	r.GET("/test-cors", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "CORS is working!",
		})
	})

	// Start server on port 8080
	log.Println("Lab project server starting on http://localhost:8080")
	r.Run(":8080")
}
