
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from typing import List, Optional
from app.models.doubts import ConversationModel, MessageModel, ConversationOut, MessageCreate, ConversationCreate, ContextUpload
from app.models.user import UserModel
from app.utils.security import get_current_user
from app.database import db
from app.ai.text_gen import answer_question
from bson import ObjectId
from datetime import datetime

router = APIRouter()


@router.post("/ask", status_code=status.HTTP_200_OK)
async def ask_question(
    message_data: MessageCreate,
    current_user: UserModel = Depends(get_current_user)
):
    """Ask a question or continue a conversation"""
    try:
        # Get context data if context IDs are provided
        context = ""
        for context_id in message_data.context_ids:
            context_note = await db.db.notes.find_one({"_id": ObjectId(context_id)})
            if context_note:
                context += context_note["content"] + "\n\n"
        
        # Generate answer using AI
        answer = await answer_question(message_data.content, context)
        
        # Create or update conversation
        if message_data.conversation_id:
            # Continue existing conversation
            conversation_id = ObjectId(message_data.conversation_id)
            
            # Get existing conversation
            conversation = await db.db.conversations.find_one({
                "_id": conversation_id,
                "user_id": str(current_user["_id"])
            })
            
            if not conversation:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Conversation not found"
                )
            
            # Add new messages
            user_message = MessageModel(content=message_data.content, role="user")
            assistant_message = MessageModel(content=answer, role="assistant")
            
            await db.db.conversations.update_one(
                {"_id": conversation_id},
                {
                    "$push": {
                        "messages": {
                            "$each": [
                                user_message.dict(),
                                assistant_message.dict()
                            ]
                        }
                    },
                    "$set": {"updated_at": datetime.now()}
                }
            )
            
            updated_conversation = await db.db.conversations.find_one({"_id": conversation_id})
            return {
                "conversation": ConversationOut(**updated_conversation),
                "message": assistant_message
            }
            
        else:
            # Create new conversation
            title = message_data.content[:50] + "..." if len(message_data.content) > 50 else message_data.content
            
            # Create messages
            user_message = MessageModel(content=message_data.content, role="user")
            assistant_message = MessageModel(content=answer, role="assistant")
            
            new_conversation = ConversationModel(
                user_id=str(current_user["_id"]),
                title=title,
                messages=[user_message, assistant_message],
                context_ids=message_data.context_ids
            )
            
            result = await db.db.conversations.insert_one(new_conversation.dict(by_alias=True))
            created_conversation = await db.db.conversations.find_one({"_id": result.inserted_id})
            
            return {
                "conversation": ConversationOut(**created_conversation),
                "message": assistant_message
            }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing question: {str(e)}"
        )


@router.get("/conversations", response_model=List[ConversationOut])
async def get_conversations(
    limit: int = 10,
    skip: int = 0,
    current_user: UserModel = Depends(get_current_user)
):
    """Get all conversations for current user"""
    conversations = []
    cursor = db.db.conversations.find(
        {"user_id": str(current_user["_id"])}
    ).skip(skip).limit(limit).sort("updated_at", -1)
    
    async for conversation in cursor:
        conversations.append(conversation)
    
    return conversations


@router.get("/conversations/{conversation_id}", response_model=ConversationOut)
async def get_conversation(
    conversation_id: str,
    current_user: UserModel = Depends(get_current_user)
):
    """Get a specific conversation"""
    conversation = await db.db.conversations.find_one({
        "_id": ObjectId(conversation_id),
        "user_id": str(current_user["_id"])
    })
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    return conversation


@router.delete("/conversations/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(
    conversation_id: str,
    current_user: UserModel = Depends(get_current_user)
):
    """Delete a conversation"""
    result = await db.db.conversations.delete_one({
        "_id": ObjectId(conversation_id),
        "user_id": str(current_user["_id"])
    })
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    return None
