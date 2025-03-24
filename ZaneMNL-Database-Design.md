# ZaneMNL Cap Store Database Design

## Entity-Relationship Diagram (Chen Notation)

```
┌───────────────┐                      ┌───────────────┐
│    USERS      │                      │   PRODUCTS    │
├───────────────┤                      ├───────────────┤
│ UserID (PK)   │                      │ ProductID(PK) │
│ Username      │                      │ Name          │
│ Email         │                      │ Description   │
│ Password      │◄─────────────────┐   │ Price         │
│ Role          │                  │   │ ImageURL      │
│ CreatedAt     │                  │   │ Stock         │
│ LastLogin     │                  │   │ CreatedAt     │
└───────┬───────┘                  │   └───────┬───────┘
        │                          │           │
        │ 1                        │           │ 1
        │                          │           │
        │                          │           │
┌───────▼───────┐              ┌───▼───────────▼───┐
│    ORDERS     │              │    CART_ITEMS     │
├───────────────┤              ├───────────────────┤
│ OrderID (PK)  │              │ CartItemID (PK)   │
│ UserID (FK)   │◄─────────────┤ UserID (FK)       │
│ Status        │              │ ProductID (FK)    │
│ ShipAddress   │              │ Quantity          │
│ PayMethod     │              └───────────────────┘
│ TotalAmount   │                        ▲
│ CreatedAt     │                        │
│ PaymentVerify │                        │
│ PayReference  │                        │
│ TrackingNum   │                        │
└───────┬───────┘                        │
        │ 1                              │
        │                                │
        ▼                                │
┌───────────────┐                        │
│ ORDER_DETAILS │                        │
├───────────────┤                        │
│ OrderDetID(PK)│                        │
│ OrderID (FK)  │                        │
│ ProductID(FK) ├────────────────────────┘
│ Quantity      │
│ Price         │
└───────┬───────┘
        │ 1
        │
        ▼
┌───────────────┐
│ ORDER_HISTORY │
├───────────────┤
│ HistoryID(PK) │
│ OrderID (FK)  │
│ OldStatus     │
│ NewStatus     │
│ ChangedAt     │
└───────────────┘
```

## Cardinality Relationships

- One User can have multiple Orders (1:N)
- One User can have multiple Cart Items (1:N)
- One Product can be in multiple Cart Items (1:N) 
- One Product can be in multiple Order Details (1:N)
- One Order can have multiple Order Details (1:N)
- One Order can have multiple Order History entries (1:N)

## Detailed Relational Schema

### Users Table
```
┌─────────────────────────────────────────────────┐
│ USERS                                           │
├────────────┬──────────────┬─────────────────────┤
│ UserID     │ INTEGER      │ PRIMARY KEY         │
│ Username   │ TEXT         │ NOT NULL            │
│ Email      │ TEXT         │ NOT NULL, UNIQUE    │
│ Password   │ TEXT         │ NOT NULL            │
│ Role       │ TEXT         │ DEFAULT 'customer'  │
│ CreatedAt  │ TEXT         │ DEFAULT timestamp   │
│ LastLogin  │ TEXT         │                     │
└────────────┴──────────────┴─────────────────────┘
```

### Products Table
```
┌─────────────────────────────────────────────────┐
│ PRODUCTS                                        │
├────────────┬──────────────┬─────────────────────┤
│ ProductID  │ INTEGER      │ PRIMARY KEY         │
│ Name       │ TEXT         │ NOT NULL, UNIQUE    │
│ Description│ TEXT         │                     │
│ Price      │ REAL         │ NOT NULL            │
│ ImageURL   │ TEXT         │                     │
│ Stock      │ INTEGER      │ NOT NULL, DEFAULT 0 │
│ CreatedAt  │ TEXT         │ DEFAULT timestamp   │
└────────────┴──────────────┴─────────────────────┘
```

### Orders Table
```
┌─────────────────────────────────────────────────────────┐
│ ORDERS                                                  │
├──────────────────┬──────────────┬─────────────────────┬─┤
│ OrderID          │ INTEGER      │ PRIMARY KEY         │ │
│ UserID           │ INTEGER      │ NOT NULL            │─┼──► REFERENCES users(UserID)
│ Status           │ TEXT         │ NOT NULL            │ │
│ ShippingAddress  │ TEXT         │ NOT NULL            │ │
│ PaymentMethod    │ TEXT         │ NOT NULL            │ │
│ TotalAmount      │ REAL         │ NOT NULL            │ │
│ CreatedAt        │ TEXT         │ DEFAULT timestamp   │ │
│ PaymentVerified  │ BOOLEAN      │ DEFAULT 0           │ │
│ PaymentReference │ TEXT         │                     │ │
│ TrackingNumber   │ TEXT         │                     │ │
└──────────────────┴──────────────┴─────────────────────┴─┘
```

### Order Details Table
```
┌─────────────────────────────────────────────────────────┐
│ ORDER_DETAILS                                           │
├────────────────┬──────────────┬────────────────────────┬┤
│ OrderDetailID  │ INTEGER      │ PRIMARY KEY            │ │
│ OrderID        │ INTEGER      │ NOT NULL               │─┼──► REFERENCES orders(OrderID)
│ ProductID      │ INTEGER      │ NOT NULL               │─┼──► REFERENCES products(ProductID)
│ Quantity       │ INTEGER      │ NOT NULL               │ │
│ Price          │ REAL         │ NOT NULL               │ │
└────────────────┴──────────────┴────────────────────────┴┘
```

### Cart Items Table
```
┌─────────────────────────────────────────────────────────┐
│ CART_ITEMS                                              │
├────────────────┬──────────────┬────────────────────────┬┤
│ CartItemID     │ INTEGER      │ PRIMARY KEY            │ │
│ UserID         │ INTEGER      │ NOT NULL               │─┼──► REFERENCES users(UserID)
│ ProductID      │ INTEGER      │ NOT NULL               │─┼──► REFERENCES products(ProductID)
│ Quantity       │ INTEGER      │ NOT NULL, DEFAULT 1    │ │
└────────────────┴──────────────┴────────────────────────┴┘
```

### Order History Table
```
┌─────────────────────────────────────────────────────────┐
│ ORDER_HISTORY                                           │
├────────────────┬──────────────┬────────────────────────┬┤
│ HistoryID      │ INTEGER      │ PRIMARY KEY            │ │
│ OrderID        │ INTEGER      │ NOT NULL               │─┼──► REFERENCES orders(OrderID)
│ OldStatus      │ TEXT         │ NOT NULL               │ │
│ NewStatus      │ TEXT         │ NOT NULL               │ │
│ ChangedAt      │ TEXT         │ DEFAULT timestamp      │ │
└────────────────┴──────────────┴────────────────────────┴┘
```

## Table Structures with Data Integrity and Entity Key Constraints

### Data Integrity Constraints

#### 1. Entity Integrity
- All tables have PRIMARY KEY constraints to ensure each row is uniquely identifiable
- UserID is the primary key for the users table
- ProductID is the primary key for the products table
- OrderID is the primary key for the orders table
- OrderDetailID is the primary key for the order_details table
- CartItemID is the primary key for the cart_items table
- HistoryID is the primary key for the order_history table

#### 2. Referential Integrity
- FOREIGN KEY constraints ensure relationships between tables are maintained
- UserID in orders references UserID in users
- UserID in cart_items references UserID in users
- ProductID in cart_items references ProductID in products
- OrderID in order_details references OrderID in orders
- ProductID in order_details references ProductID in products
- OrderID in order_history references OrderID in orders

#### 3. Domain Integrity
- NOT NULL constraints ensure required data is always provided
- DEFAULT constraints provide fallback values (like 'customer' role)
- TEXT, INTEGER, REAL data types enforce basic type validation
- UNIQUE constraint on Email prevents duplicate user accounts
- UNIQUE constraint on Product Name prevents duplicate products

### SQL Implementation

```sql
-- Users table with integrity constraints
CREATE TABLE users (
    UserID INTEGER PRIMARY KEY AUTOINCREMENT,
    Username TEXT NOT NULL,
    Email TEXT NOT NULL UNIQUE,
    Password TEXT NOT NULL,
    Role TEXT DEFAULT 'customer' CHECK (Role IN ('customer', 'admin', 'manager', 'sales')),
    CreatedAt TEXT DEFAULT (datetime('now')),
    LastLogin TEXT
);

-- Products table with integrity constraints
CREATE TABLE products (
    ProductID INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT NOT NULL UNIQUE,
    Description TEXT,
    Price REAL NOT NULL CHECK (Price > 0),
    ImageURL TEXT,
    Stock INTEGER NOT NULL DEFAULT 0 CHECK (Stock >= 0),
    CreatedAt TEXT DEFAULT (datetime('now'))
);

-- Orders table with integrity constraints
CREATE TABLE orders (
    OrderID INTEGER PRIMARY KEY AUTOINCREMENT,
    UserID INTEGER NOT NULL,
    Status TEXT NOT NULL DEFAULT 'pending' 
        CHECK (Status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    ShippingAddress TEXT NOT NULL,
    PaymentMethod TEXT NOT NULL,
    TotalAmount REAL NOT NULL CHECK (TotalAmount > 0),
    CreatedAt TEXT DEFAULT (datetime('now')),
    PaymentVerified BOOLEAN NOT NULL DEFAULT 0,
    PaymentReference TEXT,
    TrackingNumber TEXT,
    FOREIGN KEY (UserID) REFERENCES users(UserID) ON DELETE RESTRICT
);

-- Order details table with integrity constraints
CREATE TABLE order_details (
    OrderDetailID INTEGER PRIMARY KEY AUTOINCREMENT,
    OrderID INTEGER NOT NULL,
    ProductID INTEGER NOT NULL,
    Quantity INTEGER NOT NULL CHECK (Quantity > 0),
    Price REAL NOT NULL CHECK (Price >= 0),
    FOREIGN KEY (OrderID) REFERENCES orders(OrderID) ON DELETE CASCADE,
    FOREIGN KEY (ProductID) REFERENCES products(ProductID) ON DELETE RESTRICT
);

-- Cart items table with integrity constraints
CREATE TABLE cart_items (
    CartItemID INTEGER PRIMARY KEY AUTOINCREMENT,
    UserID INTEGER NOT NULL,
    ProductID INTEGER NOT NULL,
    Quantity INTEGER NOT NULL DEFAULT 1 CHECK (Quantity > 0),
    FOREIGN KEY (UserID) REFERENCES users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (ProductID) REFERENCES products(ProductID) ON DELETE RESTRICT,
    UNIQUE(UserID, ProductID)
);

-- Order history table with integrity constraints
CREATE TABLE order_history (
    HistoryID INTEGER PRIMARY KEY AUTOINCREMENT,
    OrderID INTEGER NOT NULL,
    OldStatus TEXT NOT NULL,
    NewStatus TEXT NOT NULL,
    ChangedAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (OrderID) REFERENCES orders(OrderID) ON DELETE CASCADE
);
```

## Database Triggers for Additional Constraints

```sql
-- Trigger to automatically update product stock when order is placed
CREATE TRIGGER decrease_stock_after_order
AFTER INSERT ON order_details
FOR EACH ROW
BEGIN
    UPDATE products
    SET Stock = Stock - NEW.Quantity
    WHERE ProductID = NEW.ProductID;
END;

-- Trigger to record order status changes in history
CREATE TRIGGER record_order_status_change
AFTER UPDATE OF Status ON orders
WHEN OLD.Status != NEW.Status
BEGIN
    INSERT INTO order_history (OrderID, OldStatus, NewStatus)
    VALUES (NEW.OrderID, OLD.Status, NEW.Status);
END;

-- Trigger to prevent deletion of products with pending orders
CREATE TRIGGER prevent_product_deletion
BEFORE DELETE ON products
FOR EACH ROW
BEGIN
    SELECT RAISE(ABORT, 'Cannot delete product with pending orders')
    WHERE EXISTS (
        SELECT 1 FROM order_details od
        JOIN orders o ON od.OrderID = o.OrderID
        WHERE od.ProductID = OLD.ProductID AND o.Status != 'delivered'
    );
END;
```

## Indexing Strategy

```sql
-- Indexes for performance optimization
CREATE INDEX idx_users_email ON users(Email);
CREATE INDEX idx_orders_userid ON orders(UserID);
CREATE INDEX idx_orders_status ON orders(Status);
CREATE INDEX idx_order_details_orderid ON order_details(OrderID);
CREATE INDEX idx_order_details_productid ON order_details(ProductID);
CREATE INDEX idx_cart_items_userid ON cart_items(UserID);
CREATE INDEX idx_order_history_orderid ON order_history(OrderID);
``` 