-- BrainSAIT Platform Database Initialization
-- This script sets up the initial database structure and data

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types
CREATE TYPE user_role AS ENUM ('SME_OWNER', 'MENTOR', 'ADMIN', 'SUPER_ADMIN');
CREATE TYPE sme_type AS ENUM ('STARTUP', 'SMALL_BUSINESS', 'MEDIUM_ENTERPRISE', 'NON_PROFIT');
CREATE TYPE industry_focus AS ENUM (
    'HEALTHCARE_TECHNOLOGY',
    'MEDICAL_DEVICES', 
    'PHARMACEUTICALS',
    'BIOTECHNOLOGY',
    'DIGITAL_HEALTH',
    'TELEMEDICINE',
    'HEALTH_ANALYTICS',
    'MEDICAL_RESEARCH',
    'HEALTHCARE_SERVICES',
    'HEALTH_INSURANCE'
);
CREATE TYPE verification_status AS ENUM ('PENDING', 'IN_REVIEW', 'VERIFIED', 'REJECTED');
CREATE TYPE program_type AS ENUM ('INCUBATION', 'ACCELERATION', 'MENTORSHIP', 'WORKSHOP', 'MASTERCLASS');
CREATE TYPE program_status AS ENUM ('DRAFT', 'PUBLISHED', 'ACTIVE', 'COMPLETED', 'CANCELLED');
CREATE TYPE enrollment_status AS ENUM ('PENDING', 'APPROVED', 'ACTIVE', 'COMPLETED', 'WITHDRAWN', 'REJECTED');
CREATE TYPE mentorship_status AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED');
CREATE TYPE session_status AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_sme_profiles_verification_status ON sme_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_programs_status ON programs(status);
CREATE INDEX IF NOT EXISTS idx_program_enrollments_status ON program_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_mentorships_status ON mentorships(status);

-- Insert initial admin user
INSERT INTO users (
    id, 
    email, 
    first_name, 
    last_name, 
    password, 
    role, 
    is_active, 
    is_verified
) VALUES (
    uuid_generate_v4(),
    'admin@brainsait.com',
    'BrainSAIT',
    'Administrator',
    '$2b$12$LQv3c1yqBFVz0L6cIgv2rO8zgP1GNlGVq8xZXGXHNWP1zqFjI1qYG', -- password: admin123
    'SUPER_ADMIN',
    true,
    true
) ON CONFLICT (email) DO NOTHING;

-- Insert sample industry focus data for reference
COMMENT ON TYPE industry_focus IS 'Healthcare industry focus areas for SMEs';

-- Create audit triggers (optional - for tracking changes)
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language plpgsql;

-- Apply audit trigger to main tables (when they exist)
-- Note: These will be applied after Prisma migrations create the tables

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE brainsait_db TO brainsait;
GRANT USAGE ON SCHEMA public TO brainsait;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO brainsait;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO brainsait;

-- Set default permissions for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO brainsait;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO brainsait;