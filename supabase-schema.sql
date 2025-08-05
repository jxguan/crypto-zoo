-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vertices table
CREATE TABLE IF NOT EXISTS vertices (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  abbreviation TEXT DEFAULT '',
  type TEXT NOT NULL CHECK (type IN ('primitive', 'assumption')),
  tags TEXT[] DEFAULT '{}',
  description TEXT DEFAULT '',
  definition TEXT DEFAULT '',
  related_vertices TEXT[] DEFAULT '{}',
  references_data JSONB DEFAULT '[]',
  notes TEXT DEFAULT '',
  wip BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create edges table
CREATE TABLE IF NOT EXISTS edges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('construction', 'separation', 'impossibility')),
  overview TEXT NOT NULL,
  theorem TEXT DEFAULT '',
  construction TEXT DEFAULT '',
  proof_sketch TEXT DEFAULT '',
  source_vertices TEXT[] DEFAULT '{}',
  target_vertices TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  model TEXT NOT NULL CHECK (model IN ('plain', 'random oracle', 'crs')),
  references_data JSONB DEFAULT '[]',
  notes TEXT DEFAULT '',
  wip BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create edit_requests table
CREATE TABLE IF NOT EXISTS edit_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('vertex', 'edge')),
  target_id TEXT,
  data JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_by UUID REFERENCES users(id),
  submitted_email TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  comments TEXT,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vertices_name ON vertices(name);
CREATE INDEX IF NOT EXISTS idx_vertices_type ON vertices(type);
CREATE INDEX IF NOT EXISTS idx_edges_name ON edges(name);
CREATE INDEX IF NOT EXISTS idx_edges_type ON edges(type);
CREATE INDEX IF NOT EXISTS idx_edit_requests_status ON edit_requests(status);
CREATE INDEX IF NOT EXISTS idx_edit_requests_submitted_by ON edit_requests(submitted_by);
CREATE INDEX IF NOT EXISTS idx_edit_requests_type ON edit_requests(type);

-- Create RLS (Row Level Security) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vertices ENABLE ROW LEVEL SECURITY;
ALTER TABLE edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE edit_requests ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Function to check if current user is admin (bypasses RLS)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admins can read all users' data
CREATE POLICY "Admins can read all users" ON users
  FOR SELECT USING (is_admin());

-- Anyone can insert pending users (for signup)
CREATE POLICY "Anyone can insert pending users" ON users
  FOR INSERT WITH CHECK (role = 'pending');

-- Users can insert their own data (for authenticated users)
CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own data and change role from pending to user
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (
    auth.uid() = id
  ) WITH CHECK (
    auth.uid() = id AND (
      role = 'user' OR 
      role = 'admin' OR 
      (role = 'pending' AND (SELECT role FROM users WHERE id = auth.uid()) = 'pending')
    )
  );

-- Admins can update any user's data
CREATE POLICY "Admins can update any user" ON users
  FOR UPDATE USING (is_admin())
  WITH CHECK (is_admin());

-- Anyone can read vertices and edges (public data)
CREATE POLICY "Anyone can read vertices" ON vertices
  FOR SELECT USING (true);

CREATE POLICY "Anyone can read edges" ON edges
  FOR SELECT USING (true);

-- Only admins can modify vertices and edges
CREATE POLICY "Only admins can modify vertices" ON vertices
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Only admins can modify edges" ON edges
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Drop existing policies for edit_requests to recreate them properly
DROP POLICY IF EXISTS "Anyone can create edit requests" ON edit_requests;
DROP POLICY IF EXISTS "Users can read own edit requests" ON edit_requests;
DROP POLICY IF EXISTS "Admins can read all edit requests" ON edit_requests;
DROP POLICY IF EXISTS "Only admins can update edit requests" ON edit_requests;
DROP POLICY IF EXISTS "Only admins can delete edit requests" ON edit_requests;

-- Anyone can create edit requests (anonymous or authenticated users)
-- This policy allows both authenticated users and anonymous users to insert
CREATE POLICY "Anyone can create edit requests" ON edit_requests
  FOR INSERT WITH CHECK (
    -- Allow if user is authenticated
    (auth.uid() IS NOT NULL)
    OR
    -- Allow if user has email
    (submitted_email IS NOT NULL)
  );

-- Users can read their own edit requests (for authenticated users)
CREATE POLICY "Users can read own edit requests" ON edit_requests
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND auth.uid() = submitted_by
  );

-- Admins can read all edit requests
CREATE POLICY "Admins can read all edit requests" ON edit_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Only admins can update edit requests (approve/reject)
CREATE POLICY "Only admins can update edit requests" ON edit_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Also allow admins to delete edit requests if needed
CREATE POLICY "Only admins can delete edit requests" ON edit_requests
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_vertices_updated_at 
  BEFORE UPDATE ON vertices 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_edges_updated_at 
  BEFORE UPDATE ON edges 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle approved edit requests
CREATE OR REPLACE FUNCTION handle_approved_edit_request()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process when status changes to approved
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    
    -- Handle vertex operations
    IF NEW.type = 'vertex' THEN
      IF NEW.action = 'create' THEN
        INSERT INTO vertices (id, name, abbreviation, type, tags, description, definition, references_data, related_vertices, notes)
        VALUES (
          (NEW.data->>'id'),
          NEW.data->>'name',
          NEW.data->>'abbreviation',
          NEW.data->>'type',
          ARRAY(SELECT jsonb_array_elements_text(NEW.data->'tags')),
          NEW.data->>'description',
          NEW.data->>'definition',
          NEW.data->'references_data',
          ARRAY(SELECT jsonb_array_elements_text(NEW.data->'relatedVertices')),
          NEW.data->>'notes'
        );
      ELSIF NEW.action = 'update' THEN
        UPDATE vertices SET
          name = COALESCE(NEW.data->>'name', name),
          abbreviation = COALESCE(NEW.data->>'abbreviation', abbreviation),
          type = COALESCE(NEW.data->>'type', type),
          tags = COALESCE(ARRAY(SELECT jsonb_array_elements_text(NEW.data->'tags')), tags),
          description = COALESCE(NEW.data->>'description', description),
          definition = COALESCE(NEW.data->>'definition', definition),
          references_data = COALESCE(NEW.data->'references_data', references_data),
          related_vertices = COALESCE(ARRAY(SELECT jsonb_array_elements_text(NEW.data->'relatedVertices')), related_vertices),
          notes = COALESCE(NEW.data->>'notes', notes)
        WHERE id = NEW.target_id;
      ELSIF NEW.action = 'delete' THEN
        DELETE FROM vertices WHERE id = NEW.target_id;
      END IF;
    END IF;
    
    -- Handle edge operations
    IF NEW.type = 'edge' THEN
      IF NEW.action = 'create' THEN
        INSERT INTO edges (id, type, name, overview, theorem, construction, proof_sketch, source_vertices, target_vertices, tags, model, references_data, notes)
        VALUES (
          (NEW.data->>'id'),
          NEW.data->>'type',
          NEW.data->>'name',
          NEW.data->>'overview',
          NEW.data->>'theorem',
          NEW.data->>'construction',
          NEW.data->>'proof_sketch',
          ARRAY(SELECT jsonb_array_elements_text(NEW.data->'sourceVertices')),
          ARRAY(SELECT jsonb_array_elements_text(NEW.data->'targetVertices')),
          ARRAY(SELECT jsonb_array_elements_text(NEW.data->'tags')),
          NEW.data->>'model',
          NEW.data->'references_data',
          NEW.data->>'notes'
        );
      ELSIF NEW.action = 'update' THEN
        UPDATE edges SET
          type = COALESCE(NEW.data->>'type', type),
          name = COALESCE(NEW.data->>'name', name),
          overview = COALESCE(NEW.data->>'overview', overview),
          theorem = COALESCE(NEW.data->>'theorem', theorem),
          construction = COALESCE(NEW.data->>'construction', construction),
          proof_sketch = COALESCE(NEW.data->>'proof_sketch', proof_sketch),
          source_vertices = COALESCE(ARRAY(SELECT jsonb_array_elements_text(NEW.data->'sourceVertices')), source_vertices),
          target_vertices = COALESCE(ARRAY(SELECT jsonb_array_elements_text(NEW.data->'targetVertices')), target_vertices),
          tags = COALESCE(ARRAY(SELECT jsonb_array_elements_text(NEW.data->'tags')), tags),
          model = COALESCE(NEW.data->>'model', model),
          references_data = COALESCE(NEW.data->'references_data', references_data),
          notes = COALESCE(NEW.data->>'notes', notes)
        WHERE id = NEW.target_id;
      ELSIF NEW.action = 'delete' THEN
        DELETE FROM edges WHERE id = NEW.target_id;
      END IF;
    END IF;
    
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for handling approved edit requests
CREATE TRIGGER handle_approved_edit_request_trigger
  AFTER UPDATE ON edit_requests
  FOR EACH ROW EXECUTE FUNCTION handle_approved_edit_request(); 