
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from bson import ObjectId
from app.models.user import PyObjectId


class MessageModel(BaseModel):
    content: str
    role: str  # "user" or "assistant"
    timestamp: datetime = Field(default_factory=datetime.now)


class ConversationModel(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: str
    title: str
    messages: List[MessageModel]
    context_ids: List[str] = []  # References to notes or other content
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class ConversationOut(BaseModel):
    id: str = Field(alias="_id")
    user_id: str
    title: str
    messages: List[MessageModel]
    context_ids: List[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        allow_population_by_field_name = True
        json_encoders = {ObjectId: str}


class MessageCreate(BaseModel):
    content: str
    conversation_id: Optional[str] = None  # If None, creates a new conversation
    context_ids: List[str] = []


class ConversationCreate(BaseModel):
    title: str
    first_message: str
    context_ids: List[str] = []


class ContextUpload(BaseModel):
    content: str
    title: str
