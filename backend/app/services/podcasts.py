
from app.database import db
from app.models.podcasts import PodcastModel
from app.ai.speech_gen import generate_speech
from bson import ObjectId
from datetime import datetime
from typing import List, Optional


async def create_podcast_from_text(
    user_id: str,
    title: str,
    content: str,
    voice_id: str = "default",
    tags: List[str] = []
) -> PodcastModel:
    """Create a new podcast from text content"""
    try:
        # Generate audio from text
        audio_url, duration = await generate_speech(content, voice_id)
        
        # Create podcast entry
        new_podcast = PodcastModel(
            user_id=user_id,
            title=title,
            content=content,
            audio_url=audio_url,
            duration=duration,
            voice_id=voice_id,
            tags=tags
        )
        
        result = await db.db.podcasts.insert_one(new_podcast.dict(by_alias=True))
        created_podcast = await db.db.podcasts.find_one({"_id": result.inserted_id})
        
        return created_podcast
    except Exception as e:
        print(f"Error creating podcast: {e}")
        raise e


async def get_user_podcasts(
    user_id: str,
    skip: int = 0,
    limit: int = 10
) -> List[PodcastModel]:
    """Get all podcasts for a user"""
    podcasts = []
    cursor = db.db.podcasts.find(
        {"user_id": user_id}
    ).skip(skip).limit(limit).sort("created_at", -1)
    
    async for podcast in cursor:
        podcasts.append(podcast)
    
    return podcasts


async def get_podcast_by_id(podcast_id: str, user_id: str) -> Optional[PodcastModel]:
    """Get a specific podcast"""
    podcast = await db.db.podcasts.find_one({
        "_id": ObjectId(podcast_id),
        "user_id": user_id
    })
    
    return podcast


async def delete_podcast(podcast_id: str, user_id: str) -> bool:
    """Delete a podcast"""
    result = await db.db.podcasts.delete_one({
        "_id": ObjectId(podcast_id),
        "user_id": user_id
    })
    
    return result.deleted_count > 0
