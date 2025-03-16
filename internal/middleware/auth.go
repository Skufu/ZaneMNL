package middleware

import (
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
)

// Simple hardcoded secret key - this is fine for a lab project
// In a real app, this would come from environment variables
var secretKey = []byte("your-secret-key-here")

// For development purposes only - set to true to bypass authentication
var DevMode = true

// Generate JWT token
func GenerateToken(userID int64, role string) (string, error) {
	log.Printf("Generating token for userID: %d, role: %s", userID, role)

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": userID,
		"role":    role,
		"exp":     time.Now().Add(time.Hour * 24).Unix(), // 24 hour expiration
	})

	tokenString, err := token.SignedString(secretKey)
	if err != nil {
		log.Printf("Token signing failed: %v", err)
		return "", err
	}

	log.Printf("Token generated successfully")
	return tokenString, nil
}

// Auth middleware
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// In development mode, bypass authentication
		if DevMode {
			// Set a default admin user
			c.Set("userID", int64(1))
			c.Set("role", "admin")
			c.Next()
			return
		}

		authHeader := c.GetHeader("Authorization")
		log.Printf("Auth header received: %s", authHeader)

		if authHeader == "" {
			log.Printf("No auth header")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			c.Abort()
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			log.Printf("Invalid auth format: %v", parts)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization format"})
			c.Abort()
			return
		}

		token, err := jwt.Parse(parts[1], func(token *jwt.Token) (interface{}, error) {
			return secretKey, nil
		})

		if err != nil {
			log.Printf("Token parsing failed: %v", err)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		if !token.Valid {
			log.Printf("Token invalid")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			log.Printf("Failed to get claims")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			c.Abort()
			return
		}

		log.Printf("Token validated for userID: %v, role: %v", claims["user_id"], claims["role"])
		c.Set("userID", int64(claims["user_id"].(float64)))
		c.Set("role", claims["role"].(string))

		c.Next()
	}
}

// Admin middleware
func AdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// In development mode, bypass admin check
		if DevMode {
			c.Next()
			return
		}

		role, exists := c.Get("role")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			c.Abort()
			return
		}

		if role != "admin" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Admin access required"})
			c.Abort()
			return
		}

		c.Next()
	}
}
