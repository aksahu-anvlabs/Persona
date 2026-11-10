from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
from google import genai
import json, os

app = Flask(__name__)
CORS(app)

client = genai.Client( api_key=os.environ["GEMINI_API_KEY"])
MODEL = "gemini-3.5-flash-lite"

@app.route("/ask", methods=["GET"])
def ask():
    query = request.args.get("query")
    today = request.args.get("date") or datetime.now().strftime("%d-%m-%Y")
    summary = request.args.get("summary", "false").lower() == "true"

    if not query:
        return jsonify({"error": "Missing query parameter"}), 400

    try:
        today = datetime.strptime(today, "%d-%m-%Y").strftime("%d-%m-%Y")

        os.makedirs("data", exist_ok=True)
        file_path = f"data/{today}.txt"

        data = []
        if os.path.exists(file_path):
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)

        diary_context = "\n".join(data)
        
        # Add a strict language constraint to the main prompt
        gemini_request = f"""
        You are a helpful personal AI diary assistant. 
        CRITICAL RULE: You MUST respond in the EXACT same language that the user used in their request. 
        If the user asks in Hindi, answer entirely in Hindi. If English, answer in English.

        Today's diary entries:
        {diary_context}

        User's request:
        {query}

        Respond naturally and accurately using the diary context.
        """
        
        # Generate response
        result = client.models.generate_content(model=MODEL, contents=gemini_request)
        response = result.text or ""
        
        # Append only the user's query and the AI's response to the diary context
        # (It's generally better practice to save the user query as well, so context makes sense)
        data.append(f"User: {query}")
        data.append(f"AI: {response}")
        
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        ret = { "response": response }
        
        if summary:
            # Add a strict language constraint to the summary prompt as well
            summary_request = f"""
            Summarize the following diary entries for today.
            Keep the summary concise and preserve important events,
            activities, emotions and decisions.
            
            CRITICAL RULE: You MUST write the summary in the EXACT same language as the original diary entries.
            If the entries are in Hindi, the summary must be in Hindi. If English, use English.

            {diary_context}
            """

            summary_result = client.models.generate_content(
                model=MODEL,
                contents=summary_request
            )

            ret["summary"] = summary_result.text or ""

        return jsonify(ret)

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=8080,
        debug=True
    )
