# ZANE MNL - Premium Caps E-commerce Website

ZANE MNL is a modern e-commerce platform specializing in premium caps. This project includes both a Go backend API and a JavaScript frontend.

## Features

- User authentication (register, login, logout)
- Product browsing and filtering
- Shopping cart functionality
- Checkout process
- Order history
- Admin panel for product management

## Tech Stack

### Backend
- Go (Golang)
- Gin Web Framework
- SQLite Database
- JWT Authentication

### Frontend
- HTML5
- CSS3
- Vanilla JavaScript
- Responsive Design

## Project Structure

```
├── cmd/
│   └── api/
│       └── main.go         # Main entry point for the backend API
├── internal/
│   ├── database/           # Database connection and utilities
│   ├── handlers/           # HTTP request handlers
│   ├── middleware/         # Middleware functions
│   └── models/             # Data models and business logic
├── data/                   # SQLite database file
├── images/                 # Product images
├── index.html              # Frontend HTML
├── main.css                # Frontend CSS
└── main.js                 # Frontend JavaScript
```

## Getting Started

### Prerequisites

- Go 1.16 or higher
- Web browser
- Python (optional, for serving frontend)
- Node.js (optional, for serving frontend)

### Running the Backend

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/ZaneMNL.git
   cd ZaneMNL
   ```

2. Run the Go backend:
   ```
   go run cmd/api/main.go
   ```
   
   The backend API will be available at `http://localhost:8080`.

### Running the Frontend

You can serve the frontend using one of the following methods:

#### Using Python

For Python 3:
```
python -m http.server 3000
```

For Python 2:
```
python -m SimpleHTTPServer 3000
```

#### Using Node.js

First, install the `http-server` package:
```
npm install -g http-server
```

Then run:
```
http-server -p 3000
```

After starting the server, open your browser and navigate to `http://localhost:3000`.

## API Endpoints

### Authentication
- `POST /register` - Register a new user
- `POST /login` - Login and get JWT token

### Products
- `GET /products` - Get all products
- `GET /products/:id` - Get a specific product

### Cart
- `GET /cart` - Get the current user's cart
- `POST /cart/add` - Add a product to the cart
- `PUT /cart/update` - Update product quantity in the cart
- `DELETE /cart/remove` - Remove a product from the cart

### Orders
- `POST /checkout` - Create a new order
- `GET /orders` - Get the current user's orders
- `GET /orders/:id` - Get a specific order

### Admin
- `POST /admin/products` - Create a new product
- `PUT /admin/products/:id` - Update a product
- `DELETE /admin/products/:id` - Delete a product

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Gin Web Framework](https://github.com/gin-gonic/gin)
- [Font Awesome](https://fontawesome.com/)
- [JWT Go](https://github.com/golang-jwt/jwt)
