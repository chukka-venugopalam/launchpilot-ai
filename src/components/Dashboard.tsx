'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StageVisualizer } from './StageVisualizer';
import { MemoryPanel } from './MemoryPanel';
import { ReportViewer } from './ReportViewer';
import { GoalInput } from './GoalInput';
import { runAgent } from '@/lib/agent';
import type { Stage, MemoryItem, Report, ProjectSummary } from '@/types';
import { cn } from '@/lib/utils';
import { History, Trash2, Clock, Menu, X, ChevronRight, BarChart3 } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';

const STORAGE_KEY = 'launchpilot-projects';

function loadProjects(): ProjectSummary[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveProjects(projects: ProjectSummary[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch {}
}

export function Dashboard() {
  const [stage, setStage] = useState<Stage>('idle');
  const [progress, setProgress] = useState(0);
  const [currentAction, setCurrentAction] = useState('');
  const [memory, setMemory] = useState<MemoryItem[]>([]);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [streamContent, setStreamContent] = useState('');
  const [previousProjects, setPreviousProjects] = useState<ProjectSummary[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showMobilePanel, setShowMobilePanel] = useState<'pipeline' | 'memory' | 'report'>('report');

  useEffect(() => {
    setPreviousProjects(loadProjects());
  }, []);

  const handleStream = useCallback((text: string) => {
    setStreamContent((prev) => prev + text);
  }, []);

  const handleStart = useCallback(async (goal: string) => {
    setIsRunning(true);
    setStage('observe');
    setProgress(0);
    setCurrentAction('');
    setMemory([]);
    setReport(null);
    setError(null);
    setStreamContent('');
    setShowHistory(false);

    await runAgent(goal, {
      onStageChange: (newStage) => {
        setStage(newStage);
        if (newStage === 'finish') {
          setCurrentAction('Finalizing report...');
        }
      },
      onProgress: setProgress,
      onAction: setCurrentAction,
      onMemory: (item) => {
        setMemory((prev) => [...prev, item]);
      },
      onStream: handleStream,
      onError: (err) => {
        setError(err);
        setStage('error');
        setIsRunning(false);
      },
      onComplete: (newReport) => {
        setReport(newReport);
        setIsRunning(false);
        setStage('finish');
        setProgress(100);
        setCurrentAction('Report complete!');

        // Save to history
        setPreviousProjects((prev) => {
          const updated = [
            {
              id: newReport.id,
              goal: newReport.goal,
              timestamp: newReport.timestamp,
              brandName: newReport.brandName,
              tagline: newReport.tagline,
            },
            ...prev,
          ].slice(0, 20);
          saveProjects(updated);
          return updated;
        });
      },
    });
  }, [handleStream]);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setStage('idle');
    setProgress(0);
    setCurrentAction('');
    setMemory([]);
    setReport(null);
    setError(null);
    setStreamContent('');
  }, []);

  const handleLoadProject = useCallback((summary: ProjectSummary) => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const projects = JSON.parse(data);
        // We need the full report data; store it in a separate key
        const reportData = localStorage.getItem(`launchpilot-report-${summary.id}`);
        if (reportData) {
          const fullReport = JSON.parse(reportData) as Report;
          setReport(fullReport);
          setStage('finish');
          setProgress(100);
          setShowHistory(false);
        }
      }
    } catch {}
  }, []);

  const handleDeleteProject = useCallback((id: string) => {
    setPreviousProjects((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      saveProjects(updated);
      return updated;
    });
    localStorage.removeItem(`launchpilot-report-${id}`);
  }, []);

  // Save report to localStorage when complete
  useEffect(() => {
    if (report) {
      try {
        localStorage.setItem(`launchpilot-report-${report.id}`, JSON.stringify(report));
      } catch {}
    }
  }, [report]);

  return (
    <div className="min-h-screen bg-background bg-grid">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 glass-strong">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <BarChart3 className="w-5 h-5 text-primary" />
            </motion.div>
            <span className="text-sm font-semibold text-foreground">LaunchPilot AI</span>
            <Badge variant="primary" className="text-[10px]">
              v1.0
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="text-xs"
            >
              <History className="w-3.5 h-3.5 mr-1.5" />
              History
              {previousProjects.length > 0 && (
                <span className="ml-1.5 text-muted-foreground">({previousProjects.length})</span>
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Goal Input */}
        <div className="mb-6">
          <GoalInput onSubmit={handleStart} isRunning={isRunning} onReset={handleReset} />
        </div>

        {/* Error state */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/30"
            >
              <p className="text-sm text-destructive font-medium">Error</p>
              <p className="text-xs text-destructive/80 mt-1">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress bar */}
        {isRunning && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">
                {currentAction || 'Processing...'}
              </span>
              <span className="text-xs text-primary font-mono">{progress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-primary"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        )}

        {/* Mobile panel tabs */}
        <div className="flex md:hidden gap-1 mb-4">
          {(['pipeline', 'memory', 'report'] as const).map((panel) => (
            <button
              key={panel}
              onClick={() => setShowMobilePanel(panel)}
              className={cn(
                'flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all',
                showMobilePanel === panel
                  ? 'bg-primary/10 text-primary border border-primary/30'
                  : 'bg-secondary/30 text-muted-foreground border border-border/50'
              )}
            >
              {panel === 'pipeline' ? 'Pipeline' : panel === 'memory' ? 'Memory' : 'Report'}
            </button>
          ))}
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Pipeline & Memory - Left column (hidden on mobile unless selected) */}
          <div className={cn(
            'md:col-span-4 space-y-6',
            'hidden md:block',
            showMobilePanel === 'pipeline' && 'block md:block',
            showMobilePanel === 'memory' && 'block md:block',
          )}>
            {/* Only show the active mobile panel */}
            <div className={cn(
              'md:block',
              showMobilePanel !== 'pipeline' && 'hidden md:block'
            )}>
              <StageVisualizer currentStage={stage} />
            </div>
            <div className={cn(
              'md:block',
              showMobilePanel !== 'memory' && 'hidden md:block'
            )}>
              <div className="h-[300px] md:h-[400px]">
                <MemoryPanel items={memory} currentStage={stage} />
              </div>
            </div>
          </div>

          {/* Report - Right column */}
          <div className={cn(
            'md:col-span-8',
            'md:block',
            showMobilePanel === 'report' && 'block md:block',
            showMobilePanel !== 'report' && 'hidden md:block'
          )}>
            <div className="glass rounded-xl p-5 h-full min-h-[500px]">
              <ReportViewer
                report={report}
                isStreaming={isRunning}
                streamContent={streamContent}
              />
            </div>
          </div>
        </div>

        {/* History sidebar */}
        <AnimatePresence>
          {showHistory && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40"
                onClick={() => setShowHistory(false)}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 bottom-0 w-full max-w-sm z-50 glass-strong border-l border-border/50"
              >
                <div className="p-4 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold">Project History</h2>
                    <Button variant="ghost" size="icon" onClick={() => setShowHistory(false)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <ScrollArea orientation="vertical" className="flex-1 -mx-2 px-2">
                    {previousProjects.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-32 text-center">
                        <p className="text-sm text-muted-foreground">No projects yet</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">
                          Your generated projects will appear here
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {previousProjects.map((project) => (
                          <motion.div
                            key={project.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="glass rounded-lg p-3 group cursor-pointer hover:bg-primary/5 transition-all"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div
                                className="flex-1 min-w-0"
                                onClick={() => handleLoadProject(project)}
                              >
                                <p className="text-sm font-medium text-foreground truncate">
                                  {project.goal}
                                </p>
                                {project.brandName && (
                                  <p className="text-xs text-primary mt-0.5">
                                    {project.brandName}
                                    {project.tagline && ` — ${project.tagline}`}
                                  </p>
                                )}
                                <div className="flex items-center gap-1 mt-1.5">
                                  <Clock className="w-3 h-3 text-muted-foreground" />
                                  <span className="text-[10px] text-muted-foreground">
                                    {new Date(project.timestamp).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteProject(project.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
