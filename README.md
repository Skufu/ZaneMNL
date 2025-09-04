# ZaneMNL

ZaneMNL is a full-stack e-commerce web application built with Go and React.

## Project Overview

ZaneMNL is an e-commerce platform specializing in cap merchandise, built using Go for the backend, React for the frontend, and SQLite for the database. This project demonstrates various database concepts and SQL manipulations, while providing a modern, responsive user interface for customers to browse products, manage carts, and place orders.

## Getting Started

### Prerequisites

- Go (version 1.23.2 or higher)
- Node.js
- npm

### Backend

The backend is a Go application using the Gin framework.

To build and run the backend server, use the provided script:

```bash
./run.sh
```

This will build the server and start it on port 8080.

Alternatively, you can run the server in development mode:

```bash
cd cmd/api
go run main.go
```

### Frontend

The frontend is a React application.

To run the frontend development server:

```bash
cd frontend
npm install
npm start
```

The frontend will be available at [http://localhost:3000](http://localhost:3000).

## Technologies

- **Backend:**
  - Go
  - Gin Web Framework
- **Frontend:**
  - React
  - TypeScript
- **Database:**
  - SQLite

## Project Structure

```
.
├── cmd/api         # Go backend (main.go)
├── frontend        # React frontend
├── internal        # Go internal packages
│   ├── database
│   ├── handlers
│   ├── middleware
│   └── models
└── ...
```

## Database

The application uses SQLite as its database. The database schema is defined in `internal/database/schema.sql`.

### Schema

```sql
-- Users table
CREATE TABLE users (
    UserID INTEGER PRIMARY KEY AUTOINCREMENT,
    Username TEXT NOT NULL,
    Email TEXT NOT NULL UNIQUE,
    Password TEXT NOT NULL,
    Role TEXT DEFAULT 'customer',
    CreatedAt TEXT DEFAULT (datetime('now')),
    LastLogin TEXT
);

-- Products table
CREATE TABLE products (
    ProductID INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT NOT NULL UNIQUE,
    Description TEXT,
    Price REAL NOT NULL,
    ImageURL TEXT,
    Stock INTEGER NOT NULL DEFAULT 0,
    CreatedAt TEXT DEFAULT (datetime('now'))
);

-- Orders table
CREATE TABLE orders (
    OrderID INTEGER PRIMARY KEY AUTOINCREMENT,
    UserID INTEGER NOT NULL,
    Status TEXT NOT NULL DEFAULT 'pending',
    ShippingAddress TEXT NOT NULL,
    PaymentMethod TEXT NOT NULL,
    TotalAmount REAL NOT NULL,
    CreatedAt TEXT DEFAULT (datetime('now')),
    PaymentVerified BOOLEAN NOT NULL DEFAULT 0,
    PaymentReference TEXT,
    TrackingNumber TEXT,
    FOREIGN KEY (UserID) REFERENCES users(UserID)
);

-- Order details
CREATE TABLE order_details (
    OrderDetailID INTEGER PRIMARY KEY AUTOINCREMENT,
    OrderID INTEGER,
    ProductID INTEGER,
    Quantity INTEGER,
    Price REAL,
    FOREIGN KEY (OrderID) REFERENCES orders(OrderID),
    FOREIGN KEY (ProductID) REFERENCES products(ProductID)
);

-- Order history table
CREATE TABLE order_history (
    HistoryID INTEGER PRIMARY KEY AUTOINCREMENT,
    OrderID INTEGER,
    OldStatus TEXT NOT NULL,
    NewStatus TEXT NOT NULL,
    ChangedAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (OrderID) REFERENCES orders(OrderID)
);

-- Cart items table
CREATE TABLE cart_items (
    CartItemID INTEGER PRIMARY KEY AUTOINCREMENT,
    UserID INTEGER NOT NULL,
    ProductID INTEGER NOT NULL,
    Quantity INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (UserID) REFERENCES users(UserID),
    FOREIGN KEY (ProductID) REFERENCES products(ProductID)
);
```

## API Endpoints

The API is built with Go and Gin. The following endpoints are available:

### Public Routes

- `POST /register`: Create a new user account
- `POST /login`: Login and get JWT token
- `GET /products`: List all products
- `GET /products/:id`: Get single product details

### Customer Routes (requires authentication)

- `GET /users/:id`: Get user profile
- `POST /cart/add`: Add item to cart
- `PUT /cart/update`: Update cart item quantity
- `POST /cart/decrease`: Decrease cart item quantity
- `DELETE /cart/:id`: Remove item from cart
- `DELETE /cart`: Clear cart
- `GET /cart`: View cart contents
- `POST /checkout`: Place order
- `GET /orders`: View user's orders

### Admin Routes (requires admin authentication)

- `GET /admin/dashboard`: Get dashboard metrics
- `GET /admin/products`: Get all products (admin view)
- `POST /admin/products`: Create product
- `PUT /admin/products/:id`: Update product
- `DELETE /admin/products/:id`: Delete product
- `GET /admin/orders`: View all orders
- `PUT /admin/orders/:id/status`: Update order status
- `PUT /admin/orders/:id/verify`: Verify order payment

## Frontend

The frontend is a React application with the following routes:

### Customer Routes

- `/`: Home page
- `/products`: Products page
- `/login`: Login page
- `/register`: Register page
- `/cart`: Cart page
- `/checkout`: Checkout page
- `/order-confirmation`: Order confirmation page
- `/orders`: Orders page

### Admin Routes

- `/admin/login`: Admin login page
- `/admin/dashboard`: Admin dashboard
- `/admin/products`: Admin products management
- `/admin/orders`: Admin orders management
- `/admin/reports`: Admin sales reports

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
