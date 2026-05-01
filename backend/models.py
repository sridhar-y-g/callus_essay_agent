from sqlalchemy import Boolean, Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    is_verified = Column(Boolean, default=False)
    verification_token = Column(String(10), nullable=True)
    otp_expires_at = Column(DateTime, nullable=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    profile = relationship("Profile", back_populates="user", uselist=False)
    documents = relationship("SavedDocument", back_populates="user", cascade="all, delete-orphan")

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    full_name = Column(String(255), nullable=True)
    high_school = Column(String(255), nullable=True)
    target_universities = Column(String(1000), nullable=True) # comma separated or JSON string
    bio = Column(String(2000), nullable=True)

    user = relationship("User", back_populates="profile")

class SavedDocument(Base):
    __tablename__ = "saved_documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    doc_type = Column(String(50), nullable=False) # 'essay' or 'guidance'
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False) # Use Text for long content in MySQL/TiDB
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="documents")
