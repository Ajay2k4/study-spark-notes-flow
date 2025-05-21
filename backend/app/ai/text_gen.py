
import openai
from app.config import settings

openai.api_key = settings.OPENAI_API_KEY

async def generate_notes(text, instruction="Summarize this content and create organized notes"):
    """Generate study notes from text content using OpenAI"""
    try:
        prompt = f"""
        {instruction}
        
        Content to process:
        {text}
        
        Format the notes in a clear structure with:
        - Main topics as headings
        - Key points as bullet points
        - Important definitions highlighted
        - Examples where relevant
        """
        
        response = await openai.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an educational assistant that creates well-organized study notes."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=2000,
            temperature=0.5
        )
        
        return response.choices[0].message.content
    
    except Exception as e:
        print(f"Error in text generation: {str(e)}")
        raise e


async def generate_flashcards(content, count=5):
    """Generate flashcards from content"""
    try:
        prompt = f"""
        Create {count} flashcards based on the following content.
        For each flashcard, provide:
        1. A clear and concise question
        2. A comprehensive but brief answer
        
        Content:
        {content}
        
        Format should be JSON array:
        [
            {{
                "question": "Question text here?",
                "answer": "Answer text here."
            }},
            ...
        ]
        
        Focus on key concepts, definitions, and important facts.
        """
        
        response = await openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an educational assistant that creates effective study flashcards."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1500,
            temperature=0.7,
            response_format={ "type": "json_object" }
        )
        
        return response.choices[0].message.content
    
    except Exception as e:
        print(f"Error in flashcard generation: {str(e)}")
        raise e


async def answer_question(question, context=""):
    """Answer a question based on provided context"""
    try:
        if context:
            prompt = f"""
            Question: {question}
            
            Use the following context to answer the question:
            {context}
            
            If you cannot answer the question based on the provided context, say so and provide general information if possible.
            """
        else:
            prompt = f"Question: {question}"
        
        response = await openai.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a helpful educational assistant that answers questions clearly and accurately."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1000,
            temperature=0.4
        )
        
        return response.choices[0].message.content
    
    except Exception as e:
        print(f"Error in question answering: {str(e)}")
        raise e
