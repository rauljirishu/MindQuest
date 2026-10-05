import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Gemini
  const genAI = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  app.use(express.json());

  // API Routes
  app.post("/api/analyze-mood", async (req, res) => {
    try {
      const { message, mood } = req.body;
      
      const response = await genAI.models.generateContent({
        model: "gemini-1.5-flash",
        contents: `The user selected mood: ${mood}. User message: "${message}". 
        Analyze the emotional state with NLP.
        Return a JSON object with: 
        - intensity: 1-10
        - keywords: string[]
        - detectedEmotion: string
        - recommendation: string
        - stressLevel: 1-10
        - anxietyLevel: 1-10
        - confidence: 1-10
        - sentiment: "positive" | "negative" | "neutral"`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              intensity: { type: Type.NUMBER },
              keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
              detectedEmotion: { type: Type.STRING },
              recommendation: { type: Type.STRING },
              stressLevel: { type: Type.NUMBER },
              anxietyLevel: { type: Type.NUMBER },
              confidence: { type: Type.NUMBER },
              sentiment: { type: Type.STRING }
            },
            required: ["intensity", "keywords", "detectedEmotion", "recommendation", "stressLevel", "anxietyLevel", "confidence", "sentiment"]
          }
        }
      });

      const analysis = JSON.parse(response.text);
      res.json(analysis);
    } catch (error) {
      console.error("Mood analysis failed:", error);
      const messageText = String(req.body.message || '').toLowerCase();
      const examStress = /exam|test|deadline|overwhelmed|pressure/.test(messageText);
      res.json({
        intensity: examStress ? 8 : 5,
        keywords: examStress ? ["exam", "pressure", "stress"] : ["reflection"],
        detectedEmotion: examStress ? "Stress" : (req.body.mood || "Stress"),
        recommendation: examStress ? "Let's slow the pace, choose one small study step, and protect time for rest." : "Focus on your breath and find your center.",
        stressLevel: examStress ? 8 : 5,
        anxietyLevel: examStress ? 7 : 5,
        confidence: examStress ? 3 : 5,
        sentiment: "negative"
      });
    }
  });

  app.post("/api/generate-world", async (req, res) => {
    try {
      const { mood, analysis } = req.body;
      
      const response = await genAI.models.generateContent({
        model: "gemini-1.5-flash",
        contents: `Based on the mood "${mood}" and analysis "${JSON.stringify(analysis)}", 
        generate a unique world description and adaptive game settings for a mental health adventure.
        The settings should reflect the player's current state (e.g., higher anxiety = slower breathing rhythm game).
        Return a JSON object with:
        - worldName: string
        - description: string
        - environmentDescription: string
        - introductionMessage: string (from Nova)
        - settings: {
            difficulty: 1-10,
            weather: "sunny" | "rainy" | "stormy" | "foggy" | "clear",
            musicTempo: number (60-120),
            npcBehavior: "friendly" | "calm" | "anxious" | "neutral",
            gameSpeed: number (0.5-2.0),
            visualIntensity: 1-10
          }`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              worldName: { type: Type.STRING },
              description: { type: Type.STRING },
              environmentDescription: { type: Type.STRING },
              introductionMessage: { type: Type.STRING },
              settings: {
                type: Type.OBJECT,
                properties: {
                  difficulty: { type: Type.NUMBER },
                  weather: { type: Type.STRING },
                  musicTempo: { type: Type.NUMBER },
                  npcBehavior: { type: Type.STRING },
                  gameSpeed: { type: Type.NUMBER },
                  visualIntensity: { type: Type.NUMBER }
                },
                required: ["difficulty", "weather", "musicTempo", "npcBehavior", "gameSpeed", "visualIntensity"]
              }
            },
            required: ["worldName", "description", "environmentDescription", "introductionMessage", "settings"]
          }
        }
      });

      const generatedWorld = JSON.parse(response.text);
      const stressLevel = Number(analysis?.stressLevel || 0);
      const anxietyLevel = Number(analysis?.anxietyLevel || 0);
      if (stressLevel >= 8 || anxietyLevel >= 7) {
        generatedWorld.worldName = "The Foggy Forest";
        generatedWorld.environmentDescription = "Soft mist, quiet paths, and lanterns that brighten one step at a time.";
        generatedWorld.settings = {
          ...generatedWorld.settings,
          difficulty: 4,
          weather: "foggy",
          musicTempo: 68,
          npcBehavior: "friendly",
          gameSpeed: 0.7,
          visualIntensity: 3
        };
      }
      res.json(generatedWorld);
    } catch (error) {
      console.error("World generation failed:", error);
      const analysis = req.body.analysis || {};
      const examStress = Number(analysis.stressLevel) >= 8 || Number(analysis.anxietyLevel) >= 7;
      res.json(examStress ? {
        worldName: "The Foggy Forest",
        description: "A quiet forest shaped for steady progress before tomorrow's exam.",
        environmentDescription: "Soft mist, quiet paths, and friendly lantern keepers.",
        introductionMessage: "I hear how much pressure tomorrow is carrying. We will take this one calm step at a time.",
        settings: { difficulty: 4, weather: "foggy", musicTempo: 68, npcBehavior: "friendly", gameSpeed: 0.7, visualIntensity: 3 }
      } : {
        worldName: `The Realm of ${req.body.mood || 'Balance'}`,
        description: "A mysterious space shaped by your thoughts.",
        environmentDescription: "Ethereal mists and shifting light.",
        introductionMessage: "Welcome. We will find one steady step together.",
        settings: { difficulty: 5, weather: "clear", musicTempo: 80, npcBehavior: "calm", gameSpeed: 1, visualIntensity: 5 }
      });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, mood, worldContext } = req.body;
      
      const systemPrompt = `You are Nova, an AI Clinical CBT Therapist & Neuro-Science Guide in MindQuest v2. 
      The current mental health realm is ${worldContext?.worldName || 'The Realm of Balance'}. The user's mood is ${mood}.
      You are NOT a generic chatbot. You act as a compassionate, evidence-based clinical therapist.
      Always explain:
      1) Why the user might be experiencing this emotion (e.g. Amygdala vs Prefrontal Cortex, Cortisol/Serotonin).
      2) How CBT cognitive restructuring or parasympathetic breathing helps rewire the brain.
      3) Direct actionable coping steps.
      Never repeat generic phrases. Keep responses concise, warm, and deeply insightful.`;

      const lastMessage = messages[messages.length - 1].content;
      const response = await genAI.models.generateContent({
        model: "gemini-1.5-flash",
        contents: `${systemPrompt}\n\nUser says: ${lastMessage}`
      });

      res.json({ content: response.text });
    } catch (error) {
      console.error("Chat failed:", error);
      res.json({ content: "I'm right here with you! Let's take a deep breath and keep exploring together." });
    }
  });

  app.post("/api/generate-quests", async (req, res) => {
    const { mood, analysis, memory } = req.body;
    try {
      const response = await genAI.models.generateContent({
        model: "gemini-1.5-flash",
        contents: `Create three gentle, achievable mental-wellness quests for a game player. Mood: ${mood}. Analysis: ${JSON.stringify(analysis)}. Recent memory: ${memory || 'new player'}. Avoid diagnosis and medical claims. Return JSON array with id, title, description, activity (breathing|focus|memory|reflection|connection), durationMinutes (1-10), xp (20-100), completed false.`,
        config: { responseMimeType: "application/json" }
      });
      res.json(JSON.parse(response.text));
    } catch (error) {
      console.error("Quest generation failed:", error);
      res.json([
        { id: "breath", title: "Return to your breath", description: "Follow a slow 4-count inhale and 6-count exhale for one minute.", activity: "breathing", durationMinutes: 1, xp: 40, completed: false },
        { id: "notice", title: "Name one steady thing", description: "Write down one thing you can see, hear, and feel right now.", activity: "reflection", durationMinutes: 2, xp: 35, completed: false },
        { id: "focus", title: "One gentle focus", description: "Choose one small task and give it five unrushed minutes.", activity: "focus", durationMinutes: 5, xp: 50, completed: false }
      ]);
    }
  });

  app.post("/api/recommendation", async (req, res) => {
    const { activity, mood } = req.body;
    try {
      const response = await genAI.models.generateContent({
        model: "gemini-1.5-flash",
        contents: `Give one concise, practical, non-clinical wellness activity recommendation after a player completed a ${activity} quest while feeling ${mood || 'uncertain'}. Return only the recommendation text.`
      });
      res.send(response.text);
    } catch (error) {
      console.error("Recommendation generation failed:", error);
      res.send("Try a short walk or a glass of water before your next task.");
    }
  });

  app.post("/api/game-content/anger", async (req, res) => {
    try {
      const { userMessage } = req.body;
      const response = await genAI.models.generateContent({
        model: "gemini-1.5-flash",
        contents: `The player said: "${userMessage || 'I am feeling frustrated'}".
        Generate 3 emotional conflict scenarios between two NPCs in a volcano world that need peaceful de-escalation.
        Return JSON array:
        [{
          "id": "1",
          "npc1Name": string,
          "npc2Name": string,
          "situation": string,
          "options": [
            { "text": string, "isDeescalating": boolean, "explanation": string }
          ]
        }]`,
        config: { responseMimeType: "application/json" }
      });
      res.json(JSON.parse(response.text));
    } catch (error) {
      res.json([
        {
          id: "1",
          npc1Name: "Ember",
          npc2Name: "Blaze",
          situation: "Ember accidentally ruined Blaze's stone carving while rushing.",
          options: [
            { text: "Acknowledge the mistake, apologize, and offer to rebuild together.", isDeescalating: true, explanation: "Empathy & accountability calm frustration." },
            { text: "Blame Blaze for leaving the stone in the pathway.", isDeescalating: false, explanation: "Shifting blame increases tension." },
            { text: "Ignore Blaze and walk away silently.", isDeescalating: false, explanation: "Silent treatment creates resentment." }
          ]
        },
        {
          id: "2",
          npc1Name: "Pyro",
          npc2Name: "Ash",
          situation: "Ash is upset because Pyro spoke over them in front of the village elder.",
          options: [
            { text: "Listen carefully, validate Ash's feelings, and ask how to fix it.", isDeescalating: true, explanation: "Active listening resolves hurt pride." },
            { text: "Tell Ash they are overreacting over nothing.", isDeescalating: false, explanation: "Invalidating emotions sparks anger." },
            { text: "Shout louder to prove who was right.", isDeescalating: false, explanation: "Aggression causes eruption." }
          ]
        }
      ]);
    }
  });

  app.post("/api/game-content/lonely", async (req, res) => {
    try {
      const { userMessage } = req.body;
      const response = await genAI.models.generateContent({
        model: "gemini-1.5-flash",
        contents: `Player stated: "${userMessage || 'Feeling isolated'}".
        Generate 6 lonely NPCs in a rainy village with shared pairs of hobbies (3 pairs) so player can pair them up into 3 friendships.
        Return JSON array:
        [{ "id": string, "name": string, "avatar": string, "hobby": string, "dialogue": string }]`,
        config: { responseMimeType: "application/json" }
      });
      res.json(JSON.parse(response.text));
    } catch (error) {
      res.json([
        { id: "1", name: "Willow", avatar: "🌿", hobby: "Gardening & Botanics", dialogue: "I spend all day talking to my ferns... I wish I had a human friend." },
        { id: "2", name: "Oliver", avatar: "🦉", hobby: "Star Gazing & Astronomy", dialogue: "The night sky is vast, but watching constellations alone feels cold." },
        { id: "3", name: "Flora", avatar: "🌸", hobby: "Gardening & Botanics", dialogue: "My greenhouse is blooming, but no one visits to smell the lavender." },
        { id: "4", name: "Leo", avatar: "🔭", hobby: "Star Gazing & Astronomy", dialogue: "I bought a telescope last week, but looking at Saturn alone is lonely." },
        { id: "5", name: "Melody", avatar: "🎵", hobby: "Acoustic Music & Songs", dialogue: "I write acoustic songs every evening, but no one is listening." },
        { id: "6", name: "Harmony", avatar: "🎸", hobby: "Acoustic Music & Songs", dialogue: "I love playing guitar, but duets are so much better than solos." }
      ]);
    }
  });

  app.post("/api/game-content/stress", async (req, res) => {
    try {
      const { userMessage } = req.body;
      const response = await genAI.models.generateContent({
        model: "gemini-1.5-flash",
        contents: `Player stated stressors: "${userMessage || 'Overwhelmed with work'}".
        Generate 6 daily task cards (Sleep, Work, Study, Exercise, Relax, Family) with custom stress impacts.
        Return JSON array:
        [{ "id": string, "title": string, "category": string, "durationHours": number, "stressImpact": number, "icon": string }]`,
        config: { responseMimeType: "application/json" }
      });
      res.json(JSON.parse(response.text));
    } catch (error) {
      res.json([
        { id: 't1', title: 'Deep Sleep', category: 'Sleep', durationHours: 8, stressImpact: -40, icon: '🌙' },
        { id: 't2', title: 'Focused Work', category: 'Work', durationHours: 6, stressImpact: 25, icon: '💼' },
        { id: 't3', title: 'Study & Reading', category: 'Study', durationHours: 4, stressImpact: 15, icon: '📚' },
        { id: 't4', title: 'Morning Exercise', category: 'Exercise', durationHours: 2, stressImpact: -20, icon: '🏃' },
        { id: 't5', title: 'Mindful Relaxation', category: 'Relax', durationHours: 2, stressImpact: -30, icon: '🧘' },
        { id: 't6', title: 'Family & Friends', category: 'Family', durationHours: 2, stressImpact: -25, icon: '👨‍👩‍👧' }
      ]);
    }
  });

  app.post("/api/game-content/sadness", async (req, res) => {
    try {
      const { userMessage } = req.body;
      const response = await genAI.models.generateContent({
        model: "gemini-1.5-flash",
        contents: `Player stated: "${userMessage || 'Feeling blue'}".
        Generate 5 uplifting, warm memory affirmation quotes to restore hope and joy.
        Return JSON array:
        [{ "id": string, "quote": string, "theme": string, "unlocked": false }]`,
        config: { responseMimeType: "application/json" }
      });
      res.json(JSON.parse(response.text));
    } catch (error) {
      res.json([
        { id: '1', quote: "Remember the sunny afternoon at the beach with family.", theme: "Joy", unlocked: false },
        { id: '2', quote: "The proud moment you finished your hardest project.", theme: "Achievement", unlocked: false },
        { id: '3', quote: "A warm cup of tea on a quiet rainy morning.", theme: "Peace", unlocked: false },
        { id: '4', quote: "Shared laughter with your best friend until tears came.", theme: "Friendship", unlocked: false },
        { id: '5', quote: "The gentle feeling of overcoming a tough hardship.", theme: "Resilience", unlocked: false }
      ]);
    }
  });

  app.post("/api/generate-ending", async (req, res) => {
    try {
      const { mood, message, performance, analysis } = req.body;
      const response = await genAI.models.generateContent({
        model: "gemini-1.5-flash",
        contents: `The player started with mood "${mood}", thoughts "${message}".
        Game performance: Score ${performance.score}, Time ${performance.timeTaken}s, Mistakes ${performance.mistakes}.
        Generate a personalized ending story summary from Nova, emotional shift analysis, and 1 real-world mindfulness takeaway.
        Return JSON:
        {
          "endingTitle": string,
          "novaSpeech": string,
          "emotionalShift": string,
          "realWorldAction": string
        }`,
        config: { responseMimeType: "application/json" }
      });
      res.json(JSON.parse(response.text));
    } catch (error) {
      res.json({
        endingTitle: "Emotional Balance Restored",
        novaSpeech: "I saw your determination as you navigated through the challenges. You showed great resilience!",
        emotionalShift: "Your focus and calm choices reduced your stress levels significantly.",
        realWorldAction: "Take 3 deep breaths whenever you feel overwhelmed today."
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

