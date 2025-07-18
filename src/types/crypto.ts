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
  type: string;
  tags: string[];
  description: string;
  definition: string;
  references: Reference[];
  relatedVertices: string[];
  notes?: string;
}

export interface Edge {
  id: string;
  type: string;
  name: string;
  description: string;
  overview: string;
  sourceVertices: string[];
  targetVertices: string[];
  tags: string[];
  model: string;
  references: Reference[];
  notes?: string;
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