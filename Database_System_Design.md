# Database System Design Document

## Business Profile

### Company History
ABC Retail was founded in 2010 by Jane Smith with a vision to revolutionize the local grocery shopping experience. Starting as a single small store, the company has grown to a chain of 15 stores across the metropolitan area, with plans for further expansion into neighboring cities.

### Type of Business
Retail grocery chain specializing in fresh produce, organic foods, and locally-sourced products.

### Type of Products/Services
- Fresh produce (fruits, vegetables)
- Organic food products
- Local specialty items
- Basic grocery essentials
- Home delivery service
- Loyalty program

## Organization Structure

```
CEO
├── Operations Director
│   ├── Store Managers
│   │   └── Floor Staff
│   └── Inventory Manager
│       └── Warehouse Staff
├── Finance Director
│   ├── Accounting Team
│   └── Purchasing Team
└── IT Director
    ├── System Administrators
    └── Database Administrators
```

## Database-Related Job Functions

### Store Manager
**Data Encoded:**
- New employee records
- Schedule information
- Performance reviews

**Data Updated:**
- Employee information
- Store operational parameters
- Promotion configurations

**Data Deleted:**
- Outdated promotions
- Former employee access

**Data Retrieved:**
- Sales reports
- Employee performance metrics
- Inventory levels
- Customer feedback

**Information Processed:**
- Daily sales analysis
- Staff performance evaluation
- Inventory turnover rates

### Inventory Manager
**Data Encoded:**
- New product listings
- Vendor information
- Purchase orders

**Data Updated:**
- Stock levels
- Product information
- Order status

**Data Deleted:**
- Discontinued products
- Outdated vendor contracts

**Data Retrieved:**
- Current inventory levels
- Product performance metrics
- Supplier information
- Low stock alerts

**Information Processed:**
- Stock forecasting
- Vendor performance analysis
- Order fulfillment tracking

### Sales Associate
**Data Encoded:**
- Customer purchases
- New customer accounts
- Customer feedback

**Data Updated:**
- Customer information
- Loyalty points

**Data Deleted:**
- Canceled transactions

**Data Retrieved:**
- Product information
- Customer purchase history
- Discount eligibility

**Information Processed:**
- Transaction completion
- Customer billing
- Loyalty point calculation

## Information System Type
Retail Management Information System (RMIS) with integrated Customer Relationship Management (CRM) and Inventory Management System (IMS) components.

## Information System Features

### Core Features
1. **Inventory Management**
   - Real-time stock tracking
   - Automated reordering
   - Product categorization
   - Batch and expiration tracking

2. **Customer Management**
   - Customer profiles
   - Purchase history
   - Loyalty program management
   - Targeted marketing capabilities

3. **Sales Processing**
   - POS integration
   - Discount management
   - Transaction processing
   - Receipt generation

4. **Reporting and Analytics**
   - Sales performance reports
   - Inventory turnover analysis
   - Customer behavior insights
   - Financial performance tracking

5. **Employee Management**
   - Staff scheduling
   - Performance tracking
   - Access control
   - Commission calculation

## Business Rules

1. Manager generates daily, weekly, and monthly sales reports
2. Sales associates compute customer bills during checkout
3. Manager assigns daily tasks to employees at shift start
4. Manager oversees and maintains department inventory levels
5. One sales associate assists one customer at a time
6. Manager approves all discount rates exceeding 15%
7. Inventory alerts are triggered when stock falls below 10% threshold
8. Customer loyalty points are calculated at 1 point per $10 spent
9. Returns must be processed within 30 days of purchase
10. Store managers can only access data for their assigned store

## Data Manipulation Demonstration

### Insert Operations
```sql
-- Add new product
INSERT INTO Products (ProductID, ProductName, Category, Price, StockLevel, ReorderPoint)
VALUES (1045, 'Organic Apples', 'Produce', 3.99, 150, 50);

-- Add new customer
INSERT INTO Customers (CustomerID, FirstName, LastName, Email, Phone, JoinDate, LoyaltyPoints)
VALUES (5089, 'Michael', 'Johnson', 'mjohnson@email.com', '555-123-4567', '2023-05-15', 0);

-- Record new sale
INSERT INTO Sales (SaleID, CustomerID, EmployeeID, SaleDate, TotalAmount)
VALUES (10456, 5089, 203, '2023-06-10', 45.87);
```

### Update Operations
```sql
-- Update product price
UPDATE Products
SET Price = 4.29
WHERE ProductID = 1045;

-- Update customer loyalty points
UPDATE Customers
SET LoyaltyPoints = LoyaltyPoints + 4
WHERE CustomerID = 5089;

-- Update employee position
UPDATE Employees
SET Position = 'Senior Sales Associate', Salary = 52000
WHERE EmployeeID = 203;
```

### Delete Operations
```sql
-- Remove discontinued product
DELETE FROM Products
WHERE ProductID = 932 AND StockLevel = 0;

-- Delete expired promotion
DELETE FROM Promotions
WHERE EndDate < GETDATE();

-- Remove canceled order
DELETE FROM Orders
WHERE OrderID = 7823 AND Status = 'Canceled';
```

### Select Operations
```sql
-- Retrieve low stock items
SELECT ProductID, ProductName, StockLevel, ReorderPoint
FROM Products
WHERE StockLevel < ReorderPoint;

-- Get top 10 customers by loyalty points
SELECT CustomerID, FirstName, LastName, LoyaltyPoints
FROM Customers
ORDER BY LoyaltyPoints DESC
LIMIT 10;

-- Calculate sales by department this month
SELECT p.Category, SUM(sd.Quantity) AS UnitsSold, SUM(sd.Quantity * sd.UnitPrice) AS Revenue
FROM SaleDetails sd
JOIN Products p ON sd.ProductID = p.ProductID
JOIN Sales s ON sd.SaleID = s.SaleID
WHERE s.SaleDate >= DATEADD(month, -1, GETDATE())
GROUP BY p.Category
ORDER BY Revenue DESC;
```

## System Features Demonstration

### User Login System
```sql
-- Create User table
CREATE TABLE Users (
    UserID INT PRIMARY KEY,
    Username VARCHAR(50) UNIQUE NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    EmployeeID INT REFERENCES Employees(EmployeeID),
    Role VARCHAR(50) NOT NULL,
    LastLogin DATETIME,
    IsActive BIT DEFAULT 1
);

-- Sample login verification query
SELECT UserID, Username, Role, e.FirstName, e.LastName, e.Position
FROM Users u
JOIN Employees e ON u.EmployeeID = e.EmployeeID
WHERE Username = @enteredUsername 
  AND PasswordHash = HASHBYTES('SHA2_256', @enteredPassword)
  AND IsActive = 1;

-- Update last login timestamp
UPDATE Users
SET LastLogin = GETDATE()
WHERE UserID = @loggedInUserID;
```

## Database Design

### Entity-Relationship Diagram (Chen Notation)
[ERD diagram to be presented during presentation]

### Relational Schema with Keys
```
Products (ProductID, ProductName, Category, Price, StockLevel, ReorderPoint, SupplierID)
  PK: ProductID
  FK: SupplierID references Suppliers(SupplierID)

Customers (CustomerID, FirstName, LastName, Email, Phone, JoinDate, LoyaltyPoints)
  PK: CustomerID

Employees (EmployeeID, FirstName, LastName, Position, HireDate, Salary, StoreID)
  PK: EmployeeID
  FK: StoreID references Stores(StoreID)

Stores (StoreID, StoreName, Address, Phone, ManagerID)
  PK: StoreID
  FK: ManagerID references Employees(EmployeeID)

Sales (SaleID, CustomerID, EmployeeID, SaleDate, TotalAmount)
  PK: SaleID
  FK: CustomerID references Customers(CustomerID)
  FK: EmployeeID references Employees(EmployeeID)

SaleDetails (SaleDetailID, SaleID, ProductID, Quantity, UnitPrice)
  PK: SaleDetailID
  FK: SaleID references Sales(SaleID)
  FK: ProductID references Products(ProductID)

Suppliers (SupplierID, SupplierName, ContactPerson, Email, Phone)
  PK: SupplierID

Orders (OrderID, SupplierID, OrderDate, ExpectedDelivery, Status)
  PK: OrderID
  FK: SupplierID references Suppliers(SupplierID)

OrderDetails (OrderDetailID, OrderID, ProductID, Quantity, UnitPrice)
  PK: OrderDetailID
  FK: OrderID references Orders(OrderID)
  FK: ProductID references Products(ProductID)

Users (UserID, Username, PasswordHash, EmployeeID, Role, LastLogin, IsActive)
  PK: UserID
  FK: EmployeeID references Employees(EmployeeID)
```

### Table Structures with Constraints

```sql
CREATE TABLE Products (
    ProductID INT PRIMARY KEY,
    ProductName VARCHAR(100) NOT NULL,
    Category VARCHAR(50) NOT NULL,
    Price DECIMAL(10,2) NOT NULL CHECK (Price >= 0),
    StockLevel INT NOT NULL DEFAULT 0 CHECK (StockLevel >= 0),
    ReorderPoint INT NOT NULL DEFAULT 10 CHECK (ReorderPoint >= 0),
    SupplierID INT,
    FOREIGN KEY (SupplierID) REFERENCES Suppliers(SupplierID)
);

CREATE TABLE Customers (
    CustomerID INT PRIMARY KEY,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Phone VARCHAR(20),
    JoinDate DATE NOT NULL DEFAULT GETDATE(),
    LoyaltyPoints INT NOT NULL DEFAULT 0 CHECK (LoyaltyPoints >= 0)
);

CREATE TABLE Employees (
    EmployeeID INT PRIMARY KEY,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    Position VARCHAR(50) NOT NULL,
    HireDate DATE NOT NULL,
    Salary DECIMAL(10,2) CHECK (Salary >= 0),
    StoreID INT,
    FOREIGN KEY (StoreID) REFERENCES Stores(StoreID)
);

-- Additional table definitions to be displayed during presentation
``` 