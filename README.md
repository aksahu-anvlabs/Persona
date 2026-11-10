# Persona — AI-Powered Personal Diary

**Your thoughts, conversations, and memories, organized intelligently.**

Persona is an AI-powered personal diary that lets you record your daily experiences through voice or text. It converts spoken thoughts into text, stores daily entries, and uses an LLM to understand your experiences, answer questions, and generate summaries.

![Screenshot](assets/Screenshot%202026-11-10%20220659.png)
## ✨ Features

- **Voice-Based Journaling:** Record your thoughts using your microphone.
- **Speech-to-Text:** Convert voice recordings into text using Gnani AI's STT API.
- **AI Conversations:** Interact with your diary using natural language.
- **Daily Memory:** Store diary entries organized by date.
- **Intelligent Summaries:** Generate concise summaries of your daily activities.
- **Context-Aware Responses:** Ask questions about your recorded experiences.
- **Text-to-Speech:** Listen to AI responses using the browser's built-in Speech Synthesis API.

## 🧠 How It Works

Persona combines speech recognition, LLM inference, and structured daily storage to create an interactive journaling experience.

1. Record audio through the browser microphone.
2. Split longer recordings into 30-second audio chunks.
3. Transcribe each chunk using Gnani AI's Speech-to-Text API.
4. Store the transcribed entries in date-specific JSON files.
5. Send diary context and user queries to Gemini Flash-Lite.
6. Generate contextual responses and optional daily summaries.
7. Read responses aloud using browser Text-to-Speech.

## 🏗️ Architecture

```text
                 User
                  |
          Voice / Text Input
                  |
          +-------+-------+
          |               |
       Microphone      Text Input
          |
      Gnani AI STT
          |
     Transcribed Text
          |
          v
       Flask Backend
          |
     Daily JSON Storage
          |
      Gemini Flash-Lite
          |
     AI Response / Summary
          |
          v
       Browser UI
          |
      Text-to-Speech
```

## 🛠️ Tech Stack

| Component | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Python, Flask |
| CORS | Flask-CORS |
| Speech-to-Text | Gnani AI |
| LLM | Google Gemini Flash-Lite |
| Text-to-Speech | Web Speech API |
| Storage | JSON |

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/persona.git
cd persona
```

### 2. Install dependencies

```bash
pip install flask flask-cors google-genai
```

### 3. Configure API keys

Set your environment variables:

```bash
export GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

Configure your Gnani AI API credentials in the frontend/backend integration.

### 4. Run the backend

```bash
python app.py
```

The Flask server will start at:

```text
http://localhost:8080
```

## 🔌 API

### GET `/ask`

Send a query to the AI using your stored diary context.

**Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `query` | String | User's question or instruction |
| `date` | String | Diary date in DD-MM-YYYY format |
| `summary` | Boolean | Whether to generate a summary |

**Example:**

```text
GET /ask?query=What%20did%20I%20do%20today&date=10-11-2026&summary=false
```

**Response:**

```json
{
  "response": "Based on your diary entries..."
}
```

## 🔮 Vision

The goal of Persona is to make personal journaling more natural and accessible by allowing people to document their lives through conversations rather than manually writing everything.

Instead of simply storing diary entries, Persona aims to make personal memories searchable and interactive through AI.

---

**Built with curiosity and a passion for AI.**
