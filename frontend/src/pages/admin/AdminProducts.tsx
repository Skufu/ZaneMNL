import React, { useState, useEffect } from 'react';
import AdminLayout from './components/AdminLayout';
// @ts-ignore
import ProductForm from './components/ProductForm';
import { getAdminProducts, createProduct, updateProduct, deleteProduct } from '../../services/admin-api';
import './AdminProducts.css';

// Get API URL from environment or use localhost as fallback
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

interface Product {
  product_id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  created_at: string;
  category?: string;
}

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getAdminProducts();
      
      if (Array.isArray(data)) {
        setProducts(data as Product[]);
        setError(null);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await deleteProduct(productId);
      
      // Remove product from state
      setProducts(products.filter(p => p.product_id !== productId));
      
      // Show success message
      alert('Product deleted successfully');
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Failed to delete product. Please try again.');
    }
  };

  const handleFormSubmit = async (productData: FormData) => {
    try {
      const isEditing = !!editingProduct;
      
      // Debug log for form data
      console.log('Submitting product form with fields:');
      // Use array from to convert FormData entries to array for compatibility
      const formDataEntries = Array.from(productData.entries());
      formDataEntries.forEach(([key, value]) => {
        console.log(`${key}: ${value}`);
      });
      
      let savedProduct: Product;
      
      if (isEditing && editingProduct) {
        savedProduct = await updateProduct(editingProduct.product_id, productData) as Product;
        console.log('Product updated successfully', savedProduct);
        
        // Update product in state
        setProducts(products.map(p => 
          p.product_id === editingProduct.product_id ? savedProduct : p
        ));
        
        // Show success message
        alert('Product updated successfully');
      } else {
        savedProduct = await createProduct(productData) as Product;
        console.log('Product created successfully', savedProduct);
        
        // Add new product to state
        setProducts([...products, savedProduct]);
        
        // Show success message
        alert('Product created successfully');
      }
      
      setShowForm(false);
      setEditingProduct(null);
    } catch (err) {
      console.error('Error saving product:', err);
      alert(`Failed to ${editingProduct ? 'update' : 'create'} product. Please try again.`);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper function to get the correct image URL
  const getImageUrl = (url: string | null | undefined): string => {
    if (!url) return 'https://via.placeholder.com/400';
    if (url.startsWith('http')) return url;
    return `${API_URL}${url}`;
  };

  return (
    <AdminLayout title="Product Management">
      <div className="admin-products">
        {showForm ? (
          <ProductForm 
            product={editingProduct} 
            onSubmit={handleFormSubmit} 
            onCancel={handleFormCancel} 
          />
        ) : (
          <>
            <div className="products-header">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              <button className="add-product-btn" onClick={handleAddProduct}>
                Add New Product
              </button>
            </div>
            
            {loading && (
              <div className="products-loading">
                <p>Loading products...</p>
              </div>
            )}
            
            {error && (
              <div className="products-error">
                <p>{error}</p>
                <button onClick={fetchProducts}>Try Again</button>
              </div>
            )}
            
            {!loading && !error && filteredProducts.length === 0 && (
              <div className="no-products">
                <p>No products found.</p>
              </div>
            )}
            
            {!loading && !error && filteredProducts.length > 0 && (
              <div className="products-table-container">
                <table className="products-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Product Details</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map(product => (
                      <tr key={product.product_id}>
                        <td>
                          <div className="admin-product-image">
                            <img 
                              src={getImageUrl(product.image_url)} 
                              alt={product.name} 
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400';
                              }}
                            />
                          </div>
                        </td>
                        <td>
                          <div className="product-name">{product.name}</div>
                          <div className="product-description">{product.description}</div>
                          {product.category && (
                            <div className="product-category">Category: {product.category}</div>
                          )}
                        </td>
                        <td>{formatCurrency(product.price)}</td>
                        <td>
                          <span className={`stock-badge ${
                            product.stock > 10 ? 'in-stock' : 
                            product.stock > 0 ? 'low-stock' : 
                            'out-of-stock'
                          }`}>
                            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                          </span>
                        </td>
                        <td>
                          <div className="product-actions">
                            <button 
                              className="edit-btn"
                              onClick={() => handleEditProduct(product)}
                            >
                              Edit
                            </button>
                            <button 
                              className="delete-btn"
                              onClick={() => handleDeleteProduct(product.product_id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminProducts; 