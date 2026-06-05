import secrets
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Depends, status, BackgroundTasks
from fastapi.responses import RedirectResponse
from app.db import get_connection, get_db_cursor
from app.schemas import UserCreate, UserLogin, UserProfileUpdate, PasswordChange
from app.auth.security import hash_password, verify_password
from app.auth.jwt import create_token
from app.auth.dependencies import get_current_user
from app.auth.email import send_verification_email

router = APIRouter()

# ✅ REGISTER
@router.post("/register")
def register(user: UserCreate, background_tasks: BackgroundTasks):
    conn = get_connection()
    cursor = conn.cursor()

    # Check if email exists
    cursor.execute("SELECT id FROM users WHERE email = %s", (user.email,))
    existing = cursor.fetchone()

    if existing:
        conn.close()
        raise HTTPException(status_code=400, detail="Email already exists")

    is_verified = True
    token = None
    expires_at = None

    if user.role == "citizen":
        is_verified = False
        token = secrets.token_urlsafe(32)
        expires_at = datetime.utcnow() + timedelta(hours=24)

    # Insert user
    cursor.execute("""
        INSERT INTO users (name, email, password_hash, role, department_id, is_verified, verification_token, token_expires_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id
    """, (
        user.name,
        user.email,
        hash_password(user.password),
        user.role,
        user.department_id,
        is_verified,
        token,
        expires_at
    ))

    user_id = cursor.fetchone()[0]
    conn.commit()
    conn.close()

    if user.role == "citizen":
        background_tasks.add_task(send_verification_email, user.email, user.name, token)
        return {"message": "User created. Please check your email to verify your account.", "user_id": user_id, "requires_verification": True}

    return {"message": "User created", "user_id": user_id, "requires_verification": False}


# ✅ VERIFY EMAIL
@router.get("/verify")
def verify_email(token: str):
    with get_db_cursor() as cursor:
        cursor.execute("""
            SELECT id, name, email, token_expires_at, is_verified 
            FROM users 
            WHERE verification_token = %s
        """, (token,))
        user = cursor.fetchone()

        if not user:
            return RedirectResponse("http://localhost:5173/login?error=invalid_token")

        if user["is_verified"]:
            return RedirectResponse("http://localhost:5173/login?verified=true")

        if user["token_expires_at"] and user["token_expires_at"] < datetime.utcnow():
            return RedirectResponse("http://localhost:5173/login?error=expired_token")

        cursor.execute("""
            UPDATE users 
            SET is_verified = TRUE, verification_token = NULL, token_expires_at = NULL 
            WHERE id = %s
        """, (user["id"],))

    return RedirectResponse("http://localhost:5173/login?verified=true")


# ✅ LOGIN
@router.post("/login")
def login(user: UserLogin):
    conn = get_connection()
    # Use DictCursor for easy serialization
    from psycopg2.extras import RealDictCursor
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    cursor.execute("""
        SELECT id, name, email, password_hash, role, department_id, is_active, is_verified
        FROM users
        WHERE email = %s
    """, (user.email,))

    db_user = cursor.fetchone()
    conn.close()

    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not db_user["is_active"]:
        raise HTTPException(status_code=403, detail="User account is inactive")

    if not db_user["is_verified"]:
        raise HTTPException(status_code=403, detail="Please verify your email address before logging in")

    if not verify_password(user.password, db_user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token({
        "user_id": db_user["id"],
        "role": db_user["role"]
    })

    # Return standard oauth token structure + user details
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": db_user["id"],
            "name": db_user["name"],
            "email": db_user["email"],
            "role": db_user["role"],
            "department_id": db_user["department_id"]
        }
    }


# ✅ GET CURRENT PROFILE
@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "id": current_user["id"],
        "name": current_user["name"],
        "email": current_user["email"],
        "role": current_user["role"],
        "department_id": current_user["department_id"]
    }


# ✅ UPDATE PROFILE
@router.put("/profile")
def update_profile(data: UserProfileUpdate, current_user: dict = Depends(get_current_user)):
    with get_db_cursor() as cursor:
        # Check if email is being changed and is already taken
        if data.email != current_user["email"]:
            cursor.execute("SELECT id FROM users WHERE email = %s AND id != %s", (data.email, current_user["id"]))
            if cursor.fetchone():
                raise HTTPException(status_code=400, detail="Email is already taken by another user")

        cursor.execute("""
            UPDATE users
            SET name = %s, email = %s
            WHERE id = %s
            RETURNING id, name, email, role, department_id
        """, (data.name, data.email, current_user["id"]))
        
        updated_user = cursor.fetchone()
        return updated_user


# ✅ CHANGE PASSWORD
@router.post("/change-password")
def change_password(data: PasswordChange, current_user: dict = Depends(get_current_user)):
    with get_db_cursor() as cursor:
        # Fetch password hash
        cursor.execute("SELECT password_hash FROM users WHERE id = %s", (current_user["id"],))
        db_hash = cursor.fetchone()["password_hash"]

        if not verify_password(data.old_password, db_hash):
            raise HTTPException(status_code=400, detail="Incorrect old password")

        cursor.execute("""
            UPDATE users
            SET password_hash = %s
            WHERE id = %s
        """, (hash_password(data.new_password), current_user["id"]))

    return {"message": "Password changed successfully"}