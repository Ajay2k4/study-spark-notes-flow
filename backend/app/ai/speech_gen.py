
from transformers import SpeechT5Processor, SpeechT5ForTextToSpeech, SpeechT5HifiGan
from datasets import load_dataset
import soundfile as sf
import numpy as np
import tempfile
import os
import torch
from app.config import settings
from app.utils.file_storage import s3_storage
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TextToSpeechBot:
    """
    Text-to-Speech Bot using Hugging Face SpeechT5 model
    Takes text input and generates audio output
    """
    
    def __init__(self, model_name: str = "microsoft/speecht5_tts"):
        """
        Initialize the TTS bot with pretrained models
        
        Args:
            model_name: Hugging Face model identifier
        """
        self.model_name = model_name
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        logger.info(f"Using device: {self.device}")
        
        # Initialize models
        self.processor = None
        self.model = None
        self.vocoder = None
        self.speaker_embeddings = None
        
        self._load_models()
    
    def _load_models(self):
        """Load all required models and embeddings"""
        try:
            logger.info("Loading SpeechT5 models...")
            
            # Load processor and model
            self.processor = SpeechT5Processor.from_pretrained(self.model_name)
            self.model = SpeechT5ForTextToSpeech.from_pretrained(self.model_name)
            
            # Load vocoder for high quality audio
            self.vocoder = SpeechT5HifiGan.from_pretrained("microsoft/speecht5_hifigan")
            
            # Move models to device
            self.model.to(self.device)
            self.vocoder.to(self.device)
            
            # Load speaker embeddings for voice characteristics
            self._load_speaker_embeddings()
            
            logger.info("Models loaded successfully!")
            
        except Exception as e:
            logger.error(f"Error loading models: {str(e)}")
            raise
    
    def _load_speaker_embeddings(self):
        """Load speaker embeddings for voice customization"""
        try:
            # Load CMU ARCTIC dataset for speaker embeddings
            embeddings_dataset = load_dataset(
                "Matthijs/cmu-arctic-xvectors", 
                split="validation"
            )
            
            # Use first speaker embedding as default
            self.speaker_embeddings = torch.tensor(
                embeddings_dataset[7306]["xvector"]
            ).unsqueeze(0).to(self.device)
            
            logger.info("Speaker embeddings loaded successfully!")
            
        except Exception as e:
            logger.warning(f"Could not load speaker embeddings: {str(e)}")
            # Create default embeddings if dataset fails
            self.speaker_embeddings = torch.randn((1, 512)).to(self.device)
    
    def preprocess_text(self, text: str) -> str:
        """
        Preprocess text for better TTS output
        
        Args:
            text: Input text to be processed
            
        Returns:
            Processed text ready for TTS
        """
        # Remove excessive whitespace
        text = " ".join(text.split())
        
        # Add pauses for better readability
        text = text.replace(". ", ". ... ")
        text = text.replace("? ", "? ... ")
        text = text.replace("! ", "! ... ")
        
        # Handle common abbreviations
        replacements = {
            "e.g.": "for example",
            "i.e.": "that is",
            "etc.": "etcetera",
            "vs.": "versus",
            "Dr.": "Doctor",
            "Prof.": "Professor",
            "&": "and"
        }
        
        for abbrev, full_form in replacements.items():
            text = text.replace(abbrev, full_form)
        
        # Limit text length for optimal processing
        if len(text) > 600:
            logger.warning("Text is long, consider splitting into chunks")
        
        return text
    
    def text_to_speech(
        self, 
        text: str, 
        output_path: str = "output.wav",
        sample_rate: int = 16000
    ) -> dict:
        """
        Convert text to speech audio
        
        Args:
            text: Text to convert to speech
            output_path: Path to save audio file
            sample_rate: Audio sample rate
            
        Returns:
            Dictionary containing processing results
        """
        try:
            # Preprocess text
            processed_text = self.preprocess_text(text)
            logger.info(f"Processing text: {processed_text[:100]}...")
            
            # Tokenize text
            inputs = self.processor(
                text=processed_text, 
                return_tensors="pt"
            ).to(self.device)
            
            # Generate speech
            with torch.no_grad():
                speech = self.model.generate_speech(
                    inputs["input_ids"], 
                    self.speaker_embeddings, 
                    vocoder=self.vocoder
                )
            
            # Convert to numpy array
            audio_array = speech.cpu().numpy()
            
            # Save audio file
            sf.write(output_path, audio_array, sample_rate)
            logger.info(f"Audio saved to: {output_path}")
            
            return {
                "success": True,
                "output_file": output_path,
                "sample_rate": sample_rate,
                "duration": len(audio_array) / sample_rate,
                "text_processed": processed_text,
                "audio_array": audio_array
            }
            
        except Exception as e:
            logger.error(f"Error in text_to_speech: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def process_long_text(
        self, 
        text: str, 
        output_dir: str = "audio_output",
        max_chunk_size: int = 500
    ) -> dict:
        """
        Process long text by splitting into chunks
        
        Args:
            text: Long text to convert
            output_dir: Directory to save audio files
            max_chunk_size: Maximum characters per chunk
            
        Returns:
            Processing results with multiple audio files
        """
        try:
            # Create output directory
            os.makedirs(output_dir, exist_ok=True)
            
            # Split text into chunks
            chunks = self._split_text_into_chunks(text, max_chunk_size)
            
            results = []
            all_audio = []
            
            for i, chunk in enumerate(chunks):
                output_path = os.path.join(output_dir, f"part_{i+1}.wav")
                
                result = self.text_to_speech(chunk, output_path)
                result["chunk_index"] = i + 1
                result["chunk_text"] = chunk[:100] + "..." if len(chunk) > 100 else chunk
                
                if result["success"]:
                    all_audio.append(result["audio_array"])
                
                results.append(result)
            
            # Combine all audio into single file
            if all_audio:
                combined_audio = np.concatenate(all_audio)
                combined_path = os.path.join(output_dir, "combined_audio.wav")
                sf.write(combined_path, combined_audio, 16000)
                logger.info(f"Combined audio saved to: {combined_path}")
                
                return {
                    "success": True,
                    "total_chunks": len(chunks),
                    "results": results,
                    "output_directory": output_dir,
                    "combined_file": combined_path,
                    "combined_audio": combined_audio
                }
            
            return {
                "success": False,
                "error": "No audio generated from chunks"
            }
            
        except Exception as e:
            logger.error(f"Error processing long text: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def _split_text_into_chunks(self, text: str, max_chunk_size: int = 500) -> list:
        """Split text into smaller chunks for processing"""
        sentences = text.replace('!', '.').replace('?', '.').split('.')
        chunks = []
        current_chunk = ""
        
        for sentence in sentences:
            sentence = sentence.strip()
            if not sentence:
                continue
                
            if len(current_chunk + sentence) < max_chunk_size:
                current_chunk += sentence + ". "
            else:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                current_chunk = sentence + ". "
        
        if current_chunk:
            chunks.append(current_chunk.strip())
        
        return chunks


# Global instance for easy access
tts_bot = None

def get_tts_bot():
    """Get or initialize the TTS bot singleton"""
    global tts_bot
    if tts_bot is None:
        try:
            tts_bot = TextToSpeechBot()
        except Exception as e:
            logger.error(f"Failed to initialize TTS bot: {e}")
            raise e
    return tts_bot


async def generate_speech(text: str, voice_id: str = "default") -> tuple:
    """Generate speech using Hugging Face SpeechT5 model"""
    try:
        # Create a temporary file to save the audio
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
            temp_path = temp_file.name
            
        # Get TTS bot instance
        bot = get_tts_bot()
        
        # Process text based on length
        if len(text) > 500:
            # For longer text, use the process_long_text method
            temp_dir = tempfile.mkdtemp()
            result = bot.process_long_text(text, temp_dir, max_chunk_size=500)
            
            if result["success"] and "combined_file" in result:
                temp_path = result["combined_file"]
                duration = len(result["combined_audio"]) / 16000
            else:
                raise Exception("Failed to process long text")
        else:
            # For shorter text, use the direct text_to_speech method
            result = bot.text_to_speech(text, temp_path)
            
            if not result["success"]:
                raise Exception(result.get("error", "Unknown error in speech generation"))
                
            duration = result["duration"]
        
        # Upload to S3
        with open(temp_path, "rb") as audio_file:
            upload_file = audio_file.read()
            s3_url = await s3_storage.upload_file(
                upload_file,
                folder="podcasts",
                content_type="audio/wav"
            )
        
        # Remove the temporary file(s)
        if os.path.exists(temp_path):
            os.unlink(temp_path)
        
        # Also clean up the temp directory if it was created
        if "temp_dir" in locals() and os.path.exists(temp_dir):
            import shutil
            shutil.rmtree(temp_dir, ignore_errors=True)
        
        return s3_url, duration
    
    except Exception as e:
        logger.error(f"Error in speech generation: {str(e)}")
        raise e


async def get_available_voices():
    """Get a list of available voices for TTS"""
    # For now, we'll use a fixed set of voice options that represent different embeddings
    voices = [
        {"id": "default", "name": "Default", "gender": "neutral", "preview_url": None},
        {"id": "male1", "name": "Male Voice 1", "gender": "male", "preview_url": None},
        {"id": "female1", "name": "Female Voice 1", "gender": "female", "preview_url": None},
        {"id": "neutral1", "name": "Neutral Voice", "gender": "neutral", "preview_url": None}
    ]
    
    return voices
