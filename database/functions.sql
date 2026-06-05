@"
-- ============================================
-- FUNCTIONS: Business Logic
-- ============================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Set status to assigned when complaint is assigned
CREATE OR REPLACE FUNCTION set_status_assigned()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE complaints
    SET status = 'Assigned'
    WHERE id = NEW.complaint_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Log complaint creation
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

-- Log status change
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

-- Notify citizen on assignment
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

-- Notify citizen on status change
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
"@ | Out-File -FilePath "database\functions.sql" -Encoding UTF8

Write-Host "✅ functions.sql created" -ForegroundColor Green