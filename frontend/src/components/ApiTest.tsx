import React, { useState, useEffect } from 'react';

const ApiTest: React.FC = () => {
  const [status, setStatus] = useState<string>('Testing connection...');
  
  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await fetch('http://localhost:8080/products');
        if (response.ok) {
          const data = await response.json();
          setStatus(`Connected! Found ${data.length} products.`);
        } else {
          setStatus(`Error: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        setStatus(`Connection failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    };
    
    testConnection();
  }, []);
  
  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '10px', 
      right: '10px',
      padding: '10px',
      background: status.includes('Connected') ? '#d4edda' : '#f8d7da',
      border: '1px solid',
      borderColor: status.includes('Connected') ? '#c3e6cb' : '#f5c6cb',
      borderRadius: '4px',
      zIndex: 1000
    }}>
      <p><strong>API Status:</strong> {status}</p>
    </div>
  );
};

export default ApiTest; 