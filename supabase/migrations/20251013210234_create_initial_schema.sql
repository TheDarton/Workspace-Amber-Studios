/*
  # Amber Studios Workspace - Initial Schema

  ## Overview
  Complete database schema for multi-role, multi-country workspace management system.

  ## New Tables

  ### 1. countries
  - `id` (uuid, primary key)
  - `name` (text) - Country name (e.g., "Latvia")
  - `prefix` (text) - Country code prefix
  - `active_months` (jsonb) - Array of active months for display
  - `created_at` (timestamptz)

  ### 2. users
  - `id` (uuid, primary key)
  - `country_id` (uuid, foreign key)
  - `role` (text) - 'global_admin', 'admin', 'operation', 'dealer', 'sm'
  - `login` (text, unique)
  - `password_hash` (text)
  - `name` (text, optional)
  - `surname` (text, optional)
  - `email` (text, optional)
  - `nickname` (text, optional)
  - `photo_url` (text, optional)
  - `must_change_password` (boolean)
  - `created_at` (timestamptz)

  ### 3. training_materials
  - `id` (uuid, primary key)
  - `country_id` (uuid, foreign key)
  - `type` (text) - 'dealer' or 'sm'
  - `title` (text)
  - `content` (jsonb) - Structured content with blocks
  - `order_index` (int)
  - `created_at` (timestamptz)

  ### 4. training_questions
  - `id` (uuid, primary key)
  - `material_id` (uuid, foreign key)
  - `user_id` (uuid, foreign key)
  - `question_text` (text)
  - `answer_text` (text, optional)
  - `created_at` (timestamptz)

  ### 5. news
  - `id` (uuid, primary key)
  - `country_id` (uuid, foreign key)
  - `title` (text)
  - `content` (jsonb)
  - `created_at` (timestamptz)

  ### 6. schedule_requests
  - `id` (uuid, primary key)
  - `country_id` (uuid, foreign key)
  - `user_id` (uuid, foreign key)
  - `month` (int)
  - `year` (int)
  - `shifts` (jsonb) - Daily shift selections
  - `comment` (text, optional)
  - `submitted_at` (timestamptz)

  ### 7. schedule_request_config
  - `id` (uuid, primary key)
  - `country_id` (uuid, foreign key)
  - `month` (int)
  - `year` (int)
  - `is_active` (boolean)
  - `max_slot_capacity` (int) - Default 27
  - `dealer_max_x_days` (int) - Default 4
  - `sm_max_x_days` (int) - Default 3

  ### 8. handover_takeover_records
  - `id` (uuid, primary key)
  - `country_id` (uuid, foreign key)
  - `title` (text)
  - `content` (jsonb)
  - `month` (int)
  - `year` (int)
  - `confirmed_by_csm` (boolean)
  - `created_by` (uuid, foreign key to users)
  - `created_at` (timestamptz)

  ### 9. handover_acknowledgments
  - `id` (uuid, primary key)
  - `record_id` (uuid, foreign key)
  - `sm_user_id` (uuid, foreign key)
  - `acknowledged_at` (timestamptz)

  ### 10. handover_windows
  - `id` (uuid, primary key)
  - `country_id` (uuid, foreign key)
  - `start_time_utc` (time)
  - `end_time_utc` (time)
  - `max_outgoing_sm` (int) - Default 5
  - `max_incoming_sm` (int) - Default 5

  ### 11. social_links
  - `id` (uuid, primary key)
  - `country_id` (uuid, foreign key)
  - `platform` (text) - 'facebook', 'twitter', 'youtube', 'discord', etc.
  - `url` (text)
  - `order_index` (int)

  ### 12. push_subscriptions
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `subscription_data` (jsonb)
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Add policies for role-based access control
*/

-- Create countries table
CREATE TABLE IF NOT EXISTS countries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  prefix text NOT NULL,
  active_months jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE countries ENABLE ROW LEVEL SECURITY;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id uuid REFERENCES countries(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('global_admin', 'admin', 'operation', 'dealer', 'sm')),
  login text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  name text,
  surname text,
  email text,
  nickname text,
  photo_url text,
  must_change_password boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Insert default Global_admin account with password 'admin' (hashed using bcrypt)
-- Note: In production, this should be replaced with actual bcrypt hash
INSERT INTO users (role, login, password_hash, must_change_password)
VALUES ('global_admin', 'Global_admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', true)
ON CONFLICT (login) DO NOTHING;

-- Create training_materials table
CREATE TABLE IF NOT EXISTS training_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id uuid REFERENCES countries(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('dealer', 'sm')),
  title text NOT NULL,
  content jsonb DEFAULT '{}'::jsonb,
  order_index int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE training_materials ENABLE ROW LEVEL SECURITY;

-- Create training_questions table
CREATE TABLE IF NOT EXISTS training_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id uuid REFERENCES training_materials(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  answer_text text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE training_questions ENABLE ROW LEVEL SECURITY;

-- Create news table
CREATE TABLE IF NOT EXISTS news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id uuid REFERENCES countries(id) ON DELETE CASCADE,
  title text NOT NULL,
  content jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- Create schedule_requests table
CREATE TABLE IF NOT EXISTS schedule_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id uuid REFERENCES countries(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  month int NOT NULL,
  year int NOT NULL,
  shifts jsonb DEFAULT '{}'::jsonb,
  comment text,
  submitted_at timestamptz DEFAULT now(),
  UNIQUE(user_id, month, year)
);

ALTER TABLE schedule_requests ENABLE ROW LEVEL SECURITY;

-- Create schedule_request_config table
CREATE TABLE IF NOT EXISTS schedule_request_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id uuid REFERENCES countries(id) ON DELETE CASCADE,
  month int NOT NULL,
  year int NOT NULL,
  is_active boolean DEFAULT true,
  max_slot_capacity int DEFAULT 27,
  dealer_max_x_days int DEFAULT 4,
  sm_max_x_days int DEFAULT 3,
  UNIQUE(country_id, month, year)
);

ALTER TABLE schedule_request_config ENABLE ROW LEVEL SECURITY;

-- Create handover_takeover_records table
CREATE TABLE IF NOT EXISTS handover_takeover_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id uuid REFERENCES countries(id) ON DELETE CASCADE,
  title text NOT NULL,
  content jsonb DEFAULT '{}'::jsonb,
  month int NOT NULL,
  year int NOT NULL,
  confirmed_by_csm boolean DEFAULT false,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE handover_takeover_records ENABLE ROW LEVEL SECURITY;

-- Create handover_acknowledgments table
CREATE TABLE IF NOT EXISTS handover_acknowledgments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id uuid REFERENCES handover_takeover_records(id) ON DELETE CASCADE,
  sm_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  acknowledged_at timestamptz DEFAULT now(),
  UNIQUE(record_id, sm_user_id)
);

ALTER TABLE handover_acknowledgments ENABLE ROW LEVEL SECURITY;

-- Create handover_windows table
CREATE TABLE IF NOT EXISTS handover_windows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id uuid REFERENCES countries(id) ON DELETE CASCADE,
  start_time_utc time NOT NULL,
  end_time_utc time NOT NULL,
  max_outgoing_sm int DEFAULT 5,
  max_incoming_sm int DEFAULT 5
);

ALTER TABLE handover_windows ENABLE ROW LEVEL SECURITY;

-- Create social_links table
CREATE TABLE IF NOT EXISTS social_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id uuid REFERENCES countries(id) ON DELETE CASCADE,
  platform text NOT NULL,
  url text NOT NULL,
  order_index int DEFAULT 0
);

ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;

-- Create push_subscriptions table
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  subscription_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Countries: Global admin can do everything, admins can read their country
CREATE POLICY "Global admin full access to countries"
  ON countries FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'global_admin'
    )
  );

CREATE POLICY "Admins can view their country"
  ON countries FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (users.role = 'admin' OR users.role = 'operation' OR users.role = 'dealer' OR users.role = 'sm')
      AND users.country_id = countries.id
    )
  );

-- Users: Various policies based on role
CREATE POLICY "Global admin full access to users"
  ON users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users AS u WHERE u.id = auth.uid() AND u.role = 'global_admin'
    )
  );

CREATE POLICY "Admin can manage users in their country"
  ON users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users AS u 
      WHERE u.id = auth.uid() 
      AND u.role = 'admin'
      AND u.country_id = users.country_id
    )
  );

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Training materials
CREATE POLICY "Admins can manage training materials"
  ON training_materials FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (users.role = 'global_admin' OR (users.role = 'admin' AND users.country_id = training_materials.country_id))
    )
  );

CREATE POLICY "Users can view training materials for their country and role"
  ON training_materials FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.country_id = training_materials.country_id
      AND (
        (users.role IN ('dealer', 'operation') AND training_materials.type = 'dealer') OR
        (users.role IN ('sm', 'operation') AND training_materials.type = 'sm')
      )
    )
  );

-- Training questions
CREATE POLICY "Users can create questions"
  ON training_questions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users and admins can view questions"
  ON training_questions FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (users.role = 'global_admin' OR users.role = 'admin')
    )
  );

CREATE POLICY "Admins can answer questions"
  ON training_questions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (users.role = 'global_admin' OR users.role = 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (users.role = 'global_admin' OR users.role = 'admin')
    )
  );

-- News
CREATE POLICY "Admins can manage news"
  ON news FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (users.role = 'global_admin' OR (users.role = 'admin' AND users.country_id = news.country_id))
    )
  );

CREATE POLICY "Users can view news for their country"
  ON news FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.country_id = news.country_id
    )
  );

-- Schedule requests
CREATE POLICY "Users can manage own schedule requests"
  ON schedule_requests FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view schedule requests for their country"
  ON schedule_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (users.role = 'global_admin' OR (users.role = 'admin' AND users.country_id = schedule_requests.country_id))
    )
  );

-- Schedule request config
CREATE POLICY "Admins can manage schedule config"
  ON schedule_request_config FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (users.role = 'global_admin' OR (users.role = 'admin' AND users.country_id = schedule_request_config.country_id))
    )
  );

CREATE POLICY "Users can view schedule config for their country"
  ON schedule_request_config FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.country_id = schedule_request_config.country_id
    )
  );

-- Handover/Takeover records
CREATE POLICY "SM and Operation can create handover records"
  ON handover_takeover_records FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('sm', 'operation')
      AND users.country_id = handover_takeover_records.country_id
    )
  );

CREATE POLICY "Users can view handover records for their country"
  ON handover_takeover_records FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.country_id = handover_takeover_records.country_id
      AND users.role IN ('sm', 'operation', 'admin', 'global_admin')
    )
  );

CREATE POLICY "Admins can update handover records"
  ON handover_takeover_records FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (users.role = 'global_admin' OR (users.role = 'admin' AND users.country_id = handover_takeover_records.country_id))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (users.role = 'global_admin' OR (users.role = 'admin' AND users.country_id = handover_takeover_records.country_id))
    )
  );

CREATE POLICY "Admins can delete handover records"
  ON handover_takeover_records FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (users.role = 'global_admin' OR (users.role = 'admin' AND users.country_id = handover_takeover_records.country_id))
    )
  );

-- Handover acknowledgments
CREATE POLICY "SM can create acknowledgments"
  ON handover_acknowledgments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sm_user_id);

CREATE POLICY "Users can view acknowledgments"
  ON handover_acknowledgments FOR SELECT
  TO authenticated
  USING (
    auth.uid() = sm_user_id OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'global_admin', 'operation')
    )
  );

-- Handover windows
CREATE POLICY "Admins can manage handover windows"
  ON handover_windows FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (users.role = 'global_admin' OR (users.role = 'admin' AND users.country_id = handover_windows.country_id))
    )
  );

CREATE POLICY "Users can view handover windows"
  ON handover_windows FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.country_id = handover_windows.country_id
    )
  );

-- Social links
CREATE POLICY "Admins can manage social links"
  ON social_links FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (users.role = 'global_admin' OR (users.role = 'admin' AND users.country_id = social_links.country_id))
    )
  );

CREATE POLICY "Users can view social links"
  ON social_links FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.country_id = social_links.country_id
    )
  );

-- Push subscriptions
CREATE POLICY "Users can manage own push subscriptions"
  ON push_subscriptions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);