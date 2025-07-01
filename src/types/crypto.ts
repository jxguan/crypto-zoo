export interface Reference {
  title: string;
  author: string;
  year: number;
  url: string;
}

export interface Vertex {
  id: string;
  name: string;
  abbreviation: string;
  definition: string;
  description: string;
  category: 'foundational' | 'symmetric' | 'asymmetric' | 'quantum' | 'post-quantum';
  references: Reference[];
  outgoingEdges: string[];
  incomingEdges: string[];
}

export interface Edge {
  id: string;
  type: 'construction' | 'impossibility' | 'reduction' | 'separation';
  name: string;
  description: string;
  overview: string;
  sourceVertices: string[];
  targetVertices: string[];
  category: 'symmetric' | 'asymmetric' | 'quantum' | 'post-quantum';
  references: Reference[];
  complexity?: string;
  security?: string;
}

export interface CryptoDatabase {
  vertices: Vertex[];
  edges: Edge[];
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'vertex' | 'edge';
  data: Vertex | Edge;
  x?: number;
  y?: number;
}

export interface GraphLink {
  source: string;
  target: string;
  edgeId: string;
  type: 'construction' | 'impossibility' | 'reduction' | 'separation';
} 