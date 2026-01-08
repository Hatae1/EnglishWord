
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { WordData } from "../types";

// Local pool of ~200 South Korean Elementary 3rd Grade English words
const ELEMENTARY_WORD_POOL = [
  "apple", "banana", "bag", "ball", "bear", "bird", "bike", "black", "blue", "book", "box", "boy", "brother", "bus", "cake", 
  "candy", "cap", "cat", "chair", "cold", "color", "cook", "cup", "dad", "dance", "desk", "dog", "doll", "door", "duck", 
  "egg", "elephant", "eye", "face", "family", "fan", "fast", "father", "fish", "five", "flower", "food", "foot", "four", 
  "friend", "frog", "fruit", "game", "garden", "girl", "glass", "go", "good", "grape", "gray", "green", "hair", "hand", 
  "happy", "hat", "head", "hello", "help", "hen", "hi", "home", "horse", "hot", "house", "ice", "ice cream", "ink", "jam", 
  "jet", "juice", "jump", "key", "king", "kite", "ladybug", "leg", "lemon", "lion", "long", "love", "lunch", "man", "map", 
  "milk", "mom", "monkey", "moon", "morning", "mother", "mouth", "name", "net", "night", "nine", "nose", "notebook", "nurse", 
  "octopus", "old", "one", "orange", "owl", "pan", "panda", "paper", "park", "pen", "pencil", "pet", "piano", "pig", "pink", 
  "pizza", "play", "pot", "queen", "rabbit", "rain", "red", "rice", "robot", "rock", "room", "rose", "run", "sad", "salt", 
  "school", "sea", "seven", "ship", "shirt", "shoe", "short", "sing", "sister", "six", "sky", "sleep", "slow", "small", 
  "snake", "snow", "soap", "sock", "sofa", "song", "soup", "spoon", "star", "student", "sun", "swim", "table", "tall", 
  "tea", "teacher", "ten", "tiger", "tomato", "toy", "train", "tree", "truck", "turtle", "two", "umbrella", "up", "van", 
  "vase", "vest", "violet", "walk", "watch", "water", "white", "window", "wing", "wolf", "woman", "wood", "yellow", "zebra", "zoo",
  "small", "big", "long", "short", "old", "new", "hot", "cold", "good", "bad", "happy", "sad", "hungry", "thirsty", "tired"
];

// Helper to decode base64 string
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper to decode raw PCM data into AudioBuffer
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const fetchRandomWords = async (): Promise<WordData[]> => {
  const shuffled = [...ELEMENTARY_WORD_POOL].sort(() => 0.5 - Math.random());
  const selectedWords = shuffled.slice(0, 5);

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `For these 5 English words: [${selectedWords.join(", ")}], provide one very simple English example sentence for each. Do not provide any Korean translations.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING },
            example: { type: Type.STRING, description: 'A very simple English sentence' }
          },
          required: ["word", "example"]
        }
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No words generated");
  
  const results: WordData[] = JSON.parse(text);
  return results;
};

export const speakWord = async (word: string, audioContext: AudioContext): Promise<void> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Say clearly and slowly for a child: ${word}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  if (!response.candidates || response.candidates.length === 0) {
    throw new Error("No response candidates received from the model.");
  }

  let base64Audio: string | undefined;
  const parts = response.candidates[0].content.parts;
  for (const part of parts) {
    if (part.inlineData?.data) {
      base64Audio = part.inlineData.data;
      break;
    }
  }

  if (!base64Audio) throw new Error("No audio data received");

  const audioBytes = decode(base64Audio);
  const audioBuffer = await decodeAudioData(audioBytes, audioContext, 24000, 1);
  
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioContext.destination);
  source.start();
};
