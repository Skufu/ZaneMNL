package models

import (
	"database/sql"
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
	_, err := database.DB.Exec("DELETE FROM products WHERE ProductID = ?", id)
	return err
}
