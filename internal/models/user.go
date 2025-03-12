package models

import (
	"time"

	"go_module/internal/database"
	"go_module/internal/middleware"

	"golang.org/x/crypto/bcrypt"
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
	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	// Insert into database
	result, err := database.DB.Exec(
		"INSERT INTO users (Username, Email, Password, Role) VALUES (?, ?, ?, ?)",
		username, email, string(hashedPassword), role,
	)
	if err != nil {
		return nil, err
	}

	// Get ID of inserted user
	id, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}

	// Return the created user
	return &User{
		UserID:    id,
		Username:  username,
		Email:     email,
		Role:      role,
		CreatedAt: time.Now(),
	}, nil
}

// Get user by ID
func GetUserByID(id int64) (*User, error) {
	user := &User{}

	err := database.DB.QueryRow(
		"SELECT UserID, Username, Email, Role, CreatedAt, LastLogin FROM users WHERE UserID = ?",
		id,
	).Scan(&user.UserID, &user.Username, &user.Email, &user.Role, &user.CreatedAt, &user.LastLogin)

	if err != nil {
		return nil, err
	}

	return user, nil
}

// Authenticate user
func AuthenticateUser(email, password string) (*User, string, error) {
	// Get user by email
	user := &User{}
	err := database.DB.QueryRow(
		"SELECT UserID, Username, Email, Password, Role, CreatedAt, LastLogin FROM users WHERE Email = ?",
		email,
	).Scan(&user.UserID, &user.Username, &user.Email, &user.Password, &user.Role, &user.CreatedAt, &user.LastLogin)

	if err != nil {
		return nil, "", err
	}

	// Compare password
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		return nil, "", err
	}

	// Generate JWT token
	token, err := middleware.GenerateToken(user.UserID, user.Role)
	if err != nil {
		return nil, "", err
	}

	// Update last login time
	_, err = database.DB.Exec("UPDATE users SET LastLogin = CURRENT_TIMESTAMP WHERE UserID = ?", user.UserID)
	if err != nil {
		return nil, "", err
	}

	return user, token, nil
}

// Implement similar functions for products and other models
