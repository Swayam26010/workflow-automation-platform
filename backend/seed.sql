-- DEFAULT ROLES
INSERT INTO roles (name) VALUES
('Admin'),
('Employee'),
('Manager'),
('HR'),
('Finance')
ON CONFLICT (name) DO NOTHING;

-- DEFAULT USERS
INSERT INTO users (name, email, password, role_id) VALUES
('Admin User', 'admin@test.com', 'admin123',
 (SELECT id FROM roles WHERE name = 'Admin')),

('Employee User', 'emp@test.com', 'emp123',
 (SELECT id FROM roles WHERE name = 'Employee')),

('Manager User', 'manager@test.com', 'manager123',
 (SELECT id FROM roles WHERE name = 'Manager')),

('HR User', 'hr@test.com', 'hr123',
 (SELECT id FROM roles WHERE name = 'HR'))

ON CONFLICT (email) DO NOTHING;