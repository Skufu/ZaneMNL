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
8. [Technical Stack](#project-technical-stack)
9. [Design Principles](#database-design-principles-applied)

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
        - Open System Properties > Advanced > Environment Variables
        - Add `C:\sqlite` to System PATH
     5. Verify installation: `sqlite3 --version`

3. **Install Node.js and npm**
   - Download from [Node.js website](https://nodejs.org/)
   - Choose LTS version
   - Run the installer
   - Verify installation:
     ```bash
     node --version
     npm --version
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

## Project Overview
ZaneMNL is an e-commerce platform specializing in cap merchandise, built using Go for the backend, React for the frontend, and SQLite for the database. This project demonstrates various database concepts and SQL manipulations learned in CS107L.

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

## Project Technical Stack

- **Backend**: Go (Gin framework)
- **Database**: SQLite3
- **Frontend**: React with TypeScript
- **API**: RESTful endpoints
- **Authentication**: JWT tokens

## Database Design Principles Applied

1. **Normalization**
   - Tables are in 3NF
   - Minimal data redundancy
   - Referential integrity

2. **Security**
   - Password hashing
   - Role-based access
   - Input validation

3. **Scalability**
   - Proper indexing
   - Efficient queries
   - Connection pooling

4. **Maintainability**
   - Clear schema design
   - Consistent naming
   - Documentation 