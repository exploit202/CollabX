import React from 'react';
import { Check } from 'lucide-react';

interface StepProgressProps {
  steps: string[];
  currentStep: number; // 0-indexed
  className?: string;
}

/**
 * Horizontal progress stepper for multi-step flows (creator signup, etc).
 * Purely presentational - the parent owns step state.
 */
export const StepProgress: React.FC<StepProgressProps> = ({ steps, currentStep, className = '' }) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center">
        {steps.map((label, i) => {
          const isComplete = i < currentStep;
          const isActive = i === currentStep;
          return (
            <React.Fragment key={label}>
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-all ${
                    isComplete
                      ? 'bg-gradient-to-tr from-[#EC4899] to-[#8B5CF6] text-white'
                      : isActive
                        ? 'bg-white text-pink-600 border-2 border-[#EC4899] shadow-sm'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  {isComplete ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span
                  className={`text-[9px] font-semibold text-center max-w-[64px] leading-tight hidden sm:block ${
                    isActive ? 'text-slate-900' : isComplete ? 'text-slate-600' : 'text-slate-400'
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-1 rounded-full transition-all ${
                    i < currentStep ? 'bg-gradient-to-r from-[#EC4899] to-[#8B5CF6]' : 'bg-slate-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
