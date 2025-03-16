package handlers

import (
	"log"
	"net/http"
	"strconv"

	"go_module/internal/models"

	"github.com/gin-gonic/gin"
)

// UpdateCartItem updates the quantity of an item in the cart
func UpdateCartItem(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		log.Printf("User ID not found in context")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var input struct {
		ProductID int64 `json:"product_id" binding:"required"`
		Quantity  int   `json:"quantity" binding:"required,min=0"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		log.Printf("Invalid input: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	log.Printf("Updating cart - UserID: %v, ProductID: %v, Quantity: %v", userID, input.ProductID, input.Quantity)

	err := models.UpdateCartItemQuantity(userID.(int64), input.ProductID, input.Quantity)
	if err != nil {
		log.Printf("Failed to update cart: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Cart updated successfully"})
}

// DecreaseCartItem decreases the quantity of an item in the cart
func DecreaseCartItem(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		log.Printf("User ID not found in context")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var input struct {
		ProductID  int64 `json:"product_id" binding:"required"`
		DecreaseBy int   `json:"decrease_by" binding:"required,min=1"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		log.Printf("Invalid input: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	log.Printf("Decreasing cart item - UserID: %v, ProductID: %v, DecreaseBy: %v", userID, input.ProductID, input.DecreaseBy)

	err := models.DecreaseCartItemQuantity(userID.(int64), input.ProductID, input.DecreaseBy)
	if err != nil {
		log.Printf("Failed to decrease cart item: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Cart item quantity decreased"})
}

// RemoveCartItem removes an item from the cart
func RemoveCartItem(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		log.Printf("User ID not found in context")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	productID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
		return
	}

	log.Printf("Removing cart item - UserID: %v, ProductID: %v", userID, productID)

	err = models.RemoveFromCart(userID.(int64), productID)
	if err != nil {
		log.Printf("Failed to remove cart item: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Item removed from cart"})
}

// ClearCart removes all items from the user's cart
func ClearCart(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		log.Printf("User ID not found in context")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	log.Printf("Clearing cart - UserID: %v", userID)

	err := models.ClearCart(userID.(int64))
	if err != nil {
		log.Printf("Failed to clear cart: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Cart cleared successfully"})
}
