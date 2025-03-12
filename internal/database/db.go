package database

import (
	"database/sql"
	"log"
	"os"

	_ "github.com/mattn/go-sqlite3"
)

// Create a global DB connection
var DB *sql.DB

// Initialize the database
func InitDB() {
	var err error

	// Check if database file exists
	_, err = os.Stat("./zane_mnl.db")

	// Open database connection
	DB, err = sql.Open("sqlite3", "./zane_mnl.db")
	if err != nil {
		log.Fatal(err)
	}

	// Test the connection
	err = DB.Ping()
	if err != nil {
		log.Fatal(err)
	}

	log.Println("Connected to database successfully")

	// Create tables if database file doesn't exist
	if os.IsNotExist(err) {
		log.Println("Creating database schema...")
		createSchema()
	}
}

// Create database schema
func createSchema() {
	schemaSQL, err := os.ReadFile("./internal/database/schema.sql")
	if err != nil {
		log.Fatal(err)
	}

	_, err = DB.Exec(string(schemaSQL))
	if err != nil {
		log.Fatal(err)
	}

	log.Println("Database schema created successfully")
}
