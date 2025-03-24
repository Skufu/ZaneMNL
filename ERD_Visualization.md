# Database Visualization Code

## ERD (Chen Notation) Visualization

### Option 1: Using Mermaid

```mermaid
erDiagram
    PRODUCTS {
        int ProductID PK
        string ProductName
        string Category
        decimal Price
        int StockLevel
        int ReorderPoint
        int SupplierID FK
    }
    
    CUSTOMERS {
        int CustomerID PK
        string FirstName
        string LastName
        string Email
        string Phone
        date JoinDate
        int LoyaltyPoints
    }
    
    EMPLOYEES {
        int EmployeeID PK
        string FirstName
        string LastName
        string Position
        date HireDate
        decimal Salary
        int StoreID FK
    }
    
    STORES {
        int StoreID PK
        string StoreName
        string Address
        string Phone
        int ManagerID FK
    }
    
    SALES {
        int SaleID PK
        int CustomerID FK
        int EmployeeID FK
        date SaleDate
        decimal TotalAmount
    }
    
    SALE_DETAILS {
        int SaleDetailID PK
        int SaleID FK
        int ProductID FK
        int Quantity
        decimal UnitPrice
    }
    
    SUPPLIERS {
        int SupplierID PK
        string SupplierName
        string ContactPerson
        string Email
        string Phone
    }
    
    ORDERS {
        int OrderID PK
        int SupplierID FK
        date OrderDate
        date ExpectedDelivery
        string Status
    }
    
    ORDER_DETAILS {
        int OrderDetailID PK
        int OrderID FK
        int ProductID FK
        int Quantity
        decimal UnitPrice
    }
    
    USERS {
        int UserID PK
        string Username
        string PasswordHash
        int EmployeeID FK
        string Role
        datetime LastLogin
        bit IsActive
    }
    
    SUPPLIERS ||--o{ PRODUCTS : supplies
    STORES ||--o{ EMPLOYEES : employs
    EMPLOYEES |o--|| STORES : manages
    CUSTOMERS ||--o{ SALES : places
    EMPLOYEES ||--o{ SALES : processes
    SALES ||--o{ SALE_DETAILS : contains
    PRODUCTS ||--o{ SALE_DETAILS : included_in
    SUPPLIERS ||--o{ ORDERS : receives
    ORDERS ||--o{ ORDER_DETAILS : includes
    PRODUCTS ||--o{ ORDER_DETAILS : ordered_in
    EMPLOYEES ||--|| USERS : has_account
```

### Option 2: Using PlantUML

```plantuml
@startuml
!define ENTITY class
!define PRIMARY_KEY <<PK>>
!define FOREIGN_KEY <<FK>>

ENTITY Products {
    +ProductID: INT PRIMARY_KEY
    ProductName: VARCHAR(100)
    Category: VARCHAR(50)
    Price: DECIMAL(10,2)
    StockLevel: INT
    ReorderPoint: INT
    +SupplierID: INT FOREIGN_KEY
}

ENTITY Customers {
    +CustomerID: INT PRIMARY_KEY
    FirstName: VARCHAR(50)
    LastName: VARCHAR(50)
    Email: VARCHAR(100)
    Phone: VARCHAR(20)
    JoinDate: DATE
    LoyaltyPoints: INT
}

ENTITY Employees {
    +EmployeeID: INT PRIMARY_KEY
    FirstName: VARCHAR(50)
    LastName: VARCHAR(50)
    Position: VARCHAR(50)
    HireDate: DATE
    Salary: DECIMAL(10,2)
    +StoreID: INT FOREIGN_KEY
}

ENTITY Stores {
    +StoreID: INT PRIMARY_KEY
    StoreName: VARCHAR(100)
    Address: VARCHAR(200)
    Phone: VARCHAR(20)
    +ManagerID: INT FOREIGN_KEY
}

ENTITY Sales {
    +SaleID: INT PRIMARY_KEY
    +CustomerID: INT FOREIGN_KEY
    +EmployeeID: INT FOREIGN_KEY
    SaleDate: DATE
    TotalAmount: DECIMAL(10,2)
}

ENTITY SaleDetails {
    +SaleDetailID: INT PRIMARY_KEY
    +SaleID: INT FOREIGN_KEY
    +ProductID: INT FOREIGN_KEY
    Quantity: INT
    UnitPrice: DECIMAL(10,2)
}

ENTITY Suppliers {
    +SupplierID: INT PRIMARY_KEY
    SupplierName: VARCHAR(100)
    ContactPerson: VARCHAR(100)
    Email: VARCHAR(100)
    Phone: VARCHAR(20)
}

ENTITY Orders {
    +OrderID: INT PRIMARY_KEY
    +SupplierID: INT FOREIGN_KEY
    OrderDate: DATE
    ExpectedDelivery: DATE
    Status: VARCHAR(50)
}

ENTITY OrderDetails {
    +OrderDetailID: INT PRIMARY_KEY
    +OrderID: INT FOREIGN_KEY
    +ProductID: INT FOREIGN_KEY
    Quantity: INT
    UnitPrice: DECIMAL(10,2)
}

ENTITY Users {
    +UserID: INT PRIMARY_KEY
    Username: VARCHAR(50)
    PasswordHash: VARCHAR(255)
    +EmployeeID: INT FOREIGN_KEY
    Role: VARCHAR(50)
    LastLogin: DATETIME
    IsActive: BIT
}

Suppliers "1" -- "0..*" Products : supplies
Stores "1" -- "0..*" Employees : employs
Employees "0..1" -- "1" Stores : manages
Customers "1" -- "0..*" Sales : places
Employees "1" -- "0..*" Sales : processes
Sales "1" -- "0..*" SaleDetails : contains
Products "1" -- "0..*" SaleDetails : included_in
Suppliers "1" -- "0..*" Orders : receives
Orders "1" -- "0..*" OrderDetails : includes
Products "1" -- "0..*" OrderDetails : ordered_in
Employees "1" -- "0..1" Users : has_account

@enduml
```

## Relational Schema Visualization

### Option 1: Using Mermaid

```mermaid
graph TD
    subgraph Products
        ProductID[ProductID INT PK]
        ProductName[ProductName VARCHAR(100)]
        Category[Category VARCHAR(50)]
        Price[Price DECIMAL(10,2)]
        StockLevel[StockLevel INT]
        ReorderPoint[ReorderPoint INT]
        ProductSupplierID[SupplierID INT FK]
    end
    
    subgraph Customers
        CustomerID[CustomerID INT PK]
        FirstName[FirstName VARCHAR(50)]
        LastName[LastName VARCHAR(50)]
        Email[Email VARCHAR(100)]
        Phone[Phone VARCHAR(20)]
        JoinDate[JoinDate DATE]
        LoyaltyPoints[LoyaltyPoints INT]
    end
    
    subgraph Employees
        EmployeeID[EmployeeID INT PK]
        EmpFirstName[FirstName VARCHAR(50)]
        EmpLastName[LastName VARCHAR(50)]
        Position[Position VARCHAR(50)]
        HireDate[HireDate DATE]
        Salary[Salary DECIMAL(10,2)]
        EmpStoreID[StoreID INT FK]
    end
    
    subgraph Stores
        StoreID[StoreID INT PK]
        StoreName[StoreName VARCHAR(100)]
        Address[Address VARCHAR(200)]
        StorePhone[Phone VARCHAR(20)]
        ManagerID[ManagerID INT FK]
    end
    
    subgraph Sales
        SaleID[SaleID INT PK]
        SaleCustomerID[CustomerID INT FK]
        SaleEmployeeID[EmployeeID INT FK]
        SaleDate[SaleDate DATE]
        TotalAmount[TotalAmount DECIMAL(10,2)]
    end
    
    subgraph SaleDetails
        SaleDetailID[SaleDetailID INT PK]
        DetailSaleID[SaleID INT FK]
        DetailProductID[ProductID INT FK]
        Quantity[Quantity INT]
        UnitPrice[UnitPrice DECIMAL(10,2)]
    end
    
    subgraph Suppliers
        SupplierID[SupplierID INT PK]
        SupplierName[SupplierName VARCHAR(100)]
        ContactPerson[ContactPerson VARCHAR(100)]
        SupplierEmail[Email VARCHAR(100)]
        SupplierPhone[Phone VARCHAR(20)]
    end
    
    subgraph Orders
        OrderID[OrderID INT PK]
        OrderSupplierID[SupplierID INT FK]
        OrderDate[OrderDate DATE]
        ExpectedDelivery[ExpectedDelivery DATE]
        Status[Status VARCHAR(50)]
    end
    
    subgraph OrderDetails
        OrderDetailID[OrderDetailID INT PK]
        DetailOrderID[OrderID INT FK]
        OrderProductID[ProductID INT FK]
        OrderQuantity[Quantity INT]
        OrderUnitPrice[UnitPrice DECIMAL(10,2)]
    end
    
    subgraph Users
        UserID[UserID INT PK]
        Username[Username VARCHAR(50)]
        PasswordHash[PasswordHash VARCHAR(255)]
        UserEmployeeID[EmployeeID INT FK]
        Role[Role VARCHAR(50)]
        LastLogin[LastLogin DATETIME]
        IsActive[IsActive BIT]
    end
    
    ProductSupplierID --> SupplierID
    EmpStoreID --> StoreID
    ManagerID --> EmployeeID
    SaleCustomerID --> CustomerID
    SaleEmployeeID --> EmployeeID
    DetailSaleID --> SaleID
    DetailProductID --> ProductID
    OrderSupplierID --> SupplierID
    DetailOrderID --> OrderID
    OrderProductID --> ProductID
    UserEmployeeID --> EmployeeID
```

### Option 2: Using Online SQL Diagram Tools

For a more professional visualization of the relational schema, you can use online tools like:

1. **dbdiagram.io** - Copy and paste this code:

```
Table Products {
  ProductID int [pk]
  ProductName varchar(100) [not null]
  Category varchar(50) [not null]
  Price decimal(10,2) [not null]
  StockLevel int [not null, default: 0]
  ReorderPoint int [not null, default: 10]
  SupplierID int [ref: > Suppliers.SupplierID]
}

Table Customers {
  CustomerID int [pk]
  FirstName varchar(50) [not null]
  LastName varchar(50) [not null]
  Email varchar(100) [not null, unique]
  Phone varchar(20)
  JoinDate date [not null, default: `now()`]
  LoyaltyPoints int [not null, default: 0]
}

Table Employees {
  EmployeeID int [pk]
  FirstName varchar(50) [not null]
  LastName varchar(50) [not null]
  Position varchar(50) [not null]
  HireDate date [not null]
  Salary decimal(10,2)
  StoreID int [ref: > Stores.StoreID]
}

Table Stores {
  StoreID int [pk]
  StoreName varchar(100) [not null]
  Address varchar(200) [not null]
  Phone varchar(20)
  ManagerID int [ref: - Employees.EmployeeID]
}

Table Sales {
  SaleID int [pk]
  CustomerID int [ref: > Customers.CustomerID]
  EmployeeID int [ref: > Employees.EmployeeID]
  SaleDate date [not null]
  TotalAmount decimal(10,2) [not null]
}

Table SaleDetails {
  SaleDetailID int [pk]
  SaleID int [ref: > Sales.SaleID]
  ProductID int [ref: > Products.ProductID]
  Quantity int [not null]
  UnitPrice decimal(10,2) [not null]
}

Table Suppliers {
  SupplierID int [pk]
  SupplierName varchar(100) [not null]
  ContactPerson varchar(100)
  Email varchar(100)
  Phone varchar(20)
}

Table Orders {
  OrderID int [pk]
  SupplierID int [ref: > Suppliers.SupplierID]
  OrderDate date [not null]
  ExpectedDelivery date
  Status varchar(50) [not null]
}

Table OrderDetails {
  OrderDetailID int [pk]
  OrderID int [ref: > Orders.OrderID]
  ProductID int [ref: > Products.ProductID]
  Quantity int [not null]
  UnitPrice decimal(10,2) [not null]
}

Table Users {
  UserID int [pk]
  Username varchar(50) [not null, unique]
  PasswordHash varchar(255) [not null]
  EmployeeID int [ref: - Employees.EmployeeID]
  Role varchar(50) [not null]
  LastLogin datetime
  IsActive bit [not null, default: 1]
}
```

## Instructions for Visualization

1. **For Mermaid diagrams:**
   - Use an online Mermaid live editor like https://mermaid.live/
   - Paste the Mermaid code and render the diagram
   - Export as PNG or SVG for your presentation

2. **For PlantUML:**
   - Use PlantUML online editor at http://www.plantuml.com/plantuml/
   - Paste the PlantUML code and render the diagram
   - Export as PNG or SVG for your presentation

3. **For dbdiagram.io:**
   - Go to https://dbdiagram.io/
   - Paste the code and the diagram will be automatically generated
   - You can export as PNG or PDF for your presentation 