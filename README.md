
# StudySpark - AI-powered Study Assistant

StudySpark is an integrated learning platform that utilizes AI to help students generate notes, clarify doubts, create flashcards, and convert study material into audio podcasts.

## Project Structure

This project consists of two main parts:
- **Frontend**: React application with TypeScript
- **Backend**: Python FastAPI application

## Setup Instructions

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
- On Windows:
  ```bash
  venv\Scripts\activate
  ```
- On macOS/Linux:
  ```bash
  source venv/bin/activate
  ```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

6. Edit the `.env` file and add your API keys and configuration values

7. Start the FastAPI server:
```bash
python run.py
```

## Features

- **Note Taking**: Generate structured notes from PDFs, YouTube videos, or manual input
- **Doubt Clarification**: AI-powered question answering for study topics
- **Flashcards**: Create and review flashcards with spaced repetition
- **Podcast Generation**: Convert study material into audio podcasts for on-the-go learning

## API Endpoints

The backend provides the following API endpoints:

- **Authentication**: `/api/auth/...`
- **Notes**: `/api/notes/...`
- **Doubts**: `/api/doubts/...`
- **Flashcards**: `/api/flashcards/...`
- **Podcasts**: `/api/podcasts/...`

## Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Python, FastAPI, MongoDB
- **AI Services**: OpenAI, Hugging Face, AWS S3
