import { generateStream, generateContent } from './gemini';
import type { Stage, MemoryItem, Report } from '@/types';
import { generateId } from './utils';

const SYSTEM_PROMPT = `You are LaunchPilot AI, an expert business launch strategist and startup advisor. You help entrepreneurs launch their ventures by providing comprehensive, actionable business intelligence.

For each stage of the process, follow these guidelines:

1. OBSERVE: Understand the user's goal deeply. Identify the industry, target market, core offering, and key challenges.
2. THINK: Analyze requirements including market needs, technical feasibility, resource requirements, and success metrics.
3. PLAN: Create a detailed task plan with specific, actionable steps broken into phases.
4. RESEARCH: Conduct thorough market research including industry trends, market size, growth potential, and key players.
5. EXECUTE: Generate concrete outputs including brand identity, strategy, and marketing materials.
6. REFLECT: Critically evaluate the output, identify gaps, and suggest improvements.
7. FINISH: Compile everything into a polished final report with an improved version.

Be specific, data-driven, and actionable. Avoid generic advice. Use concrete examples and realistic market data.`;

function buildStagePrompt(stage: Stage, goal: string, context: string): string {
  const prompts: Record<Stage, string> = {
    idle: '',
    error: '',
    observe: `**STAGE: OBSERVE**
Goal: "${goal}"

Analyze this goal deeply. Identify:
- Industry and sector
- Target audience
- Core value proposition
- Key challenges and opportunities
- Market context

Provide a thorough observation report.`,
    think: `**STAGE: THINK**
Goal: "${goal}"

Previous context:
${context}

Now analyze the requirements:
- What resources are needed?
- What are the success criteria?
- What are the key risks?
- What technical and business requirements exist?
- What regulatory or compliance considerations?

Provide a detailed thinking analysis.`,
    plan: `**STAGE: PLAN**
Goal: "${goal}"

Previous context:
${context}

Create a detailed task plan:
- Break the project into phases
- List specific tasks for each phase
- Estimate timelines and priorities
- Identify dependencies between tasks
- Define milestones and deliverables

Provide a comprehensive task plan.`,
    research: `**STAGE: RESEARCH**
Goal: "${goal}"

Previous context:
${context}

Conduct thorough market research:
- Industry trends and outlook
- Market size and growth potential
- Target demographics
- Current market landscape
- Key industry statistics and data
- Emerging technologies or trends

Also perform competitor analysis:
- Identify 3-5 key competitors
- Their strengths and weaknesses
- Market positioning
- Pricing strategies
- Unique selling propositions

Provide detailed market research and competitor analysis.`,
    execute: `**STAGE: EXECUTE**
Goal: "${goal}"

Previous context:
${context}

Now generate concrete business outputs:

1. **SWOT Analysis**: Strengths, Weaknesses, Opportunities, Threats
2. **Business Strategy**: Go-to-market strategy, revenue model, growth plan
3. **Brand Name**: 3-5 creative brand name suggestions with reasoning
4. **Tagline**: A compelling tagline that captures the brand essence
5. **Landing Page Copy**: Compelling copy for the landing page (headline, subheadline, features, CTA, social proof)
6. **Marketing Plan**: Channels, tactics, budget allocation, KPIs
7. **Launch Checklist**: Sequential launch steps with timelines

Be specific and creative. Provide real, usable content.`,
    reflect: `**STAGE: REFLECT**
Goal: "${goal}"

Previous context:
${context}

Critically evaluate all the outputs generated so far:
- What are the strengths?
- What gaps or weaknesses exist?
- What could be improved?
- Are there any missing elements?
- Is the strategy sound and actionable?
- What additional research or analysis would help?

Provide an honest self-evaluation with specific improvement suggestions.`,
    finish: `**STAGE: FINISH**
Goal: "${goal}"

Previous context:
${context}

Now compile the improved final version. Take the self-evaluation feedback and create an enhanced version of the entire business plan. Include:

1. **Executive Summary**: A compelling overview of the entire plan
2. **All previously generated sections** improved based on the reflection
3. **Final recommendations** and next steps

Make this the polished, final deliverable that the entrepreneur can immediately use.`,
  };

  return prompts[stage] || '';
}

const STAGE_ORDER: Stage[] = ['observe', 'think', 'plan', 'research', 'execute', 'reflect', 'finish'];

export interface AgentCallbacks {
  onStageChange: (stage: Stage) => void;
  onProgress: (progress: number) => void;
  onAction: (action: string) => void;
  onMemory: (item: MemoryItem) => void;
  onStream: (text: string) => void;
  onError: (error: string) => void;
  onComplete: (report: Report) => void;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runAgent(
  goal: string,
  callbacks: AgentCallbacks
): Promise<void> {
  const contextBuffer: string[] = [];
  const report: Report = {
    id: generateId(),
    goal,
    timestamp: Date.now(),
    executiveSummary: '',
    taskPlan: '',
    marketResearch: '',
    competitorAnalysis: '',
    swot: '',
    businessStrategy: '',
    brandName: '',
    tagline: '',
    landingPageCopy: '',
    marketingPlan: '',
    launchChecklist: '',
    selfEvaluation: '',
    improvedFinalVersion: '',
  };

  try {
    for (let i = 0; i < STAGE_ORDER.length; i++) {
      const stage = STAGE_ORDER[i];
      const progress = Math.round(((i + 1) / STAGE_ORDER.length) * 100);

      callbacks.onStageChange(stage);
      callbacks.onProgress(progress);
      callbacks.onAction(`Starting ${stage} stage...`);

      // Small delay so the UI can animate
      await sleep(800);

      const stagePrompt = buildStagePrompt(stage, goal, contextBuffer.join('\n\n'));
      const fullPrompt = `${SYSTEM_PROMPT}\n\n${stagePrompt}\n\nProvide your complete response for this stage.`;

      let accumulated = '';
      callbacks.onAction(`Running ${stage} stage...`);

      try {
        await generateStream(fullPrompt, {
          onChunk: (text) => {
            accumulated += text;
            callbacks.onStream(text);
          },
        });
      } catch (err) {
        // If streaming fails, try non-streaming
        accumulated = await generateContent(fullPrompt);
      }

      // Store in context for future stages
      contextBuffer.push(`=== ${stage.toUpperCase()} STAGE ===\n${accumulated}`);

      // Store the output in the appropriate report field
      const sectionKey = getSectionForStage(stage);
      if (sectionKey) {
        (report as any)[sectionKey] = accumulated;
      }

      // For execute stage, parse individual sections from the output
      if (stage === 'execute') {
        parseExecuteOutput(accumulated, report);
      }

      // For research stage, also try to extract competitor analysis
      if (stage === 'research') {
        parseCompetitorAnalysis(accumulated, report);
      }

      callbacks.onMemory({
        stage,
        content: accumulated.substring(0, 500) + (accumulated.length > 500 ? '...' : ''),
        timestamp: Date.now(),
      });

      callbacks.onAction(`Completed ${stage} stage`);
      await sleep(400);
    }

    // Generate executive summary from the finish stage output
    if (report.improvedFinalVersion && !report.executiveSummary) {
      // Extract first section as executive summary fallback
      const lines = report.improvedFinalVersion.split('\n').filter(l => l.trim());
      report.executiveSummary = lines.slice(0, 20).join('\n');
    }

    report.id = generateId();
    report.timestamp = Date.now();
    report.goal = goal;

    callbacks.onStageChange('finish');
    callbacks.onProgress(100);
    callbacks.onComplete(report);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    callbacks.onError(message);
  }
}

function parseCompetitorAnalysis(output: string, report: Report) {
  const patterns = ['Competitor Analysis', 'Competitor', 'competitors', 'Competitive'];
  for (const pattern of patterns) {
    const lines = output.split('\n');
    let startIdx = -1;
    let endIdx = lines.length;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (line.includes(pattern.toLowerCase()) &&
          (lines[i].includes('**') || lines[i].includes('#') || line.includes('competitor'))) {
        startIdx = i;
        break;
      }
    }

    if (startIdx !== -1) {
      // Find end of section - next header or major section
      for (let i = startIdx + 1; i < lines.length; i++) {
        if (lines[i].includes('**') && lines[i].trim() && 
            lines[i].toLowerCase() !== lines[startIdx].toLowerCase() &&
            !lines[i].toLowerCase().includes('competitor')) {
          endIdx = i;
          break;
        }
      }
      const extracted = lines.slice(startIdx, endIdx).join('\n').trim();
      if (extracted) {
        report.competitorAnalysis = extracted;
        break;
      }
    }
  }
}

function parseExecuteOutput(output: string, report: Report) {
  // Parse structured sections from the execute stage output
  const sections: { key: keyof Report; patterns: string[] }[] = [
    { key: 'swot', patterns: ['SWOT', 'SWOT Analysis', 'Strengths, Weaknesses'] },
    { key: 'businessStrategy', patterns: ['Business Strategy', 'Go-to-market', 'Revenue model'] },
    { key: 'brandName', patterns: ['Brand Name', 'Brand name', 'Branding'] },
    { key: 'tagline', patterns: ['Tagline', 'tagline'] },
    { key: 'landingPageCopy', patterns: ['Landing Page Copy', 'Landing Page', 'landing page'] },
    { key: 'marketingPlan', patterns: ['Marketing Plan', 'Marketing plan', 'Marketing strategy'] },
    { key: 'launchChecklist', patterns: ['Launch Checklist', 'Launch checklist', 'Checklist'] },
  ];

  for (const section of sections) {
    for (const pattern of section.patterns) {
      const extracted = extractSection(output, pattern, sections.map(s => s.patterns[0]));
      if (extracted) {
        (report as any)[section.key] = extracted;
        break;
      }
    }
  }
}

function extractSection(text: string, sectionName: string, otherSections: string[]): string | null {
  // Find the section header
  const lines = text.split('\n');
  let startIdx = -1;
  let endIdx = lines.length;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (line.includes(sectionName.toLowerCase()) && 
        (line.includes('**') || line.includes('#') || line.match(/^\d+\./) || line.match(/^[A-Z]/))) {
      startIdx = i;
      break;
    }
  }

  if (startIdx === -1) return null;

  // Find where this section ends (next section starts)
  for (let i = startIdx + 1; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    for (const other of otherSections) {
      if (other.toLowerCase() !== sectionName.toLowerCase() &&
          line.includes(other.toLowerCase()) &&
          (lines[i].includes('**') || lines[i].includes('#') || lines[i].match(/^\d+\./))) {
        endIdx = i;
        break;
      }
    }
    if (endIdx < lines.length) break;
  }

  return lines.slice(startIdx, endIdx).join('\n').trim();
}

function getSectionForStage(stage: Stage): keyof Report | null {
  switch (stage) {
    case 'plan':
      return 'taskPlan';
    case 'research':
      return 'marketResearch';
    case 'reflect':
      return 'selfEvaluation';
    case 'finish':
      return 'improvedFinalVersion';
    default:
      return null;
  }
}
