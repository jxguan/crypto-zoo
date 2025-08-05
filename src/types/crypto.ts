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
  references_data: Reference[];
  related_vertices: string[];
  notes?: string;
  created_at?: string;
  updated_at?: string;
  wip?: boolean;
}

export interface Edge {
  id: string;
  type: string;
  name: string;
  overview: string;
  theorem: string;
  construction?: string;
  proof_sketch: string;
  source_vertices: string[];
  target_vertices: string[];
  tags: string[];
  model: string;
  references_data: Reference[];
  notes?: string;
  created_at?: string;
  updated_at?: string;
  wip?: boolean;
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

// User management types
export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
}

// Edit request types
export interface EditRequest {
  id: string;
  type: 'vertex' | 'edge';
  target_id?: string; // For edits to existing items
  data: Partial<Vertex> | Partial<Edge>;
  status: 'pending' | 'approved' | 'rejected';
  submitted_by?: string; // Optional for anonymous users
  submitted_email?: string; // For anonymous submissions
  submitted_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  comments?: string;
  action: 'create' | 'update' | 'delete';
}

export interface EditRequestForm {
  type: 'vertex' | 'edge';
  target_id?: string;
  data: Partial<Vertex> | Partial<Edge>;
  action: 'create' | 'update' | 'delete';
  comments?: string;
  email?: string; // Optional email for anonymous submissions
} 