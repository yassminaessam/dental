-- Migration: Add Authentication Tables to Neon Database
-- This adds session management and file storage tables

-- Sessions table for JWT token management
CREATE TABLE IF NOT EXISTS "sessions" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "user_id" TEXT NOT NULL,
  "token" TEXT NOT NULL UNIQUE,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ip_address" TEXT,
  "user_agent" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Password reset tokens table
CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "user_id" TEXT NOT NULL,
  "token" TEXT NOT NULL UNIQUE,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "used" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- File storage table to track all uploaded files
CREATE TABLE IF NOT EXISTS "file_storage" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "original_name" TEXT NOT NULL,
  "file_name" TEXT NOT NULL,
  "file_path" TEXT NOT NULL,
  "file_size" INTEGER NOT NULL,
  "mime_type" TEXT NOT NULL,
  "storage_type" TEXT NOT NULL DEFAULT 'local', -- 'local', 's3', 'firebase'
  "uploaded_by" TEXT,
  "entity_type" TEXT, -- 'patient', 'clinical_image', 'document', etc.
  "entity_id" TEXT,
  "is_public" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "file_storage_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS "sessions_user_id_idx" ON "sessions"("user_id");
CREATE INDEX IF NOT EXISTS "sessions_token_idx" ON "sessions"("token");
CREATE INDEX IF NOT EXISTS "sessions_expires_at_idx" ON "sessions"("expires_at");
CREATE INDEX IF NOT EXISTS "password_reset_tokens_token_idx" ON "password_reset_tokens"("token");
CREATE INDEX IF NOT EXISTS "password_reset_tokens_user_id_idx" ON "password_reset_tokens"("user_id");
CREATE INDEX IF NOT EXISTS "file_storage_entity_idx" ON "file_storage"("entity_type", "entity_id");
CREATE INDEX IF NOT EXISTS "file_storage_uploaded_by_idx" ON "file_storage"("uploaded_by");

-- Update users table to ensure it has all needed auth fields (only if they don't exist)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verified" BOOLEAN DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_reset_at" TIMESTAMP(3);

-- Add some default users if they don't exist (for testing)
INSERT INTO "users" ("id", "email", "firstName", "lastName", "role", "permissions", "hashedPassword", "isActive")
VALUES 
  ('admin-001', 'admin@dental.local', 'Admin', 'User', 'admin', ARRAY['view_patients', 'edit_patients', 'view_appointments', 'edit_appointments', 'view_settings', 'edit_settings'], '$2a$12$placeholder', true),
  ('doctor-001', 'doctor@dental.local', 'Dr. John', 'Smith', 'doctor', ARRAY['view_patients', 'edit_patients', 'view_appointments', 'edit_appointments', 'view_treatments', 'edit_treatments'], '$2a$12$placeholder', true)
ON CONFLICT ("email") DO NOTHING;