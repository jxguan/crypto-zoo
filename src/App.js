import React, { useEffect, useRef } from 'react';
import logo from './logo.svg';
import './App.css';
import { DataSet, Network } from 'vis-network/standalone';

function App() {
  const networkRef = useRef(null);
  const networkInstance = useRef(null);

  useEffect(() => {
    // Create nodes with cryptography objects
    const nodes = new DataSet([
      {id: 1, label: 'Hash Functions', color: '#FF6B6B', shape: 'box'},
      {id: 2, label: 'Digital Signatures', color: '#4ECDC4', shape: 'box'},
      {id: 3, label: 'One-Way Functions', color: '#45B7D1', shape: 'box'},
      {id: 4, label: 'Public Key Crypto', color: '#96CEB4', shape: 'box'},
      {id: 5, label: 'Key Exchange', color: '#FFEAA7', shape: 'box'},
      {id: 6, label: 'Collision Resistance', color: '#DDA0DD', shape: 'ellipse'},
      {id: 7, label: 'Pseudorandomness', color: '#98D8C8', shape: 'ellipse'},
      {id: 8, label: 'Trapdoor Functions', color: '#F7DC6F', shape: 'ellipse'}
    ]);

    const edges = new DataSet([
      // Hash functions imply one-way functions
      {from: 1, to: 3, arrows: 'to', label: 'implies', color: '#666'},
      // Hash functions imply collision resistance
      {from: 1, to: 6, arrows: 'to', label: 'requires', color: '#666'},
      // One-way functions imply pseudorandomness
      {from: 3, to: 7, arrows: 'to', label: 'enables', color: '#666'},
      // Trapdoor functions imply one-way functions
      {from: 8, to: 3, arrows: 'to', label: 'implies', color: '#666'},
      // Public key crypto requires trapdoor functions
      {from: 4, to: 8, arrows: 'to', label: 'requires', color: '#666'},
      // Digital signatures require public key crypto
      {from: 2, to: 4, arrows: 'to', label: 'requires', color: '#666'},
      // Key exchange requires public key crypto
      {from: 5, to: 4, arrows: 'to', label: 'requires', color: '#666'},
      // Digital signatures require hash functions
      {from: 2, to: 1, arrows: 'to', label: 'uses', color: '#666'}
    ]);

    // Create network data object
    const data = {
      nodes: nodes,
      edges: edges
    };

    const options = {
      // Network visualization options
      physics: {
        enabled: true,
        stabilization: { iterations: 200 }
      },
      edges: {
        arrows: {
          to: { enabled: true, scaleFactor: 1.2 }
        },
        font: { size: 12, color: '#333' },
        smooth: { type: 'continuous' }
      },
      nodes: {
        font: { size: 14, color: '#333' },
        borderWidth: 2,
        shadow: true
      },
      layout: {
        hierarchical: {
          enabled: false
        }
      }
    };

    // Initialize the network
    if (networkRef.current) {
      networkInstance.current = new Network(networkRef.current, data, options);
    }

    // Cleanup function
    return () => {
      if (networkInstance.current) {
        networkInstance.current.destroy();
      }
    };
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h2 style={{ color: 'white', marginBottom: '20px' }}>
          Cryptographic Implications Network
        </h2>
        <div 
          ref={networkRef}
          style={{
            width: '1200px',
            height: '800px',
            border: '2px solid #444',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
          }}
        />
      </header>
    </div>
  );
}

export default App;