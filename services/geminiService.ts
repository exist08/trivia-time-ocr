
import { createWorker } from 'tesseract.js';
import { FOOTBALL_TRIVIA, QuestionData } from "../constants";

let worker: Tesseract.Worker | null = null;

/**
 * Initializes the Tesseract worker if not already created.
 */
const getWorker = async () => {
  if (!worker) {
    worker = await createWorker('eng');
  }
  return worker;
};

/**
 * Local matching algorithm to find the question in the dataset 
 * that has the highest word overlap with the OCR output.
 */
const findBestMatch = (ocrText: string): QuestionData | null => {
  const clean = (s: string) => 
    s.toLowerCase()
     .replace(/[^a-z0-9 ]/g, '')
     .split(/\s+/)
     .filter(w => w.length > 2);

  const inputWords = clean(ocrText);
  if (inputWords.length < 3) return null;

  let bestMatch: QuestionData | null = null;
  let maxScore = 0;

  for (const item of FOOTBALL_TRIVIA) {
    const targetWords = clean(item.question);
    const matchCount = targetWords.filter(w => inputWords.includes(w)).length;
    
    // Similarity score
    const score = matchCount / targetWords.length;
    
    // Require a minimum match threshold to prevent false positives
    if (score > maxScore && score > 0.4 && matchCount >= 3) {
      maxScore = score;
      bestMatch = item;
    }
  }

  return bestMatch;
};

export const analyzeQuestionImage = async (base64Image: string) => {
  try {
    const tesseractWorker = await getWorker();
    
    // Process image
    const { data: { text } } = await tesseractWorker.recognize(`data:image/jpeg;base64,${base64Image}`);
    
    const match = findBestMatch(text);

    if (!match) {
      return null;
    }

    return {
      identifiedQuestion: match.question,
      officialAnswer: match.answer
    };
  } catch (error) {
    console.error("Scanning Error:", error);
    return null;
  }
};
