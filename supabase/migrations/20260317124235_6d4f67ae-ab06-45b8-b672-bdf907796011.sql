
-- Allow password_hash to have a default for Supabase Auth managed users
ALTER TABLE public.users ALTER COLUMN password_hash SET DEFAULT 'managed_by_supabase_auth';

-- Create trigger function to sync auth.users to public.users and user_roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role app_role;
BEGIN
  -- Extract role from metadata, default to 'client'
  _role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::app_role,
    'client'::app_role
  );

  -- Insert into public.users
  INSERT INTO public.users (user_id, email, password_hash, full_name, phone, email_verified)
  VALUES (
    NEW.id,
    NEW.email,
    'managed_by_supabase_auth',
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.phone,
    COALESCE(NEW.email_confirmed_at IS NOT NULL, false)
  );

  -- Insert role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _role);

  RETURN NEW;
END;
$$;

-- Create the trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Add INSERT policy for users table (needed by the trigger via security definer)
-- Also add a policy so authenticated users can read lawyer profiles' user data
CREATE POLICY "Allow reading lawyer user profiles" ON public.users
  FOR SELECT TO authenticated
  USING (
    user_id IN (SELECT lp.user_id FROM public.lawyer_profiles lp)
  );

-- Add INSERT policy for lawyer_profiles (lawyers need to create their profile)
CREATE POLICY "Lawyers can create own profile" ON public.lawyer_profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid()::text = user_id::text);
