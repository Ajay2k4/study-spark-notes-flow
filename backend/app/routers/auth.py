
from fastapi import APIRouter, Body, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from typing import List
from datetime import timedelta
from app.models.user import UserCreate, UserOut, UserLogin, Token, UserModel
from app.utils.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    get_current_user,
)
from app.database import db
from app.config import settings
from bson import ObjectId
from email_validator import validate_email, EmailNotValidError

router = APIRouter()


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    # Validate email format
    try:
        validate_email(user_data.email)
    except EmailNotValidError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid email format"
        )

    # Check if email already exists
    existing_user = await db.db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create new user
    hashed_password = get_password_hash(user_data.password)
    new_user = UserModel(
        name=user_data.name,
        email=user_data.email,
        password=hashed_password
    )

    # Insert into database
    result = await db.db.users.insert_one(new_user.dict(by_alias=True))
    
    # Create user response
    created_user = await db.db.users.find_one({"_id": result.inserted_id})
    
    # Generate tokens
    access_token = create_access_token(
        data={"sub": str(created_user["_id"])}
    )
    refresh_token = create_refresh_token(
        data={"sub": str(created_user["_id"])}
    )
    
    # Return tokens and user data
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserOut(**created_user)
    }


@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # Find user by email
    user = await db.db.users.find_one({"email": form_data.username})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password
    if not verify_password(form_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Generate tokens
    access_token = create_access_token(
        data={"sub": str(user["_id"])}
    )
    refresh_token = create_refresh_token(
        data={"sub": str(user["_id"])}
    )
    
    # Return tokens and user data
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserOut(**user)
    }


@router.get("/me", response_model=UserOut)
async def get_me(current_user=Depends(get_current_user)):
    return UserOut(**current_user)


@router.post("/refresh")
async def refresh_token(refresh_token: str):
    # Implement token refresh logic here
    # Validate refresh token, generate new access token
    pass


@router.post("/logout")
async def logout():
    # For token-based auth, this is typically handled client-side
    # by removing the token from local storage
    return {"message": "Successfully logged out"}
