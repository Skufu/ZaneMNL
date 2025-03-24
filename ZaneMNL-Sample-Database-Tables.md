# ZaneMNL Cap Store - Sample Database Tables

Below are the table structures and sample data for all tables in the ZaneMNL Cap Store database.

## USERS Table

The USERS table stores information about registered users, including customers and administrators.

```sql
CREATE TABLE users (
  UserID integer PRIMARY KEY,
  Username text NOT NULL,
  Email text NOT NULL UNIQUE,
  Password text NOT NULL,
  Role text DEFAULT 'customer',
  CreatedAt text DEFAULT CURRENT_TIMESTAMP,
  LastLogin text
);
```

### Sample Data

| UserID | Username | Email | Password | Role | CreatedAt | LastLogin |
|--------|----------|-------|----------|------|-----------|-----------|
| 1 | admin | admin@zanemanila.com | $2a$10$hKl5EuMQQCXm1QhN7xLD3O | admin | 2023-07-15 10:30:00 | 2023-10-15 08:45:12 |
| 2 | johnsmith | john.smith@email.com | $2a$10$aBc123XyZ4567ZzZzYyXxW | customer | 2023-07-20 14:22:35 | 2023-10-14 19:30:45 |
| 3 | mariasantos | maria.santos@email.com | $2a$10$qWe789AbC1234CcCbBaAaA | customer | 2023-08-05 09:15:20 | 2023-10-12 12:10:33 |
| 4 | alexreyes | alex.reyes@email.com | $2a$10$lMn456OpQ7890RrSsTtUuU | customer | 2023-08-10 16:40:18 | 2023-10-15 10:22:17 |
| 5 | sarahcruz | sarah.cruz@email.com | $2a$10$jKi321ZxC9876VvVbNmMmM | customer | 2023-09-01 11:05:29 | 2023-10-13 17:05:50 |

## PRODUCTS Table

The PRODUCTS table contains all available products in the store.

```sql
CREATE TABLE products (
  ProductID integer PRIMARY KEY,
  Name text NOT NULL UNIQUE,
  Description text,
  Price real NOT NULL,
  ImageURL text,
  Stock integer NOT NULL DEFAULT 0,
  CreatedAt text DEFAULT CURRENT_TIMESTAMP
);
```

### Sample Data

| ProductID | Name | Description | Price | ImageURL | Stock | CreatedAt |
|-----------|------|-------------|-------|----------|-------|-----------|
| 1 | Classic Black Cap | Timeless black cap with embroidered logo | 599.00 | /images/products/black-cap.jpg | 45 | 2023-07-10 09:00:00 |
| 2 | Vintage Trucker Cap | Retro-style mesh trucker cap | 649.00 | /images/products/trucker-cap.jpg | 30 | 2023-07-10 09:15:00 |
| 3 | Summer Straw Hat | Lightweight woven straw hat for summer | 799.00 | /images/products/straw-hat.jpg | 25 | 2023-07-10 09:30:00 |
| 4 | Fitted Sports Cap | Athletic fitted cap with moisture-wicking band | 749.00 | /images/products/sports-cap.jpg | 50 | 2023-07-10 09:45:00 |
| 5 | Embroidered Snapback | Custom embroidered snapback with flat brim | 699.00 | /images/products/snapback.jpg | 35 | 2023-07-10 10:00:00 |

## ORDERS Table

The ORDERS table tracks all customer orders with details about status, shipping, and payment.

```sql
CREATE TABLE orders (
  OrderID integer PRIMARY KEY,
  UserID integer NOT NULL,
  Status text NOT NULL DEFAULT 'pending',
  ShippingAddress text NOT NULL,
  PaymentMethod text NOT NULL,
  TotalAmount real NOT NULL,
  CreatedAt text DEFAULT CURRENT_TIMESTAMP,
  PaymentVerified boolean NOT NULL DEFAULT false,
  PaymentReference text,
  TrackingNumber text,
  FOREIGN KEY (UserID) REFERENCES users(UserID)
);
```

### Sample Data

| OrderID | UserID | Status | ShippingAddress | PaymentMethod | TotalAmount | CreatedAt | PaymentVerified | PaymentReference | TrackingNumber |
|---------|--------|--------|-----------------|---------------|-------------|-----------|-----------------|-----------------|----------------|
| 1 | 2 | delivered | 123 Main St, Makati City | gcash | 1248.00 | 2023-09-15 14:30:15 | true | GC123456789 | ZMN150923001 |
| 2 | 3 | shipped | 456 Park Ave, Quezon City | credit_card | 649.00 | 2023-10-02 10:45:22 | true | CC987654321 | ZMN021023002 |
| 3 | 4 | processing | 789 Beach Rd, Manila | cash_on_delivery | 1398.00 | 2023-10-10 16:20:30 | false | NULL | NULL |
| 4 | 5 | pending | 234 Hill St, Pasig City | bank_transfer | 749.00 | 2023-10-15 09:10:40 | false | NULL | NULL |
| 5 | 2 | cancelled | 123 Main St, Makati City | credit_card | 699.00 | 2023-09-20 11:25:35 | false | NULL | NULL |

## ORDER_DETAILS Table

The ORDER_DETAILS table stores the individual items within each order.

```sql
CREATE TABLE order_details (
  OrderDetailID integer PRIMARY KEY,
  OrderID integer NOT NULL,
  ProductID integer NOT NULL,
  Quantity integer NOT NULL,
  Price real NOT NULL,
  FOREIGN KEY (OrderID) REFERENCES orders(OrderID),
  FOREIGN KEY (ProductID) REFERENCES products(ProductID)
);
```

### Sample Data

| OrderDetailID | OrderID | ProductID | Quantity | Price |
|---------------|---------|-----------|----------|-------|
| 1 | 1 | 1 | 1 | 599.00 |
| 2 | 1 | 3 | 1 | 649.00 |
| 3 | 2 | 2 | 1 | 649.00 |
| 4 | 3 | 4 | 1 | 749.00 |
| 5 | 3 | 5 | 1 | 649.00 |
| 6 | 4 | 4 | 1 | 749.00 |
| 7 | 5 | 5 | 1 | 699.00 |

## CART_ITEMS Table

The CART_ITEMS table keeps track of items in users' shopping carts.

```sql
CREATE TABLE cart_items (
  CartItemID integer PRIMARY KEY,
  UserID integer NOT NULL,
  ProductID integer NOT NULL,
  Quantity integer NOT NULL DEFAULT 1,
  FOREIGN KEY (UserID) REFERENCES users(UserID),
  FOREIGN KEY (ProductID) REFERENCES products(ProductID),
  UNIQUE(UserID, ProductID)
);
```

### Sample Data

| CartItemID | UserID | ProductID | Quantity |
|------------|--------|-----------|----------|
| 1 | 3 | 4 | 1 |
| 2 | 3 | 1 | 2 |
| 3 | 4 | 5 | 1 |
| 4 | 5 | 2 | 1 |
| 5 | 5 | 3 | 1 |

## ORDER_HISTORY Table

The ORDER_HISTORY table maintains a record of all status changes for orders.

```sql
CREATE TABLE order_history (
  HistoryID integer PRIMARY KEY,
  OrderID integer NOT NULL,
  OldStatus text NOT NULL,
  NewStatus text NOT NULL,
  ChangedAt text DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (OrderID) REFERENCES orders(OrderID)
);
```

### Sample Data

| HistoryID | OrderID | OldStatus | NewStatus | ChangedAt |
|-----------|---------|-----------|-----------|-----------|
| 1 | 1 | pending | processing | 2023-09-15 15:10:20 |
| 2 | 1 | processing | shipped | 2023-09-16 09:30:15 |
| 3 | 1 | shipped | delivered | 2023-09-18 14:45:30 |
| 4 | 2 | pending | processing | 2023-10-02 11:20:45 |
| 5 | 2 | processing | shipped | 2023-10-03 10:15:25 |
| 6 | 3 | pending | processing | 2023-10-10 17:30:10 |
| 7 | 5 | pending | cancelled | 2023-09-21 13:40:55 |

## Table Relationships Explanation

- A **User** can place multiple **Orders** (one-to-many)
- A **User** can have multiple items in their **Cart** (one-to-many)
- A **Product** can be in multiple users' **Carts** (one-to-many)
- An **Order** contains multiple **Order Details** (one-to-many)
- A **Product** can be included in multiple **Order Details** (one-to-many)
- An **Order** can have multiple status changes tracked in **Order History** (one-to-many)

## Business Rules Implemented in the Schema

1. User emails must be unique
2. Product names must be unique
3. A user cannot add the same product to their cart multiple times (instead, quantity is increased)
4. All prices are stored as real numbers (with decimal places)
5. Orders start with a default status of "pending"
6. Payment verification is tracked with a boolean flag
7. Order history maintains an audit trail of all status changes 