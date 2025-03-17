package models

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	"go_module/internal/database"
	"go_module/internal/middleware"
)

type User struct {
	UserID    int64     `json:"user_id"`
	Username  string    `json:"username"`
	Email     string    `json:"email"`
	Password  string    `json:"-"` // Don't return in JSON
	Role      string    `json:"role"`
	CreatedAt time.Time `json:"created_at"`
	LastLogin time.Time `json:"last_login,omitempty"`
}

// Create a new user
func CreateUser(username, email, password, role string) (*User, error) {
	log.Printf("Creating user with username: %s, email: %s", username, email)

	// Store plain text password for testing
	// In a production environment, you would hash the password here

	// Insert into database with SQLite datetime
	result, err := database.DB.Exec(
		"INSERT INTO users (Username, Email, Password, Role, CreatedAt) VALUES (?, ?, ?, ?, datetime('now'))",
		username, email, password, role,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to insert user: %v", err)
	}

	// Get ID of inserted user
	id, err := result.LastInsertId()
	if err != nil {
		return nil, fmt.Errorf("failed to get last insert ID: %v", err)
	}

	log.Printf("Successfully created user with ID: %d", id)

	// Get the created user to return accurate timestamps
	return GetUserByID(id)
}

// Get user by ID
func GetUserByID(id int64) (*User, error) {
	user := &User{}
	var createdAt string
	var lastLogin sql.NullString // Use sql.NullString to handle NULL

	err := database.DB.QueryRow(
		"SELECT UserID, Username, Email, Role, CreatedAt, LastLogin FROM users WHERE UserID = ?",
		id,
	).Scan(&user.UserID, &user.Username, &user.Email, &user.Role, &createdAt, &lastLogin)

	if err != nil {
		return nil, err
	}

	// Parse SQLite datetime strings
	user.CreatedAt, _ = time.Parse("2006-01-02 15:04:05", createdAt)
	if lastLogin.Valid {
		user.LastLogin, _ = time.Parse("2006-01-02 15:04:05", lastLogin.String)
	}

	return user, nil
}

// Authenticate user
func AuthenticateUser(email, password string) (*User, string, error) {
	// Get user by email
	user := &User{}
	var createdAt string
	log.Printf("Attempting login for email: %s", email)

	err := database.DB.QueryRow(
		"SELECT UserID, Username, Email, Password, Role, CreatedAt FROM users WHERE Email = ?",
		email,
	).Scan(&user.UserID, &user.Username, &user.Email, &user.Password, &user.Role, &createdAt)

	if err != nil {
		log.Printf("Database error: %v", err)
		return nil, "", fmt.Errorf("invalid credentials")
	}

	// Parse CreatedAt
	user.CreatedAt, _ = time.Parse("2006-01-02 15:04:05", createdAt)

	log.Printf("Found user: %v with role: %v", user.Username, user.Role)

	// Compare password
	if user.Password != password {
		log.Printf("Password comparison failed: stored=%s, provided=%s", user.Password, password)
		return nil, "", fmt.Errorf("invalid credentials")
	}

	log.Printf("Password verified for user: %s", user.Username)

	// Generate JWT token
	token, err := middleware.GenerateToken(user.UserID, user.Role)
	if err != nil {
		log.Printf("Token generation failed: %v", err)
		return nil, "", err
	}

	// Update last login time using SQLite's datetime function
	_, err = database.DB.Exec("UPDATE users SET LastLogin = datetime('now') WHERE UserID = ?", user.UserID)
	if err != nil {
		log.Printf("Failed to update last login: %v", err)
		// Don't return error here, not critical
	}

	return user, token, nil
}

// GetUserCount returns the total number of users
func GetUserCount() (int, error) {
	var count int
	err := database.DB.QueryRow("SELECT COUNT(*) FROM users").Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to count users: %v", err)
	}
	return count, nil
}

// IsUserAdmin checks if a user has admin role
func IsUserAdmin(userID int64) (bool, error) {
	var role string
	err := database.DB.QueryRow("SELECT Role FROM users WHERE UserID = ?", userID).Scan(&role)
	if err != nil {
		return false, fmt.Errorf("failed to get user role: %v", err)
	}

	return role == "admin", nil
}
