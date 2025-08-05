-- Function to prevent non-admins from changing roles
CREATE OR REPLACE FUNCTION prevent_role_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If role is being changed and the current user is not an admin, prevent it
  IF OLD.role != NEW.role AND 
     NOT EXISTS (
       SELECT 1 FROM users 
       WHERE users.id = auth.uid() 
       AND users.role = 'admin'
     ) THEN
    RAISE EXCEPTION 'Only admins can change user roles';
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to prevent role changes by non-admins
CREATE TRIGGER prevent_role_change_trigger
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION prevent_role_change();