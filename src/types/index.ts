export type EmotionCategory = 'Positive' | 'Neutral' | 'Negative';

export interface Emotion {
  id: string;
  name: {
    en: string;
    ms: string;
    zh: string;
  };
  emoji: string;
  category: EmotionCategory;
}

export interface Reward {
  id: string;
  name: {
    en: string;
    ms: string;
    zh: string;
  };
  streak: number;
  description: {
    en: string;
    ms: string;
    zh: string;
  };
  icon: React.ElementType;
}

export interface CheckInData {
  emotionId: string;
  intensity: number;
  date: string; // ISO string
}

export interface UserProgress {
  checkIns: CheckInData[];
  lastCheckIn: string | null;
  currentStreak: number;
  longestStreak: number;
  badges: string[];
}

export interface StudentCheckIn {
    id: string;
    student: string;
    date: string; // ISO string
    emotion: string; // emotionId
    intensity: number;
    description: string;
    bodyScan: string[];
    needs: {
      need: string;
      hope: string;
      selfCare: string;
    };
    postCoolDownEmotion?: string; // emotionId
    postCoolDownIntensity?: number;
    loggedInUser?: string;
  }
  
export interface PowerCard {
    en: string;
    zh: string;
}
