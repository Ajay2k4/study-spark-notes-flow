
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from app.models.podcasts import PodcastModel, PodcastCreate, PodcastOut, PodcastVoice
from app.models.user import UserModel
from app.utils.security import get_current_user
from app.services.podcasts import create_podcast_from_text, get_user_podcasts, get_podcast_by_id, delete_podcast
from app.ai.speech_gen import get_available_voices
from bson import ObjectId

router = APIRouter()

@router.post("/", response_model=PodcastOut, status_code=status.HTTP_201_CREATED)
async def create_podcast(
    podcast: PodcastCreate,
    current_user: UserModel = Depends(get_current_user)
):
    """Create a new podcast from text"""
    try:
        new_podcast = await create_podcast_from_text(
            user_id=str(current_user["_id"]),
            title=podcast.title,
            content=podcast.content,
            voice_id=podcast.voice_id,
            tags=podcast.tags
        )
        
        return new_podcast
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating podcast: {str(e)}"
        )

@router.get("/", response_model=List[PodcastOut])
async def get_podcasts(
    skip: int = 0,
    limit: int = 10,
    current_user: UserModel = Depends(get_current_user)
):
    """Get all podcasts for current user"""
    podcasts = await get_user_podcasts(
        user_id=str(current_user["_id"]),
        skip=skip,
        limit=limit
    )
    
    return podcasts

@router.get("/voices", response_model=List[PodcastVoice])
async def get_voices():
    """Get available TTS voices"""
    voices = await get_available_voices()
    return voices

@router.get("/{podcast_id}", response_model=PodcastOut)
async def get_podcast(
    podcast_id: str,
    current_user: UserModel = Depends(get_current_user)
):
    """Get a specific podcast"""
    podcast = await get_podcast_by_id(podcast_id, str(current_user["_id"]))
    
    if not podcast:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Podcast not found"
        )
    
    return podcast

@router.delete("/{podcast_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_podcast_by_id(
    podcast_id: str,
    current_user: UserModel = Depends(get_current_user)
):
    """Delete a podcast"""
    success = await delete_podcast(podcast_id, str(current_user["_id"]))
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Podcast not found"
        )
    
    return None
