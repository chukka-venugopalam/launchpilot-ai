'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { MemoryItem, Stage } from '@/types';
import { STAGES } from '@/types';
import { Clock, Brain } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

interface MemoryPanelProps {
  items: MemoryItem[];
  currentStage: Stage;
}

export function MemoryPanel({ items, currentStage }: MemoryPanelProps) {
  const stageMap = new Map(STAGES.map((s) => [s.id, s]));

  return (
    <div className="glass rounded-xl p-5 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Agent Memory
        </h3>
      </div>

      <ScrollArea className="flex-1 -mx-2 px-2" orientation="vertical">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <p className="text-sm text-muted-foreground">No memories yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              The agent will record its thoughts here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {items.map((item, index) => {
                const stageConfig = stageMap.get(item.stage);
                const isLatest = index === items.length - 1;

                return (
                  <motion.div
                    key={item.timestamp + item.stage}
                    initial={{ opacity: 0, x: -20, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className={cn(
                      'rounded-lg p-3 border transition-all duration-300',
                      isLatest
                        ? 'bg-primary/5 border-primary/30'
                        : 'bg-secondary/30 border-border/50'
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs">{stageConfig?.icon || '📝'}</span>
                      <span
                        className={cn(
                          'text-xs font-medium',
                          isLatest ? 'text-primary' : 'text-muted-foreground'
                        )}
                      >
                        {stageConfig?.label || item.stage}
                      </span>
                      {isLatest && (
                        <motion.span
                          animate={{ opacity: [1, 0.3, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="w-1.5 h-1.5 rounded-full bg-primary"
                        />
                      )}
                    </div>
                    <p className="text-xs text-foreground/80 leading-relaxed line-clamp-3">
                      {item.content}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
