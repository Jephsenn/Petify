# Petify E-Commerce Application Architecture

## Overview
A Shopify + Printify e-commerce application that allows users to upload pet photos, apply AI art styles, and purchase custom printed products.

## Technical Stack

### Frontend
- **Shopify Hydrogen** (React-based framework for custom storefronts)
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Shopify Storefront API** for cart and checkout

### Backend
- **Node.js 18+** with Express
- **TypeScript** for type safety
- **Axios** for HTTP requests
- **Multer** for file uploads
- **Sharp** for image processing

### External Services
- **OpenAI DALL-E** or **Stability AI** for image generation
- **Printify API** for product creation and fulfillment
- **Shopify Admin API** for order metadata
- **Local Approval Bot** at http://localhost:3000/checkpoint

## Architecture Diagram

```
┌─────────────────┐
│  Shopify Store  │
│   (Frontend)    │
└────────┬────────┘
         │
         ├─────────────────────┐
         │                     │
         ▼                     ▼
┌─────────────────┐   ┌───────────────┐
│   Node.js API   │   │  Approval Bot │
│    (Backend)    │◄──│  (localhost)  │
└────────┬────────┘   └───────────────┘
         │
         ├────────────┬─────────────┐
         │            │             │
         ▼            ▼             ▼
┌──────────────┐ ┌─────────┐ ┌──────────┐
│  AI Service  │ │Printify │ │ Storage  │
│  (DALL-E)    │ │   API   │ │  (Local) │
└──────────────┘ └─────────┘ └──────────┘
```

## Data Flow

1. **Upload & Style Selection**
   - User uploads pet photo via Shopify frontend
   - User selects AI art style/theme
   - Frontend sends to backend API

2. **AI Generation (with Approval)**
   - Backend submits checkpoint for approval
   - Upon approval, calls AI API to generate artwork
   - Stores generated image locally and returns URL
   - Implements retry logic for failures

3. **Product Creation (with Approval)**
   - Backend submits checkpoint for approval
   - Upon approval, creates Printify product with generated image
   - Returns product details to frontend

4. **Checkout & Order**
   - Frontend validates AI generation completed
   - Adds generated image and selections to order metadata
   - Shopify processes payment and fulfillment

## Folder Structure

```
petify/
├── backend/
│   ├── src/
│   │   ├── server.ts           # Express server entry point
│   │   ├── routes/
│   │   │   ├── approval.ts     # Approval webhook endpoint
│   │   │   ├── upload.ts       # Image upload endpoint
│   │   │   ├── generate.ts     # AI generation endpoint
│   │   │   └── printify.ts     # Printify integration
│   │   ├── services/
│   │   │   ├── ai.service.ts   # AI API integration
│   │   │   ├── printify.service.ts
│   │   │   ├── approval.service.ts
│   │   │   └── storage.service.ts
│   │   ├── utils/
│   │   │   └── checkpoint.ts   # Checkpoint submission utility
│   │   └── types/
│   │       └── index.ts        # TypeScript types
│   ├── uploads/                # Temporary file storage
│   ├── generated/              # Generated images storage
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── app/
│   │   ├── routes/
│   │   │   └── products.$handle.tsx  # Product page
│   │   └── components/
│   │       ├── ImageUpload.tsx
│   │       ├── StyleSelector.tsx
│   │       └── Preview.tsx
│   ├── public/
│   ├── package.json
│   └── remix.config.js
│
└── README.md
```

## Approval System Integration

### State Management
- Pending operations stored in-memory Map: `Map<checkpointId, operation>`
- Operations include: AI generation, Printify product creation, deployments

### Checkpoint Flow
1. Before expensive/irreversible operation, create pending state
2. Submit checkpoint to `POST http://localhost:3000/checkpoint`
3. Wait for approval webhook at `POST /approval`
4. Handle decision: approved (proceed), revise (modify), stopped (cancel)

### Required Checkpoints
- Phase completion milestones
- AI image generation
- Printify product creation
- Any data modification
- Production deployments

## Environment Variables

```
# Backend
PORT=3001
OPENAI_API_KEY=sk-...
PRINTIFY_API_KEY=...
SHOPIFY_ADMIN_API_TOKEN=...
SHOPIFY_STORE_URL=...
APPROVAL_BOT_URL=http://localhost:3000

# Frontend
SHOPIFY_STOREFRONT_API_TOKEN=...
SHOPIFY_STORE_DOMAIN=...
BACKEND_API_URL=http://localhost:3001
```

## Security Considerations
- Validate file uploads (size, type)
- Sanitize user inputs
- Secure API keys in environment variables
- Rate limiting on expensive operations
- CORS configuration for frontend-backend communication

## Deployment Strategy
- Backend: Node.js server (can be deployed to Railway, Render, or similar)
- Frontend: Shopify Hydrogen deployment or Online Store 2.0 theme
- Image storage: Local for MVP, can migrate to S3/Cloudinary later
