# ZaneMNL E-Commerce Platform - CS107L Database Project

## Table of Contents
1. [Project Overview](#project-overview)
2. [Setup Instructions](#setup-instructions)
   - [Prerequisites Installation](#prerequisites-installation)
   - [Database Setup](#database-setup)
   - [Running the Application](#running-the-application)
3. [SQLite3 Usage Guide](#sqlite3-usage-guide)
4. [Database Design](#database-design)
   - [Entity-Relationship Diagram](#entity-relationship-diagram-erd)
   - [Database Schema](#database-schema)
5. [Key SQL Operations](#key-sql-operations-demonstrated)
6. [SQL Data Manipulation](#sql-data-manipulation-demonstrations)
7. [Database Best Practices](#database-best-practices-demonstrated)
8. [Frontend Architecture](#frontend-architecture)
   - [Component Structure](#component-structure)
   - [State Management](#state-management)
   - [API Integration](#api-integration)
   - [User Interface Features](#user-interface-features)
9. [API Endpoints](#api-endpoints)
10. [Technical Stack](#project-technical-stack)
11. [Design Principles](#database-design-principles-applied)
12. [Project Demonstration](#project-demonstration)

## Setup Instructions

### Prerequisites Installation

1. **Install Go (1.16 or higher)**
   - Visit [Go Downloads](https://golang.org/dl/)
   - Download and run the installer for Windows
   - Verify installation: `go version`

2. **Install SQLite3**
   - Download SQLite Tools from [SQLite Download Page](https://www.sqlite.org/download.html)
   - For Windows:
     1. Download `sqlite-tools-win32-x86-*.zip`
     2. Create a folder: `C:\sqlite`
     3. Extract the downloaded files to `C:\sqlite`
     4. Add to PATH:
        - Search `edit the system environment variables`
        - In the Box under the System Variables, Scroll down to `Path`
        - Click `Edit`
        - Click `New`
        - Put the path to the extracted folder, in this case `C:\sqlite`
        - Restart VScode 
     5. Verify installation: `sqlite3 --version`

3. **Install Node.js and npm**
   - Download from [Node.js website](https://nodejs.org/)
   - Choose LTS version
   - Run the installer
   - Verify installation in terminal:
     ```bash
     node --version
     npm --version
     ```

     ```Powershell
     node -v
     npm -v
     ```

    
4. **Install Git**
   - Download from [Git website](https://git-scm.com/)
   - Run the installer
   - Verify installation: `git --version`

### Database Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/ZaneMNL.git
   cd ZaneMNL
   ```

2. **Initialize the Database**
   ```bash
   # The database will be automatically initialized when you run the server
   # To manually access the database:
   sqlite3 ./data/lab.db
   ```

### Running the Application

1. **Start the Backend Server**
   ```bash
   # Navigate to project root
   cd ZaneMNL

   # Run the server
   go run cmd/api/main.go
   ```
   The server will start on http://localhost:8080

2. **Start the Frontend Application**
   ```bash
   # Open a new terminal
   cd frontend

   # Install dependencies
   npm install

   # Start the development server
   npm start
   ```
   The frontend will open in your browser at http://localhost:3000

## SQLite3 Usage Guide

### Basic SQLite3 Commands

1. **Open SQLite Console**
   ```bash
   # Navigate to project directory
   cd ZaneMNL

   # Open database
   sqlite3 ./data/lab.db
   ```

2. **Essential SQLite Commands**
   ```sql
   -- Format output
   .mode column   -- Display as formatted columns
   .headers on    -- Show column headers
   .width 15 10 30  -- Set column widths

   -- Database information
   .tables        -- List all tables
   .schema        -- Show complete schema
   .schema users  -- Show schema for specific table
   .indexes       -- List all indexes

   -- Export/Import
   .output report.csv   -- Direct output to file
   .mode csv            -- Set output mode to CSV
   .dump                -- Backup database to SQL
   .quit                -- Exit SQLite

   -- Help
   .help          -- Show all commands
   ```

3. **Useful Settings for Presentation**
   ```sql
   -- Pretty output configuration
   .mode column
   .headers on
   .width 15 10 30
   .nullvalue NULL
   
   -- Enable foreign keys
   PRAGMA foreign_keys = ON;
   
   -- Show execution time
   .timer on
   ```

4. **Common Issues and Solutions**
   - If `sqlite3` command not found:
     - Verify PATH environment variable
     - Restart terminal/command prompt
   - If database is locked:
     - Close other connections
     - Use `.quit` to properly close SQLite
   - If changes not saving:
     - Verify you're not in read-only mode
     - Check disk permissions

## Beginner's Guide to Working with the Database

### Step-by-Step SQLite Practice (For Beginners)

1. **Starting SQLite for the First Time**
   ```bash
   # Go to the project folder first
   cd ZaneMNL
   
   # Start SQLite with the database
   sqlite3 ./data/lab.db
   
   # Make the output look nice (copy and paste these lines)
   .mode column
   .headers on
   ```

2. **Your First SELECT Query**
   ```sql
   -- See all products in the database
   SELECT ProductID, Name, Price, Stock FROM products;
   
   -- Find specific products
   SELECT * FROM products WHERE Price < 1500;
   ```

3. **Understanding Table Relationships**
   ```sql
   -- See a user's orders (replace 1 with any UserID)
   SELECT OrderID, TotalAmount, Status FROM orders WHERE UserID = 1;
   
   -- See what products are in an order (replace 1 with any OrderID)
   SELECT p.Name, od.Quantity, od.Price
   FROM order_details od
   JOIN products p ON od.ProductID = p.ProductID
   WHERE od.OrderID = 1;
   ```

### Common Beginner SQLite Errors Explained

| Error Message | What It Means | How to Fix It |
|---------------|---------------|--------------|
| `Error: no such table: [table_name]` | The table doesn't exist or you misspelled it | Use `.tables` to see available tables |
| `Error: near "[word]": syntax error` | SQL command has incorrect syntax | Check for typos, missing commas, or unclosed quotes |
| `Error: database is locked` | Another process is using the database | Close other connections to the database |
| `no such column: [column_name]` | Column doesn't exist or is misspelled | Use `.schema [table_name]` to see available columns |
| `SQL logic error` | SQL statement is logically incorrect | Review logic, especially in WHERE clauses |

### Visual Studio Code SQLite Extension

For beginners who prefer a graphical interface:

1. **Install SQLite Extension**
   - Open VS Code
   - Go to Extensions (Ctrl+Shift+X)
   - Search for "SQLite"
   - Install "SQLite" by alexcvzz

2. **Using the Extension**
   - Open Command Palette (Ctrl+Shift+P)
   - Type "SQLite: Open Database"
   - Select the database file (./data/lab.db)
   - Click on "SQLITE EXPLORER" in the sidebar
   - Expand the database to see tables
   - Right-click on tables to see options (Select Top 1000)

### Database System Flow Diagram

```
┌─────────────┐        ┌──────────────┐        ┌───────────────┐
│  React      │        │  Go Backend  │        │  SQLite       │
│  Frontend   │◄─────► │  API Server  │◄─────► │  Database     │
└─────────────┘        └──────────────┘        └───────────────┘
     ▲                                                ▲
     │                                                │
     │                                                │
     │                                                │
     ▼                                                ▼
┌─────────────┐                               ┌───────────────┐
│  User       │                               │  Database     │
│  Browser    │                               │  File         │
└─────────────┘                               │  (lab.db)     │
                                              └───────────────┘
```

This diagram shows how data flows from the user's browser through our React frontend, to the Go backend API server, which then interacts with the SQLite database file.

### Basic CRUD Operations Cheat Sheet

| Operation | SQL Command Example | What It Does |
|-----------|---------------------|-------------|
| CREATE | `INSERT INTO products (Name, Price) VALUES ('Blue Cap', 999.99);` | Adds a new product |
| READ | `SELECT * FROM products WHERE ProductID = 1;` | Gets product with ID 1 |
| UPDATE | `UPDATE products SET Price = 1099.99 WHERE ProductID = 1;` | Changes product price |
| DELETE | `DELETE FROM products WHERE ProductID = 1;` | Removes product with ID 1 |

### SQLite Data Types for Beginners

Unlike other database systems, SQLite uses "dynamic typing" with just 5 main types:

| Type Name | When to Use It | Example Data |
|-----------|----------------|--------------|
| INTEGER | For whole numbers | User IDs, quantities, counts |
| REAL | For decimal numbers | Prices, measurements, ratings |
| TEXT | For text strings | Names, descriptions, emails |
| BLOB | For binary data | Images, files (rarely used directly) |
| NULL | For missing data | NULL (absence of a value) |

## Project Overview
ZaneMNL is an e-commerce platform specializing in cap merchandise, built using Go for the backend, React for the frontend, and SQLite for the database. This project demonstrates various database concepts and SQL manipulations learned in CS107L, while providing a modern, responsive user interface for customers to browse products, manage carts, and place orders.

## Database Design

### Entity-Relationship Diagram (ERD)
The database consists of the following main entities and their relationships:

```
Users ----1:N---- Orders
  |
  1:N
  |
Cart Items ----N:1---- Products
  |
  N:1
  |
Orders ----1:N---- Order Details
```

### Database Schema

#### 1. Users Table
```sql
CREATE TABLE users (
    UserID INTEGER PRIMARY KEY AUTOINCREMENT,
    Username TEXT NOT NULL,
    Email TEXT NOT NULL UNIQUE,
    Password TEXT NOT NULL,
    Role TEXT DEFAULT 'customer',
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    LastLogin DATETIME
);
```
- Primary Key: `UserID`
- Unique Constraint: `Email`
- Default Values: `Role`, `CreatedAt`

#### 2. Products Table
```sql
CREATE TABLE products (
    ProductID INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT NOT NULL UNIQUE,
    Description TEXT,
    Price REAL NOT NULL,
    ImageURL TEXT,
    Stock INTEGER NOT NULL DEFAULT 0,
    CreatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);
```
- Primary Key: `ProductID`
- Unique Constraint: `Name`
- Business Rules: `Stock` cannot be negative, `Price` must be positive

#### 3. Cart Items Table
```sql
CREATE TABLE cart_items (
    CartItemID INTEGER PRIMARY KEY AUTOINCREMENT,
    UserID INTEGER NOT NULL,
    ProductID INTEGER NOT NULL,
    Quantity INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (UserID) REFERENCES users(UserID),
    FOREIGN KEY (ProductID) REFERENCES products(ProductID)
);
```
- Primary Key: `CartItemID`
- Foreign Keys: `UserID`, `ProductID`
- Referential Integrity: Enforced through foreign key constraints

#### 4. Orders Table
```sql
CREATE TABLE orders (
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
);
```
- Primary Key: `OrderID`
- Foreign Key: `UserID`
- Status Tracking: Order status lifecycle management

#### 5. Order Details Table
```sql
CREATE TABLE order_details (
    OrderDetailID INTEGER PRIMARY KEY AUTOINCREMENT,
    OrderID INTEGER NOT NULL,
    ProductID INTEGER NOT NULL,
    Quantity INTEGER NOT NULL,
    Price REAL NOT NULL,
    FOREIGN KEY (OrderID) REFERENCES orders(OrderID),
    FOREIGN KEY (ProductID) REFERENCES products(ProductID)
);
```
- Primary Key: `OrderDetailID`
- Foreign Keys: `OrderID`, `ProductID`
- Price History: Captures price at time of order

#### 6. Order History Table
```sql
CREATE TABLE order_history (
    HistoryID INTEGER PRIMARY KEY AUTOINCREMENT,
    OrderID INTEGER NOT NULL,
    OldStatus TEXT NOT NULL,
    NewStatus TEXT NOT NULL,
    ChangedAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (OrderID) REFERENCES orders(OrderID)
);
```
- Primary Key: `HistoryID`
- Foreign Key: `OrderID`
- Audit Trail: Tracks order status changes

## Key SQL Operations Demonstrated

### 1. Complex Joins
```sql
-- Get order details with product information
SELECT 
    o.OrderID,
    u.Username,
    p.Name as ProductName,
    od.Quantity,
    od.Price,
    o.TotalAmount,
    o.Status
FROM orders o
JOIN users u ON o.UserID = u.UserID
JOIN order_details od ON o.OrderID = od.OrderID
JOIN products p ON od.ProductID = p.ProductID
WHERE o.UserID = ?;
```

This query demonstrates the use of multiple JOIN operations to combine data from four different tables. It shows how we can retrieve comprehensive order information by linking users, orders, order details, and product information in a single query.

### 2. Transactions
```sql
-- Place new order (transaction example)
BEGIN TRANSACTION;
    -- Insert order
    INSERT INTO orders (UserID, TotalAmount, Status) 
    VALUES (?, ?, 'pending');
    
    -- Get the order ID
    SELECT last_insert_rowid();
    
    -- Insert order details
    INSERT INTO order_details (OrderID, ProductID, Quantity, Price)
    VALUES (?, ?, ?, ?);
    
    -- Update product stock
    UPDATE products 
    SET Stock = Stock - ?
    WHERE ProductID = ?;
    
    -- Clear user's cart
    DELETE FROM cart_items 
    WHERE UserID = ?;
COMMIT;
```

This transaction ensures data integrity during order placement by treating multiple operations as a single atomic unit. If any step fails, all changes are rolled back, preventing inconsistencies in the database.

### 3. Aggregation and Grouping
```sql
-- Sales report by product
SELECT 
    p.Name,
    COUNT(od.OrderDetailID) as TimesOrdered,
    SUM(od.Quantity) as TotalQuantity,
    SUM(od.Quantity * od.Price) as TotalRevenue
FROM products p
LEFT JOIN order_details od ON p.ProductID = od.ProductID
GROUP BY p.ProductID
ORDER BY TotalRevenue DESC;
```

This query demonstrates SQL's powerful aggregation capabilities, using COUNT() and SUM() functions with GROUP BY to generate business intelligence reports from raw data.

### 4. Subqueries
```sql
-- Find users who have spent more than average
SELECT Username, TotalSpent
FROM (
    SELECT 
        u.Username,
        SUM(o.TotalAmount) as TotalSpent
    FROM users u
    JOIN orders o ON u.UserID = o.UserID
    GROUP BY u.UserID
) as UserSpending
WHERE TotalSpent > (
    SELECT AVG(TotalAmount)
    FROM orders
);
```

This example shows how subqueries can be used both in the FROM clause and as a scalar value for comparison, enabling complex filtering operations.

### 5. Conditional Logic with CASE
```sql
-- Stock level categorization
SELECT 
    Name,
    Stock,
    CASE 
        WHEN Stock = 0 THEN 'Out of Stock'
        WHEN Stock < 10 THEN 'Low Stock'
        WHEN Stock < 30 THEN 'Moderate Stock'
        ELSE 'Good Stock'
    END as StockStatus
FROM products
ORDER BY Stock ASC;
```

CASE expressions bring procedural programming concepts into SQL, allowing for dynamic categorization and customized output formatting.

## SQL Data Manipulation Demonstrations

### 1. Product Management

#### A. Adding Products
```sql
-- Add a single new product
INSERT INTO products (Name, Description, Price, Stock, ImageURL)
VALUES ('Miami Heat Snapback', 'Official NBA Miami Heat Cap', 1299.99, 30, 'https://example.com/heat-cap.jpg');

-- Add multiple products in one command
INSERT INTO products (Name, Description, Price, Stock, ImageURL) VALUES 
    ('Boston Celtics Cap', 'Green Classic Snapback', 1199.99, 25, 'https://example.com/celtics-cap.jpg'),
    ('Lakers Purple Cap', 'LA Lakers Special Edition', 1399.99, 20, 'https://example.com/lakers-cap.jpg');
```

#### B. Viewing Products
```sql
-- Basic product listing
SELECT * FROM products;

-- Formatted product display
SELECT 
    ProductID,
    Name,
    printf("₱%.2f", Price) as Price,
    Stock,
    CreatedAt
FROM products;

-- Low stock alerts
SELECT Name, Stock 
FROM products 
WHERE Stock < 10
ORDER BY Stock ASC;
```

#### C. Updating Products
```sql
-- Update single field
UPDATE products 
SET Price = 1599.99 
WHERE Name = 'New Era Yankees Cap';

-- Update multiple fields
UPDATE products 
SET 
    Description = 'Limited Edition Yankees Cap',
    Price = 1799.99,
    Stock = Stock + 10
WHERE Name = 'New Era Yankees Cap';

-- Bulk price increase (10% for all products)
UPDATE products 
SET Price = Price * 1.10;
```

#### D. Deleting Products
```sql
-- Remove specific product
DELETE FROM products 
WHERE ProductID = 1;

-- Remove out-of-stock products
DELETE FROM products 
WHERE Stock = 0;

-- Remove products not sold in last 30 days
DELETE FROM products 
WHERE ProductID NOT IN (
    SELECT DISTINCT ProductID 
    FROM order_details od 
    JOIN orders o ON od.OrderID = o.OrderID 
    WHERE o.CreatedAt >= datetime('now', '-30 days')
);
```

### 2. Sales and Inventory Analysis

#### A. Product Performance Analysis
```sql
-- Sales performance by product
SELECT 
    p.Name,
    p.Price as CurrentPrice,
    COUNT(DISTINCT o.OrderID) as OrderCount,
    SUM(od.Quantity) as UnitsSold,
    printf("₱%.2f", SUM(od.Quantity * od.Price)) as TotalRevenue
FROM products p
LEFT JOIN order_details od ON p.ProductID = od.ProductID
LEFT JOIN orders o ON od.OrderID = o.OrderID
GROUP BY p.ProductID
ORDER BY UnitsSold DESC;

-- Price point analysis
SELECT 
    CASE 
        WHEN Price < 1000 THEN 'Budget (Under ₱1000)'
        WHEN Price < 1500 THEN 'Mid-range (₱1000-₱1500)'
        ELSE 'Premium (₱1500+)'
    END as PriceCategory,
    COUNT(*) as ProductCount,
    printf("₱%.2f", AVG(Price)) as AveragePrice
FROM products
GROUP BY PriceCategory;
```

#### B. Inventory Management
```sql
-- Stock level report
SELECT 
    Name,
    Stock,
    CASE 
        WHEN Stock = 0 THEN 'Out of Stock'
        WHEN Stock < 10 THEN 'Low Stock'
        WHEN Stock < 30 THEN 'Moderate Stock'
        ELSE 'Good Stock'
    END as StockStatus
FROM products
ORDER BY Stock ASC;

-- Reorder suggestion report
SELECT 
    p.Name,
    p.Stock as CurrentStock,
    COALESCE(SUM(od.Quantity), 0) as MonthlyDemand,
    CASE 
        WHEN p.Stock < COALESCE(SUM(od.Quantity), 0) * 0.5 
        THEN 'Reorder Needed'
        ELSE 'Stock Adequate'
    END as ReorderStatus
FROM products p
LEFT JOIN order_details od ON p.ProductID = od.ProductID
LEFT JOIN orders o ON od.OrderID = o.OrderID
WHERE o.CreatedAt >= datetime('now', '-30 days')
GROUP BY p.ProductID;
```

### 3. Transaction Examples

#### A. Processing a New Order
```sql
BEGIN TRANSACTION;
    -- Create new order
    INSERT INTO orders (UserID, TotalAmount, Status) 
    VALUES (1, 2999.98, 'pending');
    
    -- Get the new order ID
    SELECT last_insert_rowid();
    
    -- Add order details
    INSERT INTO order_details (OrderID, ProductID, Quantity, Price)
    VALUES 
        (last_insert_rowid(), 1, 2, 1499.99);
    
    -- Update product stock
    UPDATE products 
    SET Stock = Stock - 2
    WHERE ProductID = 1;
    
    -- Verify stock didn't go negative
    SELECT Stock FROM products WHERE ProductID = 1;
    
    -- If everything is okay
    COMMIT;
    -- If there's an issue
    -- ROLLBACK;
```

#### B. Canceling an Order
```sql
BEGIN TRANSACTION;
    -- Store order details for stock restoration
    CREATE TEMPORARY TABLE temp_restore AS
    SELECT ProductID, Quantity
    FROM order_details
    WHERE OrderID = ?;
    
    -- Restore stock
    UPDATE products
    SET Stock = Stock + (
        SELECT Quantity 
        FROM temp_restore 
        WHERE ProductID = products.ProductID
    )
    WHERE ProductID IN (SELECT ProductID FROM temp_restore);
    
    -- Update order status
    UPDATE orders 
    SET Status = 'cancelled' 
    WHERE OrderID = ?;
    
    -- Add to order history
    INSERT INTO order_history (OrderID, OldStatus, NewStatus)
    VALUES (?, 'pending', 'cancelled');
    
    DROP TABLE temp_restore;
COMMIT;
```

## Common SQLite Commands for Presentation

```sql
-- Start SQLite with the database
sqlite3 ./data/lab.db

-- Configure output format
.headers on       -- Show column headers
.mode column     -- Align output in columns
.width 15 10 30  -- Set column widths

-- Useful commands
.tables          -- List all tables
.schema products -- Show table schema
.indexes         -- List all indexes
.quit           -- Exit SQLite

-- Export results to CSV (useful for analysis)
.mode csv
.output report.csv
SELECT * FROM products;
.output stdout
```

## Database Best Practices Demonstrated

1. **Data Integrity**
   - Use of transactions for multi-step operations
   - Foreign key constraints
   - NOT NULL constraints where appropriate
   - UNIQUE constraints for business rules
   - DEFAULT values for standard fields

2. **Performance Optimization**
   - Proper indexing on frequently queried fields
   - Efficient JOIN operations
   - Prepared statements for repeated queries
   - Transaction management for bulk operations

3. **Security**
   - Input validation
   - Parameterized queries
   - Role-based access control
   - Password hashing
   - Audit trailing

4. **Maintainability**
   - Consistent naming conventions
   - Clear table relationships
   - Documented constraints
   - Version control for schema changes

## Frontend Architecture

### Component Structure

The ZaneMNL frontend is built using React with TypeScript and follows a component-based architecture that promotes reusability and maintainability:

1. **Layout Components**
   - `Header` - Contains navigation, search, and cart summary
   - `Footer` - Site map, contact information, and social links
   - `Layout` - Wrapper component that includes Header and Footer

2. **Page Components**
   - `HomePage` - Featured products and categories
   - `ProductListPage` - Displays all products with filtering and sorting
   - `ProductDetailPage` - Individual product information and "Add to Cart"
   - `CartPage` - View cart contents, update quantities, and checkout
   - `CheckoutPage` - Multi-step form for shipping, payment, and order review
   - `OrderHistoryPage` - List of past orders and status
   - `ProfilePage` - User information and settings
   - `AdminDashboard` - Product and order management for admin users

3. **Reusable UI Components**
   - `ProductCard` - Standardized product display
   - `CartItem` - Individual item in cart with quantity controls
   - `PriceDisplay` - Formatted price with currency symbol
   - `QuantitySelector` - +/- controls for changing quantities
   - `StatusBadge` - Visual indicator for order status
   - `Modal` - Reusable dialog component
   - `LoadingSpinner` - Visual feedback during data fetching

### State Management

The application uses a combination of state management approaches:

1. **React Context API**
   - `AuthContext` - Manages user authentication state
   - `CartContext` - Handles cart items and operations
   - `NotificationContext` - Manages application-wide alerts

2. **Local Component State**
   - Used for UI-specific state like form inputs, sorting options, and filters

3. **API Data Caching**
   - Implemented using React Query for efficient data fetching and caching
   - Reduces unnecessary network requests
   - Provides loading and error states automatically

### API Integration

The frontend communicates with the Go backend through RESTful API endpoints:

```typescript
// Example API service for products
import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

export const fetchProducts = async (filters = {}) => {
  const response = await axios.get(`${API_URL}/products`, { params: filters });
  return response.data;
};

export const fetchProductById = async (productId) => {
  const response = await axios.get(`${API_URL}/products/${productId}`);
  return response.data;
};

export const addToCart = async (productId, quantity, token) => {
  const response = await axios.post(
    `${API_URL}/cart`, 
    { productId, quantity },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};
```

### User Interface Features

The application implements several UI/UX features to enhance the shopping experience:

1. **Responsive Design**
   - Mobile-first approach with responsive breakpoints
   - Flexbox and CSS Grid for adaptive layouts

2. **Product Browsing**
   - Infinite scroll for product listings
   - Quick view modals for product details
   - Image galleries with zoom capability
   - Filter and sort options (price, name, newest)

3. **Shopping Cart**
   - Persistent cart between sessions
   - Real-time stock validation
   - Quantity adjustments with stock limits
   - Cart summary with subtotal calculation

4. **Checkout Process**
   - Multi-step form with progress indicator
   - Form validation with error messaging
   - Address autocompletion
   - Order summary
   - Payment method selection

5. **User Account Management**
   - Registration and login forms
   - Order history with tracking
   - Profile management
   - Saved shipping addresses

## API Endpoints

The backend provides the following RESTful API endpoints that connect the frontend to the database:

### Product Endpoints
- `GET /api/products` - Retrieve all products with optional filtering
- `GET /api/products/:id` - Retrieve a specific product by ID
- `POST /api/products` - Create a new product (admin only)
- `PUT /api/products/:id` - Update a product (admin only)
- `DELETE /api/products/:id` - Delete a product (admin only)

### User Endpoints
- `POST /api/auth/register` - Create a new user account
- `POST /api/auth/login` - Authenticate user and receive token
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile

### Cart Endpoints
- `GET /api/cart` - Retrieve current user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:itemId` - Update cart item quantity
- `DELETE /api/cart/:itemId` - Remove item from cart

### Order Endpoints
- `POST /api/orders` - Create a new order from cart
- `GET /api/orders` - Get user's order history
- `GET /api/orders/:id` - Get specific order details
- `PUT /api/orders/:id/status` - Update order status (admin only)

### Admin Endpoints
- `GET /api/admin/orders` - Get all orders (admin only)
- `GET /api/admin/users` - Get all users (admin only)
- `GET /api/admin/stats` - Get sales statistics (admin only)

## Project Technical Stack

- **Backend**: 
  - Go (Gin framework) - High-performance web framework
  - SQLite3 - Embedded SQL database
  - JWT - Token-based authentication

- **Frontend**: 
  - React 18 - UI library
  - TypeScript - Type-safe JavaScript
  - React Router - Client-side routing
  - React Query - Data fetching and caching
  - Tailwind CSS - Utility-first styling
  - Axios - HTTP client

- **DevOps**:
  - Docker - Containerization
  - GitHub Actions - CI/CD
  - ESLint/Prettier - Code quality tools

## Project Demonstration

For the project presentation to the professor, prepare to demonstrate the following key aspects:

1. **Database Operations**
   - Run sample queries from the SQL Data Manipulation section
   - Show transaction execution with rollback scenarios
   - Demonstrate joins and complex queries in action

2. **Application Walkthrough**
   - User registration and login
   - Product browsing and filtering
   - Add to cart functionality
   - Checkout process
   - Order management
   - Admin dashboard (if applicable)

3. **SQL Integration Points**
   - How frontend actions trigger database operations
   - Data flow from user interface to database and back
   - Error handling and validation

4. **Performance Considerations**
   - Indexing strategy
   - Query optimization techniques
   - Connection management

Prepare specific examples for each section to clearly demonstrate your understanding of database concepts and their application in a real-world e-commerce platform. 

## Step-by-Step Demonstration Guide for Beginners

This section provides a practical script you can follow during your presentation to demonstrate key database concepts. Copy these examples exactly to avoid errors during your demo.

### 1. Database Connection and Setup

```bash
# Navigate to the project directory
cd ZaneMNL

# Start SQLite with the database
sqlite3 ./data/lab.db

# Set up prettier output (always do this first)
.mode column
.headers on
.width 20 15 40 10
```

### 2. Basic Database Exploration

```sql
-- List all tables in the database
.tables

-- See the structure of important tables
.schema users
.schema products
.schema orders
.schema order_details

-- Check how many records are in each table
SELECT COUNT(*) AS TotalUsers FROM users;
SELECT COUNT(*) AS TotalProducts FROM products;
SELECT COUNT(*) AS TotalOrders FROM orders;
```

### 3. Demonstrating Simple Queries

```sql
-- Show all products with price and stock
SELECT ProductID, Name, Price, Stock FROM products;

-- Find expensive products (over ₱1500)
SELECT Name, Price FROM products WHERE Price > 1500 ORDER BY Price DESC;

-- Find products that are low in stock (less than 10)
SELECT Name, Stock FROM products WHERE Stock < 10;
```

### 4. Demonstrating Relationships (JOIN Operations)

```sql
-- Show users and their orders
SELECT u.UserID, u.Username, o.OrderID, o.TotalAmount, o.Status
FROM users u
JOIN orders o ON u.UserID = o.UserID
LIMIT 5;

-- Show what products are in a specific order (change OrderID as needed)
SELECT o.OrderID, p.Name AS ProductName, od.Quantity, od.Price
FROM orders o
JOIN order_details od ON o.OrderID = od.OrderID
JOIN products p ON od.ProductID = p.ProductID
WHERE o.OrderID = 1;
```

### 5. Demonstrating Transaction (Create a New Product)

```sql
-- Begin transaction
BEGIN TRANSACTION;

-- Insert a new product
INSERT INTO products (Name, Description, Price, Stock, ImageURL)
VALUES ('CS107L Cap', 'Special Edition Cap for Database Class', 1299.99, 10, 'https://example.com/cs107-cap.jpg');

-- See the new product
SELECT * FROM products WHERE Name = 'CS107L Cap';

-- Commit (to save changes) or Rollback (to cancel)
COMMIT;
-- ROLLBACK;  -- Uncomment this and comment the COMMIT to demonstrate rollback
```

### 6. Demonstrating Aggregation and Grouping

```sql
-- Calculate total value of inventory by product
SELECT Name, Price, Stock, (Price * Stock) AS InventoryValue
FROM products
ORDER BY InventoryValue DESC
LIMIT 5;

-- Count products by price range
SELECT 
    CASE 
        WHEN Price < 1000 THEN 'Budget (Under ₱1000)'
        WHEN Price < 1500 THEN 'Mid-range (₱1000-₱1500)'
        ELSE 'Premium (₱1500+)'
    END AS PriceCategory,
    COUNT(*) AS ProductCount
FROM products
GROUP BY PriceCategory;
```

### 7. Demonstration Cleanup (if needed)

```sql
-- Remove the demonstration product we added
DELETE FROM products WHERE Name = 'CS107L Cap';

-- Exit SQLite
.quit
```

### Presentation Tips for Beginners

1. **Practice the commands** beforehand so you're comfortable typing them during the demo
2. **Copy commands to a text file** that you can quickly copy-paste if needed
3. **Focus on explaining the WHY** behind each query, not just what it does
4. **If something goes wrong**, stay calm and explain what happened - professors often value seeing how you handle errors
5. **Prepare answers** to these common questions:
   - How did you decide on this database schema?
   - How does this database maintain data integrity?
   - How would you optimize this query if it were running slowly? 