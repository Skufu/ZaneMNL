package models

import (
	"database/sql"
	"fmt"
	"go_module/internal/database"
	"log"
)

// UpdateCartItemQuantity sets the quantity of an item in the cart to a specific value
// This is different from AddToCart which adds the specified quantity to the existing quantity
func UpdateCartItemQuantity(userID int64, productID int64, newQuantity int) error {
	log.Printf("UpdateCartItemQuantity: Starting for userID: %d, productID: %d, quantity: %d",
		userID, productID, newQuantity)

	// Get or create cart
	cartID, err := GetOrCreateCart(userID)
	if err != nil {
		log.Printf("UpdateCartItemQuantity: Failed to get or create cart: %v", err)
		return fmt.Errorf("failed to get or create cart: %v", err)
	}

	// Start transaction
	tx, err := database.DB.Begin()
	if err != nil {
		return fmt.Errorf("failed to start transaction: %v", err)
	}
	defer func() {
		if err != nil {
			tx.Rollback()
			log.Printf("Transaction rolled back: %v", err)
		}
	}()

	// Check if product exists and has enough stock
	var stock int
	err = tx.QueryRow("SELECT Stock FROM products WHERE ProductID = ?", productID).Scan(&stock)
	if err == sql.ErrNoRows {
		return fmt.Errorf("product not found")
	}
	if err != nil {
		return fmt.Errorf("failed to check product stock: %v", err)
	}
	if stock < newQuantity {
		return fmt.Errorf("insufficient stock (available: %d, requested: %d)", stock, newQuantity)
	}

	// Check if item already exists in cart
	var existingQuantity int
	var cartItemID int64
	err = tx.QueryRow(`
		SELECT CartItemID, Quantity FROM cart_items 
		WHERE CartID = ? AND ProductID = ?`,
		cartID, productID,
	).Scan(&cartItemID, &existingQuantity)

	if err == sql.ErrNoRows {
		// Item not in cart, insert new item if quantity > 0
		if newQuantity <= 0 {
			// Nothing to do if trying to set quantity to 0 for non-existent item
			return nil
		}

		_, err = tx.Exec(`
			INSERT INTO cart_items (CartID, ProductID, Quantity)
			VALUES (?, ?, ?)`,
			cartID, productID, newQuantity,
		)
		if err != nil {
			return fmt.Errorf("failed to add item to cart: %v", err)
		}
	} else if err != nil {
		return fmt.Errorf("failed to check cart: %v", err)
	} else {
		// Item exists
		if newQuantity <= 0 {
			// Remove item if quantity is 0 or negative
			_, err = tx.Exec("DELETE FROM cart_items WHERE CartItemID = ?", cartItemID)
			if err != nil {
				return fmt.Errorf("failed to remove item from cart: %v", err)
			}
		} else {
			// Update quantity
			_, err = tx.Exec(`
				UPDATE cart_items 
				SET Quantity = ?
				WHERE CartItemID = ?`,
				newQuantity, cartItemID,
			)
			if err != nil {
				return fmt.Errorf("failed to update cart: %v", err)
			}
		}
	}

	// Update cart's UpdatedAt timestamp
	_, err = tx.Exec("UPDATE carts SET UpdatedAt = datetime('now') WHERE CartID = ?", cartID)
	if err != nil {
		log.Printf("UpdateCartItemQuantity: Failed to update cart timestamp: %v", err)
		return fmt.Errorf("failed to update cart timestamp: %v", err)
	}

	// Commit transaction
	err = tx.Commit()
	if err != nil {
		return fmt.Errorf("failed to commit transaction: %v", err)
	}

	return nil
}

// DecreaseCartItemQuantity decreases the quantity of an item in the cart
func DecreaseCartItemQuantity(userID int64, productID int64, decreaseBy int) error {
	log.Printf("DecreaseCartItemQuantity: Starting for userID: %d, productID: %d, decreaseBy: %d",
		userID, productID, decreaseBy)

	if decreaseBy <= 0 {
		return fmt.Errorf("decrease amount must be positive")
	}

	// Get or create cart
	cartID, err := GetOrCreateCart(userID)
	if err != nil {
		log.Printf("DecreaseCartItemQuantity: Failed to get or create cart: %v", err)
		return fmt.Errorf("failed to get or create cart: %v", err)
	}

	// Start transaction
	tx, err := database.DB.Begin()
	if err != nil {
		return fmt.Errorf("failed to start transaction: %v", err)
	}
	defer func() {
		if err != nil {
			tx.Rollback()
			log.Printf("Transaction rolled back: %v", err)
		}
	}()

	// Get current quantity
	var currentQuantity int
	err = tx.QueryRow(`
		SELECT Quantity FROM cart_items 
		WHERE CartID = ? AND ProductID = ?`,
		cartID, productID,
	).Scan(&currentQuantity)

	if err == sql.ErrNoRows {
		return fmt.Errorf("item not in cart")
	}
	if err != nil {
		return fmt.Errorf("failed to get current quantity: %v", err)
	}

	// Calculate new quantity
	newQuantity := currentQuantity - decreaseBy
	if newQuantity <= 0 {
		// Remove item if quantity would be zero or negative
		_, err = tx.Exec(`
			DELETE FROM cart_items 
			WHERE CartID = ? AND ProductID = ?`,
			cartID, productID,
		)
		if err != nil {
			return fmt.Errorf("failed to remove item: %v", err)
		}
	} else {
		// Update quantity
		_, err = tx.Exec(`
			UPDATE cart_items 
			SET Quantity = ?
			WHERE CartID = ? AND ProductID = ?`,
			newQuantity, cartID, productID,
		)
		if err != nil {
			return fmt.Errorf("failed to update quantity: %v", err)
		}
	}

	// Update cart's UpdatedAt timestamp
	_, err = tx.Exec("UPDATE carts SET UpdatedAt = datetime('now') WHERE CartID = ?", cartID)
	if err != nil {
		log.Printf("DecreaseCartItemQuantity: Failed to update cart timestamp: %v", err)
		return fmt.Errorf("failed to update cart timestamp: %v", err)
	}

	// Commit transaction
	err = tx.Commit()
	if err != nil {
		return fmt.Errorf("failed to commit transaction: %v", err)
	}

	return nil
}

// RemoveFromCart removes an item from the cart
func RemoveFromCart(userID int64, productID int64) error {
	log.Printf("RemoveFromCart: Starting for userID: %d, productID: %d", userID, productID)

	// Get or create cart
	cartID, err := GetOrCreateCart(userID)
	if err != nil {
		log.Printf("RemoveFromCart: Failed to get or create cart: %v", err)
		return fmt.Errorf("failed to get or create cart: %v", err)
	}

	// Start transaction
	tx, err := database.DB.Begin()
	if err != nil {
		return fmt.Errorf("failed to start transaction: %v", err)
	}
	defer func() {
		if err != nil {
			tx.Rollback()
			log.Printf("Transaction rolled back: %v", err)
		}
	}()

	// Delete the item
	result, err := tx.Exec(`
		DELETE FROM cart_items 
		WHERE CartID = ? AND ProductID = ?`,
		cartID, productID,
	)
	if err != nil {
		return fmt.Errorf("failed to remove item: %v", err)
	}

	// Check if item was actually deleted
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %v", err)
	}
	if rowsAffected == 0 {
		return fmt.Errorf("item not found in cart")
	}

	// Update cart's UpdatedAt timestamp
	_, err = tx.Exec("UPDATE carts SET UpdatedAt = datetime('now') WHERE CartID = ?", cartID)
	if err != nil {
		log.Printf("RemoveFromCart: Failed to update cart timestamp: %v", err)
		return fmt.Errorf("failed to update cart timestamp: %v", err)
	}

	// Commit transaction
	err = tx.Commit()
	if err != nil {
		return fmt.Errorf("failed to commit transaction: %v", err)
	}

	return nil
}

// ClearCart removes all items from a user's cart
func ClearCart(userID int64) error {
	log.Printf("ClearCart: Starting for userID: %d", userID)

	// Get or create cart
	cartID, err := GetOrCreateCart(userID)
	if err != nil {
		log.Printf("ClearCart: Failed to get or create cart: %v", err)
		return fmt.Errorf("failed to get or create cart: %v", err)
	}

	// Start transaction
	tx, err := database.DB.Begin()
	if err != nil {
		return fmt.Errorf("failed to start transaction: %v", err)
	}
	defer func() {
		if err != nil {
			tx.Rollback()
			log.Printf("Transaction rolled back: %v", err)
		}
	}()

	// Delete all items for this cart
	_, err = tx.Exec("DELETE FROM cart_items WHERE CartID = ?", cartID)
	if err != nil {
		return fmt.Errorf("failed to clear cart: %v", err)
	}

	// Update cart's UpdatedAt timestamp
	_, err = tx.Exec("UPDATE carts SET UpdatedAt = datetime('now') WHERE CartID = ?", cartID)
	if err != nil {
		log.Printf("ClearCart: Failed to update cart timestamp: %v", err)
		return fmt.Errorf("failed to update cart timestamp: %v", err)
	}

	// Commit transaction
	err = tx.Commit()
	if err != nil {
		return fmt.Errorf("failed to commit transaction: %v", err)
	}

	return nil
}
