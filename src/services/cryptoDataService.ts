import verticesData from '../data/vertices.json';
import edgesData from '../data/edges.json';
import type { CryptoDatabase, Vertex, Edge } from '../types/crypto';

class CryptoDataService {
  private data: CryptoDatabase;

  constructor() {
    this.data = {
      vertices: (verticesData as { vertices: Vertex[] }).vertices,
      edges: (edgesData as { edges: Edge[] }).edges
    };
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

  getEdgesByType(type: string): Edge[] {
    return this.data.edges.filter(edge => edge.type === type);
  }

  getRelatedVertices(vertexId: string): { incoming: Vertex[], outgoing: Vertex[] } {
    // Find incoming edges: edges where this vertex is in targetVertices
    const incomingEdges = this.data.edges.filter(edge => edge.targetVertices.includes(vertexId));
    // Find outgoing edges: edges where this vertex is in sourceVertices
    const outgoingEdges = this.data.edges.filter(edge => edge.sourceVertices.includes(vertexId));

    const incoming = incomingEdges
      .flatMap(edge => edge.sourceVertices)
      .filter(id => id !== vertexId)
      .map(id => this.getVertexById(id))
      .filter(vertex => vertex !== undefined) as Vertex[];

    const outgoing = outgoingEdges
      .flatMap(edge => edge.targetVertices)
      .filter(id => id !== vertexId)
      .map(id => this.getVertexById(id))
      .filter(vertex => vertex !== undefined) as Vertex[];

    return { incoming, outgoing };
  }

  getEdgesForVertex(vertexId: string): { incoming: Edge[], outgoing: Edge[] } {
    // Incoming: edges where this vertex is in targetVertices
    const incoming = this.data.edges.filter(edge => edge.targetVertices.includes(vertexId));
    // Outgoing: edges where this vertex is in sourceVertices
    const outgoing = this.data.edges.filter(edge => edge.sourceVertices.includes(vertexId));
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