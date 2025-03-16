package handlers

import (
	"log"
	"net/http"
	"strconv"
	"time"

	"go_module/internal/models"

	"github.com/gin-gonic/gin"
)

// GetDashboardMetrics returns metrics for the admin dashboard
func GetDashboardMetrics(c *gin.Context) {
	// Get metrics
	userCount, err := models.GetUserCount()
	if err != nil {
		log.Printf("Error getting user count: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user count"})
		return
	}

	productCount, err := models.GetProductCount()
	if err != nil {
		log.Printf("Error getting product count: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get product count"})
		return
	}

	orderCount, err := models.GetOrderCount()
	if err != nil {
		log.Printf("Error getting order count: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get order count"})
		return
	}

	totalRevenue, err := models.GetTotalRevenue()
	if err != nil {
		log.Printf("Error getting total revenue: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get total revenue"})
		return
	}

	// Get recent orders
	recentOrders, err := models.GetRecentOrders(5)
	if err != nil {
		log.Printf("Error getting recent orders: %v", err)
		// Continue without recent orders
		recentOrders = []models.Order{}
	}

	// Format recent orders for the response
	formattedRecentOrders := []gin.H{}
	for _, order := range recentOrders {
		// Get user info
		user, err := models.GetUserByID(order.UserID)
		customerName := "Unknown"
		if err == nil && user != nil {
			customerName = user.Username
		}

		formattedRecentOrders = append(formattedRecentOrders, gin.H{
			"id":       order.OrderID,
			"customer": customerName,
			"date":     order.OrderDate.Format(time.RFC3339),
			"amount":   order.TotalAmount,
			"status":   order.Status,
		})
	}

	// Create mock top products data (since we don't have this functionality yet)
	topProducts := []gin.H{}
	products, err := models.GetAllProducts()
	if err == nil && len(products) > 0 {
		// Just use the first 5 products as mock data
		count := 5
		if len(products) < 5 {
			count = len(products)
		}

		for i := 0; i < count; i++ {
			product := products[i]
			// Mock sales and revenue data
			sales := 10 + i*5 // Just a mock value
			revenue := float64(sales) * product.Price

			topProducts = append(topProducts, gin.H{
				"id":      product.ProductID,
				"name":    product.Name,
				"sales":   sales,
				"revenue": revenue,
			})
		}
	}

	// Return dashboard metrics in the format expected by the frontend
	c.JSON(http.StatusOK, gin.H{
		"totalOrders":   orderCount,
		"totalRevenue":  totalRevenue,
		"totalProducts": productCount,
		"totalUsers":    userCount,
		"recentOrders":  formattedRecentOrders,
		"topProducts":   topProducts,
	})
}

// GetAdminProducts returns all products for admin
func GetAdminProducts(c *gin.Context) {
	products, err := models.GetAllProducts()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch products"})
		return
	}

	c.JSON(http.StatusOK, products)
}

// AdminGetOrders returns all orders for admin
func AdminGetOrders(c *gin.Context) {
	// Get all orders
	orders, err := models.GetAllOrders()
	if err != nil {
		log.Printf("Error getting all orders: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get orders"})
		return
	}

	// Send response
	c.JSON(http.StatusOK, orders)
}

// AdminUpdateOrderStatus updates the status of an order
func AdminUpdateOrderStatus(c *gin.Context) {
	// Parse order ID from URL
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid order ID"})
		return
	}

	// Parse request body
	var req struct {
		Status string `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request: " + err.Error()})
		return
	}

	// Update order status
	err = models.UpdateOrderStatus(id, req.Status)
	if err != nil {
		log.Printf("Error updating order status: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Send response
	c.JSON(http.StatusOK, gin.H{"message": "Order status updated successfully"})
}

// VerifyPayment verifies payment for an order
func VerifyPayment(c *gin.Context) {
	// Parse order ID from URL
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid order ID"})
		return
	}

	// Parse request body
	var req struct {
		Reference string `json:"reference" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request: " + err.Error()})
		return
	}

	// Verify payment
	err = models.VerifyOrderPayment(id, req.Reference)
	if err != nil {
		log.Printf("Error verifying payment: %v", err)
		if err.Error() == "order not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Send response
	c.JSON(http.StatusOK, gin.H{"message": "Payment verified successfully"})
}
