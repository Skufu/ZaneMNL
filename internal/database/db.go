package database

import (
	"database/sql"
	"log"
	"os"

	_ "github.com/mattn/go-sqlite3"
)

var DB *sql.DB

func InitDB() {
	log.Println("Initializing database...")

	// Create database directory
	if err := os.MkdirAll("./data", 0755); err != nil {
		log.Fatal("Failed to create database directory:", err)
	}

	// Open database - store it in a simple data directory
	var err error
	DB, err = sql.Open("sqlite3", "./data/lab.db")
	if err != nil {
		log.Fatal("Failed to open database:", err)
	}

	// Test connection
	if err = DB.Ping(); err != nil {
		log.Fatal("Failed to ping database:", err)
	}

	// Create tables
	// You can use either createTables() or createTablesFromSchema()
	createTables()
	// Alternatively: createTablesFromSchema()

	// Insert test data
	insertTestData()

	log.Println("Database initialized successfully")
}

// createTablesFromSchema initializes the database using the schema.sql file
func createTablesFromSchema() {
	log.Println("Creating tables from schema.sql...")

	// Read schema file
	schemaBytes, err := os.ReadFile("internal/database/schema.sql")
	if err != nil {
		log.Fatal("Failed to read schema file:", err)
	}

	// Execute schema
	_, err = DB.Exec(string(schemaBytes))
	if err != nil {
		log.Fatal("Failed to execute schema:", err)
	}

	log.Println("Tables created successfully from schema.sql")
}

func createTables() {
	// Schema based on schema.sql
	tables := []string{
		`CREATE TABLE IF NOT EXISTS users (
			UserID INTEGER PRIMARY KEY AUTOINCREMENT,
			Username TEXT NOT NULL,
			Email TEXT NOT NULL UNIQUE,
			Password TEXT NOT NULL,
			Role TEXT DEFAULT 'customer',
			CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
			LastLogin DATETIME
		)`,
		`CREATE TABLE IF NOT EXISTS products (
			ProductID INTEGER PRIMARY KEY AUTOINCREMENT,
			Name TEXT NOT NULL,
			Brand TEXT NOT NULL,
			Size TEXT NOT NULL,
			Description TEXT,
			Price REAL NOT NULL,
			Stock INTEGER DEFAULT 0
		)`,
		`CREATE TABLE IF NOT EXISTS payment_methods (
			PaymentMethodID INTEGER PRIMARY KEY AUTOINCREMENT,
			Name TEXT,
			AccountNumber TEXT,
			AccountName TEXT
		)`,
		`CREATE TABLE IF NOT EXISTS shipping_addresses (
			AddressID INTEGER PRIMARY KEY AUTOINCREMENT,
			UserID INTEGER NOT NULL,
			FullName TEXT,
			PhoneNumber TEXT,
			Address TEXT,
			City TEXT,
			Province TEXT,
			PostalCode TEXT,
			FOREIGN KEY (UserID) REFERENCES users(UserID)
		)`,
		`CREATE TABLE IF NOT EXISTS orders (
			OrderID INTEGER PRIMARY KEY AUTOINCREMENT,
			UserID INTEGER NOT NULL,
			TotalAmount REAL NOT NULL,
			Status TEXT DEFAULT 'pending',
			OrderDate DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (UserID) REFERENCES users(UserID)
		)`,
		`CREATE TABLE IF NOT EXISTS order_details (
			OrderDetailID INTEGER PRIMARY KEY AUTOINCREMENT,
			OrderID INTEGER,
			ProductID INTEGER,
			Quantity INTEGER,
			Price REAL,
			FOREIGN KEY (OrderID) REFERENCES orders(OrderID),
			FOREIGN KEY (ProductID) REFERENCES products(ProductID)
		)`,
		`CREATE TABLE IF NOT EXISTS order_history (
			HistoryID INTEGER PRIMARY KEY AUTOINCREMENT,
			OrderID INTEGER,
			OldStatus TEXT,
			NewStatus TEXT,
			ChangedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
			Note TEXT,
			FOREIGN KEY (OrderID) REFERENCES orders(OrderID)
		)`,
		`CREATE TABLE IF NOT EXISTS cart (
			CartID INTEGER PRIMARY KEY AUTOINCREMENT,
			UserID INTEGER NOT NULL,
			FOREIGN KEY (UserID) REFERENCES users(UserID)
		)`,
		`CREATE TABLE IF NOT EXISTS cart_contents (
			CartContentID INTEGER PRIMARY KEY AUTOINCREMENT,
			CartID INTEGER,
			ProductID INTEGER,
			Quantity INTEGER DEFAULT 1,
			FOREIGN KEY (CartID) REFERENCES cart(CartID),
			FOREIGN KEY (ProductID) REFERENCES products(ProductID)
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
		brand       string
		size        string
		description string
		price       float64
		stock       int
	}{
		{
			name:        "New Era Yankees Cap",
			brand:       "New Era",
			size:        "One Size",
			description: "Official New York Yankees Baseball Cap",
			price:       1499.99,
			stock:       50,
		},
		{
			name:        "LA Dodgers Fitted Cap",
			brand:       "New Era",
			size:        "7 1/4",
			description: "Official LA Dodgers Baseball Cap - Navy Blue",
			price:       1299.99,
			stock:       30,
		},
		{
			name:        "Chicago Bulls Snapback",
			brand:       "Mitchell & Ness",
			size:        "One Size",
			description: "Classic Chicago Bulls NBA Cap - Red/Black",
			price:       999.99,
			stock:       25,
		},
	}

	for _, p := range testProducts {
		// Try to insert, ignore errors (they'll be duplicates)
		_, err := DB.Exec(`
			INSERT INTO products (Name, Brand, Size, Description, Price, Stock)
			SELECT ?, ?, ?, ?, ?, ?
			WHERE NOT EXISTS (SELECT 1 FROM products WHERE Name = ?)
		`, p.name, p.brand, p.size, p.description, p.price, p.stock, p.name)

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
