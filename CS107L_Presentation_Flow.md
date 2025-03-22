# ZaneMNL E-Commerce Platform - Presentation Flow

## 1. Introduction (2 minutes)
- Project overview: ZaneMNL as an e-commerce platform for cap merchandise
- Technical stack: Go backend, React frontend, SQLite database
- Learning objectives covered in CS107L

## 2. Database Design (5 minutes)
- Present Entity-Relationship Diagram
- Explain database schema design choices:
  - Users, Products, Cart Items, Orders, Order Details, Order History
- Highlight key constraints and relationships
- Show how data integrity is maintained

## 3. Live Database Exploration (5 minutes)
```bash
# Connect to database
sqlite3 ./data/lab.db

# Set up display formatting
.mode column
.headers on
.width 20 15 40 10
```

```sql
-- List tables and schemas
.tables
.schema users
.schema products

-- Basic data overview
SELECT COUNT(*) AS TotalUsers FROM users;
SELECT COUNT(*) AS TotalProducts FROM products;
SELECT COUNT(*) AS TotalOrders FROM orders;
```

## 4. Key SQL Concepts Demonstration (10 minutes)

### Simple Queries
```sql
-- Product listing with price and stock
SELECT ProductID, Name, Price, Stock FROM products;

-- Filtered products (price over ₱1500)
SELECT Name, Price FROM products 
WHERE Price > 1500 
ORDER BY Price DESC;
```

### Joins
```sql
-- Users and their orders
SELECT u.UserID, u.Username, o.OrderID, o.TotalAmount, o.Status
FROM users u
JOIN orders o ON u.UserID = o.UserID
LIMIT 5;

-- Products in a specific order
SELECT o.OrderID, p.Name AS ProductName, od.Quantity, od.Price
FROM orders o
JOIN order_details od ON o.OrderID = od.OrderID
JOIN products p ON od.ProductID = p.ProductID
WHERE o.OrderID = 1;
```

### Aggregation and Grouping
```sql
-- Inventory valuation
SELECT Name, Price, Stock, (Price * Stock) AS InventoryValue
FROM products
ORDER BY InventoryValue DESC
LIMIT 5;

-- Products by price category
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

### Transaction Demo
```sql
-- Begin transaction
BEGIN TRANSACTION;

-- Insert new product
INSERT INTO products (Name, Description, Price, Stock, ImageURL)
VALUES ('CS107L Cap', 'Special Edition Cap for Database Class', 1299.99, 10, 'https://example.com/cs107-cap.jpg');

-- Verify insertion
SELECT * FROM products WHERE Name = 'CS107L Cap';

-- Commit changes
COMMIT;
```

## 5. Application Demo (8 minutes)
- Start the backend server:
  ```bash
  go run cmd/api/main.go
  ```
- Start the frontend application:
  ```bash
  cd frontend
  npm start
  ```
- Live walkthrough:
  - User registration/login
  - Product browsing and filtering
  - Add to cart functionality
  - Checkout process
  - Order tracking

## 6. Advanced SQL Features (5 minutes)

### Complex Analysis Queries
```sql
-- Product performance analysis
SELECT 
    p.Name,
    COUNT(DISTINCT o.OrderID) as OrderCount,
    SUM(od.Quantity) as UnitsSold,
    printf("₱%.2f", SUM(od.Quantity * od.Price)) as TotalRevenue
FROM products p
LEFT JOIN order_details od ON p.ProductID = od.ProductID
LEFT JOIN orders o ON od.OrderID = o.OrderID
GROUP BY p.ProductID
ORDER BY UnitsSold DESC;

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

### Subqueries
```sql
-- Find users who spent more than average
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

## 7. Database Best Practices (3 minutes)
- Data Integrity implementation
- Performance Optimization techniques
- Security measures
- Maintainability considerations

## 8. Integration with Frontend (2 minutes)
- Connection between React components and database
- API endpoints overview
- State management approach

## 9. Q&A Session (5 minutes)
- Be prepared for questions about:
  - Schema design decisions
  - Query optimization
  - Transaction management
  - Error handling
  - Future improvements

## 10. Conclusion (2 minutes)
- Key takeaways from the project
- Skills developed
- Lessons learned
- Thank your audience

## Backup Queries (If Time Permits)
```sql
-- Order status distribution
SELECT Status, COUNT(*) as OrderCount
FROM orders
GROUP BY Status;

-- Top spending customers
SELECT u.Username, SUM(o.TotalAmount) as TotalSpent
FROM users u
JOIN orders o ON u.UserID = o.UserID
GROUP BY u.UserID
ORDER BY TotalSpent DESC
LIMIT 5;
``` 