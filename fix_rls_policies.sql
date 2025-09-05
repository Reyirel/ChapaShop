-- Fix RLS Policies to prevent infinite recursion
-- This script fixes the circular reference issue in the profiles table policies

-- First, get all policy names for profiles table and drop them
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON profiles', policy_record.policyname);
    END LOOP;
END $$;

-- Create new policies without circular references
-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Allow authenticated users to insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create a separate function to check admin role without recursion
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM auth.users u
        WHERE u.id = auth.uid() 
        AND u.raw_user_meta_data->>'role' = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin policy using the function
CREATE POLICY "Admins can do everything on profiles" ON profiles
    FOR ALL USING (is_admin());

-- Fix other table policies that might have similar issues
-- Drop and recreate business policies
DROP POLICY IF EXISTS "Admins pueden hacer todo con negocios" ON businesses;
DROP POLICY IF EXISTS "Solo usuarios tipo 'business' pueden crear negocios" ON businesses;

-- Create function to check if user is business or admin
CREATE OR REPLACE FUNCTION can_create_business()
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role 
    FROM profiles 
    WHERE id = auth.uid();
    
    RETURN user_role IN ('business', 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate business policies
CREATE POLICY "Business users can create businesses" ON businesses
    FOR INSERT WITH CHECK (
        owner_id = auth.uid() AND can_create_business()
    );

CREATE POLICY "Admins can do everything on businesses" ON businesses
    FOR ALL USING (is_admin());

-- Fix categories policies
DROP POLICY IF EXISTS "Admins pueden gestionar categorías" ON business_categories;

CREATE POLICY "Admins can manage categories" ON business_categories
    FOR ALL USING (is_admin());

-- Create policy for service account operations (for triggers)
CREATE POLICY "Service role can manage profiles" ON profiles
    FOR ALL USING (current_setting('role') = 'service_role');
