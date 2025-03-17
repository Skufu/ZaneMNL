# ZaneMNL E-Commerce Platform - CS107L Database Project

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

## Database Features Implemented

1. **Referential Integrity**
   - Foreign key constraints
   - Cascade delete protection
   - Unique constraints

2. **Transaction Management**
   - ACID compliance
   - Concurrent access handling
   - Rollback support

3. **Indexing**
   - Primary key indexes
   - Foreign key indexes
   - Performance optimization

4. **Data Validation**
   - NOT NULL constraints
   - Default values
   - Check constraints

5. **Audit Trail**
   - Order history tracking
   - Timestamp logging
   - Status change monitoring

## How to Run SQL Demonstrations

1. Start the backend server:
```bash
go run cmd/api/main.go
```

2. Access the SQLite database directly:
```bash
sqlite3 ./data/lab.db
```

3. Common SQLite commands for demonstration:
```sql
.tables           -- List all tables
.schema [table]   -- Show table schema
.headers on       -- Enable column headers
.mode column      -- Pretty print results
```

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