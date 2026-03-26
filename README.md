# NextFlow Clone - AI Workflow Builder

A powerful, visual node-based workflow editor built with Next.js, React Flow, and Zustand. This application allows users to build, connect, and execute complex workflows involving video processing, image generation, text manipulation, and LLM inferences in a visual canvas interface.

## 🚀 Features

- **Visual Node Editor:** Drag-and-drop interface powered by React Flow.
- **Node Context Types:**
  - **Video Node:** Upload videos seamlessly via Transloadit API (with progress bars and local rendering).
  - **Frame Node:** Extract specific visual frames securely from connected Video nodes.
  - **LLM Node:** Run prompts using OpenAI or Groq models directly in the canvas.
  - **Text Node:** Input text components to pass contextual data to LLMs or other components.
  - **Image Node:** Handle rendering and passing of visual image mapping parameters.
- **Node Execution:** Run nodes individually or trigger selected execution flows directly from the UI.
- **Real-Time State Mapping:** Connect standard nodes securely handling explicit payload object mappings via Zustand.

## 🛠 Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router, API routes)
- **Visual Canvas:** [React Flow](https://reactflow.dev/) (Interactive node graphs)
- **State Management:** [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & Lucide React (Icons)
- **File Upload/Media:** [Transloadit SDK](https://transloadit.com/)
- **AI Integrations:** OpenAI, Groq (Vercel AI SDK)

## 📦 Local Setup & Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Hraday04/nextflow-clone.git
cd nextflow-clone
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Variables

Create a root `.env.local` file. **Never commit this file to version control.**

```env
# --- AI Providers ---
# Get this from https://platform.openai.com/
OPENAI_API_KEY="sk-your-openai-api-key"

# Get this from https://console.groq.com/
GROQ_API_KEY="gsk_your_groq_api_key"

# --- Transloadit (Media Uploading) ---
# Get this from https://transloadit.com/
TRANSLOADIT_AUTH_KEY="your_auth_key"
TRANSLOADIT_AUTH_SECRET="your_auth_secret"
```

### 4. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧩 Usage Guide

1. **Adding Nodes:** Use the sidebar or right-click context menu (if configured) to drop new nodes onto the canvas (Text, Video, Frame, LLM, Image).
2. **Connecting Nodes:** Drag lines from a node's output handle (usually bottom/right) to another node's input handle (top/left).
3. **Execution:**
   - Click the "Play" icon on an individual node (e.g., LLM Node) to execute just that node.
   - Outputs will show standard visual animations (yellow pulsing = running, green = success, red = failed).
4. **Processing Video:** Drop a Video Node, click `upload`, and connect it to a `Frame Node` to capture and generate still images for standard context usage!

## 🔐 Security Note

Please ensure you **never commit actual API keys** directly into your files (e.g., markdown backups, setup instructions). GitHub Push Protection is enabled and will block commits featuring real credentials.

Always use `.env.local` for local development, which is ignored via `.gitignore`.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# nextflow-clone-project
