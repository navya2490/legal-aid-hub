
-- Create enums
CREATE TYPE public.app_role AS ENUM ('client', 'lawyer', 'admin');
CREATE TYPE public.specialization AS ENUM (
  'Family Law', 'Criminal Law', 'Civil Litigation', 'Employment Law',
  'Real Estate Law', 'Business & Corporate Law', 'Immigration Law',
  'Intellectual Property', 'Tax Law', 'Estate Planning',
  'Personal Injury', 'Consumer Protection'
);
CREATE TYPE public.urgency_level AS ENUM ('Low', 'Medium', 'High', 'Critical');
CREATE TYPE public.case_status AS ENUM (
  'Submitted', 'Under Review', 'Assigned', 'In Progress',
  'Awaiting Client', 'Resolved', 'Closed'
);
CREATE TYPE public.file_type AS ENUM ('PDF', 'DOC', 'DOCX', 'JPG', 'JPEG', 'PNG');
CREATE TYPE public.virus_scan_status AS ENUM ('Pending', 'Clean', 'Infected');

-- Users table
CREATE TABLE public.users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 100),
  national_id TEXT,
  phone TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login TIMESTAMPTZ
);

-- User roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Lawyer profiles table
CREATE TABLE public.lawyer_profiles (
  lawyer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(user_id) ON DELETE CASCADE,
  bar_license_number TEXT NOT NULL,
  specializations specialization[] NOT NULL DEFAULT '{}',
  years_of_experience INTEGER NOT NULL DEFAULT 0 CHECK (years_of_experience >= 0),
  is_available BOOLEAN NOT NULL DEFAULT true,
  current_caseload INTEGER NOT NULL DEFAULT 0 CHECK (current_caseload >= 0),
  max_caseload INTEGER NOT NULL DEFAULT 20 CHECK (max_caseload > 0)
);

-- Cases table
CREATE TABLE public.cases (
  case_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_reference_number TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  assigned_lawyer_id UUID REFERENCES public.lawyer_profiles(lawyer_id) ON DELETE SET NULL,
  issue_category specialization NOT NULL,
  issue_description TEXT NOT NULL CHECK (char_length(issue_description) BETWEEN 50 AND 5000),
  specific_questions TEXT NOT NULL CHECK (char_length(specific_questions) BETWEEN 20 AND 2000),
  urgency_level urgency_level NOT NULL DEFAULT 'Medium',
  status case_status NOT NULL DEFAULT 'Submitted',
  terms_accepted BOOLEAN NOT NULL DEFAULT false,
  privacy_accepted BOOLEAN NOT NULL DEFAULT false,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  assigned_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- Case reference number format constraint
ALTER TABLE public.cases ADD CONSTRAINT case_ref_format
  CHECK (case_reference_number ~ '^CASE-\d{8}-\d{4}$');

-- Documents table
CREATE TABLE public.documents (
  document_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(case_id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type file_type NOT NULL,
  file_size INTEGER NOT NULL CHECK (file_size > 0 AND file_size <= 10485760),
  file_path TEXT NOT NULL,
  virus_scan_status virus_scan_status NOT NULL DEFAULT 'Pending',
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Messages table
CREATE TABLE public.messages (
  message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(case_id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_cases_reference ON public.cases(case_reference_number);
CREATE INDEX idx_cases_status ON public.cases(status);
CREATE INDEX idx_cases_category ON public.cases(issue_category);
CREATE INDEX idx_cases_user ON public.cases(user_id);
CREATE INDEX idx_cases_lawyer ON public.cases(assigned_lawyer_id);
CREATE INDEX idx_documents_case ON public.documents(case_id);
CREATE INDEX idx_documents_uploader ON public.documents(uploaded_by);
CREATE INDEX idx_messages_case ON public.messages(case_id);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_recipient ON public.messages(recipient_id);
CREATE INDEX idx_lawyer_profiles_user ON public.lawyer_profiles(user_id);
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cases_updated_at
  BEFORE UPDATE ON public.cases FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lawyer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users: can read own profile, admins can read all
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT TO authenticated
  USING (auth.uid()::text = user_id::text OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE TO authenticated
  USING (auth.uid()::text = user_id::text);

-- User roles: viewable by owner and admins
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid()::text = user_id::text OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Lawyer profiles: public read, owner update
CREATE POLICY "Lawyer profiles are publicly readable" ON public.lawyer_profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Lawyers can update own profile" ON public.lawyer_profiles
  FOR UPDATE TO authenticated
  USING (auth.uid()::text = user_id::text);

-- Cases: clients see own, lawyers see assigned, admins see all
CREATE POLICY "Clients can view own cases" ON public.cases
  FOR SELECT TO authenticated
  USING (
    auth.uid()::text = user_id::text
    OR assigned_lawyer_id IN (SELECT lawyer_id FROM public.lawyer_profiles WHERE user_id::text = auth.uid()::text)
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Clients can create cases" ON public.cases
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Case updates by owner/lawyer/admin" ON public.cases
  FOR UPDATE TO authenticated
  USING (
    auth.uid()::text = user_id::text
    OR assigned_lawyer_id IN (SELECT lawyer_id FROM public.lawyer_profiles WHERE user_id::text = auth.uid()::text)
    OR public.has_role(auth.uid(), 'admin')
  );

-- Documents: accessible by case participants
CREATE POLICY "Documents accessible by case participants" ON public.documents
  FOR SELECT TO authenticated
  USING (
    uploaded_by::text = auth.uid()::text
    OR case_id IN (
      SELECT case_id FROM public.cases
      WHERE user_id::text = auth.uid()::text
        OR assigned_lawyer_id IN (SELECT lawyer_id FROM public.lawyer_profiles WHERE user_id::text = auth.uid()::text)
    )
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can upload documents to their cases" ON public.documents
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid()::text = uploaded_by::text
    AND case_id IN (
      SELECT case_id FROM public.cases
      WHERE user_id::text = auth.uid()::text
        OR assigned_lawyer_id IN (SELECT lawyer_id FROM public.lawyer_profiles WHERE user_id::text = auth.uid()::text)
    )
  );

-- Messages: sender and recipient can view
CREATE POLICY "Users can view own messages" ON public.messages
  FOR SELECT TO authenticated
  USING (sender_id::text = auth.uid()::text OR recipient_id::text = auth.uid()::text);

CREATE POLICY "Users can send messages in their cases" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id::text = auth.uid()::text
    AND case_id IN (
      SELECT case_id FROM public.cases
      WHERE user_id::text = auth.uid()::text
        OR assigned_lawyer_id IN (SELECT lawyer_id FROM public.lawyer_profiles WHERE user_id::text = auth.uid()::text)
    )
  );

CREATE POLICY "Recipients can mark messages as read" ON public.messages
  FOR UPDATE TO authenticated
  USING (recipient_id::text = auth.uid()::text);
