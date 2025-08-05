import { supabase } from '../lib/supabase';
import type { Vertex, Edge, EditRequest, EditRequestForm, User } from '../types/crypto';
import { emailService } from './emailService';

// Type for the edit request data being inserted into the database
interface EditRequestInsert {
  type: 'vertex' | 'edge';
  target_id?: string;
  data: Partial<Vertex> | Partial<Edge>;
  action: 'create' | 'update' | 'delete';
  comments?: string;
  submitted_by?: string | null;
  submitted_email?: string;
}

// Type for authentication errors
type AuthError = {
  message: string;
  status?: number;
  name?: string;
};

export class SupabaseService {
  // Vertex operations
  async getAllVertices(): Promise<Vertex[]> {
    const { data, error } = await supabase
      .from('vertices')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  }

  async getVertexById(id: string): Promise<Vertex | null> {
    const { data, error } = await supabase
      .from('vertices')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  async createVertex(vertex: Omit<Vertex, 'id' | 'created_at' | 'updated_at'>): Promise<Vertex> {
    const { data, error } = await supabase
      .from('vertices')
      .insert(vertex)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateVertex(id: string, updates: Partial<Vertex>): Promise<Vertex> {
    const { data, error } = await supabase
      .from('vertices')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteVertex(id: string): Promise<void> {
    const { error } = await supabase
      .from('vertices')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Edge operations
  async getAllEdges(): Promise<Edge[]> {
    const { data, error } = await supabase
      .from('edges')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  }

  async getEdgeById(id: string): Promise<Edge | null> {
    const { data, error } = await supabase
      .from('edges')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  async createEdge(edge: Omit<Edge, 'id' | 'created_at' | 'updated_at'>): Promise<Edge> {
    const { data, error } = await supabase
      .from('edges')
      .insert(edge)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateEdge(id: string, updates: Partial<Edge>): Promise<Edge> {
    const { data, error } = await supabase
      .from('edges')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteEdge(id: string): Promise<void> {
    const { error } = await supabase
      .from('edges')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Search operations
  async searchVertices(query: string): Promise<Vertex[]> {
    const { data, error } = await supabase
      .from('vertices')
      .select('*')
      .or(`name.ilike.%${query}%,abbreviation.ilike.%${query}%,definition.ilike.%${query}%`)
      .order('name');
    
    if (error) throw error;
    return data || [];
  }

  async searchEdges(query: string): Promise<Edge[]> {
    const { data, error } = await supabase
      .from('edges')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,overview.ilike.%${query}%`)
      .order('name');
    
    if (error) throw error;
    return data || [];
  }

  // Edit request operations
  async submitEditRequest(request: EditRequestForm): Promise<EditRequest> {
    // Check if user is authenticated without throwing errors
    let user = null;
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      user = authUser;
    } catch {
      // User not authenticated (anonymous)
    }
    
    const editRequest: EditRequestInsert = {
      type: request.type,
      target_id: request.target_id,
      data: request.data,
      action: request.action,
      comments: request.comments
    };

    // If user is authenticated, use their ID, otherwise use email
    if (user && user.id) {
      editRequest.submitted_by = user.id;
      // Also set email if provided (for the RLS policy)
      if (request.email) {
        editRequest.submitted_email = request.email;
      }
    } else if (request.email) {
      editRequest.submitted_email = request.email;
      // Don't set submitted_by for anonymous users - let it be NULL
    }

    // Check if we have any auth headers that might be causing issues
    const session = await supabase.auth.getSession();
    
    // If we have a session but no user, clear the invalid session
    if (session?.data?.session && !session?.data?.session?.user) {
      await supabase.auth.signOut();
    }

    // For anonymous users, don't select the inserted data to avoid RLS issues
    if (user && user.id) {
      // Authenticated user - can select the inserted data
      const { data, error } = await supabase
        .from('edit_requests')
        .insert(editRequest)
        .select()
        .single();
      
      if (error) throw error;
      
      // Send confirmation email
      const emailToSend = user?.email || request.email;
      if (emailToSend) {
        try {
          await emailService.sendEditRequestConfirmation(emailToSend, data);
        } catch (emailError) {
          console.error('Failed to send confirmation email:', emailError);
          // Don't throw error to avoid breaking the main flow
        }
      }
      
      return data;
    } else {
      // Anonymous user - just insert without selecting
      const { error } = await supabase
        .from('edit_requests')
        .insert(editRequest);
      
      if (error) throw error;
      
      // For anonymous users, create a minimal response object
      const responseData: EditRequest = {
        id: 'temp-id', // This will be replaced by the actual ID from the database
        type: editRequest.type,
        target_id: editRequest.target_id,
        data: editRequest.data,
        action: editRequest.action,
        comments: editRequest.comments,
        submitted_by: editRequest.submitted_by || undefined,
        submitted_email: editRequest.submitted_email,
        status: 'pending',
        submitted_at: new Date().toISOString()
        // reviewed_at and reviewed_by are optional and will be undefined by default
      };
      
      // Send confirmation email
      if (request.email) {
        try {
          await emailService.sendEditRequestConfirmation(request.email, responseData);
        } catch (emailError) {
          console.error('Failed to send confirmation email:', emailError);
          // Don't throw error to avoid breaking the main flow
        }
      }
      
      return responseData;
    }
  }

  async getEditRequests(status?: 'pending' | 'approved' | 'rejected'): Promise<EditRequest[]> {
    let query = supabase
      .from('edit_requests')
      .select('*')
      .order('submitted_at', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getOriginalDataForEditRequest(editRequest: EditRequest): Promise<Vertex | Edge | null> {
    if (editRequest.action === 'create' || !editRequest.target_id) {
      return null;
    }

    try {
      if (editRequest.type === 'vertex') {
        return await this.getVertexById(editRequest.target_id);
      } else {
        return await this.getEdgeById(editRequest.target_id);
      }
    } catch {
      // If the item doesn't exist, return null
      return null;
    }
  }

  async updateEditRequestStatus(
    id: string, 
    status: 'approved' | 'rejected', 
    comments?: string
  ): Promise<EditRequest> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('edit_requests')
      .update({
        status,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        comments
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;

    // Send status update email
    const emailToSend = data.submitted_email;
    if (emailToSend) {
      try {
        await emailService.sendEditRequestStatusUpdate(emailToSend, data, status, comments);
      } catch (emailError) {
        console.error('Failed to send status update email:', emailError);
        // Don't throw error to avoid breaking the main flow
      }
    }

    return data;
  }

  // User operations
  async getCurrentUser(session?: { user?: { id: string; email?: string; created_at?: string } }): Promise<User | null> {
    try {
      console.log('getCurrentUser: Starting...');
      
      /*
             // Add timeout to prevent hanging
       const timeoutPromise = new Promise<null>((resolve) => {
         setTimeout(() => {
           console.error('getCurrentUser: Timeout reached, returning null');
           resolve(null);
         }, 5000); // 3 second timeout
       });*/
      
            const getUserPromise = async () => {  
        let user = null;
        
        if (session?.user) {
          // Use user from session if provided
          user = session.user;
          console.log('getCurrentUser: Using user from session:', user.id);
        } else {
          // Fallback to auth.getUser() if no session provided
          console.log('getCurrentUser: No session provided, calling auth.getUser()...');
          const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
          
          if (authError) {
            console.error('getCurrentUser: Auth error:', authError);
            return null;
          }
          
          if (!authUser) {
            console.log('getCurrentUser: No user found');
            return null;
          }
          
          user = authUser;
          console.log('getCurrentUser: User found from auth:', user.id);
        }
        // Get user details from database with retry logic
        console.log('getCurrentUser: About to query users table...');
        let data = null;
        let error = null;
        
        try {
          console.log(`getCurrentUser: Database query attempt...`, user.id);
          const result = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();
          
          data = result.data;
          error = result.error;
          
        } catch (err) {
          console.error('getCurrentUser: Exception during database query:', err);
          error = err;
          
        }
        
        if (error) {
          console.error('getCurrentUser: Error fetching user from database after retries:', error);
          // Fallback to basic user object if database query fails
          console.log('getCurrentUser: Falling back to basic user object...');
          const basicUser: User = {
            id: user.id,
            email: user.email || '',
            first_name: '',
            last_name: '',
            role: 'user',
            created_at: user.created_at || new Date().toISOString()
          };
          return basicUser;
        }
        
        console.log('getCurrentUser: User data fetched:', data?.id, data?.role);
        
        // If user is pending, upgrade them to regular user
        if (data && data.role === 'pending') {
          console.log('getCurrentUser: Upgrading pending user...');
          const { error: updateError } = await supabase
            .from('users')
            .update({ role: 'user' })
            .eq('id', user.id);
          
          if (updateError) {
            console.error('Failed to upgrade pending user:', updateError);
            return data; // Return the user as-is if upgrade fails
          }
          
          // Get the updated user record
          const { data: updatedData, error: updatedError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (updatedError) {
            console.error('Error fetching updated user:', updatedError);
            return data; // Return the original user if fetch fails
          }
          
          console.log('getCurrentUser: User upgraded successfully:', updatedData?.id);
          return updatedData;
        }
        
        console.log('getCurrentUser: Returning user:', data?.id);
        return data;
        
      };
      
      // Race between the actual operation and the timeout
      const result = await getUserPromise();
      console.log('getCurrentUser: Result:', result);
      return result;
      
    } catch (error) {
      console.error('getCurrentUser: Unexpected error:', error);
      return null;
    }
  }

  async signIn(email: string, password: string): Promise<{ user: User | null; error: AuthError | null }> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return { user: null, error };
    }
    
         if (data.user) {
       
       // Get user details from database directly to avoid double calls
       const { data: userData, error: userError } = await supabase
         .from('users')
         .select('*')
         .eq('id', data.user.id)
         .single();
       
       if (userError) {
         console.error('Error fetching user from database:', userError);
         return { user: null, error: userError };
       }
       
       // If user is pending, upgrade them to regular user
       if (userData && userData.role === 'pending') {
         const { error: updateError } = await supabase
           .from('users')
           .update({ role: 'user' })
           .eq('id', data.user.id);
         
         if (updateError) {
           console.error('Failed to upgrade pending user:', updateError);
           return { user: null, error: updateError };
         }
         
         // Get the updated user record
         const { data: updatedUserData, error: updatedUserError } = await supabase
           .from('users')
           .select('*')
           .eq('id', data.user.id)
           .single();
         
         if (updatedUserError) {
           console.error('Error fetching updated user:', updatedUserError);
           return { user: null, error: updatedUserError };
         }
         
         return { user: updatedUserData, error: null };
       }
       
       return { user: userData, error: null };
       
     }

    return { user: null, error: null };
  }

  async signUp(email: string, password: string, firstName?: string, lastName?: string): Promise<{ user: User | null; error: AuthError | null }> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });
    if (error) return { user: null, error };
    
    if (data.user) {
      // Create pending user record in users table
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email!,
          first_name: firstName || '',
          last_name: lastName || '',
          role: 'pending'
        });

      if (userError) {
        // Handle specific database errors
        if (userError.code === '23505') {
          return { 
            user: null, 
            error: { 
              message: 'An account with this email address already exists. Please try signing in instead.',
              status: 409,
              name: 'DuplicateEmailError'
            } 
          };
        }
        return { user: null, error: userError };
      }

      // For email confirmation, we don't return the user immediately
      // The user needs to confirm their email before they can sign in
      return { user: null, error: null };
    }

    return { user: null, error: null };
  }

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  // Helper methods
  async getRelatedVertices(vertexId: string): Promise<{ incoming: Vertex[], outgoing: Vertex[] }> {
    const edges = await this.getAllEdges();
    
    const incomingEdges = edges.filter(edge => 
      edge.target_vertices && Array.isArray(edge.target_vertices) && edge.target_vertices.includes(vertexId)
    );
    const outgoingEdges = edges.filter(edge => 
      edge.source_vertices && Array.isArray(edge.source_vertices) && edge.source_vertices.includes(vertexId)
    );

    const incomingIds = incomingEdges
      .flatMap(edge => edge.source_vertices || [])
      .filter(id => id !== vertexId);

    const outgoingIds = outgoingEdges
      .flatMap(edge => edge.target_vertices || [])
      .filter(id => id !== vertexId);

    // Get unique IDs
    const uniqueIncomingIds = [...new Set(incomingIds)];
    const uniqueOutgoingIds = [...new Set(outgoingIds)];

    // Fetch vertices in parallel
    const [incomingVertices, outgoingVertices] = await Promise.all([
      Promise.all(uniqueIncomingIds.map(id => this.getVertexById(id))),
      Promise.all(uniqueOutgoingIds.map(id => this.getVertexById(id)))
    ]);

    const incoming = incomingVertices.filter((vertex): vertex is Vertex => vertex !== null);
    const outgoing = outgoingVertices.filter((vertex): vertex is Vertex => vertex !== null);

    return { incoming, outgoing };
  }

  async getEdgesForVertex(vertexId: string): Promise<{ incoming: Edge[], outgoing: Edge[] }> {
    const edges = await this.getAllEdges();
    
    const incoming = edges.filter(edge => 
      edge.target_vertices && Array.isArray(edge.target_vertices) && edge.target_vertices.includes(vertexId)
    );
    const outgoing = edges.filter(edge => 
      edge.source_vertices && Array.isArray(edge.source_vertices) && edge.source_vertices.includes(vertexId)
    );
    
    return { incoming, outgoing };
  }
}

export const supabaseService = new SupabaseService(); 