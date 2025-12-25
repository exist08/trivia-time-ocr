
import { createWorker, Worker, PSM } from 'tesseract.js';
import { FOOTBALL_TRIVIA, QuestionData } from "../constants";

let workerPromise: Promise<Worker> | null = null;

/**
 * Singleton-like worker initialization to avoid race conditions 
 * during rapid autonomous scans.
 */
const getWorker = async () => {
  if (!workerPromise) {
    workerPromise = (async () => {
      const worker = await createWorker('eng');
      // Set parameters to make it faster for just reading text blocks
      // Fix: Use the PSM enum exported from tesseract.js instead of a string literal to satisfy the PSM type requirement.
      await worker.setParameters({
        tessedit_pageseg_mode: PSM.AUTO_OSD, // Automatic page segmentation with OSD.
      });
      return worker;
    })();
  }
  return workerPromise;
};

/**
 * Local matching algorithm to find the question in the dataset.
 */
const findBestMatch = (ocrText: string): QuestionData | null => {
  const clean = (s: string) =>
    s.toLowerCase()
      .replace(/[^a-z0-9 ]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2);

  const inputWords = clean(ocrText);
  if (inputWords.length < 2) return null;

  let bestMatch: QuestionData | null = null;
  let maxScore = 0;

  for (const item of FOOTBALL_TRIVIA) {
    const targetWords = clean(item.question);
    const matchCount = targetWords.filter(w => inputWords.includes(w)).length;

    // Simple Jaccard-like similarity
    const score = matchCount / targetWords.length;

    // Sensitivity threshold: 35% match or at least 3 keywords
    if (score > maxScore && (score > 0.35 || matchCount >= 4)) {
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

    if (!match) return null;

    return {
      identifiedQuestion: match.question,
      officialAnswer: match.answer
    };
  } catch (error) {
    console.error("Local Scan Error:", error);
    return null;
  }
};
