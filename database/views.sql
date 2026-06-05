@"
-- ============================================
-- VIEWS: Data Abstraction & Analytics
-- ============================================

-- Active users view
CREATE VIEW active_users AS
SELECT id, name, email, role
FROM users
WHERE is_active = TRUE;

-- Categories with departments view
CREATE VIEW categories_with_departments AS
SELECT 
    c.id,
    c.name AS category_name,
    d.name AS department_name
FROM categories c
JOIN departments d ON c.department_id = d.id
WHERE c.is_active = TRUE;

-- Active complaints (non-resolved)
CREATE VIEW active_complaints AS
SELECT *
FROM complaints
WHERE status != 'Resolved';

-- High priority complaints
CREATE VIEW high_priority_complaints AS
SELECT *
FROM complaints
WHERE priority IN ('High', 'Emergency');

-- Complaint summary by department and status
CREATE VIEW complaint_summary AS
SELECT 
    department_id,
    status,
    COUNT(*) AS total
FROM complaints
GROUP BY department_id, status;

-- Current assignments view
CREATE VIEW current_assignments AS
SELECT 
    ca.id,
    ca.complaint_id,
    ca.officer_id,
    u.name AS officer_name,
    ca.assigned_at
FROM complaint_assignments ca
JOIN users u ON ca.officer_id = u.id
WHERE ca.is_active = TRUE;

-- Complaints with assigned officers
CREATE VIEW complaints_with_officers AS
SELECT 
    c.id AS complaint_id,
    c.title,
    c.status,
    u.name AS officer_name
FROM complaints c
LEFT JOIN complaint_assignments ca 
    ON c.id = ca.complaint_id AND ca.is_active = TRUE
LEFT JOIN users u 
    ON ca.officer_id = u.id;

-- Complaint timeline view
CREATE VIEW complaint_timeline AS
SELECT 
    ch.complaint_id,
    ch.action,
    ch.old_status,
    ch.new_status,
    u.name AS performed_by,
    ch.created_at
FROM complaint_history ch
LEFT JOIN users u ON ch.performed_by = u.id
ORDER BY ch.created_at ASC;

-- Complaint files view
CREATE VIEW complaint_files_view AS
SELECT 
    cf.id,
    cf.complaint_id,
    cf.file_url,
    cf.file_type,
    cf.file_purpose,
    u.name AS uploaded_by,
    cf.uploaded_at
FROM complaint_files cf
LEFT JOIN users u ON cf.uploaded_by = u.id;

-- User notifications view
CREATE VIEW user_notifications AS
SELECT 
    n.id,
    n.user_id,
    n.message,
    n.is_read,
    n.created_at
FROM notifications n
ORDER BY n.created_at DESC;
"@ | Out-File -FilePath "database\views.sql" -Encoding UTF8

Write-Host "✅ views.sql created" -ForegroundColor Green