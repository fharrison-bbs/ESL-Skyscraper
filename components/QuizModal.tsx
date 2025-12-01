/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { QuizQuestion } from '../types';

interface QuizModalProps {
  question: QuizQuestion | null;
  loading: boolean;
  onAnswer: (correct: boolean) => void;
  onClose: () => void;
}

const QuizModal: React.FC<QuizModalProps> = ({ question, loading, onAnswer, onClose }) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleOptionClick = (index: number) => {
    if (showResult) return;
    setSelectedOption(index);
    setShowResult(true);
    
    const isCorrect = index === question?.correctIndex;
    
    // Delay closing to show explanation
    setTimeout(() => {
      onAnswer(isCorrect);
    }, 2500);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-900 border-2 border-slate-600 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-slate-800 px-6 py-4 border-b border-slate-700 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-2xl">📜</span> Royal Scroll
            </h2>
            <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Complete the scroll for gold</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors text-2xl">×</button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center py-10 gap-4">
              <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-300 font-mono animate-pulse">Drafting paperwork...</p>
            </div>
          ) : question ? (
            <div>
              <div className="mb-2">
                 <span className="bg-indigo-900 text-indigo-200 text-xs px-2 py-1 rounded font-bold uppercase tracking-wide">{question.topic}</span>
              </div>
              <h3 className="text-lg md:text-xl text-white font-medium mb-6 leading-relaxed">{question.question}</h3>
              
              <div className="grid gap-3">
                {question.options.map((option, idx) => {
                  let btnClass = "bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-200";
                  
                  if (showResult) {
                    if (idx === question.correctIndex) {
                      btnClass = "bg-green-600 border-green-400 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)]";
                    } else if (idx === selectedOption) {
                      btnClass = "bg-red-600 border-red-400 text-white";
                    } else {
                      btnClass = "bg-slate-800 opacity-50";
                    }
                  } else if (selectedOption === idx) {
                    btnClass = "bg-cyan-700 border-cyan-500 text-white";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionClick(idx)}
                      disabled={showResult}
                      className={`
                        w-full text-left px-4 py-3 rounded-xl border-2 transition-all font-medium relative overflow-hidden group
                        ${btnClass}
                      `}
                    >
                       <div className="relative z-10 flex items-center justify-between">
                         <span>{option}</span>
                         {showResult && idx === question.correctIndex && <span className="text-lg">✅</span>}
                         {showResult && idx === selectedOption && idx !== question.correctIndex && <span className="text-lg">❌</span>}
                       </div>
                    </button>
                  );
                })}
              </div>

              {showResult && (
                <div className={`mt-6 p-3 rounded-lg border text-sm animate-fade-in ${selectedOption === question.correctIndex ? 'bg-green-900/30 border-green-800 text-green-200' : 'bg-red-900/30 border-red-800 text-red-200'}`}>
                  <p className="font-bold mb-1">{selectedOption === question.correctIndex ? "Correct!" : "Incorrect."}</p>
                  <p className="opacity-90">{question.explanation}</p>
                </div>
              )}

            </div>
          ) : (
            <div className="text-center py-10 text-red-400">Failed to load contract. Try again.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizModal;