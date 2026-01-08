
export interface WordData {
  word: string;
  example: string;
}

export interface PronunciationState {
  word: string | null;
  loading: boolean;
}
