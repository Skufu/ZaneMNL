# ZaneMNL Database - Peter Chen ERD

Below is the Entity-Relationship Diagram for ZaneMNL Cap Store in traditional Peter Chen notation:

```
                             +-------------+                            +---------------+
                             |    USERS    |                            |   PRODUCTS    |
                             +-------------+                            +---------------+
                                   |                                           |
        +--------------------------|---------------------------+               |
        |           |        |     |     |        |            |               |
    (UserID)   (Username) (Email) (Password) (Role) (CreatedAt) (LastLogin)    |
        PK                                                                     |
                                                                               |
                                                                    +----------|----------+
                                                                    |          |         |
                                                               (ProductID)  (Name)  (Description)
                                                                   PK
                                                                    |          |         |
                                                                (Price)   (ImageURL)  (Stock)
                                                                    |
                                                              (CreatedAt)

  +----------+                  +-----------+                   +----------------+
  |  USERS   | 1            M  |  places   |  1              M |     ORDERS     |
  +----------+------------------+-----------+-------------------+----------------+
                                                                        |
                                                     +------------------|------------------+
                                                     |        |         |        |         |
                                                 (OrderID) (Status) (ShippingAddress) (PaymentMethod)
                                                     PK
                                                     |        |         |        |         |
                                              (TotalAmount) (CreatedAt) (PaymentVerified) (PaymentReference)
                                                                                           |
                                                                                    (TrackingNumber)


  +----------+                  +-----------+                   +----------------+
  |  USERS   | 1            M  |    has    |  1              M |   CART_ITEMS   |
  +----------+------------------+-----------+-------------------+----------------+
                                                                        |
                                                                 +------|------+
                                                                 |             |
                                                            (CartItemID)   (Quantity)
                                                                 PK


  +----------+                  +------------+                   +----------------+
  | PRODUCTS | 1            M  | added_to   |  1              M |   CART_ITEMS   |
  +----------+------------------+------------+-------------------+----------------+


  +----------+                  +------------+                   +----------------+
  | PRODUCTS | 1            M  | included_in |  1              M | ORDER_DETAILS  |
  +----------+------------------+------------+-------------------+----------------+
                                                                        |
                                                                 +------|------+
                                                                 |      |      |
                                                           (OrderDetailID) (Quantity)
                                                                 PK      |
                                                                      (Price)


  +----------+                  +------------+                   +----------------+
  |  ORDERS  | 1            M  |  contains  |  1              M | ORDER_DETAILS  |
  +----------+------------------+------------+-------------------+----------------+


  +----------+                  +------------+                   +----------------+
  |  ORDERS  | 1            M  |   tracks   |  1              M | ORDER_HISTORY  |
  +----------+------------------+------------+-------------------+----------------+
                                                                        |
                                                                 +------|------+
                                                                 |      |      |
                                                              (HistoryID) (OldStatus)
                                                                 PK      |      |
                                                                      (NewStatus) (ChangedAt)
```

## Traditional Peter Chen Notation Legend

In the diagram above:
- **Rectangles** represent entities (USERS, PRODUCTS, ORDERS, etc.)
- **Ovals/Parentheses** represent attributes (UserID, Name, Email, etc.)
- **Diamonds** represent relationships (places, has, added_to, etc.)
- **Lines** connect entities to relationships and entities to attributes
- **Cardinalities** are shown as "1" and "M" (for "many") at the connection points

Primary keys (PK) are indicated below the respective attributes.

This follows the classical Peter Chen ERD notation where:
- Each entity is connected to its attributes
- Relationships are represented as diamonds between entities
- The diagram shows both the structure and the cardinality of relationships

## Alternative Textual Representation

In a more classical Peter Chen notation, the diagram would be represented with:

- **Entities**: Represented as rectangles (USERS, PRODUCTS, ORDERS, etc.)
- **Attributes**: Represented as ovals connected to their entities
- **Relationships**: Represented as diamonds connecting entities
- **Cardinalities**: Shown at the connection points (1, M, N)

The key relationships would be:
- A USER places many ORDERS (1:M)
- A USER has many CART_ITEMS (1:M)
- A PRODUCT can be added to many CART_ITEMS (1:M)
- A PRODUCT can be included in many ORDER_DETAILS (1:M)
- An ORDER contains many ORDER_DETAILS (1:M)
- An ORDER has many ORDER_HISTORY records (1:M)

Each entity would have its attributes connected to it (e.g., UserID, Username, Email, etc. for USERS). 