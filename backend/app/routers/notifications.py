from fastapi import APIRouter, HTTPException, Depends, status
from app.db import get_db_cursor
from app.auth.dependencies import get_current_user
from app.routers.complaints import to_frontend_id

router = APIRouter()

# ✅ GET NOTIFICATIONS
@router.get("")
def get_notifications(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]

    query = """
        SELECT id, user_id, message, is_read, created_at
        FROM notifications
        WHERE user_id = %s
        ORDER BY created_at DESC
    """
    
    with get_db_cursor(commit=False) as cursor:
        cursor.execute(query, (user_id,))
        rows = cursor.fetchall()
        
        results = []
        for r in rows:
            msg = r["message"]
            created = r["created_at"]
            
            # Map title and type based on message content
            if "assigned" in msg.lower():
                title = "Complaint Assigned"
                ntype = "assignment"
            elif "status" in msg.lower():
                title = "Complaint Status Updated"
                ntype = "status_update"
            elif "resolved" in msg.lower() or "completed" in msg.lower():
                title = "Complaint Resolved"
                ntype = "resolution"
            else:
                title = "Notification Alert"
                ntype = "general"

            # Find matching complaint ID using transaction timestamp matching
            cursor.execute("""
                SELECT id 
                FROM complaints 
                WHERE citizen_id = %s 
                ORDER BY ABS(EXTRACT(EPOCH FROM (updated_at - %s))) ASC 
                LIMIT 1
            """, (user_id, created))
            complaint = cursor.fetchone()
            
            frontend_cid = to_frontend_id(complaint["id"]) if complaint else None

            results.append({
                "id": r["id"],
                "title": title,
                "message": msg,
                "complaint_id": frontend_cid,
                "is_read": r["is_read"],
                "created_at": created.isoformat() if created else None,
                "type": ntype
            })
            
        return results

# ✅ MARK NOTIFICATION AS READ
@router.put("/{id}/read")
def mark_read(id: int, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    
    with get_db_cursor() as cursor:
        # Check notification owner
        cursor.execute("SELECT id FROM notifications WHERE id = %s AND user_id = %s", (id, user_id))
        n = cursor.fetchone()
        
        if not n:
            raise HTTPException(status_code=404, detail="Notification not found")
            
        cursor.execute("UPDATE notifications SET is_read = TRUE WHERE id = %s", (id,))
        
    return {"success": True}

# ✅ MARK ALL AS READ
@router.put("/read-all")
def mark_all_read(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    
    with get_db_cursor() as cursor:
        cursor.execute("UPDATE notifications SET is_read = TRUE WHERE user_id = %s", (user_id,))
        
    return {"success": True}
