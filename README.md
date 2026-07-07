# 🚀 LaunchPilot AI

An autonomous AI agent that transforms a single business goal into a complete launch strategy through a transparent seven-stage planning, research, execution, and reflection workflow.
Built for the **Kaggle Vibe Coding Agents Capstone Project**.

## 🌐 Live Demo

**Application:** https://launchpilot-ai-kappa.vercel.app/

**GitHub:** https://github.com/chukka-venugopalam/launchpilot-ai

## ✨ Features

- **Autonomous Agent Pipeline** — Watch as the AI independently works through Observe → Think → Plan → Research → Execute → Reflect → Finish
- **Real-time Streaming** — See each stage generate content live with animated transitions
- **Comprehensive Reports** — Executive Summary, Market Research, Competitor Analysis, SWOT, Brand Identity, Marketing Plan, Launch Checklist, and more
- **Self-Improvement** — The agent reviews its own work and produces an improved final version
- **Project History** — All previous projects are saved to browser local storage
- **Dark Theme** — Modern glassmorphism UI with smooth animations
- **Export** — Download reports as Markdown

## 🛠️ Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **Framer Motion**
- **Google Gemini 2.0 Flash API**

## 🚦 Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/)
- A [Gemini API key](https://aistudio.google.com/apikey)

## 📦 Installation

1. **Clone or download the project**

2. **Install dependencies**

```bash
npm install
```

3. **Set up your environment variables**

Copy `.env.example` to `.env.local` and add your Gemini API key:

```bash
cp .env.example .env.local
```

Edit `.env.local` and replace `your_gemini_api_key_here` with your actual key:

```
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSy...
```

4. **Run the development server**

```bash
npm run dev
```

5. **Open the app**

Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 How It Works

1. **Enter a Goal** — Type any business goal (e.g., "Start an AI fitness coaching startup")
2. **Press Launch** — The autonomous agent begins working through its pipeline
3. **Watch Live** — See each stage animate as the AI processes your goal
4. **Review Results** — Browse the complete report with 13 sections
5. **Export** — Download the report as Markdown for further use

### Agent Stages

| Stage | What Happens |
|-------|-------------|
| 👁️ Observe | Understands the goal deeply |
| 🧠 Think | Analyzes requirements |
| 📋 Plan | Creates task plan |
| 🔍 Research | Researches market & competitors |
| ⚡ Execute | Generates all outputs |
| 🔄 Reflect | Self-evaluates and improves |
| ✨ Finish | Produces final report |

## 📋 Report Sections

- Executive Summary
- Task Plan
- Market Research
- Competitor Analysis
- SWOT Analysis
- Business Strategy
- Brand Name
- Tagline
- Landing Page Copy
- Marketing Plan
- Launch Checklist
- Self Evaluation
- Improved Final Version

## 📁 Project Structure

```
├── src/
│   ├── app/
│   │   ├── globals.css      # Global styles, dark theme, glassmorphism
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Main page
│   ├── components/
│   │   ├── Dashboard.tsx    # Main dashboard with agent orchestration
│   │   ├── GoalInput.tsx    # Goal input form with suggestions
│   │   ├── MemoryPanel.tsx  # Agent memory/context display
│   │   ├── ReportViewer.tsx # Report viewer with section navigation
│   │   ├── StageVisualizer.tsx # Animated pipeline visualizer
│   │   └── ui/
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── scroll-area.tsx
│   │       └── separator.tsx
│   ├── lib/
│   │   ├── agent.ts         # Agent orchestration engine
│   │   ├── gemini.ts        # Gemini API client
│   │   └── utils.ts         # Utility functions
│   └── types/
│       └── index.ts         # TypeScript types & constants
├── .env.example
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tsconfig.json
└── README.md
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_GEMINI_API_KEY` | Your Google Gemini API key |

Get your API key: [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)

## 🧪 Running for Development

```bash
npm run dev
```

## 🏗️ Building for Production

```bash
npm run build
npm start
```

## 🤝 Contributing

This is a hackathon project for the Kaggle Vibe Coding Agents Capstone. Contributions, issues, and feature requests are welcome!

## 🎬 Demo Mode

LaunchPilot AI includes a built-in Demo Mode to ensure the complete autonomous workflow can be explored even when a live Gemini API key is unavailable or API quota limits are reached.

When a valid Gemini API key is configured, the application uses the Gemini API to generate responses.

If the API is unavailable, the application automatically switches to Demo Mode and demonstrates the full seven-stage autonomous agent workflow using a predefined business strategy report. This keeps the interface, execution flow, and user experience fully functional for evaluation and demonstration purposes.

## 📄 License

MIT
