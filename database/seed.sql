@"
-- ============================================
-- SEED DATA: Sample Records for Testing
-- ============================================

-- Insert departments
INSERT INTO departments (name) VALUES 
('Electricity Department'),
('Water Department'),
('Sanitation Department'),
('Transport Department'),
('Health Department');

-- Insert users (password_hash is dummy, use proper hashing in production)
INSERT INTO users (name, email, password_hash, role, department_id) VALUES 
('Admin User', 'admin@example.com', 'hashed_password_here', 'super_admin', NULL),
('John Citizen', 'john@example.com', 'hashed_password_here', 'citizen', NULL),
('Sarah Officer', 'sarah@example.com', 'hashed_password_here', 'officer', 1),
('Mike Officer', 'mike@example.com', 'hashed_password_here', 'officer', 2);

-- Insert categories
INSERT INTO categories (name, department_id) VALUES 
('Power Outage', 1),
('High Voltage Issue', 1),
('No Water Supply', 2),
('Water Leakage', 2),
('Garbage Collection', 3),
('Road Cleaning', 3);

-- Insert complaints
INSERT INTO complaints (title, description, category_id, citizen_id, department_id, status, priority) VALUES 
('No electricity in sector 5', 'Power has been out for 6 hours', 1, 2, 1, 'Pending', 'High'),
('Water pipeline broken', 'Main pipeline burst near market', 4, 2, 2, 'In Progress', 'Emergency');

-- Insert complaint assignments
INSERT INTO complaint_assignments (complaint_id, officer_id, assigned_by, is_active) VALUES 
(1, 3, 1, TRUE),
(2, 4, 1, TRUE);
"@ | Out-File -FilePath "database\seed.sql" -Encoding UTF8

Write-Host "✅ seed.sql created" -ForegroundColor Green