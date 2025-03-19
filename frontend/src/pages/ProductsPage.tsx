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
  category?: string; // Adding category for filtering
}

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Sample categories - in a real app, these would come from the backend
  const categories = ['all', 'baseball caps', 'snapbacks', 'fitted caps', 'trucker'];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getProducts();
        setProducts(data);
        setFilteredProducts(data);
      } catch (err) {
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleCategoryFilter = (category: string) => {
    setActiveCategory(category);
    if (category === 'all') {
      setFilteredProducts(products);
    } else {
      // In a real app, you would filter based on actual category field
      // This is a simplified example
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(category.toLowerCase()) || 
        product.description.toLowerCase().includes(category.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  };

  return (
    <div className="products-page">
      <div className="products-header">
        <h1>Premium Caps Collection</h1>
        <p>Browse our selection of high-quality authentic caps</p>
      </div>

      <div className="product-filters">
        {categories.map(category => (
          <button
            key={category}
            className={`filter-btn ${activeCategory === category ? 'active' : ''}`}
            onClick={() => handleCategoryFilter(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {loading && (
        <div className="loading">
          <p>Loading premium caps...</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && filteredProducts.length === 0 && (
        <div className="no-products">
          <p>No products available in this category.</p>
        </div>
      )}

      <div className="products-grid">
        {filteredProducts.map(product => (
          <ProductCard key={product.product_id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductsPage; 