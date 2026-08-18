# 🚀 AWS Serverless AI Chatbot

A full-stack **AWS Serverless AI Chatbot** built with **React 18**, **Node.js 20.x**, **AWS Lambda**, **Amazon API Gateway**, **Amazon DynamoDB**, **JWT Custom Authorizer**, **Voice STT/TTS**, **Document Attachment RAG**, **Live CloudWatch Telemetry**, and **OpenAI Response Streaming**.

![AWS Serverless Chatbot Architecture](https://img.shields.io/badge/AWS-Serverless-orange?style=for-the-badge&logo=amazon-aws)
![React](https://img.shields.io/badge/Frontend-React_18-blue?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Backend-Node.js_20.x-green?style=for-the-badge&logo=node.js)
![DynamoDB](https://img.shields.io/badge/Database-Amazon_DynamoDB-blue?style=for-the-badge&logo=amazon-dynamodb)
![JWT Auth](https://img.shields.io/badge/Security-JWT_Authorizer-emerald?style=for-the-badge&logo=json-web-tokens)

---

## 🌟 Key Features

1. **JWT Authentication & Security**:
   - User registration & login endpoints using **Bcrypt** password hashing inside AWS Lambda.
   - **Custom AWS Lambda Authorizer** for API Gateway HTTP API v2 verifying `Authorization: Bearer <token>` headers.
   - Guest session auto-login & 1-click Demo auto-fill option for instant testing.

2. **Conversation History in Amazon DynamoDB**:
   - Single-table design storing `ChatbotUsers`, `ChatbotConversations`, and `ChatbotMessages`.
   - Complete CRUD operations: List user sessions, fetch conversation message history, create sessions, delete sessions.
   - DynamoDB document client integration with offline persistence fallback.

3. **Real-Time Streaming Responses (SSE)**:
   - Server-Sent Events (SSE) streaming tokens from OpenAI API (`gpt-4o-mini`, `gpt-4o`, `gpt-3.5-turbo`).
   - Typewriter token rendering in React with syntax-highlighted code snippets, copy-to-clipboard, and stream cancellation.
   - **Resilient Fallback Streamer**: Runs out-of-the-box in 100% free **Serverless Simulation Mode** when no API key or quota exists.

4. **Document Attachment (RAG Context Support)**:
   - Supports uploading `.txt`, `.md`, `.json`, `.csv`, and `.pdf` files.
   - Document contents are parsed and injected into the prompt context for real-time document intelligence.

5. **Voice-to-Text & Text-to-Speech (STT / TTS)**:
   - Hands-free speech recognition input via Web Speech API.
   - 1-click audio playback for AI responses with SpeechSynthesis text-to-speech.

6. **1-Click Transcript Export**:
   - Export chat history into clean Markdown (`.md`) or structured JSON (`.json`) files.

7. **Live CloudWatch Terminal & Telemetry Viewer**:
   - Interactive visual dashboard mapping request pipelines: `React` ➔ `API Gateway` ➔ `Lambda Authorizer` ➔ `Lambda Chat Stream` ➔ `DynamoDB & OpenAI`.
   - **AWS CloudWatch Log Viewer**: Live terminal streaming simulated CloudWatch logs (`START`, `INFO`, `REPORT`, `END`) with duration & memory tracking.

8. **Infrastructure as Code (IaC)**:
   - `serverless.yml` for Serverless Framework deployment.
   - `template.yaml` for AWS SAM / CloudFormation deployment.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React, Glassmorphism Design Tokens |
| **Backend Compute** | Node.js 20.x, AWS Lambda Handlers, Express Local Simulator |
| **API Proxy** | Amazon API Gateway (HTTP API v2, Payload Format 2.0, SSE Chunking) |
| **Database** | Amazon DynamoDB (DocumentClient v3) |
| **Auth & Security** | JSON Web Tokens (JWT), Bcrypt, Lambda Custom Authorizer |
| **AI Engine** | OpenAI API (`gpt-4o-mini`, `gpt-4o`, `gpt-3.5-turbo`) + AWS Simulation Fallback |

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
Run the root script to install dependencies across both `backend` and `frontend`:
```bash
npm run install:all
```

### 2. Launch Local AWS Serverless Dev Server & React Frontend
```bash
npm run dev
```
- **React Frontend UI**: http://localhost:5173
- **Local AWS API Gateway Endpoint**: http://localhost:5001/api

---

## ☁️ Deployment to AWS Cloud

### Option A: Serverless Framework (`serverless.yml`)
```bash
npx serverless deploy --stage prod --region us-east-1
```

### Option B: AWS SAM (`template.yaml`)
```bash
sam build
sam deploy --guided
```

---

## 📁 Repository Structure

```
.
├── serverless.yml            # IaC: Serverless Framework definition
├── template.yaml            # IaC: AWS SAM template
├── package.json             # Root orchestrator scripts
├── README.md                # Documentation & Architecture guide
├── backend/
│   ├── server.js            # Local API Gateway & Lambda simulator
│   ├── handlers/
│   │   ├── auth.js          # Lambda Register & Login handler
│   │   ├── authorizer.js    # Lambda Custom JWT Authorizer
│   │   ├── chat.js          # Lambda SSE Chat Stream handler
│   │   └── history.js       # Lambda DynamoDB CRUD handler
│   └── services/
│       ├── authService.js   # Bcrypt & JWT signing/verification
│       ├── dynamoService.js # DynamoDB client & local fallback
│       └── openaiService.js # OpenAI SSE streaming generator
└── frontend/
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── components/
    │   │   ├── Header.jsx
    │   │   ├── Sidebar.jsx
    │   │   ├── ChatArea.jsx
    │   │   ├── ChatInput.jsx
    │   │   ├── ArchitectureDiagram.jsx
    │   │   ├── AuthModal.jsx
    │   │   └── SettingsModal.jsx
    │   └── utils/
    │       └── api.js
```
