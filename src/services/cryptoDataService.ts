import cryptoData from '../data/crypto-primitives.json';
import type { CryptoDatabase, Vertex, Edge } from '../types/crypto';

class CryptoDataService {
  private data: CryptoDatabase;

  constructor() {
    this.data = cryptoData as CryptoDatabase;
  }

  getAllVertices(): Vertex[] {
    return this.data.vertices;
  }

  getAllEdges(): Edge[] {
    return this.data.edges;
  }

  getVertexById(id: string): Vertex | undefined {
    return this.data.vertices.find(vertex => vertex.id === id);
  }

  getEdgeById(id: string): Edge | undefined {
    return this.data.edges.find(edge => edge.id === id);
  }

  getVerticesByCategory(category: Vertex['category']): Vertex[] {
    return this.data.vertices.filter(vertex => vertex.category === category);
  }

  getEdgesByType(type: Edge['type']): Edge[] {
    return this.data.edges.filter(edge => edge.type === type);
  }

  getRelatedVertices(vertexId: string): { incoming: Vertex[], outgoing: Vertex[] } {
    const vertex = this.getVertexById(vertexId);
    if (!vertex) return { incoming: [], outgoing: [] };

    const incoming = vertex.incomingEdges
      .map(edgeId => this.getEdgeById(edgeId))
      .filter(edge => edge !== undefined)
      .flatMap(edge => edge!.sourceVertices)
      .map(vertexId => this.getVertexById(vertexId))
      .filter(vertex => vertex !== undefined) as Vertex[];

    const outgoing = vertex.outgoingEdges
      .map(edgeId => this.getEdgeById(edgeId))
      .filter(edge => edge !== undefined)
      .flatMap(edge => edge!.targetVertices)
      .map(vertexId => this.getVertexById(vertexId))
      .filter(vertex => vertex !== undefined) as Vertex[];

    return { incoming, outgoing };
  }

  getEdgesForVertex(vertexId: string): { incoming: Edge[], outgoing: Edge[] } {
    const vertex = this.getVertexById(vertexId);
    if (!vertex) return { incoming: [], outgoing: [] };

    const incoming = vertex.incomingEdges
      .map(edgeId => this.getEdgeById(edgeId))
      .filter(edge => edge !== undefined) as Edge[];

    const outgoing = vertex.outgoingEdges
      .map(edgeId => this.getEdgeById(edgeId))
      .filter(edge => edge !== undefined) as Edge[];

    return { incoming, outgoing };
  }

  searchVertices(query: string): Vertex[] {
    const lowerQuery = query.toLowerCase();
    return this.data.vertices.filter(vertex =>
      vertex.name.toLowerCase().includes(lowerQuery) ||
      vertex.abbreviation.toLowerCase().includes(lowerQuery) ||
      vertex.definition.toLowerCase().includes(lowerQuery)
    );
  }

  searchEdges(query: string): Edge[] {
    const lowerQuery = query.toLowerCase();
    return this.data.edges.filter(edge =>
      edge.name.toLowerCase().includes(lowerQuery) ||
      edge.description.toLowerCase().includes(lowerQuery) ||
      edge.overview.toLowerCase().includes(lowerQuery)
    );
  }

  // For future user submissions
  addVertex(vertex: Omit<Vertex, 'id'>): Vertex {
    const newVertex: Vertex = {
      ...vertex,
      id: `vertex_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    this.data.vertices.push(newVertex);
    return newVertex;
  }

  addEdge(edge: Omit<Edge, 'id'>): Edge {
    const newEdge: Edge = {
      ...edge,
      id: `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    this.data.edges.push(newEdge);
    return newEdge;
  }
}

export const cryptoDataService = new CryptoDataService(); 