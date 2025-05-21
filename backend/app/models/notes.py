
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from bson import ObjectId
from app.models.user import PyObjectId


class NoteModel(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: str
    title: str
    content: str
    source_type: str  # "manual", "pdf", "youtube", etc.
    source_url: Optional[str] = None
    tags: List[str] = []
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class NoteCreate(BaseModel):
    title: str
    content: str
    source_type: str
    source_url: Optional[str] = None
    tags: List[str] = []


class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[List[str]] = None


class NoteOut(BaseModel):
    id: str = Field(alias="_id")
    user_id: str
    title: str
    content: str
    source_type: str
    source_url: Optional[str]
    tags: List[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        allow_population_by_field_name = True
        json_encoders = {ObjectId: str}


class NoteFromPDF(BaseModel):
    file_url: str
    title: Optional[str] = None
    tags: List[str] = []


class NoteFromYoutube(BaseModel):
    youtube_url: str
    title: Optional[str] = None
    tags: List[str] = []
