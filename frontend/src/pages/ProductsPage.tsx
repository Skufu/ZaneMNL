import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { getProducts } from '../services/api';
import './ProductsPage.css';

interface Product {
  product_id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock: number;
}

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="products-page">
      <div className="products-header">
        <h1>Our Products</h1>
        <p>Browse our collection of authentic caps</p>
      </div>

      {loading && (
        <div className="loading">
          <p>Loading products...</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="no-products">
          <p>No products available at the moment.</p>
        </div>
      )}

      <div className="products-grid">
        {products.map(product => (
          <ProductCard key={product.product_id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductsPage; 