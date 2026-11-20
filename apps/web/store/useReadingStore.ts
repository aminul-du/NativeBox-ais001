import { create } from 'zustand';

export type PlaybackRate = 1.0 | 1.2 | 1.5 | 2.0;

export interface ReadingModeState {
  isPlaying: boolean;
  currentIndex: number;
  sentences: string[];
  playbackRate: PlaybackRate;
  activeLanguage: 'auto' | 'bn' | 'en';
  
  // Actions
  setSentences: (sentences: string[]) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  nextSentence: () => void;
  prevSentence: () => void;
  setIndex: (index: number) => void;
  cyclePlaybackRate: () => void;
  setPlaybackRate: (rate: PlaybackRate) => void;
}

export const useReadingStore = create<ReadingModeState>((set, get) => ({
  isPlaying: false,
  currentIndex: 0,
  sentences: [],
  playbackRate: 1.0,
  activeLanguage: 'auto',

  setSentences: (sentences) => set({ sentences, currentIndex: 0, isPlaying: false }),
  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  
  nextSentence: () => {
    const { currentIndex, sentences } = get();
    if (currentIndex < sentences.length - 1) {
      set({ currentIndex: currentIndex + 1 });
    } else {
      set({ isPlaying: false, currentIndex: 0 });
    }
  },

  prevSentence: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) {
      set({ currentIndex: currentIndex - 1 });
    }
  },

  setIndex: (index) => set({ currentIndex: index }),

  cyclePlaybackRate: () => {
    const rates: PlaybackRate[] = [1.0, 1.2, 1.5, 2.0];
    const current = get().playbackRate;
    const nextIdx = (rates.indexOf(current) + 1) % rates.length;
    set({ playbackRate: rates[nextIdx] ?? 1.0 });
  },

  setPlaybackRate: (rate) => set({ playbackRate: rate }),
}));
