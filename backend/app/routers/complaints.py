from fastapi import APIRouter, HTTPException, Depends, status
from typing import Optional, List
from app.db import get_db_cursor
from app.auth.dependencies import get_current_user
from app.schemas import ComplaintCreate, ComplaintStatusUpdate, ComplaintRemarkCreate

router = APIRouter()

# --- HELPER FUNCTIONS FOR COMPLAINT ID MAPPING ---
def to_frontend_id(db_id: int) -> str:
    return f"CMP-{db_id:03d}"

def to_db_id(frontend_id: str) -> int:
    try:
        if isinstance(frontend_id, str) and frontend_id.startswith("CMP-"):
            return int(frontend_id[4:])
        return int(frontend_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid complaint ID format")

# --- SCHEMA MAPPERS FOR STATUS & PRIORITY ---
DB_STATUS_MAP = {
    "pending": "Pending",
    "assigned": "Assigned",
    "in_progress": "In Progress",
    "resolved": "Resolved",
    "rejected": "Rejected"
}
FRONTEND_STATUS_MAP = {v.lower().replace(" ", "_"): v for k, v in DB_STATUS_MAP.items()}
# Standardize reverse lookup
REVERSE_STATUS_MAP = {
    "Pending": "pending",
    "Assigned": "assigned",
    "In Progress": "in_progress",
    "Resolved": "resolved",
    "Rejected": "rejected"
}

DB_PRIORITY_MAP = {
    "low": "Low",
    "medium": "Medium",
    "high": "High",
    "emergency": "Emergency"
}
FRONTEND_PRIORITY_MAP = {v.lower(): v for k, v in DB_PRIORITY_MAP.items()}
REVERSE_PRIORITY_MAP = {
    "Low": "low",
    "Medium": "medium",
    "High": "high",
    "Emergency": "emergency"
}

def format_complaint(c: dict) -> dict:
    """Format complaint database row for frontend JSON response."""
    db_id = c["id"]
    return {
        "id": to_frontend_id(db_id),
        "title": c["title"],
        "description": c["description"],
        "category": c["category"],
        "priority": REVERSE_PRIORITY_MAP.get(c["priority"], c["priority"].lower()),
        "status": REVERSE_STATUS_MAP.get(c["status"], c["status"].lower().replace(" ", "_")),
        "citizen_id": c["citizen_id"],
        "citizen_name": c.get("citizen_name"),
        "citizen_email": c.get("citizen_email"),
        "officer_name": c.get("officer_name"),
        "officer_id": c.get("officer_id"),
        "department_id": c["department_id"],
        "department_name": c.get("department_name"),
        "created_at": c["created_at"].isoformat() if c["created_at"] else None,
        "updated_at": c["updated_at"].isoformat() if c["updated_at"] else None,
        "resolved_at": c["resolved_at"].isoformat() if c.get("resolved_at") else None,
        "images": c.get("images") or [],
        "remarks": c.get("remarks") or [],
        "timeline": c.get("timeline") or []
    }

# ✅ GET COMPLAINTS (LIST WITH FILTERS & ROLE ACCESS)
@router.get("")
def get_complaints(
    status_filter: Optional[str] = None,
    priority_filter: Optional[str] = None,
    search: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    role = current_user["role"]
    user_id = current_user["id"]
    dept_id = current_user["department_id"]

    query = """
        SELECT 
            c.id,
            c.title,
            c.description,
            c.category_id,
            cat.name AS category,
            c.citizen_id,
            cit.name AS citizen_name,
            cit.email AS citizen_email,
            c.department_id,
            d.name AS department_name,
            c.status,
            c.priority,
            c.created_at,
            c.updated_at,
            (SELECT ch.created_at 
             FROM complaint_history ch 
             WHERE ch.complaint_id = c.id AND ch.new_status = 'Resolved' 
             ORDER BY ch.created_at DESC LIMIT 1) AS resolved_at,
            u_off.name AS officer_name,
            u_off.id AS officer_id
        FROM complaints c
        JOIN categories cat ON c.category_id = cat.id
        JOIN departments d ON c.department_id = d.id
        JOIN users cit ON c.citizen_id = cit.id
        LEFT JOIN complaint_assignments ca ON c.id = ca.complaint_id AND ca.is_active = TRUE
        LEFT JOIN users u_off ON ca.officer_id = u_off.id
        WHERE 1=1
    """
    params = []

    # Role filters
    if role == "citizen":
        query += " AND c.citizen_id = %s"
        params.append(user_id)
    elif role == "officer":
        query += " AND ca.officer_id = %s AND ca.is_active = TRUE"
        params.append(user_id)
    elif role == "admin":
        query += " AND c.department_id = %s"
        params.append(dept_id)
    # super_admin has no role filters

    # Status filter
    if status_filter and status_filter != "all":
        mapped_status = FRONTEND_STATUS_MAP.get(status_filter) or status_filter.capitalize()
        query += " AND c.status = %s"
        params.append(mapped_status)

    # Priority filter
    if priority_filter and priority_filter != "all":
        mapped_priority = FRONTEND_PRIORITY_MAP.get(priority_filter) or priority_filter.capitalize()
        query += " AND c.priority = %s"
        params.append(mapped_priority)

    # Search filter
    if search:
        search_pattern = f"%{search}%"
        query += " AND (c.title ILIKE %s OR c.description ILIKE %s OR cit.name ILIKE %s OR CAST(c.id AS VARCHAR) ILIKE %s)"
        params.extend([search_pattern, search_pattern, search_pattern, search_pattern])

    query += " ORDER BY c.created_at DESC"

    with get_db_cursor(commit=False) as cursor:
        cursor.execute(query, tuple(params))
        rows = cursor.fetchall()
        
        # Hydrate images for each complaint
        results = []
        for r in rows:
            cursor.execute("SELECT file_url FROM complaint_files WHERE complaint_id = %s", (r["id"],))
            files = cursor.fetchall()
            r["images"] = [f["file_url"] for f in files]
            results.append(format_complaint(r))
            
        return results

# ✅ GET COMPLAINT STATS
@router.get("/stats")
def get_complaint_stats(current_user: dict = Depends(get_current_user)):
    role = current_user["role"]
    user_id = current_user["id"]
    dept_id = current_user["department_id"]

    query = "SELECT status, COUNT(*) as count FROM complaints c WHERE 1=1"
    params = []

    if role == "citizen":
        query += " AND c.citizen_id = %s"
        params.append(user_id)
    elif role == "officer":
        query += " AND c.id IN (SELECT complaint_id FROM complaint_assignments WHERE officer_id = %s AND is_active = TRUE)"
        params.append(user_id)
    elif role == "admin":
        query += " AND c.department_id = %s"
        params.append(dept_id)

    query += " GROUP BY status"

    # Query this month count
    time_query = "SELECT COUNT(*) as count FROM complaints c WHERE c.created_at >= date_trunc('month', CURRENT_DATE)"
    time_params = []
    if role == "citizen":
        time_query += " AND c.citizen_id = %s"
        time_params.append(user_id)
    elif role == "officer":
        time_query += " AND c.id IN (SELECT complaint_id FROM complaint_assignments WHERE officer_id = %s AND is_active = TRUE)"
        time_params.append(user_id)
    elif role == "admin":
        time_query += " AND c.department_id = %s"
        time_params.append(dept_id)

    # For officer also get resolved this month
    resolved_time_query = """
        SELECT COUNT(*) as count 
        FROM complaints c
        JOIN complaint_assignments ca ON c.id = ca.complaint_id AND ca.is_active = TRUE
        WHERE ca.officer_id = %s AND c.status = 'Resolved'
        AND c.updated_at >= date_trunc('month', CURRENT_DATE)
    """

    with get_db_cursor(commit=False) as cursor:
        cursor.execute(query, tuple(params))
        rows = cursor.fetchall()
        
        cursor.execute(time_query, tuple(time_params))
        this_month_count = cursor.fetchone()["count"]

        # Default dictionary
        stats = {
            "total": 0,
            "pending": 0,
            "assigned": 0,
            "inProgress": 0,
            "resolved": 0,
            "rejected": 0,
            "thisMonth": this_month_count
        }

        for r in rows:
            db_status = r["status"]
            count = r["count"]
            stats["total"] += count
            if db_status == "Pending":
                stats["pending"] = count
            elif db_status == "Assigned":
                stats["assigned"] = count
            elif db_status == "In Progress":
                stats["inProgress"] = count
            elif db_status == "Resolved":
                stats["resolved"] = count
            elif db_status == "Rejected":
                stats["rejected"] = count

        if role == "officer":
            cursor.execute(resolved_time_query, (user_id,))
            resolved_this_month = cursor.fetchone()["count"]
            stats["totalAssigned"] = stats["total"]
            stats["resolvedThisMonth"] = resolved_this_month
            stats["avgResolutionTime"] = 18  # Mock constant for frontend dashboard view

        return stats

# ✅ GET SINGLE COMPLAINT BY ID
@router.get("/{id}")
def get_complaint(id: str, current_user: dict = Depends(get_current_user)):
    db_id = to_db_id(id)
    role = current_user["role"]
    user_id = current_user["id"]
    dept_id = current_user["department_id"]

    query = """
        SELECT 
            c.id,
            c.title,
            c.description,
            c.category_id,
            cat.name AS category,
            c.citizen_id,
            cit.name AS citizen_name,
            cit.email AS citizen_email,
            c.department_id,
            d.name AS department_name,
            c.status,
            c.priority,
            c.created_at,
            c.updated_at,
            (SELECT ch.created_at 
             FROM complaint_history ch 
             WHERE ch.complaint_id = c.id AND ch.new_status = 'Resolved' 
             ORDER BY ch.created_at DESC LIMIT 1) AS resolved_at,
            u_off.name AS officer_name,
            u_off.id AS officer_id
        FROM complaints c
        JOIN categories cat ON c.category_id = cat.id
        JOIN departments d ON c.department_id = d.id
        JOIN users cit ON c.citizen_id = cit.id
        LEFT JOIN complaint_assignments ca ON c.id = ca.complaint_id AND ca.is_active = TRUE
        LEFT JOIN users u_off ON ca.officer_id = u_off.id
        WHERE c.id = %s
    """
    
    with get_db_cursor(commit=False) as cursor:
        cursor.execute(query, (db_id,))
        c = cursor.fetchone()

        if not c:
            raise HTTPException(status_code=404, detail="Complaint not found")

        # Access check
        if role == "citizen" and c["citizen_id"] != user_id:
            raise HTTPException(status_code=403, detail="Unauthorized to view this complaint")
        elif role == "officer" and c["officer_id"] != user_id:
            raise HTTPException(status_code=403, detail="Unauthorized to view this complaint")
        elif role == "admin" and c["department_id"] != dept_id:
            raise HTTPException(status_code=403, detail="Unauthorized to view this complaint")

        # Fetch images/evidence
        cursor.execute("SELECT id, file_url, file_type, file_purpose FROM complaint_files WHERE complaint_id = %s", (db_id,))
        files = cursor.fetchall()
        c["images"] = [f["file_url"] for f in files]

        # Fetch timeline & remarks from DB view `complaint_timeline`
        cursor.execute("""
            SELECT action, old_status, new_status, performed_by, created_at
            FROM complaint_timeline
            WHERE complaint_id = %s
            ORDER BY created_at ASC
        """, (db_id,))
        timeline_rows = cursor.fetchall()

        remarks = []
        timeline = []
        remark_id_counter = 1

        for row in timeline_rows:
            action_text = row["action"]
            if action_text.startswith("Remark: "):
                remark_content = action_text[len("Remark: "):]
                remarks.append({
                    "id": remark_id_counter,
                    "text": remark_content,
                    "officer_name": row["performed_by"] or "Officer",
                    "date": row["created_at"].isoformat() if row["created_at"] else None
                })
                remark_id_counter += 1
            else:
                # Convert status details to match frontend
                actor = row["performed_by"] or "System"
                timeline.append({
                    "action": action_text,
                    "date": row["created_at"].isoformat() if row["created_at"] else None,
                    "actor": actor
                })

        c["remarks"] = remarks
        c["timeline"] = timeline

        return format_complaint(c)

# ✅ CREATE COMPLAINT
@router.post("", status_code=201)
def create_complaint(data: ComplaintCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "citizen":
        raise HTTPException(status_code=403, detail="Only citizens can create complaints")

    with get_db_cursor() as cursor:
        # Check category and fetch department_id
        cursor.execute("SELECT id, department_id FROM categories WHERE name = %s AND is_active = TRUE", (data.category,))
        cat_info = cursor.fetchone()

        if not cat_info:
            raise HTTPException(status_code=400, detail=f"Category '{data.category}' does not exist or is inactive")

        db_priority = FRONTEND_PRIORITY_MAP.get(data.priority.lower()) or "Medium"

        cursor.execute("""
            INSERT INTO complaints (title, description, category_id, citizen_id, department_id, status, priority)
            VALUES (%s, %s, %s, %s, %s, 'Pending', %s)
            RETURNING id, title, description, category_id, citizen_id, department_id, status, priority, created_at, updated_at
        """, (
            data.title,
            data.description,
            cat_info["id"],
            current_user["id"],
            cat_info["department_id"],
            db_priority
        ))
        
        new_c = cursor.fetchone()
        
        # Populate category name
        new_c["category"] = data.category
        new_c["resolved_at"] = None
        new_c["remarks"] = []
        new_c["timeline"] = [{"action": "Complaint Submitted", "date": new_c["created_at"].isoformat(), "actor": current_user["name"]}]
        
        return format_complaint(new_c)

# ✅ UPDATE COMPLAINT STATUS (FOR OFFICER / ADMIN / SUPER_ADMIN)
@router.patch("/{id}/status")
def update_status(id: str, data: ComplaintStatusUpdate, current_user: dict = Depends(get_current_user)):
    db_id = to_db_id(id)
    role = current_user["role"]
    user_id = current_user["id"]
    dept_id = current_user["department_id"]

    if role not in ["officer", "admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Unauthorized to change complaint status")

    mapped_status = FRONTEND_STATUS_MAP.get(data.status.lower())
    if not mapped_status:
        raise HTTPException(status_code=400, detail=f"Invalid status: {data.status}")

    with get_db_cursor() as cursor:
        # Fetch current complaint details
        cursor.execute("""
            SELECT c.id, c.department_id, c.status, ca.officer_id
            FROM complaints c
            LEFT JOIN complaint_assignments ca ON c.id = ca.complaint_id AND ca.is_active = TRUE
            WHERE c.id = %s
        """, (db_id,))
        complaint = cursor.fetchone()

        if not complaint:
            raise HTTPException(status_code=404, detail="Complaint not found")

        # Permission check
        if role == "officer" and complaint["officer_id"] != user_id:
            raise HTTPException(status_code=403, detail="You are not assigned to this complaint")
        elif role == "admin" and complaint["department_id"] != dept_id:
            raise HTTPException(status_code=403, detail="Complaint does not belong to your department")

        # Update status
        cursor.execute("""
            UPDATE complaints
            SET status = %s, updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        """, (mapped_status, db_id))

        # Add remark if provided
        if data.remark:
            remark_action = f"Remark: {data.remark}"
            cursor.execute("""
                INSERT INTO complaint_history (complaint_id, action, performed_by)
                VALUES (%s, %s, %s)
            """, (db_id, remark_action, user_id))

    return {"message": "Complaint status updated successfully"}

# ✅ ADD REMARK (FOR OFFICER / ADMIN)
@router.post("/{id}/remarks")
def add_remark(id: str, data: ComplaintRemarkCreate, current_user: dict = Depends(get_current_user)):
    db_id = to_db_id(id)
    role = current_user["role"]
    user_id = current_user["id"]
    dept_id = current_user["department_id"]

    if role not in ["officer", "admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Unauthorized to add remarks")

    with get_db_cursor() as cursor:
        cursor.execute("""
            SELECT c.id, c.department_id, ca.officer_id
            FROM complaints c
            LEFT JOIN complaint_assignments ca ON c.id = ca.complaint_id AND ca.is_active = TRUE
            WHERE c.id = %s
        """, (db_id,))
        complaint = cursor.fetchone()

        if not complaint:
            raise HTTPException(status_code=404, detail="Complaint not found")

        # Permission check
        if role == "officer" and complaint["officer_id"] != user_id:
            raise HTTPException(status_code=403, detail="You are not assigned to this complaint")
        elif role == "admin" and complaint["department_id"] != dept_id:
            raise HTTPException(status_code=403, detail="Complaint does not belong to your department")

        remark_action = f"Remark: {data.text}"
        
        # Insert into complaint_history (remarks)
        cursor.execute("""
            INSERT INTO complaint_history (complaint_id, action, performed_by)
            VALUES (%s, %s, %s)
        """, (db_id, remark_action, user_id))

        # Update complaint updated_at timestamp
        cursor.execute("UPDATE complaints SET updated_at = CURRENT_TIMESTAMP WHERE id = %s", (db_id,))

    return {"message": "Remark added successfully"}
