
from transformers import pipeline
import soundfile as sf
import numpy as np
import tempfile
import os
from app.config import settings
from app.utils.file_storage import s3_storage
import httpx


async def generate_speech_huggingface(text: str, voice_id: str = "default") -> tuple:
    """Generate speech using Hugging Face models"""
    try:
        # Initialize the TTS pipeline
        synthesizer = pipeline("text-to-speech", "microsoft/speecht5_tts")
        
        # Convert text to speech
        speech = synthesizer(text, forward_params={"vocoder_kwargs": {"fine_tuning": True}})
        
        # Get the speech array and sample rate
        speech_array = speech["audio"]
        sample_rate = speech["sampling_rate"]
        
        # Create a temporary file to save the audio
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
            temp_path = temp_file.name
            sf.write(temp_path, speech_array, sample_rate)
        
        # Upload to S3
        with open(temp_path, "rb") as audio_file:
            upload_file = audio_file.read()
            s3_url = await s3_storage.upload_file(
                upload_file,
                folder="podcasts",
                content_type="audio/wav"
            )
        
        # Remove the temporary file
        os.unlink(temp_path)
        
        # Calculate duration in seconds
        duration = len(speech_array) / sample_rate
        
        return s3_url, duration
    
    except Exception as e:
        print(f"Error in speech generation: {str(e)}")
        raise e


async def generate_speech_openai(text: str, voice_id: str = "alloy") -> tuple:
    """Generate speech using OpenAI TTS API"""
    try:
        # Call OpenAI API for TTS
        response = await openai.audio.speech.create(
            model="tts-1",
            voice=voice_id,  # 'alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'
            input=text
        )
        
        # Save the audio to a temporary file
        with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as temp_file:
            temp_path = temp_file.name
            response.stream_to_file(temp_path)
        
        # Upload to S3
        with open(temp_path, "rb") as audio_file:
            file_content = audio_file.read()
            
            # Get file size for duration estimation (rough estimate)
            file_size = len(file_content)
            
            # Create a file-like object for S3 upload
            from fastapi import UploadFile
            import io
            upload_file = UploadFile(
                filename=f"audio_{voice_id}.mp3",
                file=io.BytesIO(file_content),
                content_type="audio/mpeg"
            )
            
            # Upload to S3
            s3_url = await s3_storage.upload_file(upload_file, folder="podcasts")
        
        # Remove the temporary file
        os.unlink(temp_path)
        
        # Estimate duration (rough estimation based on file size and bit rate)
        # Assuming a 128 kbps bitrate for MP3
        estimated_duration = file_size * 8 / (128 * 1000)
        
        return s3_url, estimated_duration
    
    except Exception as e:
        print(f"Error in speech generation with OpenAI: {str(e)}")
        raise e


async def get_available_voices():
    """Get a list of available voices for TTS"""
    # For OpenAI TTS
    openai_voices = [
        {"id": "alloy", "name": "Alloy", "gender": "neutral", "preview_url": None},
        {"id": "echo", "name": "Echo", "gender": "male", "preview_url": None},
        {"id": "fable", "name": "Fable", "gender": "female", "preview_url": None},
        {"id": "onyx", "name": "Onyx", "gender": "male", "preview_url": None},
        {"id": "nova", "name": "Nova", "gender": "female", "preview_url": None},
        {"id": "shimmer", "name": "Shimmer", "gender": "female", "preview_url": None}
    ]
    
    return openai_voices
