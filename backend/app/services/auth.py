
from app.database import db
from app.models.user import UserModel, UserOut
from app.utils.security import get_password_hash, verify_password
from bson import ObjectId
from email_validator import validate_email, EmailNotValidError
from fastapi import HTTPException, status


async def validate_user_email(email: str) -> bool:
    """Validate email format and check if it's already registered"""
    # Validate email format
    try:
        validate_email(email)
    except EmailNotValidError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid email format"
        )

    # Check if email already exists
    existing_user = await db.db.users.find_one({"email": email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    return True


async def create_user(name: str, email: str, password: str) -> UserModel:
    """Create a new user"""
    # Validate email
    await validate_user_email(email)
    
    # Hash password
    hashed_password = get_password_hash(password)
    
    # Create user
    new_user = UserModel(
        name=name,
        email=email,
        password=hashed_password
    )
    
    # Insert into database
    result = await db.db.users.insert_one(new_user.dict(by_alias=True))
    
    # Return created user
    created_user = await db.db.users.find_one({"_id": result.inserted_id})
    return created_user


async def authenticate_user(email: str, password: str) -> UserModel:
    """Authenticate a user with email and password"""
    # Find user by email
    user = await db.db.users.find_one({"email": email})
    if not user:
        return None
    
    # Verify password
    if not verify_password(password, user["password"]):
        return None
    
    return user


async def get_user_by_id(user_id: str) -> UserModel:
    """Get a user by ID"""
    user = await db.db.users.find_one({"_id": ObjectId(user_id)})
    return user
