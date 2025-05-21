
import PyPDF2
import io
from pytube import YouTube
from youtube_transcript_api import YouTubeTranscriptApi
import re
from typing import Optional, Tuple
import httpx


async def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract text content from a PDF file"""
    try:
        # Create a PDF file reader object
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_bytes))
        
        # Get number of pages
        num_pages = len(pdf_reader.pages)
        
        # Extract text from each page
        text = ""
        for page_num in range(num_pages):
            page = pdf_reader.pages[page_num]
            text += page.extract_text() + "\n\n"
        
        return text
    
    except Exception as e:
        print(f"Error extracting text from PDF: {str(e)}")
        raise e


async def extract_youtube_transcript(youtube_url: str) -> Tuple[str, Optional[str]]:
    """Extract transcript and metadata from a YouTube video"""
    try:
        # Extract video ID from URL
        video_id = None
        if "youtube.com/watch" in youtube_url:
            video_id = re.search(r"v=([^&]+)", youtube_url).group(1)
        elif "youtu.be" in youtube_url:
            video_id = youtube_url.split("/")[-1].split("?")[0]
        
        if not video_id:
            raise ValueError("Could not extract YouTube video ID")
        
        # Get video metadata
        yt = YouTube(youtube_url)
        title = yt.title
        
        # Get transcript
        transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
        transcript_text = " ".join([item["text"] for item in transcript_list])
        
        # Additional metadata can be added here as needed
        
        return transcript_text, title
    
    except Exception as e:
        print(f"Error extracting YouTube transcript: {str(e)}")
        raise e


async def extract_url_content(url: str) -> str:
    """Extract content from a web page"""
    try:
        # Make HTTP request to the URL
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            response.raise_for_status()
            
            # Simple HTML to text conversion
            # In a real-world scenario, you'd want to use a more sophisticated HTML parser
            text = response.text
            
            # Remove HTML tags
            text = re.sub(r"<.*?>", " ", text)
            
            # Remove extra whitespace
            text = re.sub(r"\s+", " ", text).strip()
            
            return text
    
    except Exception as e:
        print(f"Error extracting content from URL: {str(e)}")
        raise e
