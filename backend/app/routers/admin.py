from fastapi import APIRouter, HTTPException, Depends, status
from typing import Optional, List
from app.db import get_db_cursor
from app.auth.dependencies import get_current_user, RoleChecker
from app.auth.security import hash_password
from app.schemas import (
    OfficerCreate, OfficerUpdate, ComplaintAssign,
    DepartmentCreate, DepartmentUpdate, CategoryCreate, CategoryUpdate
)
from app.routers.complaints import to_db_id, to_frontend_id

router = APIRouter()

# --- ACCESS ROLE CHECKERS ---
require_admin = RoleChecker(["admin"])
require_super_admin = RoleChecker(["super_admin"])
require_any_admin = RoleChecker(["admin", "super_admin"])

# ==================== DEPARTMENT ADMIN ENDPOINTS ====================

# ✅ GET OFFICERS (IN DEPARTMENT)
@router.get("/officers")
def get_officers(current_user: dict = Depends(require_admin)):
    dept_id = current_user["department_id"]
    if not dept_id:
        raise HTTPException(status_code=400, detail="Admin does not belong to a department")

    query = """
        SELECT 
            u.id, 
            u.name, 
            u.email, 
            u.is_active, 
            u.created_at,
            (SELECT COUNT(*) FROM complaint_assignments WHERE officer_id = u.id AND is_active = TRUE) AS complaints_assigned,
            (SELECT COUNT(*) FROM complaint_assignments ca 
             JOIN complaints c ON ca.complaint_id = c.id 
             WHERE ca.officer_id = u.id AND c.status = 'Resolved') AS complaints_resolved
        FROM users u
        WHERE u.role = 'officer' AND u.department_id = %s
    """
    with get_db_cursor(commit=False) as cursor:
        cursor.execute(query, (dept_id,))
        rows = cursor.fetchall()
        
        # Format for frontend representation
        for r in rows:
            r["status"] = "active" if r["is_active"] else "inactive"
            r["join_date"] = r["created_at"].strftime("%Y-%m-%d") if r["created_at"] else ""
            r["phone"] = ""  # Mock phone since database does not store phone in base users table
            
        return rows

# ✅ ADD NEW OFFICER (IN DEPARTMENT)
@router.post("/officers", status_code=201)
def add_officer(data: OfficerCreate, current_user: dict = Depends(require_admin)):
    dept_id = current_user["department_id"]
    if not dept_id:
        raise HTTPException(status_code=400, detail="Admin does not belong to a department")

    with get_db_cursor() as cursor:
        # Check if email exists
        cursor.execute("SELECT id FROM users WHERE email = %s", (data.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Email is already registered")

        cursor.execute("""
            INSERT INTO users (name, email, password_hash, role, department_id, is_active)
            VALUES (%s, %s, %s, 'officer', %s, TRUE)
            RETURNING id, name, email, role, department_id, is_active, created_at
        """, (
            data.name,
            data.email,
            hash_password(data.password),
            dept_id
        ))
        
        new_officer = cursor.fetchone()
        new_officer["status"] = "active"
        new_officer["join_date"] = new_officer["created_at"].strftime("%Y-%m-%d")
        new_officer["phone"] = data.phone
        new_officer["complaints_assigned"] = 0
        new_officer["complaints_resolved"] = 0
        
        return new_officer

# ✅ UPDATE OFFICER
@router.put("/officers/{id}")
def update_officer(id: int, data: OfficerUpdate, current_user: dict = Depends(require_admin)):
    dept_id = current_user["department_id"]
    
    with get_db_cursor() as cursor:
        cursor.execute("SELECT id, department_id FROM users WHERE id = %s AND role = 'officer'", (id,))
        officer = cursor.fetchone()
        
        if not officer:
            raise HTTPException(status_code=404, detail="Officer not found")
        if officer["department_id"] != dept_id:
            raise HTTPException(status_code=403, detail="Officer does not belong to your department")

        is_active_val = None
        if data.status:
            is_active_val = True if data.status == "active" else False

        # Build dynamic update
        update_fields = []
        params = []
        if data.name is not None:
            update_fields.append("name = %s")
            params.append(data.name)
        if data.email is not None:
            # Check email uniqueness
            cursor.execute("SELECT id FROM users WHERE email = %s AND id != %s", (data.email, id))
            if cursor.fetchone():
                raise HTTPException(status_code=400, detail="Email is already taken")
            update_fields.append("email = %s")
            params.append(data.email)
        if is_active_val is not None:
            update_fields.append("is_active = %s")
            params.append(is_active_val)

        if not update_fields:
            raise HTTPException(status_code=400, detail="No fields to update")

        params.append(id)
        query = f"UPDATE users SET {', '.join(update_fields)} WHERE id = %s RETURNING id, name, email, role, department_id, is_active, created_at"
        cursor.execute(query, tuple(params))
        updated = cursor.fetchone()
        
        updated["status"] = "active" if updated["is_active"] else "inactive"
        updated["join_date"] = updated["created_at"].strftime("%Y-%m-%d") if updated["created_at"] else ""
        updated["phone"] = data.phone or ""
        
        return updated

# ✅ DELETE OFFICER
@router.delete("/officers/{id}")
def delete_officer(id: int, current_user: dict = Depends(require_admin)):
    dept_id = current_user["department_id"]
    
    with get_db_cursor() as cursor:
        cursor.execute("SELECT id, department_id FROM users WHERE id = %s AND role = 'officer'", (id,))
        officer = cursor.fetchone()
        
        if not officer:
            raise HTTPException(status_code=404, detail="Officer not found")
        if officer["department_id"] != dept_id:
            raise HTTPException(status_code=403, detail="Officer does not belong to your department")

        # Soft delete by setting inactive or hard delete. Let's do a hard delete as mock did splice.
        # But wait, complaint assignments have foreign keys. If there are assignments, delete them or set null.
        # DB schema specifies ON DELETE CASCADE for officer_id in complaint_assignments, so it's safe to hard delete.
        cursor.execute("DELETE FROM users WHERE id = %s", (id,))
        
    return {"success": True}

# ✅ ASSIGN COMPLAINT TO OFFICER
@router.post("/assign")
def assign_complaint(data: ComplaintAssign, complaint_id: str, current_user: dict = Depends(require_admin)):
    db_complaint_id = to_db_id(complaint_id)
    dept_id = current_user["department_id"]

    with get_db_cursor() as cursor:
        # Check complaint existence and department
        cursor.execute("SELECT id, department_id, status FROM complaints WHERE id = %s", (db_complaint_id,))
        c = cursor.fetchone()
        if not c:
            raise HTTPException(status_code=404, detail="Complaint not found")
        if c["department_id"] != dept_id:
            raise HTTPException(status_code=403, detail="Complaint does not belong to your department")

        # Check officer existence and department
        cursor.execute("SELECT id, name, department_id FROM users WHERE id = %s AND role = 'officer'", (data.officer_id,))
        officer = cursor.fetchone()
        if not officer:
            raise HTTPException(status_code=404, detail="Officer not found")
        if officer["department_id"] != dept_id:
            raise HTTPException(status_code=400, detail="Officer does not belong to your department")

        # Deactivate current active assignments
        cursor.execute("UPDATE complaint_assignments SET is_active = FALSE WHERE complaint_id = %s", (db_complaint_id,))

        # Insert new assignment
        cursor.execute("""
            INSERT INTO complaint_assignments (complaint_id, officer_id, assigned_by, is_active)
            VALUES (%s, %s, %s, TRUE)
            RETURNING id, assigned_at
        """, (db_complaint_id, data.officer_id, current_user["id"]))
        
        assignment = cursor.fetchone()
        
        # Return updated complaint details
        cursor.execute("""
            SELECT c.id, c.title, c.status, c.updated_at
            FROM complaints c
            WHERE c.id = %s
        """, (db_complaint_id,))
        updated_c = cursor.fetchone()
        
        # Log manual assignment timeline event (DB trigger only logs assigned status update, not the assignee name)
        timeline_action = f"Assigned to {officer['name']}"
        cursor.execute("""
            INSERT INTO complaint_history (complaint_id, action, performed_by)
            VALUES (%s, %s, %s)
        """, (db_complaint_id, timeline_action, current_user["id"]))

        return {
            "id": to_frontend_id(updated_c["id"]),
            "title": updated_c["title"],
            "status": "assigned",
            "officer_name": officer["name"],
            "assigned_at": assignment["assigned_at"].isoformat()
        }

# ✅ GET DEPARTMENT INFO
@router.get("/department-info")
def get_department_info(current_user: dict = Depends(require_admin)):
    dept_id = current_user["department_id"]
    if not dept_id:
        raise HTTPException(status_code=400, detail="Admin does not belong to a department")

    with get_db_cursor(commit=False) as cursor:
        cursor.execute("SELECT id, name FROM departments WHERE id = %s", (dept_id,))
        dept = cursor.fetchone()
        
        if not dept:
            raise HTTPException(status_code=404, detail="Department not found")

        cursor.execute("SELECT COUNT(*) as count FROM users WHERE role = 'officer' AND department_id = %s AND is_active = TRUE", (dept_id,))
        officers_count = cursor.fetchone()["count"]

        cursor.execute("SELECT COUNT(*) as count FROM complaints WHERE department_id = %s AND status = 'Pending'", (dept_id,))
        pending_count = cursor.fetchone()["count"]

        return {
            "id": dept["id"],
            "name": dept["name"],
            "officers_count": officers_count,
            "pending_complaints": pending_count
        }

# ✅ GET DEPARTMENT ANALYTICS
@router.get("/analytics")
def get_department_analytics(current_user: dict = Depends(require_admin)):
    dept_id = current_user["department_id"]
    if not dept_id:
        raise HTTPException(status_code=400, detail="Admin does not belong to a department")

    with get_db_cursor(commit=False) as cursor:
        # Status counts
        cursor.execute("SELECT status, COUNT(*) as count FROM complaints WHERE department_id = %s GROUP BY status", (dept_id,))
        status_rows = cursor.fetchall()
        
        total = 0
        pending = 0
        assigned = 0
        in_progress = 0
        resolved = 0
        rejected = 0

        for r in status_rows:
            db_status = r["status"]
            count = r["count"]
            total += count
            if db_status == "Pending":
                pending = count
            elif db_status == "Assigned":
                assigned = count
            elif db_status == "In Progress":
                in_progress = count
            elif db_status == "Resolved":
                resolved = count
            elif db_status == "Rejected":
                rejected = count

        # Categories distribution
        cursor.execute("""
            SELECT cat.name, COUNT(c.id) as value
            FROM categories cat
            LEFT JOIN complaints c ON cat.id = c.category_id AND c.department_id = %s
            WHERE cat.department_id = %s AND cat.is_active = TRUE
            GROUP BY cat.name
        """, (dept_id, dept_id))
        category_dist = cursor.fetchall()

        # Monthly trends
        cursor.execute("""
            SELECT to_char(created_at, 'Mon') AS month, COUNT(*) AS count
            FROM complaints
            WHERE department_id = %s AND created_at >= NOW() - INTERVAL '6 months'
            GROUP BY to_char(created_at, 'Mon'), date_trunc('month', created_at)
            ORDER BY date_trunc('month', created_at)
        """, (dept_id,))
        monthly_trends = cursor.fetchall()

        # Officer performance
        cursor.execute("""
            SELECT 
                u.id, 
                u.name, 
                (SELECT COUNT(*) FROM complaint_assignments WHERE officer_id = u.id AND is_active = TRUE) AS assigned,
                (SELECT COUNT(*) FROM complaint_assignments ca 
                 JOIN complaints c ON ca.complaint_id = c.id 
                 WHERE ca.officer_id = u.id AND c.status = 'Resolved') AS resolved
            FROM users u
            WHERE u.role = 'officer' AND u.department_id = %s AND u.is_active = TRUE
        """, (dept_id,))
        officer_rows = cursor.fetchall()

        officer_perf = []
        for o in officer_rows:
            asg = o["assigned"]
            res = o["resolved"]
            officer_perf.append({
                "id": o["id"],
                "name": o["name"],
                "assigned": asg,
                "resolved": res,
                "resolutionRate": round((res / asg * 100)) if asg > 0 else 0
            })

        # This month count
        cursor.execute("SELECT COUNT(*) as count FROM complaints WHERE department_id = %s AND created_at >= date_trunc('month', CURRENT_DATE)", (dept_id,))
        this_month_count = cursor.fetchone()["count"]

        resolution_rate = round((resolved / total * 100)) if total > 0 else 0

        return {
            "total": total,
            "pending": pending,
            "assigned": assigned,
            "inProgress": in_progress,
            "resolved": resolved,
            "rejected": rejected,
            "thisMonth": this_month_count,
            "resolutionRate": resolution_rate,
            "categoryDistribution": category_dist,
            "monthlyTrends": monthly_trends,
            "officerPerformance": sorted(officer_perf, key=lambda x: x["resolutionRate"], reverse=True)
        }


# ==================== SUPER ADMIN ENDPOINTS ====================

# --- DEPARTMENT MANAGEMENT ---

@router.get("/departments")
def get_departments(current_user: dict = Depends(require_super_admin)):
    query = """
        SELECT 
            d.id, 
            d.name, 
            d.is_active, 
            d.created_at,
            (SELECT COUNT(*) FROM complaints WHERE department_id = d.id) AS complaint_count,
            (SELECT COUNT(*) FROM complaints WHERE department_id = d.id AND status = 'Resolved') AS resolved_count,
            (SELECT id FROM users WHERE role = 'admin' AND department_id = d.id LIMIT 1) AS admin_id,
            (SELECT name FROM users WHERE role = 'admin' AND department_id = d.id LIMIT 1) AS admin_name
        FROM departments d
        ORDER BY d.id ASC
    """
    with get_db_cursor(commit=False) as cursor:
        cursor.execute(query)
        depts = cursor.fetchall()
        for d in depts:
            d["icon"] = "building"  # Default icon for department representation
        return depts

@router.post("/departments", status_code=201)
def create_department(data: DepartmentCreate, current_user: dict = Depends(require_super_admin)):
    with get_db_cursor() as cursor:
        cursor.execute("SELECT id FROM departments WHERE name = %s", (data.name,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Department with this name already exists")

        cursor.execute("""
            INSERT INTO departments (name) VALUES (%s)
            RETURNING id, name, is_active, created_at
        """, (data.name,))
        new_dept = cursor.fetchone()
        new_dept["complaint_count"] = 0
        new_dept["resolved_count"] = 0
        new_dept["admin_id"] = None
        new_dept["admin_name"] = None
        new_dept["icon"] = "building"
        return new_dept

@router.put("/departments/{id}")
def update_department(id: int, data: DepartmentUpdate, current_user: dict = Depends(require_super_admin)):
    with get_db_cursor() as cursor:
        cursor.execute("SELECT id FROM departments WHERE id = %s", (id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Department not found")

        update_fields = []
        params = []
        if data.name is not None:
            update_fields.append("name = %s")
            params.append(data.name)
        if data.is_active is not None:
            update_fields.append("is_active = %s")
            params.append(data.is_active)

        if not update_fields:
            raise HTTPException(status_code=400, detail="No fields to update")

        params.append(id)
        query = f"UPDATE departments SET {', '.join(update_fields)} WHERE id = %s RETURNING id, name, is_active, created_at"
        cursor.execute(query, tuple(params))
        updated = cursor.fetchone()
        
        # Populate counts
        cursor.execute("SELECT COUNT(*) FROM complaints WHERE department_id = %s", (id,))
        updated["complaint_count"] = cursor.fetchone()["count"]
        cursor.execute("SELECT COUNT(*) FROM complaints WHERE department_id = %s AND status = 'Resolved'", (id,))
        updated["resolved_count"] = cursor.fetchone()["count"]
        cursor.execute("SELECT id, name FROM users WHERE role = 'admin' AND department_id = %s LIMIT 1", (id,))
        admin_info = cursor.fetchone()
        updated["admin_id"] = admin_info["id"] if admin_info else None
        updated["admin_name"] = admin_info["name"] if admin_info else None
        updated["icon"] = "building"
        return updated

@router.delete("/departments/{id}")
def delete_department(id: int, current_user: dict = Depends(require_super_admin)):
    with get_db_cursor() as cursor:
        cursor.execute("SELECT id FROM departments WHERE id = %s", (id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Department not found")

        cursor.execute("DELETE FROM departments WHERE id = %s", (id,))
    return {"success": True}

# --- CATEGORY MANAGEMENT ---

@router.get("/categories")
def get_categories(current_user: dict = Depends(require_any_admin)):
    query = """
        SELECT c.id, c.name, c.department_id, d.name AS department_name, c.is_active, c.created_at
        FROM categories c
        JOIN departments d ON c.department_id = d.id
        ORDER BY c.id ASC
    """
    with get_db_cursor(commit=False) as cursor:
        cursor.execute(query)
        categories = cursor.fetchall()
        for cat in categories:
            cat["active"] = cat["is_active"]
            cat["icon"] = "tag"
        return categories

@router.post("/categories", status_code=201)
def create_category(data: CategoryCreate, current_user: dict = Depends(require_super_admin)):
    with get_db_cursor() as cursor:
        cursor.execute("SELECT id FROM categories WHERE name = %s AND department_id = %s", (data.name, data.department_id))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Category already exists in this department")

        cursor.execute("""
            INSERT INTO categories (name, department_id) VALUES (%s, %s)
            RETURNING id, name, department_id, is_active, created_at
        """, (data.name, data.department_id))
        new_cat = cursor.fetchone()
        
        cursor.execute("SELECT name FROM departments WHERE id = %s", (data.department_id,))
        new_cat["department_name"] = cursor.fetchone()["name"]
        new_cat["active"] = new_cat["is_active"]
        new_cat["icon"] = "tag"
        return new_cat

@router.put("/categories/{id}")
def update_category(id: int, data: CategoryUpdate, current_user: dict = Depends(require_super_admin)):
    with get_db_cursor() as cursor:
        cursor.execute("SELECT id FROM categories WHERE id = %s", (id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Category not found")

        update_fields = []
        params = []
        if data.name is not None:
            update_fields.append("name = %s")
            params.append(data.name)
        if data.department_id is not None:
            update_fields.append("department_id = %s")
            params.append(data.department_id)
        if data.is_active is not None:
            update_fields.append("is_active = %s")
            params.append(data.is_active)

        if not update_fields:
            raise HTTPException(status_code=400, detail="No fields to update")

        params.append(id)
        query = f"UPDATE categories SET {', '.join(update_fields)} WHERE id = %s RETURNING id, name, department_id, is_active, created_at"
        cursor.execute(query, tuple(params))
        updated = cursor.fetchone()

        cursor.execute("SELECT name FROM departments WHERE id = %s", (updated["department_id"],))
        updated["department_name"] = cursor.fetchone()["name"]
        updated["active"] = updated["is_active"]
        updated["icon"] = "tag"
        return updated

@router.delete("/categories/{id}")
def delete_category(id: int, current_user: dict = Depends(require_super_admin)):
    with get_db_cursor() as cursor:
        cursor.execute("SELECT id FROM categories WHERE id = %s", (id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Category not found")

        cursor.execute("DELETE FROM categories WHERE id = %s", (id,))
    return {"success": True}

# --- SYSTEM USER MANAGEMENT ---

@router.get("/users")
def get_users(current_user: dict = Depends(require_super_admin)):
    query = """
        SELECT u.id, u.name, u.email, u.role, u.department_id, d.name as department_name, u.is_active, u.created_at
        FROM users u
        LEFT JOIN departments d ON u.department_id = d.id
        ORDER BY u.id ASC
    """
    with get_db_cursor(commit=False) as cursor:
        cursor.execute(query)
        rows = cursor.fetchall()
        for r in rows:
            r["status"] = "active" if r["is_active"] else "inactive"
        return rows

@router.put("/users/{id}/role")
def update_user_role(id: int, role: str, department_id: Optional[int] = None, current_user: dict = Depends(require_super_admin)):
    # Validate role
    if role not in ["citizen", "officer", "admin", "super_admin"]:
        raise HTTPException(status_code=400, detail="Invalid role value")

    with get_db_cursor() as cursor:
        cursor.execute("SELECT id FROM users WHERE id = %s", (id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="User not found")

        cursor.execute("""
            UPDATE users
            SET role = %s, department_id = %s
            WHERE id = %s
            RETURNING id, name, email, role, department_id, is_active, created_at
        """, (role, department_id, id))
        
        updated = cursor.fetchone()
        updated["status"] = "active" if updated["is_active"] else "inactive"
        return updated

@router.put("/users/{id}/status")
def update_user_status(id: int, status: str, current_user: dict = Depends(require_super_admin)):
    if status not in ["active", "inactive"]:
        raise HTTPException(status_code=400, detail="Status must be 'active' or 'inactive'")

    is_active_val = True if status == "active" else False

    with get_db_cursor() as cursor:
        cursor.execute("SELECT id FROM users WHERE id = %s", (id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="User not found")

        cursor.execute("""
            UPDATE users
            SET is_active = %s
            WHERE id = %s
            RETURNING id, name, email, role, department_id, is_active, created_at
        """, (is_active_val, id))
        
        updated = cursor.fetchone()
        updated["status"] = "active" if updated["is_active"] else "inactive"
        return updated

@router.delete("/users/{id}")
def delete_user(id: int, current_user: dict = Depends(require_super_admin)):
    with get_db_cursor() as cursor:
        cursor.execute("SELECT id FROM users WHERE id = %s", (id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="User not found")

        cursor.execute("DELETE FROM users WHERE id = %s", (id,))
    return {"success": True}

# --- SYSTEM ANALYTICS (SUPER ADMIN) ---

@router.get("/super-analytics")
def get_super_analytics(current_user: dict = Depends(require_super_admin)):
    with get_db_cursor(commit=False) as cursor:
        # Users stats
        cursor.execute("SELECT role, COUNT(*) as count FROM users GROUP BY role")
        user_rows = cursor.fetchall()
        
        users_stats = {"total": 0, "citizens": 0, "officers": 0, "admins": 0}
        for u in user_rows:
            r = u["role"]
            count = u["count"]
            users_stats["total"] += count
            if r == "citizen":
                users_stats["citizens"] = count
            elif r == "officer":
                users_stats["officers"] = count
            elif r == "admin":
                users_stats["admins"] = count
            elif r == "super_admin":
                pass

        # Complaints stats
        cursor.execute("SELECT status, COUNT(*) as count FROM complaints GROUP BY status")
        complaint_rows = cursor.fetchall()
        
        total_complaints = 0
        pending = 0
        resolved = 0
        in_progress = 0
        assigned = 0
        rejected = 0

        for c in complaint_rows:
            s = c["status"]
            count = c["count"]
            total_complaints += count
            if s == "Pending":
                pending = count
            elif s == "Resolved":
                resolved = count
            elif s == "In Progress":
                in_progress = count
            elif s == "Assigned":
                assigned = count
            elif s == "Rejected":
                rejected = count

        # Department performance
        cursor.execute("""
            SELECT 
                d.id, 
                d.name,
                (SELECT COUNT(*) FROM complaints WHERE department_id = d.id) AS total,
                (SELECT COUNT(*) FROM complaints WHERE department_id = d.id AND status = 'Resolved') AS resolved
            FROM departments d
            WHERE d.is_active = TRUE
        """)
        dept_rows = cursor.fetchall()
        
        dept_perf = []
        for d in dept_rows:
            tot = d["total"]
            res = d["resolved"]
            dept_perf.append({
                "id": d["id"],
                "name": d["name"],
                "total": tot,
                "resolved": res,
                "rate": round((res / tot * 100)) if tot > 0 else 0
            })

        # Monthly trends (last 6 months)
        cursor.execute("""
            SELECT to_char(created_at, 'Mon') AS month, COUNT(*) AS count
            FROM complaints
            WHERE created_at >= NOW() - INTERVAL '6 months'
            GROUP BY to_char(created_at, 'Mon'), date_trunc('month', created_at)
            ORDER BY date_trunc('month', created_at)
        """)
        monthly_trends = cursor.fetchall()

        # Category distribution
        cursor.execute("""
            SELECT cat.name AS name, COUNT(c.id) AS value
            FROM categories cat
            JOIN complaints c ON cat.id = c.category_id
            GROUP BY cat.name
        """)
        category_dist = cursor.fetchall()

        resolution_rate = round((resolved / total_complaints * 100)) if total_complaints > 0 else 0

        return {
            "users": users_stats,
            "complaints": {
                "total": total_complaints,
                "pending": pending,
                "resolved": resolved,
                "inProgress": in_progress,
                "assigned": assigned,
                "rejected": rejected,
                "resolutionRate": resolution_rate
            },
            "departments": {
                "total": len(dept_perf),
                "performance": dept_perf
            },
            "monthlyTrends": monthly_trends,
            "categoryDistribution": category_dist
        }
