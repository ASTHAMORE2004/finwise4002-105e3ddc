-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Add reviewed_by and reviewed_at columns to ipo_listings
ALTER TABLE public.ipo_listings 
ADD COLUMN IF NOT EXISTS reviewed_by uuid,
ADD COLUMN IF NOT EXISTS reviewed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Add reviewed columns to startup_registrations  
ALTER TABLE public.startup_registrations
ADD COLUMN IF NOT EXISTS reviewed_by uuid,
ADD COLUMN IF NOT EXISTS reviewed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Allow admins to update all IPO listings
DROP POLICY IF EXISTS "Users can update IPO listings" ON public.ipo_listings;
CREATE POLICY "Admins can update all IPO listings"
ON public.ipo_listings
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update all startup registrations
DROP POLICY IF EXISTS "Users can update their own startup" ON public.startup_registrations;
CREATE POLICY "Users can update their own startup"
ON public.startup_registrations
FOR UPDATE
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all startups (including pending)
DROP POLICY IF EXISTS "Anyone can view approved startups" ON public.startup_registrations;
CREATE POLICY "View startups based on status or ownership"
ON public.startup_registrations
FOR SELECT
USING (
  status IN ('approved', 'live', 'funded') 
  OR auth.uid() = user_id 
  OR public.has_role(auth.uid(), 'admin')
);