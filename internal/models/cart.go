package models

import (
	"go_module/internal/database"
)

type CartItem struct {
	ProductID   int64   `json:"product_id"`
	Name        string  `json:"name"`
	Price       float64 `json:"price"`
	Quantity    int     `json:"quantity"`
	ImageURL    string  `json:"image_url,omitempty"`
	Description string  `json:"description,omitempty"`
}

type Cart struct {
	CartID   int64      `json:"cart_id"`
	UserID   int64      `json:"user_id"`
	Items    []CartItem `json:"items"`
	Subtotal float64    `json:"subtotal"`
}

// Add item to cart
func AddToCart(userID, productID int64, quantity int) error {
	// First, check if user has a cart
	var cartID int64
	err := database.DB.QueryRow("SELECT CartID FROM cart WHERE UserID = ?", userID).Scan(&cartID)

	if err != nil {
		// Create a new cart if one doesn't exist
		result, err := database.DB.Exec("INSERT INTO cart (UserID) VALUES (?)", userID)
		if err != nil {
			return err
		}

		cartID, err = result.LastInsertId()
		if err != nil {
			return err
		}
	}

	// Check if product already exists in cart
	var existingID int64
	var existingQuantity int
	err = database.DB.QueryRow(
		"SELECT CartContentID, Quantity FROM cart_contents WHERE CartID = ? AND ProductID = ?",
		cartID, productID,
	).Scan(&existingID, &existingQuantity)

	if err == nil {
		// Update existing cart item
		_, err = database.DB.Exec(
			"UPDATE cart_contents SET Quantity = ? WHERE CartContentID = ?",
			existingQuantity+quantity, existingID,
		)
		return err
	} else {
		// Add new cart item
		_, err = database.DB.Exec(
			"INSERT INTO cart_contents (CartID, ProductID, Quantity) VALUES (?, ?, ?)",
			cartID, productID, quantity,
		)
		return err
	}
}

// Get cart by user ID
func GetCartByUserID(userID int64) (*Cart, error) {
	// Get cart ID
	var cartID int64
	err := database.DB.QueryRow("SELECT CartID FROM cart WHERE UserID = ?", userID).Scan(&cartID)
	if err != nil {
		// Create a new cart if one doesn't exist
		result, err := database.DB.Exec("INSERT INTO cart (UserID) VALUES (?)", userID)
		if err != nil {
			return nil, err
		}

		cartID, err = result.LastInsertId()
		if err != nil {
			return nil, err
		}
	}

	// Create cart object
	cart := &Cart{
		CartID: cartID,
		UserID: userID,
		Items:  []CartItem{},
	}

	// Get cart items
	rows, err := database.DB.Query(`
		SELECT p.ProductID, p.Name, p.Price, cc.Quantity, p.Description
		FROM cart_contents cc
		JOIN products p ON cc.ProductID = p.ProductID
		WHERE cc.CartID = ?
	`, cartID)
	if err != nil {
		return cart, nil // Return empty cart on error
	}
	defer rows.Close()

	// Calculate subtotal
	var subtotal float64 = 0

	for rows.Next() {
		var item CartItem
		err := rows.Scan(&item.ProductID, &item.Name, &item.Price, &item.Quantity, &item.Description)
		if err != nil {
			continue
		}

		cart.Items = append(cart.Items, item)
		subtotal += item.Price * float64(item.Quantity)
	}

	cart.Subtotal = subtotal

	return cart, nil
}
