
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { WordData, PronunciationState } from './types';
import { fetchRandomWords, speakWord } from './services/geminiService';
import WordCard from './components/WordCard';
import LoadingSkeleton from './components/LoadingSkeleton';

const App: React.FC = () => {
  const [words, setWords] = useState<WordData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pronunciation, setPronunciation] = useState<PronunciationState>({ word: null, loading: false });
  
  // Score tracking
  const [score, setScore] = useState<number>(0);
  const [totalSeen, setTotalSeen] = useState<number>(0);
  // To track which words in the CURRENT batch have been clicked to avoid double-counting
  const [evaluatedWords, setEvaluatedWords] = useState<Set<string>>(new Set());

  const audioContextRef = useRef<AudioContext | null>(null);

  const loadWords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchRandomWords();
      setWords(data);
      setTotalSeen(prev => prev + 5);
      setEvaluatedWords(new Set()); // Reset evaluated status for new batch
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch words. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWords();
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const handlePronounce = async (word: string) => {
    if (pronunciation.loading) return;

    if (audioContextRef.current?.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    setPronunciation({ word, loading: true });
    try {
      if (audioContextRef.current) {
        await speakWord(word, audioContextRef.current);
      }
    } catch (err) {
      console.error("Pronunciation error:", err);
    } finally {
      setTimeout(() => {
        setPronunciation({ word: null, loading: false });
      }, 800);
    }
  };

  const handleMarkCorrect = (word: string) => {
    if (!evaluatedWords.has(word)) {
      setScore(prev => prev + 1);
      setEvaluatedWords(prev => new Set(prev).add(word));
    }
  };

  const handleMarkIncorrect = (word: string) => {
    if (!evaluatedWords.has(word)) {
      setEvaluatedWords(prev => new Set(prev).add(word));
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-4 sm:px-6 relative">
      {/* Fixed Scoreboard */}
      <div className="fixed top-6 right-6 z-50">
        <div className="bg-white/80 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl px-6 py-3 flex items-center space-x-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Progress</span>
            <div className="text-2xl font-black text-slate-800">
              <span className="text-indigo-600">{score}</span>
              <span className="mx-1 text-slate-300">/</span>
              <span>{totalSeen}</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <i className="fa-solid fa-trophy"></i>
          </div>
        </div>
      </div>

      {/* Header Section */}
      <div className="max-w-7xl w-full text-center mb-12">
        <div className="inline-flex items-center justify-center space-x-2 mb-4 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full font-semibold text-sm tracking-wide uppercase">
          <i className="fa-solid fa-graduation-cap"></i>
          <span>Elementary School Grade 3</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 mb-4 tracking-tight">
          Word<span className="text-indigo-600">Pop</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          Tap to hear. Mark <i className="fa-solid fa-check text-green-500"></i> if you know it!
        </p>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl w-full flex-grow">
        {error ? (
          <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-2xl text-center flex flex-col items-center gap-4">
            <i className="fa-solid fa-circle-exclamation text-3xl"></i>
            <p className="font-medium">{error}</p>
            <button 
              onClick={loadWords}
              className="px-6 py-2 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : loading ? (
          <LoadingSkeleton />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {words.map((item, index) => (
              <WordCard 
                key={`${item.word}-${index}`}
                data={item}
                isPronouncing={pronunciation.word === item.word}
                isEvaluated={evaluatedWords.has(item.word)}
                onPronounce={handlePronounce}
                onMarkCorrect={() => handleMarkCorrect(item.word)}
                onMarkIncorrect={() => handleMarkIncorrect(item.word)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer / Reset Action */}
      <footer className="mt-16 w-full flex justify-center sticky bottom-8">
        <button
          onClick={loadWords}
          disabled={loading}
          className={`
            flex items-center space-x-3 px-8 py-4 bg-slate-900 text-white rounded-full 
            shadow-2xl shadow-slate-300 transition-all duration-300 transform
            hover:scale-105 active:scale-95 hover:bg-indigo-600
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {loading ? (
            <i className="fa-solid fa-spinner animate-spin"></i>
          ) : (
            <i className="fa-solid fa-rotate"></i>
          )}
          <span className="font-bold text-lg">Gimme New Words</span>
        </button>
      </footer>

      {/* Background Decor */}
      <div className="fixed top-0 left-0 -z-10 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-200 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-blue-100 rounded-full blur-[100px]"></div>
      </div>
    </div>
  );
};

export default App;
