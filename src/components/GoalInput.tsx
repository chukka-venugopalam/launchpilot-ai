'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Rocket, RotateCcw } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface GoalInputProps {
  onSubmit: (goal: string) => void;
  isRunning: boolean;
  onReset: () => void;
}

export function GoalInput({ onSubmit, isRunning, onReset }: GoalInputProps) {
  const [goal, setGoal] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = goal.trim();
    if (trimmed && !isRunning) {
      onSubmit(trimmed);
    }
  };

  const suggestions = [
    'Start an AI fitness coaching startup',
    'Launch a sustainable fashion brand',
    'Build a SaaS platform for remote teams',
    'Create a meal prep delivery service',
  ];

  return (
    <div className="glass-strong rounded-2xl p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/20">
          <Rocket className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">LaunchPilot AI</h2>
          <p className="text-xs text-muted-foreground">Autonomous Business Launch Agent</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Input
            ref={inputRef}
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Enter your business goal..."
            disabled={isRunning}
            className="pr-24 h-12 text-base bg-background/30 border-primary/20 focus:border-primary/50"
          />
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex gap-1">
            {isRunning ? (
              <Button type="button" variant="destructive" size="sm" onClick={onReset}>
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </Button>
            ) : (
              <Button type="submit" variant="primary" size="sm" disabled={!goal.trim()}>
                <Sparkles className="w-4 h-4 mr-1" />
                Launch
              </Button>
            )}
          </div>
        </div>
      </form>

      {!isRunning && (
        <div className="mt-4">
          <p className="text-xs text-muted-foreground mb-2">Try an example:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  setGoal(suggestion);
                  inputRef.current?.focus();
                }}
                className="text-xs px-3 py-1.5 rounded-full border border-border bg-secondary/30 text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {isRunning && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20"
        >
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="w-4 h-4 text-primary" />
            </motion.div>
            <p className="text-xs text-primary">
              Agent is analyzing your goal autonomously...
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
