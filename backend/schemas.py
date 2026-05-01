from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ProfileBase(BaseModel):
    full_name: Optional[str] = None
    high_school: Optional[str] = None
    target_universities: Optional[str] = None
    bio: Optional[str] = None

class ProfileCreate(ProfileBase):
    pass

class ProfileResponse(ProfileBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    is_verified: bool
    is_admin: bool
    created_at: datetime
    profile: Optional[ProfileResponse] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class VerifyOTP(BaseModel):
    email: EmailStr
    otp: str

class SavedDocumentCreate(BaseModel):
    doc_type: str
    title: str
    content: str

class SavedDocumentResponse(BaseModel):
    id: int
    user_id: int
    doc_type: str
    title: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True
