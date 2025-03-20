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
  category: string; // Category field should be used for filtering
}

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>(['all']);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getProducts();
        setProducts(data);
        setFilteredProducts(data);
        
        // Extract unique categories from products
        const categorySet = new Set<string>();
        categorySet.add('all');
        data.forEach((product: Product) => {
          categorySet.add(product.category || 'uncategorized');
        });
        setCategories(Array.from(categorySet));
      } catch (err) {
        console.error('Error fetching products:', err);
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
      // Filter based on the category field
      const filtered = products.filter(product => 
        product.category === category || 
        // Fallback for products without a category
        (!product.category && category === 'uncategorized')
      );
      setFilteredProducts(filtered);
    }
  };

  return (
    <div className="products-page">
      <div className="products-page-header">
        <h1>Premium Caps Collection</h1>
        <p>Browse our selection of high-quality authentic caps</p>
      </div>

      <div className="products-page-filters">
        {categories.map(category => (
          <button
            key={category}
            className={`products-page-filter-btn ${activeCategory === category ? 'active' : ''}`}
            onClick={() => handleCategoryFilter(category)}
          >
            {category === 'all' ? 'All Products' : 
             category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {loading && (
        <div className="products-page-loading">
          <p>Loading premium caps...</p>
        </div>
      )}

      {error && (
        <div className="products-page-error">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && filteredProducts.length === 0 && (
        <div className="products-page-no-products">
          <p>No products available in this category.</p>
        </div>
      )}

      <div className="products-page-grid">
        {filteredProducts.map(product => (
          <ProductCard key={product.product_id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductsPage; 