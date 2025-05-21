
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
import json
from app.models.flashcards import FlashcardModel, FlashcardCreate, FlashcardUpdate, FlashcardOut, FlashcardGenerate
from app.models.user import UserModel
from app.utils.security import get_current_user
from app.database import db
from app.ai.text_gen import generate_flashcards
from app.ai.image_gen import generate_image_for_concept
from bson import ObjectId
from datetime import datetime

router = APIRouter()


@router.post("/", response_model=FlashcardOut, status_code=status.HTTP_201_CREATED)
async def create_flashcard(
    flashcard: FlashcardCreate,
    current_user: UserModel = Depends(get_current_user)
):
    """Create a new flashcard manually"""
    new_flashcard = FlashcardModel(
        user_id=str(current_user["_id"]),
        question=flashcard.question,
        answer=flashcard.answer,
        image_url=flashcard.image_url,
        deck_name=flashcard.deck_name,
        tags=flashcard.tags
    )
    
    result = await db.db.flashcards.insert_one(new_flashcard.dict(by_alias=True))
    created_flashcard = await db.db.flashcards.find_one({"_id": result.inserted_id})
    
    return created_flashcard


@router.post("/generate", response_model=List[FlashcardOut], status_code=status.HTTP_201_CREATED)
async def generate_flashcards_from_text(
    data: FlashcardGenerate,
    current_user: UserModel = Depends(get_current_user)
):
    """Generate flashcards from text content"""
    try:
        # Generate flashcards using AI
        flashcards_json = await generate_flashcards(data.content, data.count)
        flashcards_data = json.loads(flashcards_json)
        
        # Ensure we have a list of flashcards from the JSON (handle different formats)
        if isinstance(flashcards_data, dict) and "flashcards" in flashcards_data:
            flashcards_list = flashcards_data["flashcards"]
        elif isinstance(flashcards_data, list):
            flashcards_list = flashcards_data
        else:
            raise ValueError("Unexpected format from AI flashcard generation")
        
        created_flashcards = []
        
        # Create each flashcard
        for card_data in flashcards_list:
            # Generate image if requested
            image_url = None
            if data.generate_images:
                # Use the question for better image context
                image_url = await generate_image_for_concept(card_data["question"])
            
            # Create flashcard model
            new_flashcard = FlashcardModel(
                user_id=str(current_user["_id"]),
                question=card_data["question"],
                answer=card_data["answer"],
                image_url=image_url,
                deck_name=data.deck_name,
                tags=data.tags
            )
            
            result = await db.db.flashcards.insert_one(new_flashcard.dict(by_alias=True))
            created_flashcard = await db.db.flashcards.find_one({"_id": result.inserted_id})
            created_flashcards.append(created_flashcard)
        
        return created_flashcards
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating flashcards: {str(e)}"
        )


@router.get("/", response_model=List[FlashcardOut])
async def get_flashcards(
    deck: Optional[str] = None,
    limit: int = 100,
    skip: int = 0,
    current_user: UserModel = Depends(get_current_user)
):
    """Get all flashcards for current user, optionally filtered by deck"""
    query = {"user_id": str(current_user["_id"])}
    
    # Add deck filter if provided
    if deck:
        query["deck_name"] = deck
    
    flashcards = []
    cursor = db.db.flashcards.find(query).skip(skip).limit(limit)
    
    async for flashcard in cursor:
        flashcards.append(flashcard)
    
    return flashcards


@router.get("/decks", response_model=List[str])
async def get_decks(
    current_user: UserModel = Depends(get_current_user)
):
    """Get all unique deck names for current user"""
    decks = await db.db.flashcards.distinct("deck_name", {"user_id": str(current_user["_id"])})
    return decks


@router.get("/{flashcard_id}", response_model=FlashcardOut)
async def get_flashcard(
    flashcard_id: str,
    current_user: UserModel = Depends(get_current_user)
):
    """Get a specific flashcard"""
    flashcard = await db.db.flashcards.find_one({
        "_id": ObjectId(flashcard_id),
        "user_id": str(current_user["_id"])
    })
    
    if not flashcard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flashcard not found"
        )
    
    return flashcard


@router.put("/{flashcard_id}", response_model=FlashcardOut)
async def update_flashcard(
    flashcard_id: str,
    flashcard_update: FlashcardUpdate,
    current_user: UserModel = Depends(get_current_user)
):
    """Update a flashcard"""
    # Get existing flashcard
    existing_flashcard = await db.db.flashcards.find_one({
        "_id": ObjectId(flashcard_id),
        "user_id": str(current_user["_id"])
    })
    
    if not existing_flashcard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flashcard not found"
        )
    
    # Update fields
    update_data = flashcard_update.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.now()
    
    # Perform update
    await db.db.flashcards.update_one(
        {"_id": ObjectId(flashcard_id)},
        {"$set": update_data}
    )
    
    # Get updated flashcard
    updated_flashcard = await db.db.flashcards.find_one({"_id": ObjectId(flashcard_id)})
    return updated_flashcard


@router.post("/{flashcard_id}/review")
async def review_flashcard(
    flashcard_id: str,
    difficulty: int,
    current_user: UserModel = Depends(get_current_user)
):
    """Update flashcard review status"""
    # Get existing flashcard
    existing_flashcard = await db.db.flashcards.find_one({
        "_id": ObjectId(flashcard_id),
        "user_id": str(current_user["_id"])
    })
    
    if not existing_flashcard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flashcard not found"
        )
    
    # Update review status
    await db.db.flashcards.update_one(
        {"_id": ObjectId(flashcard_id)},
        {
            "$set": {
                "last_reviewed": datetime.now(),
                "difficulty": difficulty
            },
            "$inc": {"review_count": 1}
        }
    )
    
    return {"status": "success"}


@router.delete("/{flashcard_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_flashcard(
    flashcard_id: str,
    current_user: UserModel = Depends(get_current_user)
):
    """Delete a flashcard"""
    result = await db.db.flashcards.delete_one({
        "_id": ObjectId(flashcard_id),
        "user_id": str(current_user["_id"])
    })
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flashcard not found"
        )
    
    return None
