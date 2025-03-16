package auth

import (
	"errors"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt"
)

var jwtKey = []byte("your-secret-key") // In production, use environment variable

// GetUserIDFromRequest extracts the user ID from the JWT token in the request
func GetUserIDFromRequest(r *http.Request) (int64, error) {
	// Get the Authorization header
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		return 0, errors.New("authorization header is required")
	}

	// Check if the header has the Bearer prefix
	if !strings.HasPrefix(authHeader, "Bearer ") {
		return 0, errors.New("invalid authorization header format")
	}

	// Extract the token
	tokenString := strings.TrimPrefix(authHeader, "Bearer ")

	// Parse the token
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Validate the signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return jwtKey, nil
	})

	if err != nil {
		return 0, err
	}

	// Extract claims
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		// Get the user ID from claims
		if userID, ok := claims["user_id"].(float64); ok {
			return int64(userID), nil
		}
		return 0, errors.New("user ID not found in token")
	}

	return 0, errors.New("invalid token")
}
