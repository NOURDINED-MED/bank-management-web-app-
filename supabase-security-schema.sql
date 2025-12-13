-- =====================================================
-- SECURITY SCHEMA UPDATES FOR BAMS
-- Add these tables to your Supabase project
-- =====================================================

-- Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_name VARCHAR(100),
  device_type VARCHAR(20) CHECK (device_type IN ('desktop', 'mobile', 'tablet', 'unknown')),
  browser VARCHAR(50),
  ip_address VARCHAR(45),
  location VARCHAR(200),
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_active ON sessions(is_active, expires_at);

-- Trusted Devices Table
CREATE TABLE IF NOT EXISTS trusted_devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_name VARCHAR(100),
  device_type VARCHAR(20) CHECK (device_type IN ('desktop', 'mobile', 'tablet', 'unknown')),
  browser VARCHAR(50),
  os VARCHAR(50),
  fingerprint VARCHAR(100) UNIQUE NOT NULL,
  ip_address VARCHAR(45),
  location VARCHAR(200),
  is_trusted BOOLEAN DEFAULT false,
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, fingerprint)
);

CREATE INDEX idx_trusted_devices_user_id ON trusted_devices(user_id);
CREATE INDEX idx_trusted_devices_fingerprint ON trusted_devices(fingerprint);

-- OTP Codes Table
CREATE TABLE IF NOT EXISTS otp_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code VARCHAR(10) NOT NULL,
  purpose VARCHAR(50) CHECK (purpose IN ('transaction', '2fa', 'password_reset', 'email_verification')),
  channel VARCHAR(20) CHECK (channel IN ('email', 'sms')),
  attempts INTEGER DEFAULT 0,
  is_used BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_otp_codes_user_id ON otp_codes(user_id);
CREATE INDEX idx_otp_codes_expires_at ON otp_codes(expires_at);

-- Security Events Table
CREATE TABLE IF NOT EXISTS security_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_type VARCHAR(100) NOT NULL,
  description TEXT,
  severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  ip_address VARCHAR(45),
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_security_events_user_id ON security_events(user_id);
CREATE INDEX idx_security_events_severity ON security_events(severity);
CREATE INDEX idx_security_events_created_at ON security_events(created_at DESC);

-- Extend Audit Logs Table (if not exists)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  description TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  old_data JSONB,
  new_data JSONB,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Failed Login Attempts Table (for brute force protection)
CREATE TABLE IF NOT EXISTS failed_login_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL,
  ip_address VARCHAR(45) NOT NULL,
  attempt_count INTEGER DEFAULT 1,
  last_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  locked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_failed_logins_email ON failed_login_attempts(email);
CREATE INDEX idx_failed_logins_ip ON failed_login_attempts(ip_address);

-- Add security fields to users table if not exists
DO $$ 
BEGIN
  -- Add 2FA enabled flag
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='users' AND column_name='two_factor_enabled') THEN
    ALTER TABLE users ADD COLUMN two_factor_enabled BOOLEAN DEFAULT false;
  END IF;

  -- Add 2FA secret
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='users' AND column_name='two_factor_secret') THEN
    ALTER TABLE users ADD COLUMN two_factor_secret VARCHAR(100);
  END IF;

  -- Add account locked flag
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='users' AND column_name='account_locked') THEN
    ALTER TABLE users ADD COLUMN account_locked BOOLEAN DEFAULT false;
  END IF;

  -- Add locked until timestamp
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='users' AND column_name='locked_until') THEN
    ALTER TABLE users ADD COLUMN locked_until TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Add last password change
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='users' AND column_name='password_changed_at') THEN
    ALTER TABLE users ADD COLUMN password_changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;

  -- Add account type for transaction limits
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='users' AND column_name='account_tier') THEN
    ALTER TABLE users ADD COLUMN account_tier VARCHAR(20) DEFAULT 'basic' 
      CHECK (account_tier IN ('basic', 'premium', 'business'));
  END IF;
END $$;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all security tables
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trusted_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE failed_login_attempts ENABLE ROW LEVEL SECURITY;

-- Sessions Policies
CREATE POLICY "Users can view own sessions"
  ON sessions FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own sessions"
  ON sessions FOR DELETE
  USING (auth.uid()::text = user_id::text);

-- Trusted Devices Policies
CREATE POLICY "Users can view own devices"
  ON trusted_devices FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage own devices"
  ON trusted_devices FOR UPDATE
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can remove own devices"
  ON trusted_devices FOR DELETE
  USING (auth.uid()::text = user_id::text);

-- OTP Codes Policies (read-only for users)
CREATE POLICY "Users can view own OTPs"
  ON otp_codes FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Security Events Policies (read-only for users)
CREATE POLICY "Users can view own security events"
  ON security_events FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Audit Logs Policies (read-only for users)
CREATE POLICY "Users can view own audit logs"
  ON audit_logs FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Admin can view all audit logs
CREATE POLICY "Admins can view all audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to auto-expire sessions
CREATE OR REPLACE FUNCTION expire_old_sessions()
RETURNS void AS $$
BEGIN
  UPDATE sessions
  SET is_active = false
  WHERE expires_at < NOW() AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired OTPs
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM otp_codes
  WHERE expires_at < NOW() - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql;

-- Function to detect suspicious login
CREATE OR REPLACE FUNCTION log_login_attempt(
  p_user_id UUID,
  p_success BOOLEAN,
  p_ip_address VARCHAR,
  p_user_agent TEXT
)
RETURNS void AS $$
BEGIN
  IF p_success THEN
    -- Clear failed attempts on successful login
    DELETE FROM failed_login_attempts 
    WHERE email = (SELECT email FROM users WHERE id = p_user_id)
    AND ip_address = p_ip_address;
  ELSE
    -- Increment failed attempts
    INSERT INTO failed_login_attempts (email, ip_address, attempt_count)
    VALUES (
      (SELECT email FROM users WHERE id = p_user_id),
      p_ip_address,
      1
    )
    ON CONFLICT (email, ip_address) DO UPDATE
    SET attempt_count = failed_login_attempts.attempt_count + 1,
        last_attempt_at = NOW(),
        locked_until = CASE 
          WHEN failed_login_attempts.attempt_count >= 5 
          THEN NOW() + INTERVAL '1 hour'
          ELSE NULL
        END;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to log transaction changes
CREATE OR REPLACE FUNCTION log_transaction_audit()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    entity_type,
    entity_id,
    description,
    old_data,
    new_data
  ) VALUES (
    NEW.user_id,
    TG_OP,
    'transaction',
    NEW.id,
    format('Transaction %s: %s', TG_OP, NEW.transaction_type),
    to_jsonb(OLD),
    to_jsonb(NEW)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply audit trigger to transactions table
DROP TRIGGER IF EXISTS transaction_audit_trigger ON transactions;
CREATE TRIGGER transaction_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION log_transaction_audit();

-- =====================================================
-- SAMPLE SECURITY DATA
-- =====================================================

-- Insert sample security event
INSERT INTO security_events (user_id, event_type, description, severity) VALUES
((SELECT id FROM users LIMIT 1), 'test_event', 'System security test', 'low')
ON CONFLICT DO NOTHING;

-- =====================================================
-- HELPFUL QUERIES
-- =====================================================

-- View active sessions
-- SELECT * FROM sessions WHERE is_active = true AND expires_at > NOW();

-- View failed login attempts
-- SELECT * FROM failed_login_attempts WHERE attempt_count >= 3;

-- View recent security events
-- SELECT * FROM security_events ORDER BY created_at DESC LIMIT 50;

-- View user audit trail
-- SELECT * FROM audit_logs WHERE user_id = 'USER_ID' ORDER BY created_at DESC;

-- Cleanup old data (run periodically)
-- SELECT expire_old_sessions();
-- SELECT cleanup_expired_otps();

