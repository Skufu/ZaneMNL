package models

import (
	"database/sql"
	"fmt"
	"go_module/internal/database"
	"time"
)

type Product struct {
	ProductID   int64     `json:"product_id"`
	Name        string    `json:"name"`
	Brand       string    `json:"brand,omitempty"`
	Category    string    `json:"category,omitempty"`
	Price       float64   `json:"price"`
	Stock       int       `json:"stock"`
	Status      string    `json:"status,omitempty"`
	CapStyle    string    `json:"cap_style,omitempty"`
	Color       string    `json:"color,omitempty"`
	Description string    `json:"description"`
	Slug        string    `json:"slug,omitempty"`
	Size        string    `json:"size,omitempty"`
	ImageURL    string    `json:"image_url"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at,omitempty"`
}

// Get all products
func GetAllProducts() ([]Product, error) {
	rows, err := database.DB.Query(`
		SELECT ProductID, Name, Description, Price, ImageURL, Stock, CreatedAt 
		FROM products
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []Product
	for rows.Next() {
		var p Product
		var createdAt string
		err := rows.Scan(
			&p.ProductID,
			&p.Name,
			&p.Description,
			&p.Price,
			&p.ImageURL,
			&p.Stock,
			&createdAt,
		)
		if err != nil {
			return nil, err
		}
		p.CreatedAt, _ = time.Parse("2006-01-02 15:04:05", createdAt)
		products = append(products, p)
	}

	return products, nil
}

// Get product by ID
func GetProductByID(id int64) (*Product, error) {
	var p Product
	var createdAt string

	err := database.DB.QueryRow(`
		SELECT ProductID, Name, Description, Price, ImageURL, Stock, CreatedAt 
		FROM products WHERE ProductID = ?
	`, id).Scan(
		&p.ProductID,
		&p.Name,
		&p.Description,
		&p.Price,
		&p.ImageURL,
		&p.Stock,
		&createdAt,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	p.CreatedAt, _ = time.Parse("2006-01-02 15:04:05", createdAt)
	return &p, nil
}

// Create a new product
func CreateProduct(name, description string, price float64, imageURL string, stock int) (*Product, error) {
	result, err := database.DB.Exec(`
		INSERT INTO products (Name, Description, Price, ImageURL, Stock, CreatedAt) 
		VALUES (?, ?, ?, ?, ?, datetime('now'))
	`, name, description, price, imageURL, stock)

	if err != nil {
		return nil, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}

	return GetProductByID(id)
}

// Update product
func UpdateProduct(id int64, name, description string, price float64, imageURL string, stock int) (*Product, error) {
	_, err := database.DB.Exec(`
		UPDATE products 
		SET Name = ?, Description = ?, Price = ?, ImageURL = ?, Stock = ?
		WHERE ProductID = ?
	`, name, description, price, imageURL, stock, id)

	if err != nil {
		return nil, err
	}

	return GetProductByID(id)
}

// Delete product
func DeleteProduct(id int64) error {
	// Start a transaction
	tx, err := database.DB.Begin()
	if err != nil {
		return fmt.Errorf("failed to start transaction: %v", err)
	}

	// Defer a rollback in case anything fails
	defer tx.Rollback()

	// Check if product exists in cart_items
	var cartItemCount int
	err = tx.QueryRow("SELECT COUNT(*) FROM cart_items WHERE ProductID = ?", id).Scan(&cartItemCount)
	if err != nil {
		return fmt.Errorf("failed to check if product exists in carts: %v", err)
	}

	if cartItemCount > 0 {
		// Remove product from all carts
		_, err = tx.Exec("DELETE FROM cart_items WHERE ProductID = ?", id)
		if err != nil {
			return fmt.Errorf("failed to remove product from carts: %v", err)
		}
	}

	// Check if product exists in order_details
	var orderDetailCount int
	err = tx.QueryRow("SELECT COUNT(*) FROM order_details WHERE ProductID = ?", id).Scan(&orderDetailCount)
	if err != nil {
		return fmt.Errorf("failed to check if product exists in orders: %v", err)
	}

	if orderDetailCount > 0 {
		// Get product name to preserve in order details
		var productName string
		err = tx.QueryRow("SELECT Name FROM products WHERE ProductID = ?", id).Scan(&productName)
		if err != nil {
			return fmt.Errorf("failed to get product name: %v", err)
		}

		// Two approaches based on database schema:
		// 1. Try to set ProductID to NULL (if schema allows)
		_, err = tx.Exec("UPDATE order_details SET ProductID = NULL WHERE ProductID = ?", id)
		if err != nil {
			// 2. If NULL is not allowed, we have a few options:
			// Option A: Add "[Deleted]" prefix to the product name to indicate deletion
			// and keep a record of the deleted product
			_, err = tx.Exec(`
				INSERT INTO products (Name, Description, Price, Stock, ImageURL) 
				VALUES (?, '[Deleted Product]', 0, 0, '')`,
				"[Deleted] "+productName)

			if err != nil {
				return fmt.Errorf("failed to create placeholder for deleted product: %v", err)
			}

			// Get the ID of the placeholder product
			var placeholderID int64
			err = tx.QueryRow("SELECT last_insert_rowid()").Scan(&placeholderID)
			if err != nil {
				return fmt.Errorf("failed to get placeholder product ID: %v", err)
			}

			// Update order_details to use the placeholder product
			_, err = tx.Exec("UPDATE order_details SET ProductID = ? WHERE ProductID = ?",
				placeholderID, id)
			if err != nil {
				return fmt.Errorf("failed to update order details with placeholder: %v", err)
			}
		}
	}

	// Now delete the product
	_, err = tx.Exec("DELETE FROM products WHERE ProductID = ?", id)
	if err != nil {
		return fmt.Errorf("failed to delete product: %v", err)
	}

	// Commit the transaction
	if err = tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %v", err)
	}

	return nil
}

// GetProductCount returns the total number of products
func GetProductCount() (int, error) {
	var count int
	err := database.DB.QueryRow("SELECT COUNT(*) FROM products").Scan(&count)

	if err != nil {
		return 0, fmt.Errorf("failed to count products: %v", err)
	}

	return count, nil
}
