'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { STAGES } from '@/types';
import type { Stage } from '@/types';
import { Check, Loader2 } from 'lucide-react';

interface StageVisualizerProps {
  currentStage: Stage;
}

export function StageVisualizer({ currentStage }: StageVisualizerProps) {
  const isErrorState = currentStage === 'error';
  const currentIndex = isErrorState ? -1 : STAGES.findIndex((s) => s.id === currentStage);

  if (isErrorState) {
    return (
      <div className="glass rounded-xl p-5">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Agent Pipeline
        </h3>
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 bg-destructive/10 border border-destructive/30">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-destructive text-destructive-foreground">
            ✕
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-destructive">Execution Failed</p>
            <p className="text-xs text-destructive/70">An error interrupted the agent pipeline</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-5">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
        Agent Pipeline
      </h3>
      <div className="space-y-1">
        {STAGES.map((stage, index) => {
          const isActive = stage.id === currentStage;
          const isCompleted = currentIndex > index;
          const isPending = currentIndex < index;
          const isError = false;

          return (
            <div key={stage.id} className="relative">
              <motion.div
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-300',
                  isActive && !isError && 'bg-primary/10 border border-primary/30 glow-primary',
                  isActive && isError && 'bg-destructive/10 border border-destructive/30',
                  isCompleted && 'bg-primary/5 border border-primary/20',
                  isPending && 'opacity-40'
                )}
                animate={{
                  scale: isActive ? 1.02 : 1,
                }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                {/* Stage icon */}
                <div
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-full text-sm transition-all duration-300',
                    isCompleted && 'bg-primary text-primary-foreground',
                    isActive && !isError && 'bg-primary text-primary-foreground animate-pulse-glow',
                    isActive && isError && 'bg-destructive text-destructive-foreground',
                    isPending && 'bg-secondary text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : isActive ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>{stage.icon}</span>
                  )}
                </div>

                {/* Stage info */}
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      'text-sm font-medium transition-colors duration-300',
                      isActive && 'text-primary',
                      isCompleted && 'text-foreground',
                      isPending && 'text-muted-foreground'
                    )}
                  >
                    {stage.label}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {isCompleted ? 'Completed' : isActive ? stage.description : 'Waiting...'}
                  </p>
                </div>

                {/* Status indicator */}
                <div className="flex-shrink-0">
                  {isCompleted && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 rounded-full bg-primary"
                    />
                  )}
                  {isActive && (
                    <motion.div
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-2 h-2 rounded-full bg-primary"
                    />
                  )}
                </div>
              </motion.div>

              {/* Arrow between stages */}
              {index < STAGES.length - 1 && (
                <div className="flex justify-center py-0.5">
                  <div
                    className={cn(
                      'w-0.5 h-4 rounded-full transition-colors duration-500',
                      currentIndex > index ? 'bg-primary' : 'bg-border'
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
