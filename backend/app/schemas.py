from pydantic import BaseModel, EmailStr
from typing import Optional, List

# --- AUTH SCHEMAS ---
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str  # citizen, officer, admin, super_admin
    department_id: Optional[int] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfileUpdate(BaseModel):
    name: str
    email: EmailStr

class PasswordChange(BaseModel):
    old_password: str
    new_password: str

# --- COMPLAINT SCHEMAS ---
class ComplaintCreate(BaseModel):
    title: str
    description: str
    category: str  # Category name (e.g., 'Water Supply')
    priority: str  # Low, Medium, High, Emergency

class ComplaintStatusUpdate(BaseModel):
    status: str    # Pending, Assigned, In Progress, Resolved, Rejected
    remark: Optional[str] = ""

class ComplaintRemarkCreate(BaseModel):
    text: str

class ComplaintAssign(BaseModel):
    officer_id: int

# --- DEPARTMENT & CATEGORY SCHEMAS ---
class DepartmentCreate(BaseModel):
    name: str

class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    is_active: Optional[bool] = None

class CategoryCreate(BaseModel):
    name: str
    department_id: int

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    department_id: Optional[int] = None
    is_active: Optional[bool] = None

# --- OFFICER SCHEMAS ---
class OfficerCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = ""

class OfficerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    status: Optional[str] = None  # active, inactive