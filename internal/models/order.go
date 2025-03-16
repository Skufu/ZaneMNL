package models

import (
	"database/sql"
	"fmt"
	"go_module/internal/database"
	"log"
	"strings"
	"time"
)

type OrderItem struct {
	ProductID       int64   `json:"product_id"`
	Name            string  `json:"name"`
	Quantity        int     `json:"quantity"`
	PriceAtPurchase float64 `json:"price_at_purchase"`
}

type Order struct {
	OrderID          int64       `json:"order_id"`
	UserID           int64       `json:"user_id"`
	ShippingAddress  string      `json:"shipping_address"`
	PaymentMethod    string      `json:"payment_method"`
	OrderDate        time.Time   `json:"order_date"`
	TotalAmount      float64     `json:"total_amount"`
	Status           string      `json:"status"`
	TrackingNumber   string      `json:"tracking_number,omitempty"`
	PaymentVerified  bool        `json:"payment_verified"`
	PaymentReference string      `json:"payment_reference,omitempty"`
	Items            []OrderItem `json:"items,omitempty"`
}

// Create a new order from cart
func CreateOrder(userID int64, shippingAddress, paymentMethod string) (*Order, error) {
	log.Printf("Starting CreateOrder for userID: %d", userID)

	// Start transaction with a timeout context
	tx, err := database.DB.Begin()
	if err != nil {
		log.Printf("Failed to start transaction: %v", err)
		return nil, fmt.Errorf("failed to start transaction: %v", err)
	}

	// Make sure we either commit or rollback the transaction
	committed := false
	defer func() {
		if !committed && tx != nil {
			log.Printf("Rolling back transaction for userID: %d", userID)
			tx.Rollback()
		}

		// Recover from any panics
		if r := recover(); r != nil {
			log.Printf("Recovered from panic in CreateOrder: %v", r)
		}
	}()

	// Get cart
	log.Printf("Fetching cart for userID: %d", userID)
	cart, err := GetCartByUserID(userID)
	if err != nil {
		log.Printf("Failed to get cart: %v", err)
		return nil, fmt.Errorf("failed to get cart: %v", err)
	}

	// Check if cart is empty
	if len(cart.Items) == 0 {
		log.Printf("Cart is empty for userID: %d", userID)
		return nil, fmt.Errorf("cart is empty")
	}

	log.Printf("Creating order record for userID: %d with %d items", userID, len(cart.Items))

	// Create order directly with shipping address and payment method
	result, err := tx.Exec(`
		INSERT INTO orders (
			UserID, ShippingAddress, PaymentMethod, 
			TotalAmount, Status, CreatedAt, PaymentVerified
		) VALUES (?, ?, ?, ?, ?, datetime('now'), ?)
	`, userID, shippingAddress, paymentMethod, cart.Subtotal, "pending", paymentMethod == "cash_on_delivery")
	if err != nil {
		log.Printf("Failed to create order record: %v", err)
		return nil, fmt.Errorf("failed to create order: %v", err)
	}

	orderID, err := result.LastInsertId()
	if err != nil {
		log.Printf("Failed to get order ID: %v", err)
		return nil, fmt.Errorf("failed to get order ID: %v", err)
	}

	log.Printf("Created order with ID: %d for userID: %d", orderID, userID)

	// Create order items and update stock in one transaction
	for _, item := range cart.Items {
		log.Printf("Adding item %d (qty: %d) to order %d", item.ProductID, item.Quantity, orderID)

		// Add to order details
		_, err = tx.Exec(`
			INSERT INTO order_details (
				OrderID, ProductID, Quantity, Price
			) VALUES (?, ?, ?, ?)
		`, orderID, item.ProductID, item.Quantity, item.Price)
		if err != nil {
			log.Printf("Failed to create order item: %v", err)
			return nil, fmt.Errorf("failed to create order item: %v", err)
		}

		// Update product stock
		_, err = tx.Exec(
			"UPDATE products SET Stock = Stock - ? WHERE ProductID = ?",
			item.Quantity, item.ProductID,
		)
		if err != nil {
			log.Printf("Failed to update stock: %v", err)
			return nil, fmt.Errorf("failed to update stock: %v", err)
		}
	}

	// Clear cart within the same transaction
	log.Printf("Clearing cart for userID: %d", userID)
	_, err = tx.Exec("DELETE FROM cart_items WHERE UserID = ?", userID)
	if err != nil {
		log.Printf("Failed to clear cart: %v", err)
		return nil, fmt.Errorf("failed to clear cart: %v", err)
	}

	// Commit transaction
	log.Printf("Committing transaction for order %d", orderID)
	err = tx.Commit()
	if err != nil {
		log.Printf("Failed to commit transaction: %v", err)
		return nil, fmt.Errorf("failed to commit transaction: %v", err)
	}

	committed = true
	log.Printf("Transaction committed successfully for order %d", orderID)

	// Return order
	order := &Order{
		OrderID:         orderID,
		UserID:          userID,
		ShippingAddress: shippingAddress,
		PaymentMethod:   paymentMethod,
		OrderDate:       time.Now(),
		TotalAmount:     cart.Subtotal,
		Status:          "pending",
		PaymentVerified: paymentMethod == "cash_on_delivery",
		Items:           make([]OrderItem, len(cart.Items)),
	}

	// Add items to order response
	for i, item := range cart.Items {
		order.Items[i] = OrderItem{
			ProductID:       item.ProductID,
			Name:            item.Name,
			Quantity:        item.Quantity,
			PriceAtPurchase: item.Price,
		}
	}

	log.Printf("Order %d created successfully with %d items", orderID, len(order.Items))
	return order, nil
}

// Get orders by user ID
func GetOrdersByUserID(userID int64) ([]Order, error) {
	rows, err := database.DB.Query(`
		SELECT OrderID, UserID, ShippingAddress, PaymentMethod, 
			   CreatedAt, TotalAmount, Status, PaymentVerified, PaymentReference, TrackingNumber
		FROM orders
		WHERE UserID = ?
		ORDER BY CreatedAt DESC
	`, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch orders: %v", err)
	}
	defer rows.Close()

	var orders []Order
	for rows.Next() {
		var o Order
		var createdAt string
		var paymentReference, trackingNumber sql.NullString

		err := rows.Scan(
			&o.OrderID,
			&o.UserID,
			&o.ShippingAddress,
			&o.PaymentMethod,
			&createdAt,
			&o.TotalAmount,
			&o.Status,
			&o.PaymentVerified,
			&paymentReference,
			&trackingNumber,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan order: %v", err)
		}

		// Parse the created_at timestamp
		o.OrderDate, _ = time.Parse("2006-01-02 15:04:05", createdAt)

		// Handle nullable fields
		if paymentReference.Valid {
			o.PaymentReference = paymentReference.String
		}
		if trackingNumber.Valid {
			o.TrackingNumber = trackingNumber.String
		}

		// Get order items
		itemRows, err := database.DB.Query(`
			SELECT od.ProductID, p.Name, od.Quantity, od.Price
			FROM order_details od
			JOIN products p ON od.ProductID = p.ProductID
			WHERE od.OrderID = ?
		`, o.OrderID)
		if err == nil {
			o.Items = make([]OrderItem, 0)
			for itemRows.Next() {
				var item OrderItem
				err := itemRows.Scan(
					&item.ProductID,
					&item.Name,
					&item.Quantity,
					&item.PriceAtPurchase,
				)
				if err == nil {
					o.Items = append(o.Items, item)
				}
			}
			itemRows.Close()
		}

		orders = append(orders, o)
	}

	return orders, nil
}

// Get all orders (admin only)
func GetAllOrders() ([]Order, error) {
	rows, err := database.DB.Query(`
		SELECT OrderID, UserID, ShippingAddress, PaymentMethod, 
			   CreatedAt, TotalAmount, Status, PaymentVerified, PaymentReference, TrackingNumber
		FROM orders
		ORDER BY CreatedAt DESC
	`)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch orders: %v", err)
	}
	defer rows.Close()

	var orders []Order
	for rows.Next() {
		var o Order
		var createdAt string
		var paymentReference, trackingNumber sql.NullString

		err := rows.Scan(
			&o.OrderID,
			&o.UserID,
			&o.ShippingAddress,
			&o.PaymentMethod,
			&createdAt,
			&o.TotalAmount,
			&o.Status,
			&o.PaymentVerified,
			&paymentReference,
			&trackingNumber,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan order: %v", err)
		}

		// Parse the created_at timestamp
		o.OrderDate, _ = time.Parse("2006-01-02 15:04:05", createdAt)

		// Handle nullable fields
		if paymentReference.Valid {
			o.PaymentReference = paymentReference.String
		}
		if trackingNumber.Valid {
			o.TrackingNumber = trackingNumber.String
		}

		// Get order items
		itemRows, err := database.DB.Query(`
			SELECT od.ProductID, p.Name, od.Quantity, od.Price
			FROM order_details od
			JOIN products p ON od.ProductID = p.ProductID
			WHERE od.OrderID = ?
		`, o.OrderID)
		if err == nil {
			o.Items = make([]OrderItem, 0)
			for itemRows.Next() {
				var item OrderItem
				err := itemRows.Scan(
					&item.ProductID,
					&item.Name,
					&item.Quantity,
					&item.PriceAtPurchase,
				)
				if err == nil {
					o.Items = append(o.Items, item)
				}
			}
			itemRows.Close()
		}

		orders = append(orders, o)
	}

	return orders, nil
}

// Update order status
func UpdateOrderStatus(id int64, status string) error {
	// Validate status
	validStatuses := []string{"pending", "processing", "shipped", "delivered", "cancelled"}
	isValid := false
	for _, s := range validStatuses {
		if strings.ToLower(status) == s {
			isValid = true
			break
		}
	}

	if !isValid {
		return fmt.Errorf("invalid status: %s", status)
	}

	// Check if order exists
	var exists bool
	err := database.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM orders WHERE OrderID = ?)", id).Scan(&exists)
	if err != nil {
		return fmt.Errorf("failed to check if order exists: %v", err)
	}

	if !exists {
		return fmt.Errorf("order not found")
	}

	// Get current status
	var currentStatus string
	err = database.DB.QueryRow("SELECT Status FROM orders WHERE OrderID = ?", id).Scan(&currentStatus)
	if err != nil {
		return fmt.Errorf("failed to get current status: %v", err)
	}

	// Update status
	_, err = database.DB.Exec("UPDATE orders SET Status = ? WHERE OrderID = ?", status, id)
	if err != nil {
		return fmt.Errorf("failed to update order status: %v", err)
	}

	// Add to order history
	_, err = database.DB.Exec(
		"INSERT INTO order_history (OrderID, OldStatus, NewStatus, ChangedAt) VALUES (?, ?, ?, datetime('now'))",
		id, currentStatus, status,
	)
	if err != nil {
		log.Printf("Warning: Failed to add to order history: %v", err)
		// Don't return error, not critical
	}

	return nil
}

// VerifyOrderPayment marks an order's payment as verified and updates the payment reference
func VerifyOrderPayment(id int64, reference string) error {
	// Check if order exists
	var exists bool
	err := database.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM orders WHERE OrderID = ?)", id).Scan(&exists)
	if err != nil {
		return fmt.Errorf("failed to check if order exists: %v", err)
	}

	if !exists {
		return fmt.Errorf("order not found")
	}

	// Update payment verification
	_, err = database.DB.Exec(
		"UPDATE orders SET PaymentVerified = 1, PaymentReference = ? WHERE OrderID = ?",
		reference, id,
	)
	if err != nil {
		return fmt.Errorf("failed to verify payment: %v", err)
	}

	// If order is in pending status, move to processing
	var status string
	err = database.DB.QueryRow("SELECT Status FROM orders WHERE OrderID = ?", id).Scan(&status)
	if err != nil {
		log.Printf("Warning: Failed to get order status: %v", err)
	} else if status == "pending" {
		err = UpdateOrderStatus(id, "processing")
		if err != nil {
			log.Printf("Warning: Failed to update order status: %v", err)
		}
	}

	return nil
}

// GetOrderCount returns the total number of orders
func GetOrderCount() (int, error) {
	var count int
	err := database.DB.QueryRow("SELECT COUNT(*) FROM orders").Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to count orders: %v", err)
	}
	return count, nil
}

// GetTotalRevenue returns the total revenue from all orders
func GetTotalRevenue() (float64, error) {
	var total float64
	err := database.DB.QueryRow("SELECT COALESCE(SUM(TotalAmount), 0) FROM orders WHERE PaymentVerified = 1").Scan(&total)
	if err != nil {
		return 0, fmt.Errorf("failed to calculate total revenue: %v", err)
	}
	return total, nil
}

// GetRecentOrders returns the most recent orders with a limit
func GetRecentOrders(limit int) ([]Order, error) {
	// Get recent orders
	rows, err := database.DB.Query(`
		SELECT OrderID, UserID, Status, ShippingAddress, PaymentMethod, TotalAmount, CreatedAt, PaymentVerified, PaymentReference, TrackingNumber
		FROM orders 
		ORDER BY CreatedAt DESC
		LIMIT ?
	`, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to get recent orders: %v", err)
	}
	defer rows.Close()

	var orders []Order
	for rows.Next() {
		var order Order
		var createdAt string
		var paymentReference, trackingNumber sql.NullString

		err := rows.Scan(
			&order.OrderID,
			&order.UserID,
			&order.Status,
			&order.ShippingAddress,
			&order.PaymentMethod,
			&order.TotalAmount,
			&createdAt,
			&order.PaymentVerified,
			&paymentReference,
			&trackingNumber,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan order: %v", err)
		}

		// Parse date
		order.OrderDate, _ = time.Parse("2006-01-02 15:04:05", createdAt)

		// Handle nullable fields
		if paymentReference.Valid {
			order.PaymentReference = paymentReference.String
		}
		if trackingNumber.Valid {
			order.TrackingNumber = trackingNumber.String
		}

		orders = append(orders, order)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating orders: %v", err)
	}

	return orders, nil
}
