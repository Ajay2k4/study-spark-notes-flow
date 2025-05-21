
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from bson import ObjectId
from app.models.user import PyObjectId


class PodcastModel(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: str
    title: str
    content: str
    audio_url: str
    duration: float  # in seconds
    voice_id: str = "default"
    tags: List[str] = []
    created_at: datetime = Field(default_factory=datetime.now)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class PodcastCreate(BaseModel):
    title: str
    content: str
    voice_id: str = "default"
    tags: List[str] = []


class PodcastOut(BaseModel):
    id: str = Field(alias="_id")
    user_id: str
    title: str
    content: str
    audio_url: str
    duration: float
    voice_id: str
    tags: List[str]
    created_at: datetime

    class Config:
        allow_population_by_field_name = True
        json_encoders = {ObjectId: str}


class PodcastVoice(BaseModel):
    id: str
    name: str
    gender: str
    preview_url: Optional[str] = None
