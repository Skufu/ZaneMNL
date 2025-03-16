package models

import (
	"database/sql"
	"fmt"
	"go_module/internal/database"
	"log"
)

type CartItem struct {
	CartItemID int64   `json:"cart_item_id"`
	ProductID  int64   `json:"product_id"`
	Name       string  `json:"name"`
	Price      float64 `json:"price"`
	Quantity   int     `json:"quantity"`
	ImageURL   string  `json:"image_url"`
}

type Cart struct {
	Items    []CartItem `json:"items"`
	Subtotal float64    `json:"subtotal"`
}

// Add to cart with improved error handling
func AddToCart(userID int64, productID int64, quantity int) error {
	// Validate inputs
	if quantity <= 0 {
		return fmt.Errorf("quantity must be positive")
	}

	log.Printf("Starting AddToCart transaction - UserID: %d, ProductID: %d, Quantity: %d",
		userID, productID, quantity)

	// Start transaction
	tx, err := database.DB.Begin()
	if err != nil {
		log.Printf("Failed to start transaction: %v", err)
		return fmt.Errorf("database error: %v", err)
	}

	// Use defer with a named error to ensure proper cleanup
	var txErr error
	defer func() {
		if txErr != nil || err != nil {
			log.Printf("Rolling back transaction due to error: %v", err)
			tx.Rollback()
		}
	}()

	// First check if product exists and has enough stock
	var stock int
	err = tx.QueryRow("SELECT Stock FROM products WHERE ProductID = ?", productID).Scan(&stock)
	if err == sql.ErrNoRows {
		log.Printf("Product not found: %d", productID)
		return fmt.Errorf("product not found")
	}
	if err != nil {
		log.Printf("Error checking product stock: %v", err)
		return fmt.Errorf("failed to check product stock: %v", err)
	}

	log.Printf("Product %d has stock: %d", productID, stock)

	// Check if item already exists in cart
	var existingQuantity int
	var cartItemID int64
	err = tx.QueryRow(`
		SELECT CartItemID, Quantity FROM cart_items 
		WHERE UserID = ? AND ProductID = ?`,
		userID, productID,
	).Scan(&cartItemID, &existingQuantity)

	if err == sql.ErrNoRows {
		// Item not in cart, insert new item
		log.Printf("Item not in cart, adding new item")

		// Check if there's enough stock
		if stock < quantity {
			log.Printf("Insufficient stock for new item: available=%d, requested=%d",
				stock, quantity)
			return fmt.Errorf("insufficient stock (available: %d, requested: %d)",
				stock, quantity)
		}

		_, err = tx.Exec(`
			INSERT INTO cart_items (UserID, ProductID, Quantity)
			VALUES (?, ?, ?)`,
			userID, productID, quantity,
		)
		if err != nil {
			log.Printf("Failed to insert cart item: %v", err)
			return fmt.Errorf("failed to add item to cart: %v", err)
		}

		log.Printf("Successfully added new item to cart")
	} else if err != nil {
		log.Printf("Error checking existing cart item: %v", err)
		return fmt.Errorf("failed to check cart: %v", err)
	} else {
		// Item exists in cart
		log.Printf("Item exists in cart with quantity: %d", existingQuantity)

		// Check if total quantity would exceed stock
		if existingQuantity+quantity > stock {
			log.Printf("Insufficient stock for update: available=%d, in cart=%d, requested=%d",
				stock, existingQuantity, quantity)
			return fmt.Errorf("insufficient stock (available: %d, in cart: %d, requested: %d)",
				stock, existingQuantity, quantity)
		}

		// Item exists, update quantity
		_, err = tx.Exec(`
			UPDATE cart_items 
			SET Quantity = Quantity + ?
			WHERE CartItemID = ?`,
			quantity, cartItemID,
		)
		if err != nil {
			log.Printf("Failed to update cart item: %v", err)
			return fmt.Errorf("failed to update cart: %v", err)
		}

		log.Printf("Successfully updated cart item quantity to: %d", existingQuantity+quantity)
	}

	// Commit transaction
	log.Printf("Committing transaction")
	err = tx.Commit()
	if err != nil {
		log.Printf("Failed to commit transaction: %v", err)
		txErr = fmt.Errorf("failed to commit transaction: %v", err)
		return txErr
	}

	log.Printf("AddToCart completed successfully")
	return nil
}

// Get cart contents
func GetCartByUserID(userID int64) (*Cart, error) {
	// Start transaction for consistent read
	tx, err := database.DB.Begin()
	if err != nil {
		return nil, fmt.Errorf("failed to start transaction: %v", err)
	}
	defer tx.Rollback()

	rows, err := tx.Query(`
		SELECT 
			ci.CartItemID,
			ci.ProductID,
			p.Name,
			p.Price,
			ci.Quantity,
			p.ImageURL
		FROM cart_items ci
		JOIN products p ON ci.ProductID = p.ProductID
		WHERE ci.UserID = ?`,
		userID,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch cart: %v", err)
	}
	defer rows.Close()

	cart := &Cart{
		Items: make([]CartItem, 0),
	}

	for rows.Next() {
		var item CartItem
		err := rows.Scan(
			&item.CartItemID,
			&item.ProductID,
			&item.Name,
			&item.Price,
			&item.Quantity,
			&item.ImageURL,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan cart item: %v", err)
		}
		cart.Items = append(cart.Items, item)
		cart.Subtotal += item.Price * float64(item.Quantity)
	}

	// Commit the transaction
	if err = tx.Commit(); err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %v", err)
	}

	return cart, nil
}

// Note: ClearCart function has been moved to cart_operations.go
// to avoid duplicate function definitions
