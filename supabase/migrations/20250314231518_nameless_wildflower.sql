/*
  # Add created_by column to animals table

  1. Changes
    - Add created_by column to animals table
    - Add foreign key constraint to auth.users
    - Set default value to current user's ID
*/

-- Add created_by column
ALTER TABLE animals
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

-- Set default value for created_by to current user
ALTER TABLE animals
ALTER COLUMN created_by SET DEFAULT auth.uid();