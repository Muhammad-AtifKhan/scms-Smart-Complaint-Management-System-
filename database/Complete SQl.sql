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


-- Email pe fast login
CREATE INDEX idx_users_email ON users(email);

-- Role-based filtering fast
CREATE INDEX idx_users_role ON users(role);

-- Department filtering fast
CREATE INDEX idx_users_department ON users(department_id);


CREATE VIEW active_users AS
SELECT id, name, email, role
FROM users
WHERE is_active = TRUE;


CREATE TABLE departments (
    id SERIAL PRIMARY KEY,

    name VARCHAR(100) UNIQUE NOT NULL,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_departments_name ON departments(name);

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

CREATE INDEX idx_categories_department ON categories(department_id);
CREATE INDEX idx_categories_name ON categories(name);

ALTER TABLE users
ADD CONSTRAINT fk_users_department
FOREIGN KEY (department_id)
REFERENCES departments(id)
ON DELETE SET NULL;

CREATE VIEW categories_with_departments AS
SELECT 
    c.id,
    c.name AS category_name,
    d.name AS department_name
FROM categories c
JOIN departments d ON c.department_id = d.id
WHERE c.is_active = TRUE;


ALTER TABLE categories
ADD CONSTRAINT unique_category_per_department
UNIQUE (name, department_id);


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


CREATE INDEX idx_complaints_status ON complaints(status);

CREATE INDEX idx_complaints_priority ON complaints(priority);

CREATE INDEX idx_complaints_department ON complaints(department_id);

CREATE INDEX idx_complaints_citizen ON complaints(citizen_id);

CREATE INDEX idx_complaints_created_at ON complaints(created_at);


CREATE VIEW active_complaints AS
SELECT *
FROM complaints
WHERE status != 'Resolved';


CREATE VIEW high_priority_complaints AS
SELECT *
FROM complaints
WHERE priority IN ('High', 'Emergency');
CREATE VIEW complaint_summary AS
SELECT 
    department_id,
    status,
    COUNT(*) AS total
FROM complaints
GROUP BY department_id, status;

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_timestamp
BEFORE UPDATE ON complaints
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();



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
CREATE INDEX idx_assignment_complaint ON complaint_assignments(complaint_id);

CREATE INDEX idx_assignment_officer ON complaint_assignments(officer_id);

CREATE INDEX idx_assignment_active ON complaint_assignments(is_active);

CREATE UNIQUE INDEX unique_active_assignment
ON complaint_assignments(complaint_id)
WHERE is_active = TRUE;

CREATE OR REPLACE FUNCTION set_status_assigned()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE complaints
    SET status = 'Assigned'
    WHERE id = NEW.complaint_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_assigned_status
AFTER INSERT ON complaint_assignments
FOR EACH ROW
EXECUTE FUNCTION set_status_assigned();

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
CREATE INDEX idx_history_complaint ON complaint_history(complaint_id);

CREATE INDEX idx_history_user ON complaint_history(performed_by);

CREATE INDEX idx_history_time ON complaint_history(created_at);
CREATE OR REPLACE FUNCTION log_complaint_creation()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO complaint_history (
        complaint_id,
        action,
        new_status,
        performed_by
    )
    VALUES (
        NEW.id,
        'Complaint Created',
        NEW.status,
        NEW.citizen_id
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trigger_log_complaint_creation
AFTER INSERT ON complaints
FOR EACH ROW
EXECUTE FUNCTION log_complaint_creation();

CREATE OR REPLACE FUNCTION log_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO complaint_history (
            complaint_id,
            action,
            old_status,
            new_status,
            performed_by
        )
        VALUES (
            NEW.id,
            'Status Updated',
            OLD.status,
            NEW.status,
            NULL
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;



CREATE TRIGGER trigger_log_status_change
AFTER UPDATE ON complaints
FOR EACH ROW
EXECUTE FUNCTION log_status_change();
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
CREATE INDEX idx_files_complaint ON complaint_files(complaint_id);

CREATE INDEX idx_files_user ON complaint_files(uploaded_by);
ALTER TABLE complaint_files
ADD COLUMN file_purpose VARCHAR(50) CHECK (
    file_purpose IN ('evidence', 'before', 'after', 'other')
);
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
CREATE INDEX idx_notifications_user ON notifications(user_id);

CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE OR REPLACE FUNCTION notify_assignment()
RETURNS TRIGGER AS $$
DECLARE
    citizen_id_var INTEGER;
BEGIN
    SELECT citizen_id INTO citizen_id_var
    FROM complaints
    WHERE id = NEW.complaint_id;

    INSERT INTO notifications (user_id, message)
    VALUES (
        citizen_id_var,
        'Your complaint has been assigned to an officer.'
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trigger_notify_assignment
AFTER INSERT ON complaint_assignments
FOR EACH ROW
EXECUTE FUNCTION notify_assignment();

CREATE OR REPLACE FUNCTION notify_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO notifications (user_id, message)
        VALUES (
            NEW.citizen_id,
            'Your complaint status has been updated to ' || NEW.status
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trigger_notify_status
AFTER UPDATE ON complaints
FOR EACH ROW
EXECUTE FUNCTION notify_status_change();
CREATE VIEW user_notifications AS
SELECT 
    n.id,
    n.user_id,
    n.message,
    n.is_read,
    n.created_at
FROM notifications n
ORDER BY n.created_at DESC;









