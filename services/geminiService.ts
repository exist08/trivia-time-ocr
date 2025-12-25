
import Tesseract from 'tesseract.js';
import { FOOTBALL_TRIVIA, QuestionData } from "../constants";

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
  if (inputWords.length === 0) return null;

  let bestMatch: QuestionData | null = null;
  let maxScore = 0;

  for (const item of FOOTBALL_TRIVIA) {
    const targetWords = clean(item.question);
    const matchCount = targetWords.filter(w => inputWords.includes(w)).length;
    
    // Calculate a score based on percentage of question words found
    const score = matchCount / targetWords.length;
    
    // We need at least a decent threshold of matches (e.g., 30% of question words)
    if (score > maxScore && matchCount >= 3) {
      maxScore = score;
      bestMatch = item;
    }
  }

  return bestMatch;
};

export const analyzeQuestionImage = async (base64Image: string) => {
  try {
    // Perform local OCR processing
    const { data: { text } } = await Tesseract.recognize(
      `data:image/jpeg;base64,${base64Image}`,
      'eng'
    );

    console.log("OCR Extracted Text:", text);

    const match = findBestMatch(text);

    if (!match) {
      throw new Error("Could not find a matching question in the local database.");
    }

    return {
      identifiedQuestion: match.question,
      officialAnswer: match.answer
    };
  } catch (error) {
    console.error("Local Scan Error:", error);
    throw error;
  }
};
