-- DEFAULT ROLES
INSERT INTO roles (name) VALUES
('admin'),
('employee'),
('manager'),
('hr'),
('finance')
ON CONFLICT DO NOTHING;

-- DEFAULT USERS (password is plain for now — you can later hash it)
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@test.com', 'admin123', 'admin'),
('Employee User', 'emp@test.com', 'emp123', 'employee'),
('Manager User', 'manager@test.com', 'manager123', 'manager'),
('HR User', 'hr@test.com', 'hr123', 'hr')
ON CONFLICT DO NOTHING;