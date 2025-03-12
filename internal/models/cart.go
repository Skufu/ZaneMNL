package models

import (
	"database/sql"
	"fmt"
	"go_module/internal/database"
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

// Add item to cart
func AddToCart(userID int64, productID int64, quantity int) error {
	// Start transaction
	tx, err := database.DB.Begin()
	if err != nil {
		return fmt.Errorf("failed to start transaction: %v", err)
	}
	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	// First check if product exists and has enough stock
	var stock int
	err = tx.QueryRow("SELECT Stock FROM products WHERE ProductID = ?", productID).Scan(&stock)
	if err == sql.ErrNoRows {
		return fmt.Errorf("product not found")
	}
	if err != nil {
		return fmt.Errorf("failed to check product stock: %v", err)
	}
	if stock < quantity {
		return fmt.Errorf("insufficient stock (available: %d, requested: %d)", stock, quantity)
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
		// Item not in cart, insert new item
		_, err = tx.Exec(`
			INSERT INTO cart_items (UserID, ProductID, Quantity)
			VALUES (?, ?, ?)`,
			userID, productID, quantity,
		)
		if err != nil {
			return fmt.Errorf("failed to add item to cart: %v", err)
		}
	} else if err != nil {
		return fmt.Errorf("failed to check cart: %v", err)
	} else {
		// Check if total quantity would exceed stock
		if existingQuantity+quantity > stock {
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
			return fmt.Errorf("failed to update cart: %v", err)
		}
	}

	// Commit transaction
	err = tx.Commit()
	if err != nil {
		return fmt.Errorf("failed to commit transaction: %v", err)
	}

	return nil
}

// Get cart contents
func GetCartByUserID(userID int64) (*Cart, error) {
	rows, err := database.DB.Query(`
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

	return cart, nil
}

// Clear cart
func ClearCart(userID int64) error {
	_, err := database.DB.Exec("DELETE FROM cart_items WHERE UserID = ?", userID)
	return err
}
