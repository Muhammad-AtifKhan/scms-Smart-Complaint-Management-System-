@"
-- ============================================
-- TRIGGERS: Automated Actions
-- ============================================

-- Trigger for updating timestamp on complaints
CREATE TRIGGER trigger_update_timestamp
BEFORE UPDATE ON complaints
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Trigger for setting assigned status
CREATE TRIGGER trigger_set_assigned_status
AFTER INSERT ON complaint_assignments
FOR EACH ROW
EXECUTE FUNCTION set_status_assigned();

-- Trigger for logging complaint creation
CREATE TRIGGER trigger_log_complaint_creation
AFTER INSERT ON complaints
FOR EACH ROW
EXECUTE FUNCTION log_complaint_creation();

-- Trigger for logging status changes
CREATE TRIGGER trigger_log_status_change
AFTER UPDATE ON complaints
FOR EACH ROW
EXECUTE FUNCTION log_status_change();

-- Trigger for assignment notifications
CREATE TRIGGER trigger_notify_assignment
AFTER INSERT ON complaint_assignments
FOR EACH ROW
EXECUTE FUNCTION notify_assignment();

-- Trigger for status change notifications
CREATE TRIGGER trigger_notify_status
AFTER UPDATE ON complaints
FOR EACH ROW
EXECUTE FUNCTION notify_status_change();
"@ | Out-File -FilePath "database\triggers.sql" -Encoding UTF8

Write-Host "✅ triggers.sql created" -ForegroundColor Green