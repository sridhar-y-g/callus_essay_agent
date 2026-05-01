from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import database, models, schemas, auth

router = APIRouter(prefix="/api/admin", tags=["admin"])

def get_current_admin(current_user: models.User = Depends(auth.get_current_active_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough privileges")
    return current_user

@router.get("/users", response_model=List[schemas.UserResponse])
def get_all_users(db: Session = Depends(database.get_db), admin_user: models.User = Depends(get_current_admin)):
    users = db.query(models.User).all()
    return users
