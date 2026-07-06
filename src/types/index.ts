export type Stage =
  | 'idle'
  | 'observe'
  | 'think'
  | 'plan'
  | 'research'
  | 'execute'
  | 'reflect'
  | 'finish'
  | 'error';

export interface StageConfig {
  id: Stage;
  label: string;
  description: string;
  icon: string;
}

export const STAGES: StageConfig[] = [
  { id: 'observe', label: 'Observe', description: 'Understanding your goal...', icon: '👁️' },
  { id: 'think', label: 'Think', description: 'Analyzing requirements...', icon: '🧠' },
  { id: 'plan', label: 'Plan', description: 'Creating task plan...', icon: '📋' },
  { id: 'research', label: 'Research', description: 'Researching market...', icon: '🔍' },
  { id: 'execute', label: 'Execute', description: 'Generating outputs...', icon: '⚡' },
  { id: 'reflect', label: 'Reflect', description: 'Reviewing and improving...', icon: '🔄' },
  { id: 'finish', label: 'Finish', description: 'Finalizing report...', icon: '✨' },
];

export interface MemoryItem {
  stage: Stage;
  content: string;
  timestamp: number;
}

export interface AgentState {
  stage: Stage;
  progress: number;
  currentAction: string;
  memory: MemoryItem[];
  error: string | null;
}

export interface Section {
  key: keyof Report;
  label: string;
  icon: string;
}

export const REPORT_SECTIONS: Section[] = [
  { key: 'executiveSummary', label: 'Executive Summary', icon: '📊' },
  { key: 'taskPlan', label: 'Task Plan', icon: '📋' },
  { key: 'marketResearch', label: 'Market Research', icon: '🔍' },
  { key: 'competitorAnalysis', label: 'Competitor Analysis', icon: '🏢' },
  { key: 'swot', label: 'SWOT Analysis', icon: '⚖️' },
  { key: 'businessStrategy', label: 'Business Strategy', icon: '🎯' },
  { key: 'brandName', label: 'Brand Name', icon: '🏷️' },
  { key: 'tagline', label: 'Tagline', icon: '💬' },
  { key: 'landingPageCopy', label: 'Landing Page Copy', icon: '📄' },
  { key: 'marketingPlan', label: 'Marketing Plan', icon: '📢' },
  { key: 'launchChecklist', label: 'Launch Checklist', icon: '✅' },
  { key: 'selfEvaluation', label: 'Self Evaluation', icon: '📝' },
  { key: 'improvedFinalVersion', label: 'Improved Final Version', icon: '⭐' },
];

export interface Report {
  id: string;
  goal: string;
  timestamp: number;
  executiveSummary: string;
  taskPlan: string;
  marketResearch: string;
  competitorAnalysis: string;
  swot: string;
  businessStrategy: string;
  brandName: string;
  tagline: string;
  landingPageCopy: string;
  marketingPlan: string;
  launchChecklist: string;
  selfEvaluation: string;
  improvedFinalVersion: string;
}

export interface ProjectSummary {
  id: string;
  goal: string;
  timestamp: number;
  brandName: string;
  tagline: string;
}
