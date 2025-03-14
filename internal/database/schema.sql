-- Users table
CREATE TABLE IF NOT EXISTS users (
    UserID INTEGER PRIMARY KEY AUTOINCREMENT,
    Username TEXT NOT NULL,
    Email TEXT NOT NULL UNIQUE,
    Password TEXT NOT NULL,
    Role TEXT DEFAULT 'customer',
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    LastLogin DATETIME
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    ProductID INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT NOT NULL,
    Brand TEXT NOT NULL,
    Size TEXT NOT NULL,
    Description TEXT,
    Price REAL NOT NULL,
    Stock INTEGER DEFAULT 0
);

-- Payment methods table
CREATE TABLE IF NOT EXISTS payment_methods (
    PaymentMethodID INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT,
    AccountNumber TEXT,
    AccountName TEXT
);

-- Shipping addresses table
CREATE TABLE IF NOT EXISTS shipping_addresses (
    AddressID INTEGER PRIMARY KEY AUTOINCREMENT,
    UserID INTEGER NOT NULL,
    FullName TEXT,
    PhoneNumber TEXT,
    Address TEXT,
    City TEXT,
    Province TEXT,
    PostalCode TEXT,
    FOREIGN KEY (UserID) REFERENCES users(UserID)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    OrderID INTEGER PRIMARY KEY AUTOINCREMENT,
    UserID INTEGER NOT NULL,
    TotalAmount REAL NOT NULL,
    Status TEXT DEFAULT 'pending',
    OrderDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES users(UserID)
);

-- Order details
CREATE TABLE IF NOT EXISTS order_details (
    OrderDetailID INTEGER PRIMARY KEY AUTOINCREMENT,
    OrderID INTEGER,
    ProductID INTEGER,
    Quantity INTEGER,
    Price REAL,
    FOREIGN KEY (OrderID) REFERENCES orders(OrderID),
    FOREIGN KEY (ProductID) REFERENCES products(ProductID)
);

-- Order history table
CREATE TABLE IF NOT EXISTS order_history (
    HistoryID INTEGER PRIMARY KEY AUTOINCREMENT,
    OrderID INTEGER,
    OldStatus TEXT,
    NewStatus TEXT,
    ChangedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    Note TEXT,
    FOREIGN KEY (OrderID) REFERENCES orders(OrderID)
);

-- Cart table
CREATE TABLE IF NOT EXISTS cart (
    CartID INTEGER PRIMARY KEY AUTOINCREMENT,
    UserID INTEGER NOT NULL,
    FOREIGN KEY (UserID) REFERENCES users(UserID)
);

-- Cart contents
CREATE TABLE IF NOT EXISTS cart_contents (
    CartContentID INTEGER PRIMARY KEY AUTOINCREMENT,
    CartID INTEGER,
    ProductID INTEGER,
    Quantity INTEGER DEFAULT 1,
    FOREIGN KEY (CartID) REFERENCES cart(CartID),
    FOREIGN KEY (ProductID) REFERENCES products(ProductID)
);
