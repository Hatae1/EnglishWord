
import React from 'react';
import { WordData } from '../types';

interface WordCardProps {
  data: WordData;
  isPronouncing: boolean;
  isEvaluated: boolean;
  onPronounce: (word: string) => void;
  onMarkCorrect: () => void;
  onMarkIncorrect: () => void;
}

const WordCard: React.FC<WordCardProps> = ({ 
  data, 
  isPronouncing, 
  isEvaluated, 
  onPronounce, 
  onMarkCorrect, 
  onMarkIncorrect 
}) => {
  return (
    <div 
      className={`
        relative group p-6 bg-white rounded-2xl shadow-sm border border-slate-200 
        transition-all duration-300 flex flex-col h-full min-h-[240px]
        ${isPronouncing ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}
        ${isEvaluated ? 'opacity-60 bg-slate-50' : 'hover:shadow-xl hover:-translate-y-1 hover:border-indigo-400'}
      `}
    >
      <div 
        onClick={() => onPronounce(data.word)}
        className="flex justify-between items-start mb-4 cursor-pointer"
      >
        <h3 className="text-3xl font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors lowercase">
          {data.word}
        </h3>
        <div className={`
          flex items-center justify-center w-10 h-10 rounded-full transition-all
          ${isPronouncing ? 'bg-indigo-500 text-white animate-pulse shadow-lg shadow-indigo-200' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500'}
        `}>
          <i className={`fa-solid ${isPronouncing ? 'fa-volume-high' : 'fa-volume-low'} text-sm`}></i>
        </div>
      </div>
      
      <div 
        onClick={() => onPronounce(data.word)}
        className="mb-6 flex-grow cursor-pointer"
      >
        <p className="text-sm font-medium text-slate-400 leading-relaxed italic">
          &ldquo;{data.example}&rdquo;
        </p>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-center space-x-4">
        <button
          onClick={(e) => { e.stopPropagation(); onMarkIncorrect(); }}
          disabled={isEvaluated}
          className={`
            w-10 h-10 rounded-full flex items-center justify-center transition-all
            ${isEvaluated ? 'bg-slate-100 text-slate-300' : 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white hover:scale-110'}
          `}
          title="Don't know yet"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onMarkCorrect(); }}
          disabled={isEvaluated}
          className={`
            w-10 h-10 rounded-full flex items-center justify-center transition-all
            ${isEvaluated ? 'bg-slate-100 text-slate-300' : 'bg-green-50 text-green-500 hover:bg-green-500 hover:text-white hover:scale-110'}
          `}
          title="I know this word!"
        >
          <i className="fa-solid fa-check"></i>
        </button>
      </div>

      {isPronouncing && (
        <div className="absolute top-2 right-2">
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
        </div>
      )}
    </div>
  );
};

export default WordCard;
