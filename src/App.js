import React, { useEffect, useRef } from 'react';
import logo from './logo.svg';
import './App.css';
import { DataSet, Network } from 'vis-network/standalone';

function App() {
  const networkRef = useRef(null);
  const networkInstance = useRef(null);

  useEffect(() => {
    // Create nodes and edges data
    const nodes = new DataSet([
      {id: 1, label: 'Node 1'},
      {id: 2, label: 'Node 2'},
      {id: 3, label: 'Node 3'},
      {id: 4, label: 'Node 4'},
      {id: 5, label: 'Node 5'}
    ]);

    const edges = new DataSet([
      {from: 1, to: 3},
      {from: 1, to: 2},
      {from: 2, to: 4},
      {from: 2, to: 5}
    ]);

    // Create network data object
    const data = {
      nodes: nodes,
      edges: edges
    };

    const options = {
      // Add any vis-network options here
      physics: {
        enabled: true
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
        <div 
          ref={networkRef}
          style={{
            width: '1000px',
            height: '700px',
            border: '1px solid lightgray',
            backgroundColor: 'white'
          }}
        />
      </header>
    </div>
  );
}

export default App;