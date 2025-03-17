package handlers

import (
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"go_module/internal/models"

	"github.com/gin-gonic/gin"
)

// Register a new user
func RegisterUser(c *gin.Context) {
	var input struct {
		Username string `json:"username" binding:"required"`
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=6"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		log.Printf("Registration input validation failed: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	log.Printf("Attempting to register user: %s, email: %s", input.Username, input.Email)

	// Create user
	user, err := models.CreateUser(input.Username, input.Email, input.Password, "customer")
	if err != nil {
		log.Printf("Failed to create user: %v", err)
		if strings.Contains(err.Error(), "UNIQUE constraint") {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Email already exists"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, user)
}

// Get user by ID
func GetUser(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	user, err := models.GetUserByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}

// LoginUser handles user authentication and returns a JWT token
func LoginUser(c *gin.Context) {
	var input struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, token, err := models.AuthenticateUser(input.Email, input.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user":  user,
		"token": token,
	})
}

// GetProducts returns a list of all products
func GetProducts(c *gin.Context) {
	products, err := models.GetAllProducts()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch products"})
		return
	}

	c.JSON(http.StatusOK, products)
}

// GetProduct returns a specific product by ID
func GetProduct(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
		return
	}

	product, err := models.GetProductByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	c.JSON(http.StatusOK, product)
}

// AddToCart adds a product to the user's cart
func AddToCart(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		log.Printf("AddToCart: User ID not found in context")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var input struct {
		ProductID int64 `json:"product_id" binding:"required"`
		Quantity  int   `json:"quantity" binding:"required,min=1"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		log.Printf("AddToCart: Invalid input for AddToCart: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	log.Printf("AddToCart: Adding to cart - UserID: %v, ProductID: %v, Quantity: %v", userID, input.ProductID, input.Quantity)

	// Try to add to cart
	err := models.AddToCart(userID.(int64), input.ProductID, input.Quantity)
	if err != nil {
		log.Printf("AddToCart: Failed to add to cart: %v", err)

		// Check for specific error types and return appropriate status codes
		if strings.Contains(err.Error(), "insufficient stock") {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if strings.Contains(err.Error(), "product not found") {
			c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add item to cart. Please try again."})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Item added to cart"})
}

// GetCart retrieves the current user's cart
func GetCart(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		log.Printf("GetCart: User ID not found in context")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	log.Printf("GetCart: Fetching cart for userID: %v", userID)
	cart, err := models.GetCartByUserID(userID.(int64))
	if err != nil {
		log.Printf("GetCart: Failed to fetch cart: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch cart"})
		return
	}

	log.Printf("GetCart: Successfully fetched cart for userID: %v with %d items", userID, len(cart.Items))
	c.JSON(http.StatusOK, cart)
}

// Checkout processes the user's cart into an order
func Checkout(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		log.Printf("User ID not found in context")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var input struct {
		ShippingAddress struct {
			FullName    string `json:"full_name" binding:"required"`
			PhoneNumber string `json:"phone_number" binding:"required"`
			Address     string `json:"address" binding:"required"`
			City        string `json:"city" binding:"required"`
			Province    string `json:"province" binding:"required"`
			PostalCode  string `json:"postal_code" binding:"required"`
		} `json:"shipping_address" binding:"required"`
		PaymentMethod string `json:"payment_method" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		log.Printf("Invalid checkout input: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Format shipping address as a single string
	shippingAddress := fmt.Sprintf("%s\n%s\n%s\n%s, %s %s",
		input.ShippingAddress.FullName,
		input.ShippingAddress.PhoneNumber,
		input.ShippingAddress.Address,
		input.ShippingAddress.City,
		input.ShippingAddress.Province,
		input.ShippingAddress.PostalCode,
	)

	log.Printf("Creating order for userID: %v with shipping address: %v", userID, shippingAddress)
	log.Printf("Payment method: %v", input.PaymentMethod)

	// Set a timeout for the order creation process
	orderChan := make(chan *models.Order, 1)
	errChan := make(chan error, 1)

	// Create the order in a separate goroutine
	go func() {
		order, err := models.CreateOrder(userID.(int64), shippingAddress, input.PaymentMethod)
		if err != nil {
			errChan <- err
			return
		}
		orderChan <- order
	}()

	// Wait for the order to be created or timeout
	select {
	case order := <-orderChan:
		log.Printf("Order created successfully: %+v", order)
		c.JSON(http.StatusCreated, order)
	case err := <-errChan:
		log.Printf("Failed to create order: %v", err)

		// Check for specific error types
		if strings.Contains(err.Error(), "cart is empty") {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Your cart is empty. Please add items before checkout."})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	case <-time.After(25 * time.Second):
		log.Printf("Order creation timed out for userID: %v", userID)
		c.JSON(http.StatusGatewayTimeout, gin.H{"error": "Order creation timed out. Please try again."})
	}
}

// GetOrders retrieves all orders for the current user
func GetOrders(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	orders, err := models.GetOrdersByUserID(userID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch orders"})
		return
	}

	c.JSON(http.StatusOK, orders)
}

// CreateProduct adds a new product (admin only)
func CreateProduct(c *gin.Context) {
	var input struct {
		Name        string  `json:"name" binding:"required,min=3"`
		Description string  `json:"description" binding:"required,min=10"`
		Price       float64 `json:"price" binding:"required,min=0.01"`
		ImageURL    string  `json:"image_url" binding:"omitempty,url"`
		Stock       int     `json:"stock" binding:"required,min=0"`
		Category    string  `json:"category" binding:"omitempty"`
		Brand       string  `json:"brand" binding:"omitempty"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		log.Printf("Invalid product input: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	product, err := models.CreateProduct(input.Name, input.Description, input.Price, input.ImageURL, input.Stock)
	if err != nil {
		log.Printf("Failed to create product: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, product)
}

// UpdateProduct modifies an existing product (admin only)
func UpdateProduct(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
		return
	}

	var input struct {
		Name        string  `json:"name"`
		Description string  `json:"description"`
		Price       float64 `json:"price" binding:"omitempty,min=0.01"`
		ImageURL    string  `json:"image_url"`
		Stock       int     `json:"stock" binding:"omitempty,min=0"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	product, err := models.UpdateProduct(id, input.Name, input.Description, input.Price, input.ImageURL, input.Stock)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update product"})
		return
	}

	c.JSON(http.StatusOK, product)
}

// DeleteProduct removes a product (admin only)
func DeleteProduct(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
		return
	}

	err = models.DeleteProduct(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete product"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Product deleted successfully"})
}

// GetAllOrders retrieves all orders in the system (admin only)
func GetAllOrders(c *gin.Context) {
	orders, err := models.GetAllOrders()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch orders"})
		return
	}

	c.JSON(http.StatusOK, orders)
}

// UpdateOrderStatus changes the status of an order (admin only)
func UpdateOrderStatus(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid order ID"})
		return
	}

	var input struct {
		Status string `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	log.Printf("Updating order %d status to: %s", id, input.Status)

	err = models.UpdateOrderStatus(id, input.Status)
	if err != nil {
		log.Printf("Failed to update order status: %v", err)
		if err.Error() == "order not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Order status updated successfully"})
}
