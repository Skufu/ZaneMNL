package models

import (
	"database/sql"
	"fmt"
	"go_module/internal/database"
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
	// Start transaction
	tx, err := database.DB.Begin()
	if err != nil {
		return nil, fmt.Errorf("failed to start transaction: %v", err)
	}
	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	// Get cart
	cart, err := GetCartByUserID(userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get cart: %v", err)
	}

	// Check if cart is empty
	if len(cart.Items) == 0 {
		return nil, fmt.Errorf("cart is empty")
	}

	// Create order directly with shipping address and payment method
	result, err := tx.Exec(`
		INSERT INTO orders (
			UserID, ShippingAddress, PaymentMethod, 
			TotalAmount, Status, CreatedAt
		) VALUES (?, ?, ?, ?, ?, datetime('now'))
	`, userID, shippingAddress, paymentMethod, cart.Subtotal, "pending")
	if err != nil {
		return nil, fmt.Errorf("failed to create order: %v", err)
	}

	orderID, err := result.LastInsertId()
	if err != nil {
		return nil, fmt.Errorf("failed to get order ID: %v", err)
	}

	// Create order items and update stock in one transaction
	for _, item := range cart.Items {
		// Add to order details
		_, err = tx.Exec(`
			INSERT INTO order_details (
				OrderID, ProductID, Quantity, Price
			) VALUES (?, ?, ?, ?)
		`, orderID, item.ProductID, item.Quantity, item.Price)
		if err != nil {
			return nil, fmt.Errorf("failed to create order item: %v", err)
		}

		// Update product stock
		_, err = tx.Exec(
			"UPDATE products SET Stock = Stock - ? WHERE ProductID = ?",
			item.Quantity, item.ProductID,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to update stock: %v", err)
		}
	}

	// Clear cart within the same transaction
	_, err = tx.Exec("DELETE FROM cart_items WHERE UserID = ?", userID)
	if err != nil {
		return nil, fmt.Errorf("failed to clear cart: %v", err)
	}

	// Commit transaction
	err = tx.Commit()
	if err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %v", err)
	}

	// Return order
	order := &Order{
		OrderID:         orderID,
		UserID:          userID,
		ShippingAddress: shippingAddress,
		PaymentMethod:   paymentMethod,
		OrderDate:       time.Now(),
		TotalAmount:     cart.Subtotal,
		Status:          "pending",
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

	return order, nil
}

// Get orders by user ID
func GetOrdersByUserID(userID int64) ([]Order, error) {
	rows, err := database.DB.Query(`
		SELECT OrderID, UserID, ShippingAddress, PaymentMethod, 
			   CreatedAt, TotalAmount, Status
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
		err := rows.Scan(
			&o.OrderID,
			&o.UserID,
			&o.ShippingAddress,
			&o.PaymentMethod,
			&createdAt,
			&o.TotalAmount,
			&o.Status,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan order: %v", err)
		}

		// Parse the created_at timestamp
		o.OrderDate, _ = time.Parse("2006-01-02 15:04:05", createdAt)

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
			   CreatedAt, TotalAmount, Status
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
		err := rows.Scan(
			&o.OrderID,
			&o.UserID,
			&o.ShippingAddress,
			&o.PaymentMethod,
			&createdAt,
			&o.TotalAmount,
			&o.Status,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan order: %v", err)
		}

		// Parse the created_at timestamp
		o.OrderDate, _ = time.Parse("2006-01-02 15:04:05", createdAt)

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
	// Start transaction
	tx, err := database.DB.Begin()
	if err != nil {
		return fmt.Errorf("failed to start transaction: %v", err)
	}
	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	// Check if order exists and get current status
	var currentStatus string
	err = tx.QueryRow("SELECT Status FROM orders WHERE OrderID = ?", id).Scan(&currentStatus)
	if err == sql.ErrNoRows {
		return fmt.Errorf("order not found")
	}
	if err != nil {
		return fmt.Errorf("failed to get order status: %v", err)
	}

	// Update status
	result, err := tx.Exec("UPDATE orders SET Status = ? WHERE OrderID = ?", status, id)
	if err != nil {
		return fmt.Errorf("failed to update order status: %v", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %v", err)
	}
	if rowsAffected == 0 {
		return fmt.Errorf("order not found")
	}

	// Add to order history
	_, err = tx.Exec(`
		INSERT INTO order_history (OrderID, OldStatus, NewStatus) 
		VALUES (?, ?, ?)
	`, id, currentStatus, status)
	if err != nil {
		return fmt.Errorf("failed to create history record: %v", err)
	}

	// Commit transaction
	err = tx.Commit()
	if err != nil {
		return fmt.Errorf("failed to commit transaction: %v", err)
	}

	return nil
}
