
from app.database import db
from app.models.notes import NoteModel
from app.ai.extractors import extract_text_from_pdf, extract_youtube_transcript, extract_url_content
from app.ai.text_gen import generate_notes
from bson import ObjectId
from datetime import datetime
from typing import List, Optional


async def create_note_from_text(
    user_id: str,
    title: str,
    content: str,
    source_type: str = "manual",
    source_url: Optional[str] = None,
    tags: List[str] = []
) -> NoteModel:
    """Create a new note from text"""
    new_note = NoteModel(
        user_id=user_id,
        title=title,
        content=content,
        source_type=source_type,
        source_url=source_url,
        tags=tags
    )
    
    result = await db.db.notes.insert_one(new_note.dict(by_alias=True))
    created_note = await db.db.notes.find_one({"_id": result.inserted_id})
    
    return created_note


async def create_note_from_pdf(
    user_id: str,
    pdf_content: bytes,
    title: Optional[str] = None,
    file_name: str = "document.pdf",
    tags: List[str] = []
) -> NoteModel:
    """Create a note from PDF content"""
    # Extract text from PDF
    extracted_text = await extract_text_from_pdf(pdf_content)
    
    # Generate notes using AI
    notes_content = await generate_notes(extracted_text)
    
    # Create a default title if not provided
    if not title:
        title = f"Notes from {file_name}"
    
    # Create the note
    new_note = await create_note_from_text(
        user_id=user_id,
        title=title,
        content=notes_content,
        source_type="pdf",
        source_url=file_name,
        tags=tags
    )
    
    return new_note


async def create_note_from_youtube(
    user_id: str,
    youtube_url: str,
    title: Optional[str] = None,
    tags: List[str] = []
) -> NoteModel:
    """Create a note from YouTube video"""
    # Extract transcript and metadata
    transcript, video_title = await extract_youtube_transcript(youtube_url)
    
    # Generate notes using AI
    notes_content = await generate_notes(transcript)
    
    # Use video title if no title provided
    if not title:
        title = f"Notes from {video_title}"
    
    # Create the note
    new_note = await create_note_from_text(
        user_id=user_id,
        title=title,
        content=notes_content,
        source_type="youtube",
        source_url=youtube_url,
        tags=tags
    )
    
    return new_note


async def get_user_notes(
    user_id: str,
    skip: int = 0,
    limit: int = 10
) -> List[NoteModel]:
    """Get all notes for a user"""
    notes = []
    cursor = db.db.notes.find(
        {"user_id": user_id}
    ).skip(skip).limit(limit).sort("created_at", -1)
    
    async for note in cursor:
        notes.append(note)
    
    return notes


async def get_note_by_id(note_id: str, user_id: str) -> Optional[NoteModel]:
    """Get a specific note"""
    note = await db.db.notes.find_one({
        "_id": ObjectId(note_id),
        "user_id": user_id
    })
    
    return note


async def update_note(
    note_id: str,
    user_id: str,
    update_data: dict
) -> Optional[NoteModel]:
    """Update a note"""
    # Add updated timestamp
    update_data["updated_at"] = datetime.now()
    
    # Update the note
    await db.db.notes.update_one(
        {"_id": ObjectId(note_id), "user_id": user_id},
        {"$set": update_data}
    )
    
    # Return updated note
    updated_note = await db.db.notes.find_one({
        "_id": ObjectId(note_id),
        "user_id": user_id
    })
    
    return updated_note


async def delete_note(note_id: str, user_id: str) -> bool:
    """Delete a note"""
    result = await db.db.notes.delete_one({
        "_id": ObjectId(note_id),
        "user_id": user_id
    })
    
    return result.deleted_count > 0
