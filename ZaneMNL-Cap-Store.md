# ZaneMNL Cap Store
## Information System Documentation

## Company History
ZaneMNL is a specialized cap store that was established to provide high-quality, authentic caps from popular brands. The company focuses on offering premium headwear products to fashion-conscious consumers. ZaneMNL was founded with the mission to deliver authenticated cap products with exceptional customer service.

## Type of Business
ZaneMNL operates as an e-commerce retail business specializing in caps and headwear. The business model is primarily B2C (Business-to-Consumer), selling directly to end customers through an online platform.

## Type of Products or Services
ZaneMNL specializes in the following products:
- Premium baseball caps (New Era, LA Dodgers, etc.)
- Basketball team caps (Chicago Bulls, etc.)
- Fitted caps
- Snapback caps
- Custom-designed caps

The business focuses on authenticity and quality, ensuring all products are genuine brand merchandise.

## Organization Structure
ZaneMNL follows a hierarchical organizational structure:

1. **Owner/CEO**: Oversees the entire business operations
2. **Store Manager**: Manages day-to-day operations
3. **Inventory Manager**: Handles stock and product management
4. **Sales Associates**: Process orders and assist customers
5. **IT Administrator**: Maintains the e-commerce platform

## Job Title and Database Manipulation Functions

### Store Manager
- **Data Encoded**: New product information, staff accounts, price adjustments
- **Data Updated**: Product prices, inventory levels, staff information
- **Data Deleted**: Discontinued products, former staff accounts
- **Data Retrieved**: Sales reports, inventory reports, staff performance
- **Information Processed**: Monthly sales analytics, performance metrics

### Inventory Manager
- **Data Encoded**: New inventory, product details, stock levels
- **Data Updated**: Stock counts, product descriptions, product images
- **Data Deleted**: Obsolete inventory records
- **Data Retrieved**: Low stock alerts, product performance data
- **Information Processed**: Inventory forecasting, restock requirements

### Sales Associate
- **Data Encoded**: Customer orders, customer information
- **Data Updated**: Order status, customer details
- **Data Deleted**: Canceled orders
- **Data Retrieved**: Product information, customer order history
- **Information Processed**: Order fulfillment status, shipping information

### Customer (System User)
- **Data Encoded**: Personal information, order details
- **Data Updated**: Account details, cart items
- **Data Deleted**: Cart items, account (upon request)
- **Data Retrieved**: Product catalog, order status
- **Information Processed**: Order confirmations, shipping updates

## Type of Information System
ZaneMNL utilizes a comprehensive e-commerce information system that combines:

1. **Transaction Processing System (TPS)**: Handles day-to-day business transactions including order processing, inventory management, and payment processing.

2. **Customer Relationship Management (CRM)**: Manages customer information, purchase history, and preferences to improve customer service.

3. **Management Information System (MIS)**: Provides reports and analytics to support management decision-making regarding inventory, sales, and marketing strategies.

4. **Inventory Management System**: Tracks product availability, manages stock levels, and automates reordering processes.

## Specific Information System Features

1. **User Authentication and Authorization**
   - Secure login system with role-based access control
   - Password encryption and security measures
   - Session management

2. **Product Management**
   - Product catalog with detailed product information
   - Inventory tracking with stock level alerts
   - Image and description management

3. **Order Processing**
   - Shopping cart functionality
   - Checkout process with shipping information
   - Payment integration
   - Order status tracking

4. **Customer Management**
   - Customer profile management
   - Order history tracking
   - Address and payment method storage

5. **Reporting and Analytics**
   - Sales performance reports
   - Inventory status reports
   - Customer behavior analytics

## Business Rules

1. **Customer Registration**
   - Customers must register with a unique email address
   - Password must meet security requirements
   - Email verification required for account activation

2. **Order Processing**
   - One customer can place multiple orders
   - Orders cannot be placed for out-of-stock items
   - Payment must be verified before order fulfillment
   - Order status updates trigger customer notifications
   - Customers can only view their own orders

3. **Inventory Management**
   - Product prices cannot be negative
   - Stock levels are automatically updated when orders are placed
   - Low stock alerts trigger at predefined thresholds
   - Products cannot be sold below minimum price thresholds

4. **Employee Access Control**
   - Manager can access all system features
   - Inventory Manager can only modify product information
   - Sales Associates can only process orders and update order status
   - One employee assists one customer at a time through the order processing

5. **Cart Management**
   - Customers can add multiple products to their cart
   - Cart items are saved until checkout or manual removal
   - Quantity cannot exceed available stock

## Information System Features Demonstration

### Data Manipulation Language Examples

#### 1. INSERT Operations
```sql
-- Adding a new product
INSERT INTO products (Name, Description, Price, ImageURL, Stock)
VALUES ('Supreme Snapback', 'Limited Edition Supreme Snapback Cap', 1999.99, '/assets/supreme.png', 25);

-- Registering a new user
INSERT INTO users (Username, Email, Password, Role)
VALUES ('john_doe', 'john@example.com', 'hashedpassword123', 'customer');

-- Adding item to cart
INSERT INTO cart_items (UserID, ProductID, Quantity)
VALUES (1, 3, 2);
```

#### 2. UPDATE Operations
```sql
-- Updating product stock
UPDATE products 
SET Stock = Stock - 5 
WHERE ProductID = 1;

-- Changing order status
UPDATE orders 
SET Status = 'shipped', TrackingNumber = 'ZNL123456789' 
WHERE OrderID = 5;

-- Updating user information
UPDATE users 
SET Email = 'newemail@example.com' 
WHERE UserID = 10;
```

#### 3. DELETE Operations
```sql
-- Removing item from cart
DELETE FROM cart_items 
WHERE UserID = 5 AND ProductID = 2;

-- Cancelling an order
DELETE FROM order_details 
WHERE OrderID = 12;

-- Removing discontinued product
DELETE FROM products 
WHERE ProductID = 7 AND Stock = 0;
```

#### 4. SELECT Operations
```sql
-- Retrieving all products with low stock
SELECT ProductID, Name, Stock 
FROM products 
WHERE Stock < 10;

-- Getting customer orders with status
SELECT o.OrderID, o.TotalAmount, o.Status, o.CreatedAt 
FROM orders o 
JOIN users u ON o.UserID = u.UserID 
WHERE u.Email = 'customer@example.com';

-- Retrieving order details with product information
SELECT p.Name, od.Quantity, od.Price, (od.Quantity * od.Price) AS Subtotal 
FROM order_details od 
JOIN products p ON od.ProductID = p.ProductID 
WHERE od.OrderID = 3;
```

## Database Design

### Entity-Relationship Diagram (Chen Notation)

```
┌─────────────┐       ┌─────────────┐
│   USERS     │       │  PRODUCTS   │
├─────────────┤       ├─────────────┤
│ UserID (PK) │       │ProductID(PK)│
│ Username    │       │ Name        │
│ Email       │◄──┐   │ Description │
│ Password    │   │   │ Price       │
│ Role        │   │   │ ImageURL    │
│ CreatedAt   │   │   │ Stock       │
│ LastLogin   │   │   │ CreatedAt   │
└─────────────┘   │   └─────────────┘
       ▲          │         ▲
       │          │         │
       │          │         │
┌─────────────┐   │   ┌─────────────┐
│   ORDERS    │   │   │ CART_ITEMS  │
├─────────────┤   │   ├─────────────┤
│ OrderID (PK)│   │   │CartItemID(PK)│
│ UserID (FK) ├───┘   │ UserID (FK) ├─────┐
│ Status      │       │ProductID(FK)├─────┤
│ ShipAddress │       │ Quantity    │     │
│ PayMethod   │       └─────────────┘     │
│ TotalAmount │                           │
│ CreatedAt   │                           │
└─────────────┘                           │
       │                                  │
       │                                  │
       ▼                                  │
┌─────────────┐                           │
│ORDER_DETAILS│                           │
├─────────────┤                           │
│OrderDetID(PK)│                          │
│ OrderID (FK)│                           │
│ProductID(FK)├───────────────────────────┘
│ Quantity    │
│ Price       │
└─────────────┘
```

### Relational Schema with Primary and Foreign Keys

```
users (UserID, Username, Email, Password, Role, CreatedAt, LastLogin)
  PK: UserID

products (ProductID, Name, Description, Price, ImageURL, Stock, CreatedAt)
  PK: ProductID

orders (OrderID, UserID, Status, ShippingAddress, PaymentMethod, TotalAmount, CreatedAt, PaymentVerified, PaymentReference, TrackingNumber)
  PK: OrderID
  FK: UserID references users(UserID)

order_details (OrderDetailID, OrderID, ProductID, Quantity, Price)
  PK: OrderDetailID
  FK: OrderID references orders(OrderID)
  FK: ProductID references products(ProductID)

cart_items (CartItemID, UserID, ProductID, Quantity)
  PK: CartItemID
  FK: UserID references users(UserID)
  FK: ProductID references products(ProductID)

order_history (HistoryID, OrderID, OldStatus, NewStatus, ChangedAt)
  PK: HistoryID
  FK: OrderID references orders(OrderID)
```

### Table Structures with Data Integrity and Entity Key Constraints

#### Users Table
```sql
CREATE TABLE users (
    UserID INTEGER PRIMARY KEY AUTOINCREMENT,
    Username TEXT NOT NULL,
    Email TEXT NOT NULL UNIQUE,
    Password TEXT NOT NULL,
    Role TEXT DEFAULT 'customer',
    CreatedAt TEXT DEFAULT (datetime('now')),
    LastLogin TEXT
);
```
- **Data Integrity**: UNIQUE constraint on Email ensures no duplicate accounts
- **Entity Key**: PRIMARY KEY ensures each user has a unique identifier

#### Products Table
```sql
CREATE TABLE products (
    ProductID INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT NOT NULL UNIQUE,
    Description TEXT,
    Price REAL NOT NULL,
    ImageURL TEXT,
    Stock INTEGER NOT NULL DEFAULT 0,
    CreatedAt TEXT DEFAULT (datetime('now'))
);
```
- **Data Integrity**: NOT NULL constraints ensure essential data is provided
- **Entity Key**: PRIMARY KEY ensures each product has a unique identifier

#### Orders Table
```sql
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
```
- **Data Integrity**: FOREIGN KEY ensures orders are linked to valid users
- **Entity Key**: PRIMARY KEY ensures each order has a unique identifier

#### Order Details Table
```sql
CREATE TABLE order_details (
    OrderDetailID INTEGER PRIMARY KEY AUTOINCREMENT,
    OrderID INTEGER,
    ProductID INTEGER,
    Quantity INTEGER,
    Price REAL,
    FOREIGN KEY (OrderID) REFERENCES orders(OrderID),
    FOREIGN KEY (ProductID) REFERENCES products(ProductID)
);
```
- **Data Integrity**: FOREIGN KEYs ensure order details are linked to valid orders and products
- **Entity Key**: PRIMARY KEY ensures each order detail record has a unique identifier

## System Features Demonstration

### User Login Security
- Secure authentication using JWT (JSON Web Tokens)
- Password encryption and validation
- Role-based access control (customer vs. admin)
- Session management and token expiration

### Product Management
- Adding new products with full details
- Updating product information (price, stock, description)
- Removing discontinued products
- Categorizing and filtering products

### Order Processing
- Shopping cart management
- Checkout process with address and payment details
- Order status tracking and updates
- Order history and details viewing

### Reporting System
- Sales performance analytics
- Inventory level monitoring
- Customer behavior tracking
- Revenue and profit calculation

## Conclusion
ZaneMNL Cap Store utilizes a comprehensive e-commerce information system that enables efficient management of inventory, customer orders, and business operations. The system's database design ensures data integrity and proper relationships between entities, while the user interface provides a seamless experience for both customers and staff. The implementation of rigorous business rules ensures that all transactions are processed accurately and securely. 