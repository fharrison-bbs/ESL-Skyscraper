
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, Type } from "@google/genai";
import { AIGoal, BuildingType, CityStats, Grid, NewsItem, QuizQuestion } from "../types";
import { BUILDINGS } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelId = 'gemini-2.5-flash';

// --- Goal Generation ---

const goalSchema = {
  type: Type.OBJECT,
  properties: {
    description: {
      type: Type.STRING,
      description: "A short goal from the Roman Senate or Emperor.",
    },
    targetType: {
      type: Type.STRING,
      enum: ['population', 'money', 'building_count'],
    },
    targetValue: {
      type: Type.INTEGER,
    },
    buildingType: {
      type: Type.STRING,
    },
    reward: {
      type: Type.INTEGER,
    },
  },
  required: ['description', 'targetType', 'targetValue', 'reward'],
};

export const generateCityGoal = async (stats: CityStats, grid: Grid): Promise<AIGoal | null> => {
  const context = `
    Roman City Stats:
    Year: ${stats.day} AUC
    Denarii: ${stats.money}
    Citizens: ${stats.population}
  `;

  const prompt = `Generate a goal for a Roman Governor. Use Roman terminology (Denarii, Citizens, Senate). Return JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `${context}\n${prompt}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: goalSchema,
        temperature: 0.7,
      },
    });

    if (response.text) {
      const goalData = JSON.parse(response.text) as Omit<AIGoal, 'completed'>;
      return { ...goalData, completed: false };
    }
  } catch (error) {
    console.error("Error generating goal:", error);
  }
  return null;
};

// --- News Feed Generation ---

const newsSchema = {
  type: Type.OBJECT,
  properties: {
    text: { type: Type.STRING },
    type: { type: Type.STRING, enum: ['positive', 'negative', 'neutral'] },
  },
  required: ['text', 'type'],
};

export const generateNewsEvent = async (stats: CityStats, recentAction: string | null): Promise<NewsItem | null> => {
  const context = `Roman City Stats - Pop: ${stats.population}, Denarii: ${stats.money}.`;
  const prompt = "Generate a very short, ancient Roman news headline (e.g., Chariot races, Senate decrees, Gods' favor).";

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `${context}\n${prompt}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: newsSchema,
        temperature: 1.1,
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      return {
        id: Date.now().toString() + Math.random(),
        text: data.text,
        type: data.type,
      };
    }
  } catch (error) {
    console.error("Error generating news:", error);
  }
  return null;
};

// --- ESL Quiz Generation ---

const quizSchema = {
  type: Type.OBJECT,
  properties: {
    question: { type: Type.STRING },
    options: { type: Type.ARRAY, items: { type: Type.STRING }, minItems: 4, maxItems: 4 },
    correctIndex: { type: Type.INTEGER },
    explanation: { type: Type.STRING, description: "Very brief grammar explanation." },
  },
  required: ['question', 'options', 'correctIndex', 'explanation'],
};

export const generateESLQuestion = async (topic: string): Promise<QuizQuestion | null> => {
  // Map building topics to specific grammar constraints
  let promptDetails = "";
  if (topic === 'Past Simple') {
    promptDetails = "Focus on completed actions in the past. (e.g., built, walked, ate).";
  } else if (topic === 'Past Continuous') {
    promptDetails = "Focus on actions in progress at a specific time in the past (e.g., was walking, were sleeping).";
  } else if (topic === 'Past Simple vs Continuous') {
    promptDetails = "Focus on a short action interrupting a longer action (e.g., 'I was reading when he arrived').";
  } else if (topic === 'Subordinate Clauses') {
    promptDetails = "Focus on time, reason, or condition clauses (e.g., using 'because', 'although', 'if', 'when').";
  } else {
    promptDetails = "General past tense grammar.";
  }

  const prompt = `Generate a Multiple Choice English Grammar question for A2-B1 ESL learners.
  Topic: ${topic}. ${promptDetails}
  Context: Ancient Rome (Gladiators, Emperors, Daily Life).
  Keep the language simple.`;
  
  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: quizSchema,
        temperature: 0.7,
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      return { ...data, topic };
    }
  } catch (error) {
    console.error("Error generating quiz:", error);
  }
  return null;
};
