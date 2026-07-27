/**
 * Clinical NLP Pipeline for Mental Health Text Processing
 * Demonstrates NLP preprocessing, emotion vectorization, and CBT cognitive distortion classification.
 */

export interface CognitiveDistortionResult {
  type: string;
  confidence: number;
  explanation: string;
  reframingTip: string;
}

export interface NLPProcessingResult {
  rawText: string;
  cleanedTokens: string[];
  lemmas: string[];
  keywords: string[];
  sentiment: {
    score: number; // -1.0 to +1.0
    label: 'Positive' | 'Negative' | 'Neutral';
  };
  emotionConfidenceScore: number; // 0 to 100%
  stressScore: number; // 0 to 100
  anxietyScore: number; // 0 to 100
  burnoutScore: number; // 0 to 100
  hopeScore: number; // 0 to 100
  socialIsolationScore: number; // 0 to 100
  personalityTraits: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  detectedDistortions: CognitiveDistortionResult[];
}

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'can\'t', 'cannot',
  'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has',
  'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into',
  'is', 'it', 'its', 'itself', 'just', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on',
  'once', 'only', 'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so',
  'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when',
  'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours', 'yourself'
]);

// Basic lemmatizer mapping for therapeutic keywords
const LEMMA_MAP: { [word: string]: string } = {
  'feeling': 'feel', 'felt': 'feel', 'worried': 'worry', 'worrying': 'worry',
  'panicking': 'panic', 'panicked': 'panic', 'failing': 'fail', 'failed': 'fail',
  'stressed': 'stress', 'stressful': 'stress', 'lonely': 'alone', 'isolated': 'alone',
  'hopeless': 'hope', 'hopeful': 'hope', 'scared': 'fear', 'afraid': 'fear',
  'angry': 'anger', 'furious': 'anger', 'sad': 'sadness', 'depressed': 'sadness'
};

export class NLPPipeline {
  private static instance: NLPPipeline;

  private constructor() {}

  static getInstance(): NLPPipeline {
    if (!NLPPipeline.instance) {
      NLPPipeline.instance = new NLPPipeline();
    }
    return NLPPipeline.instance;
  }

  processText(text: string): NLPProcessingResult {
    // 1. Text Cleaning & Tokenization
    const cleanText = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
    const rawTokens = cleanText.split(/\s+/).filter(Boolean);

    // 2. Stop Word Removal & Lemmatization
    const cleanedTokens = rawTokens.filter(token => !STOP_WORDS.has(token));
    const lemmas = cleanedTokens.map(token => LEMMA_MAP[token] || token);
    const keywords = Array.from(new Set(lemmas)).slice(0, 8);

    // 3. Sentiment Analysis
    const positiveWords = new Set(['good', 'great', 'happy', 'calm', 'peace', 'hope', 'love', 'joy', 'smile', 'better', 'strong', 'relax']);
    const negativeWords = new Set(['bad', 'fail', 'worst', 'ruin', 'never', 'fear', 'hate', 'alone', 'scared', 'sad', 'stress', 'panic', 'tired']);

    let posCount = 0;
    let negCount = 0;
    cleanedTokens.forEach(t => {
      if (positiveWords.has(t)) posCount++;
      if (negativeWords.has(t)) negCount++;
    });

    const totalTarget = posCount + negCount || 1;
    const sentimentScore = Math.max(-1, Math.min(1, (posCount - negCount) / totalTarget));
    const sentimentLabel = sentimentScore > 0.15 ? 'Positive' : sentimentScore < -0.15 ? 'Negative' : 'Neutral';

    // 4. Clinical Score Calculations
    const textLen = text.length;
    const stressScore = Math.min(100, Math.max(10, Math.round((negCount * 25) + (textLen > 100 ? 20 : 0))));
    const anxietyScore = Math.min(100, Math.max(10, Math.round((text.includes('fear') || text.includes('worry') || text.includes('panic') ? 40 : 15) + negCount * 15)));
    const burnoutScore = Math.min(100, Math.max(5, Math.round((text.includes('tired') || text.includes('exhausted') || text.includes('overwhelmed') ? 45 : 10) + negCount * 10)));
    const hopeScore = Math.min(100, Math.max(5, Math.round((posCount * 30) + (sentimentScore > 0 ? 30 : 10))));
    const socialIsolationScore = Math.min(100, Math.max(5, Math.round((text.includes('alone') || text.includes('lonely') || text.includes('nobody') ? 50 : 10))));
    const emotionConfidenceScore = Math.min(99, Math.max(65, 70 + cleanedTokens.length * 2));

    // 5. Cognitive Distortion Detection
    const detectedDistortions: CognitiveDistortionResult[] = [];

    if (/always|never|completely|impossible|ruined|total/i.test(text)) {
      detectedDistortions.push({
        type: 'All-or-Nothing Thinking',
        confidence: 88,
        explanation: 'Viewing situations in black-and-white absolutes without seeing nuanced middle ground.',
        reframingTip: 'Ask yourself: "Is it really 100% absolute, or are there exceptions?"'
      });
    }

    if (/worst|disaster|horrible|catastrophe|ruin|going to fail/i.test(text)) {
      detectedDistortions.push({
        type: 'Catastrophizing',
        confidence: 92,
        explanation: 'Expecting the absolute worst scenario to occur despite lack of evidence.',
        reframingTip: 'What is the most likely outcome, and what coping steps would you take if it happened?'
      });
    }

    if (/my fault|blame me|because of me|i ruined/i.test(text)) {
      detectedDistortions.push({
        type: 'Personalization',
        confidence: 85,
        explanation: 'Holding yourself personally responsible for events outside your control.',
        reframingTip: 'What external factors also contributed to this situation?'
      });
    }

    if (/they think|everyone hates|nobody likes|they judge/i.test(text)) {
      detectedDistortions.push({
        type: 'Mind Reading',
        confidence: 84,
        explanation: 'Assuming you know others\' negative thoughts without concrete proof.',
        reframingTip: 'Have they explicitly told you this, or is your anxiety making an assumption?'
      });
    }

    // 6. Personality Trait Estimation (OCEAN)
    const personalityTraits = {
      openness: Math.min(100, 50 + (textLen > 80 ? 20 : 0)),
      conscientiousness: Math.min(100, 45 + (posCount * 10)),
      extraversion: Math.max(10, 60 - socialIsolationScore * 0.4),
      agreeableness: Math.min(100, 60 + posCount * 5),
      neuroticism: Math.min(100, Math.round(anxietyScore * 0.7 + stressScore * 0.3))
    };

    return {
      rawText: text,
      cleanedTokens,
      lemmas,
      keywords,
      sentiment: { score: sentimentScore, label: sentimentLabel },
      emotionConfidenceScore,
      stressScore,
      anxietyScore,
      burnoutScore,
      hopeScore,
      socialIsolationScore,
      personalityTraits,
      detectedDistortions
    };
  }
}
