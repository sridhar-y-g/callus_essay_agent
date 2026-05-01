import random
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import database, models, schemas, auth, mailer

router = APIRouter(prefix="/api/auth", tags=["auth"])

def generate_otp() -> str:
    return str(random.randint(100000, 999999))

@router.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        # If user exists but is unverified, resend OTP
        if not db_user.is_verified:
            otp = generate_otp()
            db_user.verification_token = otp
            db_user.otp_expires_at = datetime.utcnow() + timedelta(minutes=10)
            db.commit()
            db.refresh(db_user)
            mailer.send_verification_email(db_user.email, otp)
            return db_user
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = auth.get_password_hash(user.password)
    otp = generate_otp()

    new_user = models.User(
        email=user.email,
        password_hash=hashed_password,
        verification_token=otp,
        otp_expires_at=datetime.utcnow() + timedelta(minutes=10)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Initialize empty profile
    new_profile = models.Profile(user_id=new_user.id)
    db.add(new_profile)
    db.commit()

    # Send OTP email
    mailer.send_verification_email(new_user.email, otp)

    return new_user

@router.post("/verify-otp")
def verify_otp(data: schemas.VerifyOTP, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
    if user.is_verified:
        raise HTTPException(status_code=400, detail="Email already verified")
    if user.verification_token != data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP code")
    if user.otp_expires_at and datetime.utcnow() > user.otp_expires_at:
        raise HTTPException(status_code=400, detail="OTP has expired. Please register again to get a new code.")

    user.is_verified = True
    user.verification_token = None
    user.otp_expires_at = None
    db.commit()
    return {"message": "Email verified successfully! You can now log in."}

@router.post("/login", response_model=schemas.Token)
def login(user_credentials: schemas.UserLogin, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == user_credentials.email).first()

    if not user or not auth.verify_password(user_credentials.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if not user.is_verified:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email not verified. Please check your inbox for the OTP code.")

    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(auth.get_current_active_user)):
    return current_user

@router.put("/profile", response_model=schemas.ProfileResponse)
def update_profile(profile: schemas.ProfileCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    try:
        db_profile = db.query(models.Profile).filter(models.Profile.user_id == current_user.id).first()
        
        if not db_profile:
            # Auto-create profile if it doesn't exist (for older users)
            db_profile = models.Profile(user_id=current_user.id)
            db.add(db_profile)
            db.commit()
            db.refresh(db_profile)

        if profile.full_name is not None: db_profile.full_name = profile.full_name
        if profile.high_school is not None: db_profile.high_school = profile.high_school
        if profile.target_universities is not None: db_profile.target_universities = profile.target_universities
        if profile.bio is not None: db_profile.bio = profile.bio

        db.commit()
        db.refresh(db_profile)
        return db_profile
    except Exception as e:
        db.rollback()
        print(f"Error updating profile: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
