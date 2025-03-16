package database

import (
	"database/sql"
	"log"
	"os"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

var DB *sql.DB

func InitDB() {
	log.Println("Initializing database...")

	// Create database directory
	if err := os.MkdirAll("./data", 0755); err != nil {
		log.Fatal("Failed to create database directory:", err)
	}

	// Open database with improved concurrency settings
	// WAL mode provides better concurrency
	// busy_timeout sets how long to wait when the database is locked
	var err error
	DB, err = sql.Open("sqlite3", "./data/lab.db?_journal=WAL&_busy_timeout=30000&_foreign_keys=on&_timeout=30000&cache=shared")
	if err != nil {
		log.Fatal("Failed to open database:", err)
	}

	// Configure connection pool
	// SQLite works best with limited connections but we need enough for concurrent operations
	DB.SetMaxOpenConns(10) // Increase from 1 to allow more concurrent operations
	DB.SetMaxIdleConns(5)  // Keep more idle connections ready
	DB.SetConnMaxLifetime(time.Hour)

	// Test connection
	if err = DB.Ping(); err != nil {
		log.Fatal("Failed to ping database:", err)
	}

	// Enable extended error logging for development
	_, err = DB.Exec("PRAGMA foreign_keys = ON")
	if err != nil {
		log.Printf("Warning: Failed to enable foreign keys: %v", err)
	}

	// Set busy timeout at the connection level as well
	_, err = DB.Exec("PRAGMA busy_timeout = 30000")
	if err != nil {
		log.Printf("Warning: Failed to set busy timeout: %v", err)
	}

	// Set journal mode to WAL for better concurrency
	_, err = DB.Exec("PRAGMA journal_mode = WAL")
	if err != nil {
		log.Printf("Warning: Failed to set journal mode: %v", err)
	}

	// Create tables
	createTables()

	// Insert test data
	insertTestData()

	log.Println("Database initialized successfully")
}

func createTables() {
	// Simple schema for a lab project
	tables := []string{
		`CREATE TABLE IF NOT EXISTS users (
			UserID INTEGER PRIMARY KEY AUTOINCREMENT,
			Username TEXT NOT NULL,
			Email TEXT UNIQUE NOT NULL,
			Password TEXT NOT NULL,
			Role TEXT NOT NULL DEFAULT 'customer',
			CreatedAt TEXT NOT NULL DEFAULT (datetime('now')),
			LastLogin TEXT
		)`,
		`CREATE TABLE IF NOT EXISTS products (
			ProductID INTEGER PRIMARY KEY AUTOINCREMENT,
			Name TEXT NOT NULL UNIQUE,
			Description TEXT,
			Price REAL NOT NULL,
			ImageURL TEXT,
			Stock INTEGER NOT NULL DEFAULT 0,
			CreatedAt TEXT NOT NULL DEFAULT (datetime('now'))
		)`,
		`CREATE TABLE IF NOT EXISTS cart_items (
			CartItemID INTEGER PRIMARY KEY AUTOINCREMENT,
			UserID INTEGER NOT NULL,
			ProductID INTEGER NOT NULL,
			Quantity INTEGER NOT NULL DEFAULT 1,
			FOREIGN KEY (UserID) REFERENCES users(UserID),
			FOREIGN KEY (ProductID) REFERENCES products(ProductID)
		)`,
		`CREATE TABLE IF NOT EXISTS orders (
			OrderID INTEGER PRIMARY KEY AUTOINCREMENT,
			UserID INTEGER NOT NULL,
			Status TEXT NOT NULL DEFAULT 'pending',
			ShippingAddress TEXT NOT NULL,
			PaymentMethod TEXT NOT NULL,
			TotalAmount REAL NOT NULL,
			CreatedAt TEXT NOT NULL DEFAULT (datetime('now')),
			FOREIGN KEY (UserID) REFERENCES users(UserID)
		)`,
		`CREATE TABLE IF NOT EXISTS order_details (
			OrderDetailID INTEGER PRIMARY KEY AUTOINCREMENT,
			OrderID INTEGER NOT NULL,
			ProductID INTEGER NOT NULL,
			Quantity INTEGER NOT NULL,
			Price REAL NOT NULL,
			FOREIGN KEY (OrderID) REFERENCES orders(OrderID),
			FOREIGN KEY (ProductID) REFERENCES products(ProductID)
		)`,
		`CREATE TABLE IF NOT EXISTS order_history (
			HistoryID INTEGER PRIMARY KEY AUTOINCREMENT,
			OrderID INTEGER NOT NULL,
			OldStatus TEXT NOT NULL,
			NewStatus TEXT NOT NULL,
			ChangedAt TEXT NOT NULL DEFAULT (datetime('now')),
			FOREIGN KEY (OrderID) REFERENCES orders(OrderID)
		)`,
	}

	for _, table := range tables {
		if _, err := DB.Exec(table); err != nil {
			log.Fatal("Failed to create table:", err)
		}
	}
}

func insertTestData() {
	// Insert some test products
	testProducts := []struct {
		name        string
		description string
		price       float64
		imageURL    string
		stock       int
	}{
		{
			name:        "New Era Yankees Cap",
			description: "Official New York Yankees Baseball Cap",
			price:       1499.99,
			imageURL:    "https://example.com/yankees-cap.jpg",
			stock:       50,
		},
		{
			name:        "LA Dodgers Fitted Cap",
			description: "Official LA Dodgers Baseball Cap - Navy Blue",
			price:       1299.99,
			imageURL:    "https://example.com/dodgers-cap.jpg",
			stock:       50,
		},
		{
			name:        "Chicago Bulls Snapback",
			description: "Classic Chicago Bulls NBA Cap - Red/Black",
			price:       999.99,
			imageURL:    "https://example.com/bulls-cap.jpg",
			stock:       50,
		},
	}

	for _, p := range testProducts {
		// Try to insert, ignore errors (they'll be duplicates)
		_, err := DB.Exec(`
			INSERT INTO products (Name, Description, Price, ImageURL, Stock)
			SELECT ?, ?, ?, ?, ?
			WHERE NOT EXISTS (SELECT 1 FROM products WHERE Name = ?)
		`, p.name, p.description, p.price, p.imageURL, p.stock, p.name)

		if err != nil {
			log.Printf("Warning: Failed to insert test product %s: %v", p.name, err)
		}
	}

	// Verify products were inserted
	count := 0
	err := DB.QueryRow("SELECT COUNT(*) FROM products").Scan(&count)
	if err != nil {
		log.Printf("Warning: Failed to count products: %v", err)
	}
	log.Printf("Number of products in database: %d", count)
}
