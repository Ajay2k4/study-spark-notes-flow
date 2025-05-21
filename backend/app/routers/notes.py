
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from typing import List, Optional
from app.models.notes import NoteModel, NoteCreate, NoteUpdate, NoteOut, NoteFromPDF, NoteFromYoutube
from app.models.user import UserModel
from app.utils.security import get_current_user
from app.database import db
from app.ai.extractors import extract_text_from_pdf, extract_youtube_transcript
from app.ai.text_gen import generate_notes
from bson import ObjectId
from datetime import datetime

router = APIRouter()


@router.post("/", response_model=NoteOut, status_code=status.HTTP_201_CREATED)
async def create_note(
    note: NoteCreate,
    current_user: UserModel = Depends(get_current_user)
):
    """Create a new note manually"""
    new_note = NoteModel(
        user_id=str(current_user["_id"]),
        title=note.title,
        content=note.content,
        source_type=note.source_type,
        source_url=note.source_url,
        tags=note.tags
    )
    
    result = await db.db.notes.insert_one(new_note.dict(by_alias=True))
    created_note = await db.db.notes.find_one({"_id": result.inserted_id})
    
    return created_note


@router.post("/from-pdf", response_model=NoteOut, status_code=status.HTTP_201_CREATED)
async def create_note_from_pdf(
    file: UploadFile = File(...),
    title: str = Form(None),
    tags: str = Form(""),
    current_user: UserModel = Depends(get_current_user)
):
    """Create notes from a PDF file"""
    # Read file content
    pdf_content = await file.read()
    
    # Extract text from PDF
    try:
        extracted_text = await extract_text_from_pdf(pdf_content)
        
        # Generate notes using AI
        notes_content = await generate_notes(extracted_text)
        
        # Create a default title if not provided
        if not title:
            title = f"Notes from {file.filename}"
        
        # Parse tags
        tag_list = tags.split(",") if tags else []
        tag_list = [tag.strip() for tag in tag_list if tag.strip()]
        
        # Create new note
        new_note = NoteModel(
            user_id=str(current_user["_id"]),
            title=title,
            content=notes_content,
            source_type="pdf",
            source_url=file.filename,
            tags=tag_list
        )
        
        result = await db.db.notes.insert_one(new_note.dict(by_alias=True))
        created_note = await db.db.notes.find_one({"_id": result.inserted_id})
        
        return created_note
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing PDF: {str(e)}"
        )


@router.post("/from-youtube", response_model=NoteOut, status_code=status.HTTP_201_CREATED)
async def create_note_from_youtube(
    data: NoteFromYoutube,
    current_user: UserModel = Depends(get_current_user)
):
    """Create notes from a YouTube video"""
    try:
        # Extract transcript and metadata from YouTube
        transcript, video_title = await extract_youtube_transcript(data.youtube_url)
        
        # Generate notes using AI
        notes_content = await generate_notes(transcript)
        
        # Use video title if no title provided
        title = data.title if data.title else f"Notes from {video_title}"
        
        # Create new note
        new_note = NoteModel(
            user_id=str(current_user["_id"]),
            title=title,
            content=notes_content,
            source_type="youtube",
            source_url=data.youtube_url,
            tags=data.tags
        )
        
        result = await db.db.notes.insert_one(new_note.dict(by_alias=True))
        created_note = await db.db.notes.find_one({"_id": result.inserted_id})
        
        return created_note
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing YouTube video: {str(e)}"
        )


@router.get("/", response_model=List[NoteOut])
async def get_notes(
    limit: int = 10,
    skip: int = 0,
    current_user: UserModel = Depends(get_current_user)
):
    """Get all notes for current user"""
    notes = []
    cursor = db.db.notes.find(
        {"user_id": str(current_user["_id"])}
    ).skip(skip).limit(limit).sort("created_at", -1)
    
    async for note in cursor:
        notes.append(note)
    
    return notes


@router.get("/{note_id}", response_model=NoteOut)
async def get_note(
    note_id: str,
    current_user: UserModel = Depends(get_current_user)
):
    """Get a specific note"""
    note = await db.db.notes.find_one({
        "_id": ObjectId(note_id),
        "user_id": str(current_user["_id"])
    })
    
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    return note


@router.put("/{note_id}", response_model=NoteOut)
async def update_note(
    note_id: str,
    note_update: NoteUpdate,
    current_user: UserModel = Depends(get_current_user)
):
    """Update a note"""
    # Get existing note
    existing_note = await db.db.notes.find_one({
        "_id": ObjectId(note_id),
        "user_id": str(current_user["_id"])
    })
    
    if not existing_note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    # Update fields
    update_data = note_update.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.now()
    
    # Perform update
    await db.db.notes.update_one(
        {"_id": ObjectId(note_id)},
        {"$set": update_data}
    )
    
    # Get updated note
    updated_note = await db.db.notes.find_one({"_id": ObjectId(note_id)})
    return updated_note


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(
    note_id: str,
    current_user: UserModel = Depends(get_current_user)
):
    """Delete a note"""
    result = await db.db.notes.delete_one({
        "_id": ObjectId(note_id),
        "user_id": str(current_user["_id"])
    })
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    return None
