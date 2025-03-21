# Potential Questions for CS107L Database Project Presentation

## Basic SQL Operations

1. **Show me how to retrieve all products with their current stock levels.**
   - *Expected query:* `SELECT ProductID, Name, Price, Stock FROM products;`

2. **How would you find all users who registered in the last 30 days?**
   - *Expected query:* `SELECT UserID, Username, Email, CreatedAt FROM users WHERE CreatedAt >= datetime('now', '-30 days');`

3. **Show me how to list all orders with a 'pending' status.**
   - *Expected query:* `SELECT OrderID, UserID, TotalAmount, CreatedAt FROM orders WHERE Status = 'pending';`

## Data Relationships & Joins

4. **How would you display all products that a specific user has ordered?**
   - *Expected query:* 
   ```sql
   SELECT DISTINCT p.ProductID, p.Name 
   FROM products p
   JOIN order_details od ON p.ProductID = od.ProductID
   JOIN orders o ON od.OrderID = o.OrderID
   WHERE o.UserID = ?;
   ```

5. **Show me how to find all users who have never placed an order.**
   - *Expected query:* 
   ```sql
   SELECT UserID, Username, Email 
   FROM users 
   WHERE UserID NOT IN (SELECT DISTINCT UserID FROM orders);
   ```

6. **How would you retrieve the complete order history for a specific user with product details?**
   - *Expected query:* 
   ```sql
   SELECT o.OrderID, o.CreatedAt, o.Status, o.TotalAmount, 
          p.Name as ProductName, od.Quantity, od.Price
   FROM orders o
   JOIN order_details od ON o.OrderID = od.OrderID
   JOIN products p ON od.ProductID = p.ProductID
   WHERE o.UserID = ?
   ORDER BY o.CreatedAt DESC;
   ```

## Aggregation & Analysis

7. **How much has a specific user spent in total on our platform?**
   - *Expected query:* 
   ```sql
   SELECT u.Username, SUM(o.TotalAmount) as TotalSpent
   FROM users u
   JOIN orders o ON u.UserID = o.UserID
   WHERE u.UserID = ?
   GROUP BY u.UserID;
   ```

8. **What is our top-selling product in terms of units sold?**
   - *Expected query:* 
   ```sql
   SELECT p.Name, SUM(od.Quantity) as TotalUnitsSold
   FROM products p
   JOIN order_details od ON p.ProductID = od.ProductID
   GROUP BY p.ProductID
   ORDER BY TotalUnitsSold DESC
   LIMIT 1;
   ```

9. **How would you calculate the average order value for each month of the current year?**
   - *Expected query:* 
   ```sql
   SELECT 
       strftime('%m', CreatedAt) as Month,
       printf("₱%.2f", AVG(TotalAmount)) as AverageOrderValue,
       COUNT(*) as NumberOfOrders
   FROM orders
   WHERE CreatedAt >= datetime('now', 'start of year')
   GROUP BY Month
   ORDER BY Month;
   ```

## Transaction Management

10. **Walk me through the SQL transaction you would use to place a new order, ensuring stock levels are updated correctly.**
    - *Expected explanation:* A transaction with order creation, order detail insertion, and stock update with checks for adequate inventory

11. **How would you handle a situation where an order needs to be canceled and stock returned to inventory?**
    - *Expected query involves transaction with:*
    ```sql
    BEGIN TRANSACTION;
        -- Update stock levels
        -- Update order status
        -- Log in order history
    COMMIT;
    ```

## Performance & Optimization

12. **Which indexes have you created for this database and why?**
    - *Expected discussion:* Indexes on foreign keys, frequently filtered fields, etc.

13. **Show me a query that might benefit from optimization and explain how you would improve it.**
    - *Expected response:* Identifying a complex query and discussing indexing, query restructuring, etc.

14. **How would you identify the slowest queries in your application?**
    - *Expected response:* Discussion of query profiling, SQLite's explain query plan, etc.

## Security & Data Integrity

15. **How does your database design enforce referential integrity?**
    - *Expected response:* Discussion of foreign key constraints

16. **Show me how you prevent SQL injection in your application.**
    - *Expected response:* Discussion of prepared statements, parameter binding

17. **How do you ensure that a product's stock never goes negative?**
    - *Expected response:* Combination of CHECK constraints and transaction validation

## Advanced SQL Features

18. **Demonstrate a query using a Common Table Expression (CTE) to solve a business problem.**
    - *Example query:* 
    ```sql
    WITH MonthlyRevenue AS (
        SELECT 
            strftime('%Y-%m', CreatedAt) as Month,
            SUM(TotalAmount) as Revenue
        FROM orders
        GROUP BY Month
    )
    SELECT 
        Month, 
        Revenue,
        LAG(Revenue) OVER (ORDER BY Month) as PreviousMonthRevenue,
        (Revenue - LAG(Revenue) OVER (ORDER BY Month)) as MonthlyChange
    FROM MonthlyRevenue
    ORDER BY Month;
    ```

19. **Show me a query using window functions to rank products by their sales performance.**
    - *Expected query:* 
    ```sql
    SELECT 
        p.Name,
        SUM(od.Quantity) as TotalSold,
        RANK() OVER (ORDER BY SUM(od.Quantity) DESC) as SalesRank
    FROM products p
    JOIN order_details od ON p.ProductID = od.ProductID
    GROUP BY p.ProductID
    ORDER BY SalesRank;
    ```

20. **Create a query that identifies products that are frequently purchased together.**
    - *Expected query:* A query involving self-join on order_details to find co-occurring products

## Business Intelligence

21. **How would you identify our most valuable customers?**
    - *Expected query:* 
    ```sql
    SELECT 
        u.UserID, 
        u.Username,
        COUNT(DISTINCT o.OrderID) as OrderCount,
        SUM(o.TotalAmount) as TotalSpent,
        AVG(o.TotalAmount) as AverageOrderValue
    FROM users u
    JOIN orders o ON u.UserID = o.UserID
    GROUP BY u.UserID
    ORDER BY TotalSpent DESC
    LIMIT 10;
    ```

22. **Can you show me a query that analyzes our sales trends over time?**
    - *Expected query:* Time-based aggregation with growth calculations

23. **How would you determine which products we should consider discontinuing due to poor sales?**
    - *Expected query:* Analysis combining sales data, inventory costs, and time on shelf

## Database Design Questions

24. **Why did you choose this particular schema for your e-commerce database?**
    - *Expected response:* Discussion of normalization, relationships, and business requirements

25. **If you were to add a product review feature, how would you modify your database schema?**
    - *Expected response:* New table design with appropriate relationships

26. **How does your database design handle product price changes over time?**
    - *Expected response:* Discussion of price history in order_details vs. current price in products

## Error Handling

27. **How do you handle situations where a user tries to order more units than are in stock?**
    - *Expected response:* Transaction rollback with appropriate error messaging

28. **What happens in your system if a payment fails during the checkout process?**
    - *Expected response:* Discussion of transaction isolation and status management

29. **How would you recover from a database corruption scenario?**
    - *Expected response:* Discussion of backup strategies and recovery procedures

30. **Demonstrate a query to identify inconsistencies in your data, such as orders with no order details.**
    - *Expected query:* 
    ```sql
    SELECT o.OrderID
    FROM orders o
    LEFT JOIN order_details od ON o.OrderID = od.OrderID
    WHERE od.OrderDetailID IS NULL;
    ``` 