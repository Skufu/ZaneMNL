import React, { useState, useEffect, useRef } from 'react';
import './ProductForm.css';

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

interface ProductFormProps {
  product: Product | null;
  onSubmit: (productData: any) => void;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSubmit, onCancel }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    image_url: '',
    category: '',
  });
  const [errors, setErrors] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    image_url: '',
    category: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [imageSource, setImageSource] = useState<'url' | 'upload'>('url');

  // Helper function to get the correct image URL
  const getImageUrl = (url: string | null | undefined): string => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_URL}${url}`;
  };

  useEffect(() => {
    // If editing an existing product, populate the form
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        stock: product.stock.toString(),
        image_url: product.image_url || '',
        category: product.category || '',
      });
      
      if (product.image_url) {
        setPreviewUrl(getImageUrl(product.image_url));
        setImageSource('url');
      }
    }
  }, [product]);

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      // Only revoke if it's a blob URL (from file upload)
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // For price, only allow digits and a single decimal point
    if (name === 'price') {
      const regex = /^[0-9]*\.?[0-9]*$/;
      if (value === '' || regex.test(value)) {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
      return;
    }
    
    // For stock, only allow integers
    if (name === 'stock') {
      const regex = /^[0-9]*$/;
      if (value === '' || regex.test(value)) {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
      return;
    }
    
    // For other fields
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageSourceChange = (source: 'url' | 'upload') => {
    setImageSource(source);
    
    // Clean up previous blob URL if exists
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    
    // Clear image-related data when switching methods
    if (source === 'url') {
      setImageFile(null);
      setPreviewUrl(formData.image_url ? getImageUrl(formData.image_url) : '');
    } else {
      setFormData(prev => ({ ...prev, image_url: '' }));
      setPreviewUrl('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setImageFile(file);
      
      // Create preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      // Clear any image URL errors
      setErrors(prev => ({ ...prev, image_url: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      name: '',
      description: '',
      price: '',
      stock: '',
      image_url: '',
      category: '',
    };
    let isValid = true;

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
      isValid = false;
    }

    // Validate description
    if (!formData.description.trim()) {
      newErrors.description = 'Product description is required';
      isValid = false;
    }

    // Validate price
    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
      isValid = false;
    } else if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
      isValid = false;
    }

    // Validate stock
    if (!formData.stock.trim()) {
      newErrors.stock = 'Stock is required';
      isValid = false;
    } else if (isNaN(parseInt(formData.stock)) || parseInt(formData.stock) < 0) {
      newErrors.stock = 'Stock must be a non-negative number';
      isValid = false;
    }

    // Validate image (either URL or file)
    if (imageSource === 'url' && formData.image_url.trim() && !isValidUrl(formData.image_url)) {
      newErrors.image_url = 'Please enter a valid URL';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      // Create a FormData object for file upload
      const productFormData = new FormData();
      
      // Add all form fields with proper capitalization for the backend
      productFormData.append('Name', formData.name);
      productFormData.append('Description', formData.description);
      
      // Ensure numeric fields are properly formatted without localization issues
      // Parse then stringify to remove any non-numeric characters and format properly
      let price = '0';
      let stock = '0';
      
      try {
        // Remove any non-numeric characters except decimal point for price
        const cleanPrice = formData.price.replace(/[^0-9.]/g, '');
        price = parseFloat(cleanPrice).toString();
      } catch (err) {
        console.error('Error parsing price:', err);
        price = '0';
      }
      
      try {
        // Remove any non-numeric characters for stock
        const cleanStock = formData.stock.replace(/[^0-9]/g, '');
        stock = parseInt(cleanStock).toString();
      } catch (err) {
        console.error('Error parsing stock:', err);
        stock = '0';
      }
      
      productFormData.append('Price', price);
      productFormData.append('Stock', stock);
      
      if (formData.category) {
        productFormData.append('Category', formData.category);
      }
      
      // Handle image
      if (imageSource === 'upload' && imageFile) {
        productFormData.append('Image', imageFile);
      } else if (imageSource === 'url' && formData.image_url) {
        productFormData.append('ImageURL', formData.image_url);
      }
      
      // Log what we're sending
      console.log("Submitting with price:", price, "stock:", stock);
      
      onSubmit(productFormData);
    } catch (err) {
      console.error('Error preparing form data:', err);
      alert('Error preparing form data. Please check your inputs and try again.');
    }
  };

  return (
    <div className="product-form-container">
      <h2>{product ? 'Edit Product' : 'Add New Product'}</h2>
      
      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-group">
          <label htmlFor="name">Product Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? 'error' : ''}
          />
          {errors.name && <div className="error-text">{errors.name}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className={errors.description ? 'error' : ''}
          />
          {errors.description && <div className="error-text">{errors.description}</div>}
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="price">Price (₱)</label>
            <input
              type="text"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className={errors.price ? 'error' : ''}
              placeholder="0.00"
            />
            {errors.price && <div className="error-text">{errors.price}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="stock">Stock</label>
            <input
              type="text"
              id="stock"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              className={errors.stock ? 'error' : ''}
              placeholder="0"
            />
            {errors.stock && <div className="error-text">{errors.stock}</div>}
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <input
            type="text"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="e.g. snapbacks, fitted caps, etc."
          />
        </div>
        
        <div className="image-source-selector">
          <button 
            type="button" 
            className={`image-source-btn ${imageSource === 'url' ? 'active' : ''}`}
            onClick={() => handleImageSourceChange('url')}
          >
            Image URL
          </button>
          <button 
            type="button" 
            className={`image-source-btn ${imageSource === 'upload' ? 'active' : ''}`}
            onClick={() => handleImageSourceChange('upload')}
          >
            Upload Image
          </button>
        </div>
        
        {imageSource === 'url' ? (
          <div className="form-group">
            <label htmlFor="image_url">Image URL</label>
            <input
              type="text"
              id="image_url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              className={errors.image_url ? 'error' : ''}
              placeholder="https://example.com/image.jpg"
            />
            {errors.image_url && <div className="error-text">{errors.image_url}</div>}
          </div>
        ) : (
          <div className="admin-image-upload">
            <label htmlFor="image-upload" className="admin-image-upload-label">
              {imageFile ? `Selected: ${imageFile.name}` : 'Choose an image file'}
            </label>
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              onChange={handleFileChange}
              className="admin-image-upload-input"
              ref={fileInputRef}
            />
          </div>
        )}
        
        {previewUrl && (
          <div className="admin-image-preview">
            <img src={previewUrl} alt="Product preview" />
          </div>
        )}
        
        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="submit-btn">
            {product ? 'Update Product' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm; 