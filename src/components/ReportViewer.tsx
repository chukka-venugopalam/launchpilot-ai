'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Report, Section } from '@/types';
import { REPORT_SECTIONS } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { FileText, Download, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

interface ReportViewerProps {
  report: Report | null;
  isStreaming: boolean;
  streamContent: string;
}

function renderMarkdown(text: string): React.ReactNode[] {
  if (!text) return [];
  
  const lines = text.split('\n');
  const nodes: React.ReactNode[] = [];
  let inList = false;
  let listItems: React.ReactNode[] = [];
  let keyCounter = 0;

  const flushList = () => {
    if (listItems.length > 0) {
      const key = `list-${keyCounter++}`;
      nodes.push(
        <ul key={key} className="space-y-1 my-2">
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  const renderInline = (line: string): React.ReactNode => {
    // Bold
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  for (const line of lines) {
    const trimmed = line.trim();
    
    // Headers
    if (trimmed.startsWith('### ')) {
      flushList();
      nodes.push(
        <h4 key={keyCounter++} className="text-sm font-semibold text-primary mt-4 mb-2">
          {renderInline(trimmed.slice(4))}
        </h4>
      );
      continue;
    }
    if (trimmed.startsWith('## ')) {
      flushList();
      nodes.push(
        <h3 key={keyCounter++} className="text-base font-semibold text-foreground mt-5 mb-2">
          {renderInline(trimmed.slice(3))}
        </h3>
      );
      continue;
    }
    if (trimmed.startsWith('# ')) {
      flushList();
      nodes.push(
        <h2 key={keyCounter++} className="text-lg font-bold text-foreground mt-5 mb-2">
          {renderInline(trimmed.slice(2))}
        </h2>
      );
      continue;
    }

    // Unordered list
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      inList = true;
      listItems.push(
        <li key={keyCounter++} className="text-sm text-foreground/80 leading-relaxed flex gap-2">
          <span className="text-primary mt-1.5 flex-shrink-0">•</span>
          <span>{renderInline(trimmed.slice(2))}</span>
        </li>
      );
      continue;
    }

    // Numbered list
    if (/^\d+\.\s/.test(trimmed)) {
      inList = true;
      const content = trimmed.replace(/^\d+\.\s*/, '');
      listItems.push(
        <li key={keyCounter++} className="text-sm text-foreground/80 leading-relaxed flex gap-2">
          <span className="text-primary mt-1.5 flex-shrink-0">•</span>
          <span>{renderInline(content)}</span>
        </li>
      );
      continue;
    }

    // Horizontal rule
    if (trimmed === '---' || trimmed === '___' || trimmed === '***') {
      flushList();
      nodes.push(<div key={keyCounter++} className="my-3 h-px bg-border" />);
      continue;
    }

    // Empty line
    if (!trimmed) {
      flushList();
      nodes.push(<div key={keyCounter++} className="h-2" />);
      continue;
    }

    // Regular paragraph
    flushList();
    nodes.push(
      <p key={keyCounter++} className="text-sm text-foreground/80 leading-relaxed mb-2">
        {renderInline(trimmed)}
      </p>
    );
  }

  flushList();
  return nodes;
}

function ReportSection({ section, content }: { section: Section; content: string }) {
  if (!content) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="glass rounded-xl p-5 mb-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{section.icon}</span>
        <h3 className="text-sm font-semibold text-foreground">{section.label}</h3>
      </div>
      <div className="space-y-1">
        {renderMarkdown(content)}
      </div>
    </motion.div>
  );
}

function exportAsMarkdown(report: Report): string {
  let md = `# LaunchPilot AI Report\n\n`;
  md += `**Goal:** ${report.goal}\n`;
  md += `**Generated:** ${new Date(report.timestamp).toLocaleString()}\n\n`;
  md += `---\n\n`;

  for (const section of REPORT_SECTIONS) {
    const content = report[section.key] as string;
    if (content) {
      md += `## ${section.icon} ${section.label}\n\n`;
      md += `${content}\n\n`;
      md += `---\n\n`;
    }
  }

  return md;
}

export function ReportViewer({ report, isStreaming, streamContent }: ReportViewerProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  if (!report && !isStreaming) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <FileText className="w-12 h-12 text-muted-foreground/40 mb-4" />
        <p className="text-sm text-muted-foreground">No report generated yet</p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          Enter a goal and run the agent to generate a report
        </p>
      </div>
    );
  }

  const handleExport = () => {
    if (!report) return;
    const md = exportAsMarkdown(report);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `launchpilot-${report.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Streaming content */}
      {isStreaming && streamContent && (
        <div className="glass rounded-xl p-5 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-primary"
            />
            <h3 className="text-sm font-semibold text-primary">Live Stream</h3>
          </div>
          <div className="max-h-64 overflow-y-auto space-y-1">
            {renderMarkdown(streamContent)}
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="inline-block w-2 h-4 bg-primary ml-0.5"
            />
          </div>
        </div>
      )}

      {/* Report content */}
      {report && (
        <>
          {/* Report header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Final Report</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Generated {new Date(report.timestamp).toLocaleString()}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-1.5" />
              Export
            </Button>
          </div>

          {/* Section navigation */}
          <ScrollArea orientation="horizontal" className="mb-4 -mx-1 px-1">
            <div className="flex gap-1.5 pb-2">
              {REPORT_SECTIONS.map((section) => {
                const content = report[section.key] as string;
                if (!content) return null;
                return (
                  <button
                    key={section.key}
                    onClick={() => setActiveSection(activeSection === section.key ? null : section.key)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap border',
                      activeSection === section.key
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-secondary/50 text-muted-foreground border-border hover:bg-secondary'
                    )}
                  >
                    <span>{section.icon}</span>
                    <span>{section.label}</span>
                  </button>
                );
              })}
            </div>
          </ScrollArea>

          {/* Report sections */}
          <ScrollArea orientation="vertical" className="flex-1 -mx-2 px-2">
            <AnimatePresence mode="popLayout">
              {REPORT_SECTIONS.map((section) => {
                const content = report[section.key] as string;
                if (!content) return null;
                if (activeSection && activeSection !== section.key) return null;
                return <ReportSection key={section.key} section={section} content={content} />;
              })}
            </AnimatePresence>
          </ScrollArea>
        </>
      )}
    </div>
  );
}
