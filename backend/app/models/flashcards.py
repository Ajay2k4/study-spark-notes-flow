
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from bson import ObjectId
from app.models.user import PyObjectId


class FlashcardModel(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: str
    question: str
    answer: str
    image_url: Optional[str] = None
    deck_name: str = "Default"
    tags: List[str] = []
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    last_reviewed: Optional[datetime] = None
    review_count: int = 0
    difficulty: int = 0  # 0-5 scale where 0 is easiest

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class FlashcardCreate(BaseModel):
    question: str
    answer: str
    image_url: Optional[str] = None
    deck_name: str = "Default"
    tags: List[str] = []


class FlashcardUpdate(BaseModel):
    question: Optional[str] = None
    answer: Optional[str] = None
    image_url: Optional[str] = None
    deck_name: Optional[str] = None
    tags: Optional[List[str]] = None
    difficulty: Optional[int] = None


class FlashcardOut(BaseModel):
    id: str = Field(alias="_id")
    user_id: str
    question: str
    answer: str
    image_url: Optional[str]
    deck_name: str
    tags: List[str]
    created_at: datetime
    last_reviewed: Optional[datetime]
    review_count: int
    difficulty: int

    class Config:
        allow_population_by_field_name = True
        json_encoders = {ObjectId: str}


class FlashcardGenerate(BaseModel):
    content: str
    count: int = 5
    deck_name: str = "Default"
    tags: List[str] = []
    generate_images: bool = True
