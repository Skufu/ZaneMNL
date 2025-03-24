# ZaneMNL Database - Peter Chen ERD

Below is the Entity-Relationship Diagram for ZaneMNL Cap Store in Peter Chen notation:

```mermaid
erDiagram
    %% Entities with attributes
    USERS {
        UserID PK
        Username
        Email
        Password
        Role
        CreatedAt
        LastLogin
    }

    PRODUCTS {
        ProductID PK
        Name
        Description
        Price
        ImageURL
        Stock
        CreatedAt
    }

    ORDERS {
        OrderID PK
        Status
        ShippingAddress
        PaymentMethod
        TotalAmount
        CreatedAt
        PaymentVerified
        PaymentReference
        TrackingNumber
    }

    ORDER_DETAILS {
        OrderDetailID PK
        Quantity
        Price
    }

    CART_ITEMS {
        CartItemID PK
        Quantity
    }

    ORDER_HISTORY {
        HistoryID PK
        OldStatus
        NewStatus
        ChangedAt
    }

    %% Relationships with cardinalities
    USERS ||--o{ ORDERS : places
    USERS ||--o{ CART_ITEMS : has
    PRODUCTS ||--o{ CART_ITEMS : added_to
    PRODUCTS ||--o{ ORDER_DETAILS : included_in
    ORDERS ||--o{ ORDER_DETAILS : contains
    ORDERS ||--o{ ORDER_HISTORY : tracks
```

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