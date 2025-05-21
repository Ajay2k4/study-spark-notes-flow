
# StudySpark Backend API

This is the Python FastAPI backend for the StudySpark application.

## Features

- User authentication with JWT
- Notes management with AI-powered generation from PDFs and YouTube
- Flashcard creation and management with image generation
- Doubt clarification using AI
- Podcast generation from study materials

## Setup and Installation

### Prerequisites

- Python 3.8 or higher
- MongoDB 4.4 or higher
- AWS S3 bucket (for file storage)
- OpenAI API key
- HuggingFace API key (optional)

### Installation

1. Clone the repository
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy `.env.example` to `.env` and fill in your configuration values:
   ```bash
   cp .env.example .env
   nano .env  # or use any text editor
   ```

### Running the application

```bash
uvicorn app.main:app --reload
```

The API will be available at http://localhost:8000

## API Documentation

When the server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Docker Deployment

Build and run with Docker:

```bash
docker build -t studyspark-backend .
docker run -p 8000:8000 --env-file .env studyspark-backend
```

## Connecting with Frontend

To connect this backend with the React frontend:

1. Update the API base URL in the frontend environment to point to this backend server
2. Modify the frontend authentication context to use the JWT authentication endpoints
3. Update API calls in the frontend to use the correct endpoint paths
