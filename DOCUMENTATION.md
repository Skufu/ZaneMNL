# E-Commerce Backend API Documentation

This document outlines the available endpoints and their usage for the ZaneMNL e-commerce backend API. This guide is designed to be beginner-friendly and includes all the information you need to get started.

## Table of Contents
- [Getting Started](#getting-started)
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Public Endpoints](#public-endpoints)
- [Protected Endpoints](#protected-endpoints)
- [Admin Endpoints](#admin-endpoints)
- [Error Handling](#error-handling)
- [Step-by-Step Tutorial](#step-by-step-tutorial)
- [Data Models Reference](#data-models-reference)

## Getting Started

### Prerequisites
- Go 1.16 or higher
- SQLite3
- Git

### Installation
1. Clone the repository
2. Navigate to the project directory
3. Run the server:
   ```bash
   go run cmd/api/main.go
   ```
4. The server will start on http://localhost:8080

## Base URL
```
http://localhost:8080
```

## Authentication
Most endpoints require JWT authentication. After logging in, you'll receive a token that must be included in subsequent requests:

```
Authorization: Bearer <your_jwt_token>
```

### Token Expiration
Tokens expire after 24 hours, after which you'll need to log in again.

## Public Endpoints
These endpoints don't require authentication.

### Register User
```
POST /register
```
Creates a new user account.

**Body:**
```json
{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123"
}
```

**Response:** 
```json
{
    "user_id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "role": "customer",
    "created_at": "2024-03-12T10:00:00Z"
}
```

### Login
```
POST /login
```
Authenticates a user and returns a JWT token.

**Body:**
```json
{
    "email": "john@example.com",
    "password": "password123"
}
```

**Response:**
```json
{
    "user": {
        "user_id": 1,
        "username": "johndoe",
        "email": "john@example.com",
        "role": "customer",
        "created_at": "2024-03-12T10:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### List Products
```
GET /products
```
Retrieves all available products.

**Response:** 
```json
[
    {
        "product_id": 1,
        "name": "New Era Yankees Cap",
        "description": "Official New York Yankees Baseball Cap",
        "price": 1499.99,
        "image_url": "https://example.com/yankees-cap.jpg",
        "stock": 50,
        "created_at": "2024-03-12T10:00:00Z"
    },
    {
        "product_id": 2,
        "name": "LA Dodgers Fitted Cap",
        "description": "Official LA Dodgers Baseball Cap - Navy Blue",
        "price": 1299.99,
        "image_url": "https://example.com/dodgers-cap.jpg",
        "stock": 30,
        "created_at": "2024-03-12T10:00:00Z"
    }
]
```

### Get Single Product
```
GET /products/{id}
```
Retrieves details for a specific product.

**Example:** `GET /products/1`

**Response:**
```json
{
    "product_id": 1,
    "name": "New Era Yankees Cap",
    "description": "Official New York Yankees Baseball Cap",
    "price": 1499.99,
    "image_url": "https://example.com/yankees-cap.jpg",
    "stock": 50,
    "created_at": "2024-03-12T10:00:00Z"
}
```

## Protected Endpoints (Requires Authentication)
These endpoints require a valid JWT token in the authorization header.

### Get User Profile
```
GET /users/{id}
```
Retrieves user profile information.

**Example:** `GET /users/1`

**Response:**
```json
{
    "user_id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "role": "customer",
    "created_at": "2024-03-12T10:00:00Z"
}
```

### Cart Operations

#### Add to Cart
```
POST /cart/add
```
Adds a product to the user's shopping cart.

**Body:**
```json
{
    "product_id": 1,
    "quantity": 2
}
```

**Response:**
```json
{
    "message": "Item added to cart"
}
```

#### View Cart
```
GET /cart
```
Retrieves the contents of the user's shopping cart.

**Response:**
```json
{
    "items": [
        {
            "cart_item_id": 1,
            "product_id": 1,
            "name": "New Era Yankees Cap",
            "price": 1499.99,
            "quantity": 2,
            "image_url": "https://example.com/yankees-cap.jpg"
        }
    ],
    "subtotal": 2999.98
}
```

### Order Operations

#### Create Order (Checkout)
```
POST /checkout
```
Creates a new order from the items in the user's cart.

**Body:**
```json
{
    "shipping_address": {
        "full_name": "John Doe",
        "phone_number": "1234567890",
        "address": "123 Main St",
        "city": "New York",
        "province": "NY",
        "postal_code": "10001"
    },
    "payment_method": "credit_card"
}
```

**Response:**
```json
{
    "order_id": 1,
    "user_id": 1,
    "shipping_address": "John Doe\n1234567890\n123 Main St\nNew York, NY 10001",
    "payment_method": "credit_card",
    "order_date": "2024-03-12T10:00:00Z",
    "total_amount": 2999.98,
    "status": "pending",
    "items": [
        {
            "product_id": 1,
            "name": "New Era Yankees Cap",
            "quantity": 2,
            "price_at_purchase": 1499.99
        }
    ]
}
```

#### View User Orders
```
GET /orders
```
Retrieves all orders placed by the authenticated user.

**Response:**
```json
[
    {
        "order_id": 1,
        "user_id": 1,
        "shipping_address": "John Doe\n1234567890\n123 Main St\nNew York, NY 10001",
        "payment_method": "credit_card",
        "order_date": "2024-03-12T10:00:00Z",
        "total_amount": 2999.98,
        "status": "pending",
        "items": [
            {
                "product_id": 1,
                "name": "New Era Yankees Cap",
                "quantity": 2,
                "price_at_purchase": 1499.99
            }
        ]
    }
]
```

## Admin Endpoints (Requires Admin Role)
These endpoints require authentication with an admin user account.

### Product Management

#### Create Product
```
POST /admin/products
```
Creates a new product.

**Body:**
```json
{
    "name": "Chicago Bulls Snapback",
    "description": "Classic Chicago Bulls NBA Cap - Red/Black",
    "price": 999.99,
    "image_url": "https://example.com/bulls-cap.jpg",
    "stock": 25
}
```

**Response:**
```json
{
    "product_id": 3,
    "name": "Chicago Bulls Snapback",
    "description": "Classic Chicago Bulls NBA Cap - Red/Black",
    "price": 999.99,
    "image_url": "https://example.com/bulls-cap.jpg",
    "stock": 25,
    "created_at": "2024-03-12T10:00:00Z"
}
```

#### Update Product
```
PUT /admin/products/{id}
```
Updates an existing product.

**Example:** `PUT /admin/products/3`

**Body:**
```json
{
    "name": "Chicago Bulls Snapback",
    "description": "Updated - Classic Chicago Bulls NBA Cap - Red/Black",
    "price": 1099.99,
    "image_url": "https://example.com/bulls-cap-updated.jpg",
    "stock": 30
}
```

**Response:**
```json
{
    "product_id": 3,
    "name": "Chicago Bulls Snapback",
    "description": "Updated - Classic Chicago Bulls NBA Cap - Red/Black",
    "price": 1099.99,
    "image_url": "https://example.com/bulls-cap-updated.jpg",
    "stock": 30,
    "created_at": "2024-03-12T10:00:00Z",
    "updated_at": "2024-03-12T11:00:00Z"
}
```

#### Delete Product
```
DELETE /admin/products/{id}
```
Deletes a product.

**Example:** `DELETE /admin/products/3`

**Response:**
```json
{
    "message": "Product deleted successfully"
}
```

### Order Management

#### View All Orders
```
GET /admin/orders
```
Retrieves all orders in the system.

**Response:** Array of all order objects

#### Update Order Status
```
PUT /admin/orders/{id}/status
```
Updates the status of an order.

**Example:** `PUT /admin/orders/1/status`

**Body:**
```json
{
    "status": "shipped"
}
```

**Response:**
```json
{
    "message": "Order status updated successfully"
}
```

## Error Handling

All endpoints return error responses in the following format:
```json
{
    "error": "Error message description"
}
```

### Common HTTP Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request (invalid input)
- **401**: Unauthorized (missing or invalid token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **500**: Internal Server Error

### Common Error Messages
- **"Invalid credentials"**: Email/password don't match
- **"Email already exists"**: When registering with an email that's already in use
- **"User not authenticated"**: Missing or invalid token
- **"Admin access required"**: Regular user trying to access admin endpoints
- **"Insufficient stock"**: Trying to add more items than available
- **"Cart is empty"**: Attempting to checkout with an empty cart

## Step-by-Step Tutorial

### 1. Starting the Server
```bash
go run cmd/api/main.go
```

### 2. Creating a Regular User
```bash
curl -X POST http://localhost:8080/register \
-H "Content-Type: application/json" \
-d '{
    "username": "customer",
    "email": "customer@example.com",
    "password": "password123"
}'
```

### 3. Creating an Admin User
First, register a new user:
```bash
curl -X POST http://localhost:8080/register \
-H "Content-Type: application/json" \
-d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "adminpass"
}'
```

Then, use an SQLite command to update the user role:
```bash
sqlite3 ./data/lab.db "UPDATE users SET Role = 'admin' WHERE Email = 'admin@example.com';"
```

### 4. Logging In
```bash
curl -X POST http://localhost:8080/login \
-H "Content-Type: application/json" \
-d '{
    "email": "customer@example.com",
    "password": "password123"
}'
```

Save the token from the response:
```
TOKEN="eyJhbGciOiJIUzI1NiIs..."
```

### 5. Browsing Products
```bash
curl -X GET http://localhost:8080/products
```

### 6. Adding to Cart
```bash
curl -X POST http://localhost:8080/cart/add \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{
    "product_id": 1,
    "quantity": 2
}'
```

### 7. Viewing Cart
```bash
curl -X GET http://localhost:8080/cart \
-H "Authorization: Bearer $TOKEN"
```

### 8. Placing an Order
```bash
curl -X POST http://localhost:8080/checkout \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{
    "shipping_address": {
        "full_name": "John Doe",
        "phone_number": "1234567890",
        "address": "123 Main St",
        "city": "New York",
        "province": "NY",
        "postal_code": "10001"
    },
    "payment_method": "credit_card"
}'
```

### 9. Viewing Orders
```bash
curl -X GET http://localhost:8080/orders \
-H "Authorization: Bearer $TOKEN"
```

### 10. Admin: Creating a Product (requires admin token)
```bash
curl -X POST http://localhost:8080/admin/products \
-H "Authorization: Bearer $ADMIN_TOKEN" \
-H "Content-Type: application/json" \
-d '{
    "name": "Seattle Mariners Cap",
    "description": "Official Seattle Mariners Baseball Cap - Navy/Teal",
    "price": 1399.99,
    "image_url": "https://example.com/mariners-cap.jpg",
    "stock": 35
}'
```

### 11. Admin: Updating Order Status (requires admin token)
```bash
curl -X PUT http://localhost:8080/admin/orders/1/status \
-H "Authorization: Bearer $ADMIN_TOKEN" \
-H "Content-Type: application/json" \
-d '{
    "status": "shipped"
}'
```

## Data Models Reference

### User
- **UserID**: Unique identifier
- **Username**: Display name
- **Email**: Unique email address
- **Password**: Securely hashed password (not returned in responses)
- **Role**: Either "customer" or "admin"
- **CreatedAt**: Account creation timestamp
- **LastLogin**: Last login timestamp

### Product
- **ProductID**: Unique identifier
- **Name**: Product name
- **Description**: Detailed description
- **Price**: Price in currency units
- **ImageURL**: URL to product image
- **Stock**: Available quantity
- **CreatedAt**: Product creation timestamp

### Cart
- **Items**: Array of cart items
  - **CartItemID**: Unique identifier for cart item
  - **ProductID**: Reference to product
  - **Name**: Product name
  - **Price**: Current product price
  - **Quantity**: Number of units
  - **ImageURL**: URL to product image
- **Subtotal**: Total price of all items

### Order
- **OrderID**: Unique identifier
- **UserID**: Customer who placed the order
- **ShippingAddress**: Formatted shipping address
- **PaymentMethod**: Payment method used
- **OrderDate**: Date and time of order placement
- **TotalAmount**: Total order amount
- **Status**: Order status (pending, shipped, delivered, etc.)
- **Items**: Array of purchased items
  - **ProductID**: Reference to product
  - **Name**: Product name at time of purchase
  - **Quantity**: Number of units purchased
  - **PriceAtPurchase**: Price at time of purchase
</rewritten_file>