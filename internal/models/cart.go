package models

import (
	"database/sql"
	"fmt"
	"go_module/internal/database"
	"log"
	"time"
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
	CartID    int64      `json:"cart_id"`
	UserID    int64      `json:"user_id"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	Items     []CartItem `json:"items"`
	Subtotal  float64    `json:"subtotal"`
}

// GetOrCreateCart gets the user's cart or creates one if it doesn't exist
func GetOrCreateCart(userID int64) (int64, error) {
	log.Printf("GetOrCreateCart: Starting for userID: %d", userID)

	// Check if cart exists
	var cartID int64
	err := database.DB.QueryRow("SELECT CartID FROM carts WHERE UserID = ?", userID).Scan(&cartID)

	if err == nil {
		// Cart exists
		log.Printf("GetOrCreateCart: Found existing cart (ID: %d) for userID: %d", cartID, userID)
		return cartID, nil
	}

	if err != sql.ErrNoRows {
		// Unexpected error
		log.Printf("GetOrCreateCart: Error checking for existing cart: %v", err)
		return 0, fmt.Errorf("failed to check for existing cart: %v", err)
	}

	// Cart doesn't exist, create one
	log.Printf("GetOrCreateCart: No cart found for userID: %d, creating new cart", userID)
	result, err := database.DB.Exec(
		"INSERT INTO carts (UserID, CreatedAt, UpdatedAt) VALUES (?, datetime('now'), datetime('now'))",
		userID,
	)
	if err != nil {
		log.Printf("GetOrCreateCart: Failed to create cart: %v", err)
		return 0, fmt.Errorf("failed to create cart: %v", err)
	}

	cartID, err = result.LastInsertId()
	if err != nil {
		log.Printf("GetOrCreateCart: Failed to get cart ID: %v", err)
		return 0, fmt.Errorf("failed to get cart ID: %v", err)
	}

	log.Printf("GetOrCreateCart: Created new cart (ID: %d) for userID: %d", cartID, userID)
	return cartID, nil
}

// Add to cart with improved error handling
func AddToCart(userID int64, productID int64, quantity int) error {
	// Validate inputs
	if quantity <= 0 {
		return fmt.Errorf("quantity must be positive")
	}

	log.Printf("AddToCart: Starting transaction - UserID: %d, ProductID: %d, Quantity: %d",
		userID, productID, quantity)

	// Get or create cart
	cartID, err := GetOrCreateCart(userID)
	if err != nil {
		log.Printf("AddToCart: Failed to get or create cart: %v", err)
		return fmt.Errorf("failed to get or create cart: %v", err)
	}

	// Start transaction
	tx, err := database.DB.Begin()
	if err != nil {
		log.Printf("AddToCart: Failed to start transaction: %v", err)
		return fmt.Errorf("database error: %v", err)
	}

	// Use defer with a named error to ensure proper cleanup
	var txErr error
	defer func() {
		if txErr != nil || err != nil {
			log.Printf("AddToCart: Rolling back transaction due to error: %v", err)
			tx.Rollback()
		}
	}()

	// First check if product exists and has enough stock
	var stock int
	err = tx.QueryRow("SELECT Stock FROM products WHERE ProductID = ?", productID).Scan(&stock)
	if err == sql.ErrNoRows {
		log.Printf("AddToCart: Product not found: %d", productID)
		return fmt.Errorf("product not found")
	}
	if err != nil {
		log.Printf("AddToCart: Error checking product stock: %v", err)
		return fmt.Errorf("failed to check product stock: %v", err)
	}

	log.Printf("AddToCart: Product %d has stock: %d", productID, stock)

	// Check if item already exists in cart
	var existingQuantity int
	var cartItemID int64
	err = tx.QueryRow(`
		SELECT CartItemID, Quantity FROM cart_items 
		WHERE CartID = ? AND ProductID = ?`,
		cartID, productID,
	).Scan(&cartItemID, &existingQuantity)

	if err == sql.ErrNoRows {
		// Item not in cart, insert new item
		log.Printf("AddToCart: Item not in cart for cartID: %d, adding new item", cartID)

		// Check if there's enough stock
		if stock < quantity {
			log.Printf("AddToCart: Insufficient stock for new item: available=%d, requested=%d",
				stock, quantity)
			return fmt.Errorf("insufficient stock (available: %d, requested: %d)",
				stock, quantity)
		}

		_, err = tx.Exec(`
			INSERT INTO cart_items (CartID, ProductID, Quantity)
			VALUES (?, ?, ?)`,
			cartID, productID, quantity,
		)
		if err != nil {
			log.Printf("AddToCart: Failed to insert cart item: %v", err)
			return fmt.Errorf("failed to add item to cart: %v", err)
		}

		log.Printf("AddToCart: Successfully added new item to cart for cartID: %d", cartID)
	} else if err != nil {
		log.Printf("AddToCart: Error checking existing cart item: %v", err)
		return fmt.Errorf("failed to check cart: %v", err)
	} else {
		// Item exists in cart
		log.Printf("AddToCart: Item exists in cart for cartID: %d with quantity: %d", cartID, existingQuantity)

		// Check if total quantity would exceed stock
		if existingQuantity+quantity > stock {
			log.Printf("AddToCart: Insufficient stock for update: available=%d, in cart=%d, requested=%d",
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
			log.Printf("AddToCart: Failed to update cart item: %v", err)
			return fmt.Errorf("failed to update cart: %v", err)
		}

		log.Printf("AddToCart: Successfully updated cart item quantity to: %d for cartID: %d", existingQuantity+quantity, cartID)
	}

	// Update cart's UpdatedAt timestamp
	_, err = tx.Exec("UPDATE carts SET UpdatedAt = datetime('now') WHERE CartID = ?", cartID)
	if err != nil {
		log.Printf("AddToCart: Failed to update cart timestamp: %v", err)
		return fmt.Errorf("failed to update cart timestamp: %v", err)
	}

	// Commit transaction
	log.Printf("AddToCart: Committing transaction for cartID: %d", cartID)
	err = tx.Commit()
	if err != nil {
		log.Printf("AddToCart: Failed to commit transaction: %v", err)
		txErr = fmt.Errorf("failed to commit transaction: %v", err)
		return txErr
	}

	log.Printf("AddToCart: Transaction completed successfully for cartID: %d", cartID)
	return nil
}

// Get cart contents
func GetCartByUserID(userID int64) (*Cart, error) {
	log.Printf("GetCartByUserID: Starting for userID: %d", userID)

	// Get or create cart
	cartID, err := GetOrCreateCart(userID)
	if err != nil {
		log.Printf("GetCartByUserID: Failed to get or create cart: %v", err)
		return nil, fmt.Errorf("failed to get or create cart: %v", err)
	}

	// Start transaction for consistent read
	tx, err := database.DB.Begin()
	if err != nil {
		log.Printf("GetCartByUserID: Failed to start transaction: %v", err)
		return nil, fmt.Errorf("failed to start transaction: %v", err)
	}
	defer tx.Rollback()

	// Get cart details
	var cart Cart
	var createdAt, updatedAt string
	err = tx.QueryRow(`
		SELECT CartID, UserID, CreatedAt, UpdatedAt
		FROM carts
		WHERE CartID = ?`,
		cartID,
	).Scan(&cart.CartID, &cart.UserID, &createdAt, &updatedAt)
	if err != nil {
		log.Printf("GetCartByUserID: Failed to get cart details: %v", err)
		return nil, fmt.Errorf("failed to get cart details: %v", err)
	}

	// Parse timestamps
	cart.CreatedAt, _ = time.Parse("2006-01-02 15:04:05", createdAt)
	cart.UpdatedAt, _ = time.Parse("2006-01-02 15:04:05", updatedAt)

	log.Printf("GetCartByUserID: Querying cart items for cartID: %d", cartID)
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
		WHERE ci.CartID = ?`,
		cartID,
	)
	if err != nil {
		log.Printf("GetCartByUserID: Failed to fetch cart items: %v", err)
		return nil, fmt.Errorf("failed to fetch cart items: %v", err)
	}
	defer rows.Close()

	cart.Items = make([]CartItem, 0)
	cart.Subtotal = 0

	itemCount := 0
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
			log.Printf("GetCartByUserID: Failed to scan cart item: %v", err)
			return nil, fmt.Errorf("failed to scan cart item: %v", err)
		}
		cart.Items = append(cart.Items, item)
		cart.Subtotal += item.Price * float64(item.Quantity)
		itemCount++
	}

	// Commit the transaction
	if err = tx.Commit(); err != nil {
		log.Printf("GetCartByUserID: Failed to commit transaction: %v", err)
		return nil, fmt.Errorf("failed to commit transaction: %v", err)
	}

	log.Printf("GetCartByUserID: Successfully fetched cart for userID: %d with %d items", userID, itemCount)
	return &cart, nil
}

// Note: ClearCart function has been moved to cart_operations.go
// to avoid duplicate function definitions
