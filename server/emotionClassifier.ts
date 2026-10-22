export const EMOTIONS = ['Happy', 'Sad', 'Stress', 'Angry', 'Neutral', 'Tired'] as const;
export type Emotion = typeof EMOTIONS[number];

type Example = { text: string; label: Emotion };

export const TRAINING_DATA: Example[] = [
  { text: 'I feel joyful and excited about today', label: 'Happy' },
  { text: 'I am grateful and full of energy', label: 'Happy' },
  { text: 'I feel happy and excited today', label: 'Happy' },
  { text: 'I feel down and want to cry', label: 'Sad' },
  { text: 'I miss someone and feel empty', label: 'Sad' },
  { text: 'I feel sad and empty today', label: 'Sad' },
  { text: 'There is too much pressure and I feel overwhelmed', label: 'Stress' },
  { text: 'I have a deadline and cannot relax', label: 'Stress' },
  { text: 'I feel overwhelmed by pressure', label: 'Stress' },
  { text: 'I am furious about what happened', label: 'Angry' },
  { text: 'I feel frustrated and want to shout', label: 'Angry' },
  { text: 'I feel angry and frustrated', label: 'Angry' },
  { text: 'I am okay and going through a normal day', label: 'Neutral' },
  { text: 'I am not sure how I feel right now', label: 'Neutral' },
  { text: 'I feel neutral and okay', label: 'Neutral' },
  { text: 'I am exhausted and have no energy', label: 'Tired' },
  { text: 'I barely slept and feel drained', label: 'Tired' },
  { text: 'I feel tired and exhausted', label: 'Tired' }
];

const tokenize = (text: string): string[] => text.toLowerCase().match(/[a-z]+/g) || [];

export interface EmotionPrediction {
  emotion: Emotion;
  confidence: number;
  probabilities: Record<Emotion, number>;
  trainedExamples: number;
  model: 'multinomial-naive-bayes';
}

export class EmotionClassifier {
  private readonly vocabulary = new Set<string>();
  private readonly tokenCounts = new Map<Emotion, Map<string, number>>();
  private readonly classCounts = new Map<Emotion, number>();
  private readonly totalTokens = new Map<Emotion, number>();

  constructor(examples: Example[] = TRAINING_DATA) {
    for (const emotion of EMOTIONS) {
      this.tokenCounts.set(emotion, new Map());
      this.classCounts.set(emotion, 0);
      this.totalTokens.set(emotion, 0);
    }
    this.fit(examples);
  }

  fit(examples: Example[]) {
    for (const example of examples) {
      const tokens = tokenize(example.text);
      this.classCounts.set(example.label, (this.classCounts.get(example.label) || 0) + 1);
      const counts = this.tokenCounts.get(example.label)!;
      for (const token of tokens) {
        this.vocabulary.add(token);
        counts.set(token, (counts.get(token) || 0) + 1);
        this.totalTokens.set(example.label, (this.totalTokens.get(example.label) || 0) + 1);
      }
    }
  }

  predict(text: string): EmotionPrediction {
    const tokens = tokenize(text);
    const vocabularySize = Math.max(1, this.vocabulary.size);
    const totalExamples = TRAINING_DATA.length;
    const scores = new Map<Emotion, number>();

    for (const emotion of EMOTIONS) {
      const prior = Math.log((this.classCounts.get(emotion) || 0.5) / totalExamples);
      const counts = this.tokenCounts.get(emotion)!;
      const denominator = (this.totalTokens.get(emotion) || 0) + vocabularySize;
      const score = tokens.reduce((sum, token) => sum + Math.log(((counts.get(token) || 0) + 1) / denominator), prior);
      scores.set(emotion, score);
    }

    const maxScore = Math.max(...scores.values());
    const expScores = EMOTIONS.map(emotion => Math.exp(scores.get(emotion)! - maxScore));
    const total = expScores.reduce((sum, value) => sum + value, 0);
    const probabilities = Object.fromEntries(EMOTIONS.map((emotion, index) => [emotion, expScores[index] / total])) as Record<Emotion, number>;
    const emotion = EMOTIONS.reduce((best, candidate) => probabilities[candidate] > probabilities[best] ? candidate : best, EMOTIONS[0]);

    return {
      emotion,
      confidence: Math.round(probabilities[emotion] * 100) / 100,
      probabilities,
      trainedExamples: totalExamples,
      model: 'multinomial-naive-bayes'
    };
  }
}

export const emotionClassifier = new EmotionClassifier();

export function evaluateEmotionModel() {
  const heldOut = TRAINING_DATA.filter((_, index) => index % 3 === 2);
  const training = TRAINING_DATA.filter((_, index) => index % 3 !== 2);
  const model = new EmotionClassifier(training);
  const confusion = Object.fromEntries(EMOTIONS.map(label => [label, Object.fromEntries(EMOTIONS.map(item => [item, 0]))])) as Record<Emotion, Record<Emotion, number>>;
  let correct = 0;
  for (const example of heldOut) {
    const predicted = model.predict(example.text).emotion;
    confusion[example.label][predicted] += 1;
    if (predicted === example.label) correct += 1;
  }
  const perClass = Object.fromEntries(EMOTIONS.map(label => {
    const truePositive = confusion[label][label];
    const actual = EMOTIONS.reduce((sum, item) => sum + confusion[label][item], 0);
    const predicted = EMOTIONS.reduce((sum, item) => sum + confusion[item][label], 0);
    const precision = predicted ? truePositive / predicted : 0;
    const recall = actual ? truePositive / actual : 0;
    return [label, {
      precision: Number(precision.toFixed(3)),
      recall: Number(recall.toFixed(3)),
      f1: Number((precision + recall ? (2 * precision * recall) / (precision + recall) : 0).toFixed(3))
    }];
  }));
  return {
    model: 'multinomial-naive-bayes',
    trainingExamples: training.length,
    heldOutExamples: heldOut.length,
    accuracy: Number((correct / Math.max(1, heldOut.length)).toFixed(3)),
    perClass,
    confusionMatrix: confusion
  };
}
