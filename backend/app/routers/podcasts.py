
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from app.models.podcasts import PodcastModel, PodcastCreate, PodcastOut, PodcastVoice
from app.models.user import UserModel
from app.utils.security import get_current_user
from app.database import db
from app.ai.speech_gen import generate_speech_openai, get_available_voices
from bson import ObjectId
from datetime import datetime

router = APIRouter()


@router.post("/generate", response_model=PodcastOut, status_code=status.HTTP_201_CREATED)
async def generate_podcast(
    data: PodcastCreate,
    current_user: UserModel = Depends(get_current_user)
):
    """Generate a podcast from text content"""
    try:
        # Generate speech using OpenAI or other service
        audio_url, duration = await generate_speech_openai(data.content, data.voice_id)
        
        # Create podcast record
        new_podcast = PodcastModel(
            user_id=str(current_user["_id"]),
            title=data.title,
            content=data.content,
            audio_url=audio_url,
            duration=duration,
            voice_id=data.voice_id,
            tags=data.tags
        )
        
        result = await db.db.podcasts.insert_one(new_podcast.dict(by_alias=True))
        created_podcast = await db.db.podcasts.find_one({"_id": result.inserted_id})
        
        return created_podcast
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating podcast: {str(e)}"
        )


@router.get("/", response_model=List[PodcastOut])
async def get_podcasts(
    limit: int = 10,
    skip: int = 0,
    current_user: UserModel = Depends(get_current_user)
):
    """Get all podcasts for current user"""
    podcasts = []
    cursor = db.db.podcasts.find(
        {"user_id": str(current_user["_id"])}
    ).skip(skip).limit(limit).sort("created_at", -1)
    
    async for podcast in cursor:
        podcasts.append(podcast)
    
    return podcasts


@router.get("/{podcast_id}", response_model=PodcastOut)
async def get_podcast(
    podcast_id: str,
    current_user: UserModel = Depends(get_current_user)
):
    """Get a specific podcast"""
    podcast = await db.db.podcasts.find_one({
        "_id": ObjectId(podcast_id),
        "user_id": str(current_user["_id"])
    })
    
    if not podcast:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Podcast not found"
        )
    
    return podcast


@router.get("/{podcast_id}/download")
async def download_podcast(
    podcast_id: str,
    current_user: UserModel = Depends(get_current_user)
):
    """Get a download URL for a podcast"""
    podcast = await db.db.podcasts.find_one({
        "_id": ObjectId(podcast_id),
        "user_id": str(current_user["_id"])
    })
    
    if not podcast:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Podcast not found"
        )
    
    # Return the audio URL directly as we're using S3 presigned URLs
    return {"download_url": podcast["audio_url"]}


@router.delete("/{podcast_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_podcast(
    podcast_id: str,
    current_user: UserModel = Depends(get_current_user)
):
    """Delete a podcast"""
    # First get the podcast to check if it exists and to get the audio_url
    podcast = await db.db.podcasts.find_one({
        "_id": ObjectId(podcast_id),
        "user_id": str(current_user["_id"])
    })
    
    if not podcast:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Podcast not found"
        )
    
    # TODO: Delete the audio file from storage if needed
    
    # Delete the podcast record
    result = await db.db.podcasts.delete_one({
        "_id": ObjectId(podcast_id)
    })
    
    return None


@router.get("/voices/available", response_model=List[PodcastVoice])
async def get_voice_options():
    """Get available voice options for podcast generation"""
    voices = await get_available_voices()
    return voices
