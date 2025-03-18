package database

import (
	"database/sql"
	"log"
	"math/rand"
	"os"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

var DB *sql.DB

func InitDB() {
	log.Println("Initializing database...")

	// Seed the random number generator
	rand.Seed(time.Now().UnixNano())

	// Create database directory
	if err := os.MkdirAll("./data", 0755); err != nil {
		log.Fatal("Failed to create database directory:", err)
	}

	// Check if database file exists and is valid
	checkDatabaseFile()

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
	// Schema
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
		`CREATE TABLE IF NOT EXISTS carts (
			CartID INTEGER PRIMARY KEY AUTOINCREMENT,
			UserID INTEGER NOT NULL UNIQUE,
			CreatedAt TEXT NOT NULL DEFAULT (datetime('now')),
			UpdatedAt TEXT NOT NULL DEFAULT (datetime('now')),
			FOREIGN KEY (UserID) REFERENCES users(UserID)
		)`,
		`CREATE TABLE IF NOT EXISTS cart_items (
			CartItemID INTEGER PRIMARY KEY AUTOINCREMENT,
			CartID INTEGER NOT NULL,
			ProductID INTEGER NOT NULL,
			Quantity INTEGER NOT NULL DEFAULT 1,
			FOREIGN KEY (CartID) REFERENCES carts(CartID),
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
			PaymentVerified BOOLEAN NOT NULL DEFAULT 0,
			PaymentReference TEXT,
			TrackingNumber TEXT,
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

	// Insert test admin user
	// Plain text password for testing
	_, err := DB.Exec(`
		DELETE FROM users WHERE Email = 'admin@example.com'
	`)
	if err != nil {
		log.Printf("Warning: Failed to delete existing admin user: %v", err)
	}

	_, err = DB.Exec(`
		INSERT INTO users (Username, Email, Password, Role)
		VALUES ('admin', 'admin@example.com', 'admin123', 'admin')
	`)
	if err != nil {
		log.Printf("Warning: Failed to insert test admin user: %v", err)
	}

	// Insert test customer users
	// Plain text passwords for testing
	testUsers := []struct {
		username string
		email    string
		password string
	}{
		{username: "user1", email: "user1@example.com", password: "password123"},
		{username: "user2", email: "user2@example.com", password: "password123"},
	}

	for _, u := range testUsers {
		// Delete existing user first
		_, err := DB.Exec(`DELETE FROM users WHERE Email = ?`, u.email)
		if err != nil {
			log.Printf("Warning: Failed to delete existing user %s: %v", u.username, err)
		}

		// Insert user
		_, err = DB.Exec(`
			INSERT INTO users (Username, Email, Password, Role)
			VALUES (?, ?, ?, 'customer')
		`, u.username, u.email, u.password)

		if err != nil {
			log.Printf("Warning: Failed to insert test user %s: %v", u.username, err)
		}
	}

	// Verify products were inserted
	count := 0
	err = DB.QueryRow("SELECT COUNT(*) FROM products").Scan(&count)
	if err != nil {
		log.Printf("Warning: Failed to count products: %v", err)
	}
	log.Printf("Number of products in database: %d", count)

	// Create test orders for each user
	createTestOrders()
}

// Create test orders for users
func createTestOrders() {
	// Get user IDs
	var user1ID, user2ID int64
	err := DB.QueryRow("SELECT UserID FROM users WHERE Email = 'user1@example.com'").Scan(&user1ID)
	if err != nil {
		log.Printf("Warning: Failed to get user1 ID: %v", err)
		return
	}

	err = DB.QueryRow("SELECT UserID FROM users WHERE Email = 'user2@example.com'").Scan(&user2ID)
	if err != nil {
		log.Printf("Warning: Failed to get user2 ID: %v", err)
		return
	}

	// Create test orders for user1
	createTestOrder(user1ID, "123 Main St, City, Province, 12345", "cash_on_delivery", 1499.99, "delivered")
	createTestOrder(user1ID, "123 Main St, City, Province, 12345", "bank_transfer", 2299.98, "processing")

	// Create test orders for user2
	createTestOrder(user2ID, "456 Oak Ave, Town, Province, 67890", "gcash", 999.99, "shipped")
	createTestOrder(user2ID, "456 Oak Ave, Town, Province, 67890", "cash_on_delivery", 1299.99, "pending")
}

// Helper function to create a test order
func createTestOrder(userID int64, address, paymentMethod string, amount float64, status string) {
	// Check if user already has orders
	var orderCount int
	err := DB.QueryRow("SELECT COUNT(*) FROM orders WHERE UserID = ?", userID).Scan(&orderCount)
	if err != nil {
		log.Printf("Warning: Failed to check user orders: %v", err)
		return
	}

	if orderCount > 0 {
		// User already has orders, skip
		return
	}

	// Insert order
	result, err := DB.Exec(`
		INSERT INTO orders (
			UserID, ShippingAddress, PaymentMethod, TotalAmount, 
			Status, CreatedAt, PaymentVerified
		) VALUES (?, ?, ?, ?, ?, datetime('now', '-' || ? || ' days'), ?)
	`, userID, address, paymentMethod, amount, status, rand.Intn(30), paymentMethod != "bank_transfer")

	if err != nil {
		log.Printf("Warning: Failed to create test order: %v", err)
		return
	}

	orderID, err := result.LastInsertId()
	if err != nil {
		log.Printf("Warning: Failed to get order ID: %v", err)
		return
	}

	// Get a random product
	var productID int64
	var productPrice float64
	var productName string
	err = DB.QueryRow("SELECT ProductID, Price, Name FROM products ORDER BY RANDOM() LIMIT 1").Scan(&productID, &productPrice, &productName)
	if err != nil {
		log.Printf("Warning: Failed to get random product: %v", err)
		return
	}

	// Add order details
	quantity := 1
	if amount > productPrice {
		quantity = int(amount / productPrice)
	}

	_, err = DB.Exec(`
		INSERT INTO order_details (OrderID, ProductID, Quantity, Price)
		VALUES (?, ?, ?, ?)
	`, orderID, productID, quantity, productPrice)

	if err != nil {
		log.Printf("Warning: Failed to create test order details: %v", err)
		return
	}

	log.Printf("Created test order #%d for user %d with status %s", orderID, userID, status)
}

// Check if database file exists and is valid
func checkDatabaseFile() {
	dbPath := "./data/lab.db"

	// Check if file exists
	_, err := os.Stat(dbPath)
	if os.IsNotExist(err) {
		log.Println("Database file does not exist, will create a new one")
		return
	}

	// Try to open the database to check if it's valid
	testDB, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		log.Printf("Warning: Failed to open existing database: %v", err)
		log.Println("Removing corrupted database file...")
		os.Remove(dbPath)
		return
	}

	// Try to ping the database
	err = testDB.Ping()
	if err != nil {
		log.Printf("Warning: Failed to ping existing database: %v", err)
		testDB.Close()
		log.Println("Removing corrupted database file...")
		os.Remove(dbPath)
		return
	}

	// Close the test connection
	testDB.Close()
	log.Println("Existing database file is valid")
}
