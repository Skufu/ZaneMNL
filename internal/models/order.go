package models

import (
	"database/sql"
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
		return nil, err
	}
	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	// Get cart
	cart, err := GetCartByUserID(userID)
	if err != nil {
		return nil, err
	}

	// Check if cart is empty
	if len(cart.Items) == 0 {
		return nil, sql.ErrNoRows
	}

	// Create shipping address record
	var addressID int64
	result, err := tx.Exec(
		"INSERT INTO shipping_addresses (UserID, Address) VALUES (?, ?)",
		userID, shippingAddress,
	)
	if err != nil {
		return nil, err
	}
	addressID, err = result.LastInsertId()
	if err != nil {
		return nil, err
	}

	// Create payment method record
	var paymentID int64
	result, err = tx.Exec(
		"INSERT INTO payment_methods (Name) VALUES (?)",
		paymentMethod,
	)
	if err != nil {
		return nil, err
	}
	paymentID, err = result.LastInsertId()
	if err != nil {
		return nil, err
	}

	// Create order
	result, err = tx.Exec(`
		INSERT INTO orders (
			UserID, ShippingAddressID, PaymentMethodID, 
			OrderDate, TotalAmount, Status, PaymentVerified
		) VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?, ?, 0)
	`, userID, addressID, paymentID, cart.Subtotal, "pending")
	if err != nil {
		return nil, err
	}

	orderID, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}

	// Create order items
	for _, item := range cart.Items {
		_, err = tx.Exec(`
			INSERT INTO order_details (
				OrderID, ProductID, Quantity, PriceAtPurchase
			) VALUES (?, ?, ?, ?)
		`, orderID, item.ProductID, item.Quantity, item.Price)
		if err != nil {
			return nil, err
		}

		// Update product stock
		_, err = tx.Exec(
			"UPDATE products SET Stock = Stock - ? WHERE ProductID = ?",
			item.Quantity, item.ProductID,
		)
		if err != nil {
			return nil, err
		}
	}

	// Clear cart
	_, err = tx.Exec("DELETE FROM cart_contents WHERE CartID = ?", cart.CartID)
	if err != nil {
		return nil, err
	}

	// Commit transaction
	err = tx.Commit()
	if err != nil {
		return nil, err
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
		PaymentVerified: false,
		Items:           []OrderItem{},
	}

	// Add items to order
	for _, item := range cart.Items {
		order.Items = append(order.Items, OrderItem{
			ProductID:       item.ProductID,
			Name:            item.Name,
			Quantity:        item.Quantity,
			PriceAtPurchase: item.Price,
		})
	}

	return order, nil
}

// Get orders by user ID
func GetOrdersByUserID(userID int64) ([]Order, error) {
	rows, err := database.DB.Query(`
		SELECT o.OrderID, o.OrderDate, o.TotalAmount, o.Status, 
		       sa.Address, pm.Name
		FROM orders o
		JOIN shipping_addresses sa ON o.ShippingAddressID = sa.AddressID
		JOIN payment_methods pm ON o.PaymentMethodID = pm.PaymentMethodID
		WHERE o.UserID = ?
		ORDER BY o.OrderDate DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var orders []Order
	for rows.Next() {
		var o Order
		err := rows.Scan(
			&o.OrderID, &o.OrderDate, &o.TotalAmount, &o.Status,
			&o.ShippingAddress, &o.PaymentMethod,
		)
		if err != nil {
			return nil, err
		}
		o.UserID = userID

		// Get order items
		itemRows, err := database.DB.Query(`
			SELECT od.ProductID, p.Name, od.Quantity, od.PriceAtPurchase
			FROM order_details od
			JOIN products p ON od.ProductID = p.ProductID
			WHERE od.OrderID = ?
		`, o.OrderID)
		if err == nil {
			for itemRows.Next() {
				var item OrderItem
				err := itemRows.Scan(&item.ProductID, &item.Name, &item.Quantity, &item.PriceAtPurchase)
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
		SELECT o.OrderID, o.UserID, o.OrderDate, o.TotalAmount, o.Status, 
		       sa.Address, pm.Name
		FROM orders o
		JOIN shipping_addresses sa ON o.ShippingAddressID = sa.AddressID
		JOIN payment_methods pm ON o.PaymentMethodID = pm.PaymentMethodID
		ORDER BY o.OrderDate DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var orders []Order
	for rows.Next() {
		var o Order
		err := rows.Scan(
			&o.OrderID, &o.UserID, &o.OrderDate, &o.TotalAmount, &o.Status,
			&o.ShippingAddress, &o.PaymentMethod,
		)
		if err != nil {
			return nil, err
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
		return err
	}
	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	// Get current status
	var currentStatus string
	err = tx.QueryRow("SELECT Status FROM orders WHERE OrderID = ?", id).Scan(&currentStatus)
	if err != nil {
		return err
	}

	// Update status
	_, err = tx.Exec("UPDATE orders SET Status = ? WHERE OrderID = ?", status, id)
	if err != nil {
		return err
	}

	// Add to order history
	_, err = tx.Exec(`
		INSERT INTO order_history (OrderID, OldStatus, NewStatus) 
		VALUES (?, ?, ?)
	`, id, currentStatus, status)
	if err != nil {
		return err
	}

	// Commit transaction
	return tx.Commit()
}
