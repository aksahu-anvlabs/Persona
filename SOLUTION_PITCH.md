# Persona — An AI-Powered Personal Diary

**Solution Pitch**

Persona is an AI-powered personal diary that allows people to record their thoughts, experiences, and daily activities naturally through voice or text. Instead of manually writing diary entries, users can simply speak, and Persona converts their speech into text and organizes their personal reflections by date.

### The Problem

Traditional diary applications require users to manually write and organize their experiences. This creates friction, making it difficult for people to maintain a consistent journaling habit. Furthermore, conventional diaries store information but cannot meaningfully interact with users or help them reflect on their past experiences.

### Our Solution

Persona transforms personal journaling into an interactive AI-powered experience.

- **Voice Journaling:** Users can speak naturally instead of typing. Speech is converted into text using Gnani AI's speech-to-text technology.
- **Personal AI Assistant:** Users can ask questions about their experiences and interact with an AI that uses their stored diary entries as context.
- **Daily Memory:** Entries are organized and stored by date, allowing users to revisit their experiences.
- **AI Summarization:** Persona can generate concise summaries of daily experiences.
- **Voice Responses:** The assistant can respond using browser-based text-to-speech.

### How It Works

1. The user records their thoughts through the browser microphone or enters text.
2. Gnani AI converts recorded speech into text.
3. The Flask backend processes the entry and stores it in date-based JSON files.
4. Google's Gemini model uses the relevant diary context to generate responses and summaries.
5. The response is displayed and can be played aloud using browser text-to-speech.

### Technology Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Python, Flask, Flask-CORS
- **Speech Recognition:** Gnani AI
- **AI Reasoning:** Google Gemini
- **Storage:** Date-based JSON files
- **Voice Output:** Web Speech API

### Vision

Our vision is to make personal journaling effortless and interactive by combining voice technology, AI, and personal memory. Persona aims to become more than a place to store diary entries — it aims to become a personal reflection companion that helps users revisit, understand, and learn from their own experiences.
