package models

import (
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
	ImageURL    string    `json:"image_url,omitempty"`
	CreatedAt   time.Time `json:"created_at,omitempty"`
	UpdatedAt   time.Time `json:"updated_at,omitempty"`
}

// Get all products
func GetAllProducts() ([]Product, error) {
	rows, err := database.DB.Query(`
		SELECT ProductID, Name, Brand, Category, Price, Stock, Status, 
		       CapStyle, Color, Description, Slug, Size 
		FROM products
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []Product
	for rows.Next() {
		var p Product
		err := rows.Scan(
			&p.ProductID, &p.Name, &p.Brand, &p.Category, &p.Price, &p.Stock,
			&p.Status, &p.CapStyle, &p.Color, &p.Description, &p.Slug, &p.Size,
		)
		if err != nil {
			return nil, err
		}
		products = append(products, p)
	}

	return products, nil
}

// Get product by ID
func GetProductByID(id int64) (*Product, error) {
	product := &Product{}
	err := database.DB.QueryRow(`
		SELECT ProductID, Name, Brand, Category, Price, Stock, Status, 
		       CapStyle, Color, Description, Slug, Size 
		FROM products 
		WHERE ProductID = ?
	`, id).Scan(
		&product.ProductID, &product.Name, &product.Brand, &product.Category,
		&product.Price, &product.Stock, &product.Status, &product.CapStyle,
		&product.Color, &product.Description, &product.Slug, &product.Size,
	)
	if err != nil {
		return nil, err
	}

	return product, nil
}

// Create a new product
func CreateProduct(name, description string, price float64, imageURL string, stock int) (*Product, error) {
	result, err := database.DB.Exec(`
		INSERT INTO products (Name, Description, Price, Stock, ImageURL, Status) 
		VALUES (?, ?, ?, ?, ?, ?)
	`, name, description, price, stock, imageURL, "active")
	if err != nil {
		return nil, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}

	return &Product{
		ProductID:   id,
		Name:        name,
		Description: description,
		Price:       price,
		Stock:       stock,
		ImageURL:    imageURL,
		Status:      "active",
	}, nil
}

// Update an existing product
func UpdateProduct(id int64, name, description string, price float64, imageURL string, stock int) (*Product, error) {
	_, err := database.DB.Exec(`
		UPDATE products 
		SET Name = ?, Description = ?, Price = ?, Stock = ?, ImageURL = ? 
		WHERE ProductID = ?
	`, name, description, price, stock, imageURL, id)
	if err != nil {
		return nil, err
	}

	return GetProductByID(id)
}

// Delete a product
func DeleteProduct(id int64) error {
	_, err := database.DB.Exec("DELETE FROM products WHERE ProductID = ?", id)
	return err
}
