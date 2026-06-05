@"
-- ============================================
-- SCHEMA: All Tables for Complaint Management System
-- ============================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (
        role IN ('citizen', 'officer', 'admin', 'super_admin')
    ),
    department_id INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    department_id INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_category_department
    FOREIGN KEY (department_id)
    REFERENCES departments(id)
    ON DELETE CASCADE
);

CREATE TABLE complaints (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category_id INTEGER NOT NULL,
    citizen_id INTEGER NOT NULL,
    department_id INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (
        status IN ('Pending', 'Assigned', 'In Progress', 'Resolved', 'Rejected')
    ),
    priority VARCHAR(50) NOT NULL DEFAULT 'Medium' CHECK (
        priority IN ('Low', 'Medium', 'High', 'Emergency')
    ),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_complaint_category
    FOREIGN KEY (category_id)
    REFERENCES categories(id)
    ON DELETE RESTRICT,
    CONSTRAINT fk_complaint_user
    FOREIGN KEY (citizen_id)
    REFERENCES users(id)
    ON DELETE CASCADE,
    CONSTRAINT fk_complaint_department
    FOREIGN KEY (department_id)
    REFERENCES departments(id)
    ON DELETE RESTRICT
);

CREATE TABLE complaint_assignments (
    id SERIAL PRIMARY KEY,
    complaint_id INTEGER NOT NULL,
    officer_id INTEGER NOT NULL,
    assigned_by INTEGER NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_assignment_complaint
    FOREIGN KEY (complaint_id)
    REFERENCES complaints(id)
    ON DELETE CASCADE,
    CONSTRAINT fk_assignment_officer
    FOREIGN KEY (officer_id)
    REFERENCES users(id)
    ON DELETE CASCADE,
    CONSTRAINT fk_assignment_admin
    FOREIGN KEY (assigned_by)
    REFERENCES users(id)
    ON DELETE SET NULL
);

CREATE TABLE complaint_history (
    id SERIAL PRIMARY KEY,
    complaint_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    performed_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_history_complaint
    FOREIGN KEY (complaint_id)
    REFERENCES complaints(id)
    ON DELETE CASCADE,
    CONSTRAINT fk_history_user
    FOREIGN KEY (performed_by)
    REFERENCES users(id)
    ON DELETE SET NULL
);

CREATE TABLE complaint_files (
    id SERIAL PRIMARY KEY,
    complaint_id INTEGER NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50) NOT NULL CHECK (
        file_type IN ('image', 'document', 'video', 'other')
    ),
    uploaded_by INTEGER,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_files_complaint
    FOREIGN KEY (complaint_id)
    REFERENCES complaints(id)
    ON DELETE CASCADE,
    CONSTRAINT fk_files_user
    FOREIGN KEY (uploaded_by)
    REFERENCES users(id)
    ON DELETE SET NULL
);

CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);
"@ | Out-File -FilePath "database\schema.sql" -Encoding UTF8

Write-Host "✅ schema.sql created" -ForegroundColor Green