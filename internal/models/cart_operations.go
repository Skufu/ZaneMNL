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
		WHERE UserID = ? AND ProductID = ?`,
		userID, productID,
	).Scan(&cartItemID, &existingQuantity)

	if err == sql.ErrNoRows {
		// Item not in cart, insert new item if quantity > 0
		if newQuantity <= 0 {
			// Nothing to do if trying to set quantity to 0 for non-existent item
			return nil
		}

		_, err = tx.Exec(`
			INSERT INTO cart_items (UserID, ProductID, Quantity)
			VALUES (?, ?, ?)`,
			userID, productID, newQuantity,
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

	// Commit transaction
	err = tx.Commit()
	if err != nil {
		return fmt.Errorf("failed to commit transaction: %v", err)
	}

	return nil
}

// DecreaseCartItemQuantity decreases the quantity of an item in the cart
func DecreaseCartItemQuantity(userID int64, productID int64, decreaseBy int) error {
	if decreaseBy <= 0 {
		return fmt.Errorf("decrease amount must be positive")
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
		WHERE UserID = ? AND ProductID = ?`,
		userID, productID,
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
			WHERE UserID = ? AND ProductID = ?`,
			userID, productID,
		)
		if err != nil {
			return fmt.Errorf("failed to remove item: %v", err)
		}
	} else {
		// Update quantity
		_, err = tx.Exec(`
			UPDATE cart_items 
			SET Quantity = ?
			WHERE UserID = ? AND ProductID = ?`,
			newQuantity, userID, productID,
		)
		if err != nil {
			return fmt.Errorf("failed to update quantity: %v", err)
		}
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
		WHERE UserID = ? AND ProductID = ?`,
		userID, productID,
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

	// Commit transaction
	err = tx.Commit()
	if err != nil {
		return fmt.Errorf("failed to commit transaction: %v", err)
	}

	return nil
}

// ClearCart removes all items from a user's cart
func ClearCart(userID int64) error {
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

	// Delete all items for this user
	_, err = tx.Exec("DELETE FROM cart_items WHERE UserID = ?", userID)
	if err != nil {
		return fmt.Errorf("failed to clear cart: %v", err)
	}

	// Commit transaction
	err = tx.Commit()
	if err != nil {
		return fmt.Errorf("failed to commit transaction: %v", err)
	}

	return nil
}
