
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.database import Database
from app.config import settings


class MongoDB:
    client: AsyncIOMotorClient = None
    db: Database = None


db = MongoDB()


async def connect_to_mongo():
    db.client = AsyncIOMotorClient(settings.MONGODB_URL)
    db.db = db.client[settings.MONGODB_DB_NAME]
    print(f"Connected to MongoDB at {settings.MONGODB_URL}")


async def close_mongo_connection():
    if db.client:
        db.client.close()
        print("MongoDB connection closed")
