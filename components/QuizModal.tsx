
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
    
    setTimeout(() => {
      onAnswer(isCorrect);
    }, 2500);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      {/* Parchment Container */}
      <div className="bg-[#f5e6ca] text-stone-900 rounded-sm max-w-lg w-full shadow-2xl relative font-serif border-8 border-double border-[#8b5cf6] md:border-yellow-800">
        
        {/* Header */}
        <div className="bg-[#e7d5b5] px-6 py-4 border-b border-[#d4c3a3] flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold uppercase tracking-widest text-red-900 flex items-center gap-2">
               Senate Inquiry
            </h2>
          </div>
          <button onClick={onClose} className="text-stone-500 hover:text-red-900 text-3xl font-bold leading-none">&times;</button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          {loading ? (
            <div className="flex flex-col items-center py-10 gap-4">
              <div className="w-12 h-12 border-4 border-red-800 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-stone-600 font-bold animate-pulse uppercase tracking-wide">Scribes are writing...</p>
            </div>
          ) : question ? (
            <div>
              <div className="mb-4 text-center">
                 <span className="inline-block border-b-2 border-red-900/30 text-red-900 font-bold uppercase tracking-widest text-xs py-1">{question.topic}</span>
              </div>
              
              <h3 className="text-lg md:text-xl font-medium mb-8 leading-relaxed text-center font-serif text-stone-800">
                "{question.question}"
              </h3>
              
              <div className="grid gap-3">
                {question.options.map((option, idx) => {
                  let btnClass = "bg-[#e7d5b5] hover:bg-[#d4c3a3] border-[#d4c3a3] text-stone-800";
                  
                  if (showResult) {
                    if (idx === question.correctIndex) {
                      btnClass = "bg-green-700 border-green-800 text-white";
                    } else if (idx === selectedOption) {
                      btnClass = "bg-red-700 border-red-800 text-white";
                    } else {
                      btnClass = "opacity-50 grayscale";
                    }
                  } else if (selectedOption === idx) {
                    btnClass = "bg-stone-800 text-white";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionClick(idx)}
                      disabled={showResult}
                      className={`
                        w-full text-left px-4 py-4 rounded-sm border transition-all font-medium relative shadow-sm
                        ${btnClass}
                      `}
                    >
                       <div className="relative z-10 flex items-center justify-between">
                         <span className="text-base md:text-lg">{option}</span>
                         {showResult && idx === question.correctIndex && <span>✅</span>}
                         {showResult && idx === selectedOption && idx !== question.correctIndex && <span>❌</span>}
                       </div>
                    </button>
                  );
                })}
              </div>

              {showResult && (
                <div className={`mt-6 p-4 border-2 ${selectedOption === question.correctIndex ? 'bg-green-100 border-green-600 text-green-900' : 'bg-red-100 border-red-600 text-red-900'}`}>
                  <p className="font-bold mb-2 uppercase text-xs tracking-widest">{selectedOption === question.correctIndex ? "Correct Answer" : "Incorrect"}</p>
                  <p className="italic text-sm">{question.explanation}</p>
                </div>
              )}

            </div>
          ) : (
            <div className="text-center py-10 text-red-800 font-bold">The scroll was lost. Try again.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizModal;
