'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';
import { useReadingStore, PlaybackRate } from '../store/useReadingStore';

interface AudioToolbarProps {
  containerId?: string;
}

export default function AudioControlToolbar({ containerId = 'main-reading-container' }: AudioToolbarProps) {
  const {
    isPlaying,
    currentIndex,
    sentences,
    playbackRate,
    setSentences,
    togglePlay,
    nextSentence,
    prevSentence,
    cyclePlaybackRate,
    pause,
  } = useReadingStore();

  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isPlayingRef = useRef<boolean>(isPlaying);
  isPlayingRef.current = isPlaying;

  const playbackRateRef = useRef<PlaybackRate>(playbackRate);
  playbackRateRef.current = playbackRate;

  const currentIndexRef = useRef<number>(currentIndex);
  currentIndexRef.current = currentIndex;

  const sentencesRef = useRef<string[]>(sentences);
  sentencesRef.current = sentences;

  // 1. Multilingual DOM Sentence Parser & Segmenter
  useEffect(() => {
    const timer = setTimeout(() => {
      const container = document.getElementById(containerId) || document.querySelector('main') || document.body;
      if (!container) return;

      const extracted: string[] = [];
      const textNodes: { node: Text; text: string }[] = [];

      // Multilingual sentence splitter (Latin .!? and Bengali Dari । ॥)
      const sentenceRegex = new RegExp('[^.!?।॥\\n]+(?:[.!?।॥]+["\']?|\\n+|$)', 'gm');

      const walker = document.createTreeWalker(
        container,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) => {
            const parent = node.parentElement;
            if (!parent) return NodeFilter.FILTER_REJECT;
            const tag = parent.tagName.toLowerCase();
            if (['script', 'style', 'canvas', 'button', 'input', 'pre', 'code'].includes(tag)) {
              return NodeFilter.FILTER_REJECT;
            }
            if (parent.closest('#reading-mode-toolbar')) {
              return NodeFilter.FILTER_REJECT;
            }
            return (node.textContent && node.textContent.trim().length > 3)
              ? NodeFilter.FILTER_ACCEPT
              : NodeFilter.FILTER_REJECT;
          },
        }
      );

      let curr: Node | null;
      while ((curr = walker.nextNode())) {
        textNodes.push({ node: curr as Text, text: curr.textContent || '' });
      }

      let globalIdx = 0;
      textNodes.forEach(({ node, text }) => {
        const matches = text.match(sentenceRegex);
        if (!matches || matches.length === 0) return;

        const frag = document.createDocumentFragment();
        matches.forEach((sentence) => {
          const trimmed = sentence.trim();
          if (trimmed.length > 2) {
            extracted.push(trimmed);
            const span = document.createElement('span');
            span.id = 'web-seg-' + globalIdx;
            span.className = 'reading-seg transition-all duration-200';
            span.textContent = sentence;
            frag.appendChild(span);
            globalIdx++;
          } else {
            frag.appendChild(document.createTextNode(sentence));
          }
        });

        if (node.parentNode) {
          node.parentNode.replaceChild(frag, node);
        }
      });

      setSentences(extracted);
    }, 150);

    return () => clearTimeout(timer);
  }, [containerId, setSentences]);

  // 2. DOM Highlight & Auto-scroll Synchronizer
  useEffect(() => {
    document.querySelectorAll('.reading-seg').forEach((el) => {
      el.classList.remove('bg-blue-500/25', 'text-blue-300', 'ring-1', 'ring-blue-400', 'rounded', 'px-1', 'font-medium');
    });

    const activeEl = document.getElementById('web-seg-' + currentIndex);
    if (activeEl) {
      activeEl.classList.add('bg-blue-500/25', 'text-blue-300', 'ring-1', 'ring-blue-400', 'rounded', 'px-1', 'font-medium');
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [currentIndex]);

  // 3. Dual-Engine Speech Synthesis
  const speakCurrent = useCallback(async () => {
    if (typeof window === 'undefined') return;

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const idx = currentIndexRef.current;
    const list = sentencesRef.current;
    if (!list || !list[idx]) {
      pause();
      return;
    }

    const text = list[idx];
    const isBengali = /[\u0980-\u09FF]/.test(text);

    if (isBengali) {
      // ENGINE 2: Localized Bengali Speech Synthesis
      if (window.speechSynthesis) {
        const utt = new SpeechSynthesisUtterance(text);
        utt.rate = playbackRateRef.current;
        utt.lang = 'bn-BD';
        utt.onend = () => {
          if (isPlayingRef.current) nextSentence();
        };
        utt.onerror = () => {
          if (isPlayingRef.current) nextSentence();
        };
        synthRef.current = utt;
        window.speechSynthesis.speak(utt);
      }
    } else {
      // ENGINE 1: Standard Client Web Speech API (English)
      if (window.speechSynthesis) {
        const utt = new SpeechSynthesisUtterance(text);
        utt.rate = playbackRateRef.current;
        utt.lang = 'en-US';
        utt.onend = () => {
          if (isPlayingRef.current) nextSentence();
        };
        utt.onerror = () => {
          if (isPlayingRef.current) nextSentence();
        };
        synthRef.current = utt;
        window.speechSynthesis.speak(utt);
      }
    }
  }, [nextSentence, pause]);

  useEffect(() => {
    if (isPlaying) {
      speakCurrent();
    } else {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentIndex, speakCurrent]);

  const handlePrev = () => {
    prevSentence();
    if (isPlaying) speakCurrent();
  };

  const handleNext = () => {
    nextSentence();
    if (isPlaying) speakCurrent();
  };

  return (
    <div
      id="reading-mode-toolbar"
      className="fixed top-5 right-6 z-50 flex items-center gap-2 px-3.5 py-1.5 bg-slate-900/90 border border-slate-700/60 backdrop-blur-md rounded-full shadow-2xl text-slate-100 select-none text-xs transition-all hover:border-blue-500/50"
      role="region"
      aria-label="Reading Mode Audio Controls"
    >
      <button
        onClick={handlePrev}
        disabled={currentIndex === 0}
        className="p-1 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
        aria-label="Previous Sentence"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <button
        onClick={togglePlay}
        className="w-7 h-7 rounded-full bg-blue-600 hover:bg-blue-500 active:scale-95 flex items-center justify-center transition-all text-white shadow-sm cursor-pointer"
        aria-label={isPlaying ? 'Pause reading' : 'Play reading'}
      >
        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
      </button>

      <button
        onClick={handleNext}
        disabled={currentIndex >= sentences.length - 1}
        className="p-1 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
        aria-label="Next Sentence"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      <div className="w-px h-4 bg-slate-700 mx-0.5" />

      <button
        onClick={cyclePlaybackRate}
        className="px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-[11px] font-mono font-semibold text-blue-400 tracking-tight transition-colors cursor-pointer"
        aria-label={`Playback speed: ${playbackRate}x`}
      >
        {playbackRate.toFixed(1)}x
      </button>

      {sentences.length > 0 && (
        <span className="text-[10px] font-mono text-slate-400 border-l border-slate-700 pl-2">
          {currentIndex + 1}/{sentences.length}
        </span>
      )}
    </div>
  );
}
