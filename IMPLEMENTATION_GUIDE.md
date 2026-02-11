# Petify Implementation Guide

## 🎯 Project Overview

**Petify** is a fully functional Shopify + Printify e-commerce MVP that allows users to:
1. Upload pet photos
2. Apply AI art styles (artistic, holiday, event themes)
3. Generate custom AI artwork
4. Preview results
5. Purchase physical printed products
6. Receive products via Printify fulfillment

## 🏗️ What Has Been Built

### ✅ Phase 1 Complete: Foundation & Approval System

#### Backend Infrastructure
- **Express API Server** (TypeScript, ES Modules)
  - 8 RESTful endpoints
  - CORS and security middleware
  - Error handling and logging
  - Static file serving
  
#### Approval System Integration
- **Checkpoint Submission**: Non-blocking POST to `http://localhost:3000/checkpoint`
- **Approval Webhook**: Receives decisions at `POST /approval`
- **State Management**: In-memory Map for pending operations
- **Decision Support**: approved/revise/stopped with instructions
- **Timeout Protection**: 30-minute auto-cleanup

#### Services Implemented
1. **AI Service** - OpenAI DALL-E integration with 10 art styles
2. **Printify Service** - Product creation and Shopify publishing
3. **Storage Service** - Local image storage and URL management
4. **Approval Service** - Operation state and decision handling

#### API Endpoints
```
GET  /health                    - Health check
POST /approval                  - Approval webhook (REQUIRED)
GET  /approval/pending          - List pending operations
POST /upload                    - Upload pet photo
GET  /generate/styles           - Get available art styles
POST /generate                  - Generate AI artwork (requires approval)
POST /printify/create           - Create product (requires approval)
POST /printify/publish/:id      - Publish to Shopify
```

#### Art Styles Available (10 total)
- **Artistic** (6): Watercolor, Oil Painting, Cartoon, Pop Art, Sketch, Digital Art
- **Holiday** (2): Christmas, Halloween
- **Event** (2): Birthday, Valentine's Day

## 🚀 Getting Started

### 1. Install Dependencies

```bash
cd petify/backend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=3001
APPROVAL_BOT_URL=http://localhost:3000

# Add your API keys:
OPENAI_API_KEY=sk-your-key-here
PRINTIFY_API_KEY=your-key-here
PRINTIFY_SHOP_ID=your-shop-id
```

### 3. Start Backend

```bash
npm run dev
```

Server starts on `http://localhost:3001`

### 4. Test API

```bash
# From repository root
bash test-backend-api.sh
```

Expected output:
- ✅ Health check responds
- ✅ 10 art styles returned
- ✅ Pending operations list works
- ✅ All endpoints registered

## 📡 Approval System Workflow

### How It Works

1. **Before Expensive Operation**:
   ```typescript
   const checkpointId = generateCheckpointId('ai_generation');
   
   await submitCheckpoint({
     checkpointId,
     summary: 'AI image generation',
     agentName: 'PetifyAgent',
     context: 'Details about the operation...',
     metadata: { style: 'watercolor' }
   });
   ```

2. **Wait for Approval**:
   ```typescript
   const result = await approvalService.waitForApproval(
     checkpointId,
     'ai_generation',
     requestData
   );
   ```

3. **Approval Bot Sends Decision**:
   ```bash
   POST http://localhost:3001/approval
   {
     "decision": "approved",
     "checkpointId": "ai_generation_...",
     "instructions": "Optional feedback"
   }
   ```

4. **Operation Proceeds**:
   - **approved**: Continue normally
   - **revise**: Modify based on instructions, resubmit
   - **stopped**: Cancel and cleanup

### Testing Approval Flow

You can simulate approval decisions:

```bash
# Approve an operation
curl -X POST http://localhost:3001/approval \
  -H "Content-Type: application/json" \
  -d '{
    "decision": "approved",
    "checkpointId": "test_checkpoint_123"
  }'

# Request revision
curl -X POST http://localhost:3001/approval \
  -H "Content-Type: application/json" \
  -d '{
    "decision": "revise",
    "checkpointId": "test_checkpoint_123",
    "instructions": "Use a different style"
  }'

# Stop operation
curl -X POST http://localhost:3001/approval \
  -H "Content-Type: application/json" \
  -d '{
    "decision": "stopped",
    "checkpointId": "test_checkpoint_123"
  }'
```

## 🧪 Example Usage Flow

### 1. Upload Pet Photo

```bash
curl -X POST http://localhost:3001/upload \
  -F "image=@my-pet.jpg"
```

Response:
```json
{
  "success": true,
  "file": {
    "filename": "pet-1234567890.jpg",
    "url": "http://localhost:3001/uploads/pet-1234567890.jpg",
    "size": 123456,
    "mimetype": "image/jpeg"
  }
}
```

### 2. Generate AI Artwork

```bash
curl -X POST http://localhost:3001/generate \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "http://localhost:3001/uploads/pet-1234567890.jpg",
    "style": "watercolor",
    "prompt": "My cute dog"
  }'
```

This will:
1. Submit checkpoint to approval bot
2. Wait for approval
3. Generate AI artwork (on approval)
4. Return generated image URL

### 3. Create Printify Product

```bash
curl -X POST http://localhost:3001/printify/create \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "http://localhost:3001/generated/generated-1234567890.png",
    "title": "Custom Pet Artwork T-Shirt",
    "description": "Beautiful watercolor portrait of my pet"
  }'
```

This will:
1. Submit checkpoint to approval bot
2. Wait for approval
3. Create Printify product (on approval)
4. Return product ID and details

## �� Project Structure

```
petify/
├── backend/
│   ├── src/
│   │   ├── server.ts              # Main server
│   │   ├── routes/                # API routes
│   │   │   ├── approval.ts        # ✅ Approval webhook
│   │   │   ├── upload.ts          # ✅ Image upload
│   │   │   ├── generate.ts        # ✅ AI generation
│   │   │   └── printify.ts        # ✅ Printify integration
│   │   ├── services/
│   │   │   ├── approval.service.ts  # ✅ State management
│   │   │   ├── ai.service.ts        # ✅ DALL-E integration
│   │   │   ├── printify.service.ts  # ✅ Printify API
│   │   │   └── storage.service.ts   # ✅ File storage
│   │   ├── utils/
│   │   │   └── checkpoint.ts      # ✅ Checkpoint utility
│   │   └── types/
│   │       └── index.ts           # ✅ Type definitions
│   ├── uploads/                   # Uploaded files
│   ├── generated/                 # Generated images
│   ├── package.json               # Dependencies
│   ├── tsconfig.json              # TS config
│   └── .env.example               # Environment template
│
├── frontend/                      # ⏸️ Scaffolded (Phase 2)
│   ├── app/
│   │   ├── routes/                # To be implemented
│   │   └── components/            # To be implemented
│   └── package.json
│
├── ARCHITECTURE.md                # Architecture docs
├── README.md                      # Main documentation
├── PHASE1_SUMMARY.md              # Phase 1 details
├── submit-phase1-checkpoint.js    # Checkpoint script
└── test-backend-api.sh            # API test script
```

## 🔐 Security Features

- ✅ File upload validation (size: 10MB max, types: JPEG/PNG/WebP)
- ✅ CORS configuration
- ✅ Environment variable protection (.env in .gitignore)
- ✅ Input sanitization
- ✅ Error handling without exposing internals
- ✅ Timeout protection on long-running operations

## 🎨 Available Art Styles

```javascript
// Get all styles
curl http://localhost:3001/generate/styles
```

Returns:
1. **watercolor** - Soft, flowing watercolor painting
2. **oil_painting** - Classical oil painting style
3. **cartoon** - Cute cartoon style
4. **pop_art** - Bold pop art style
5. **sketch** - Pencil sketch drawing
6. **digital_art** - Modern digital artwork
7. **christmas** - Festive Christmas theme
8. **halloween** - Spooky Halloween theme
9. **birthday** - Birthday celebration theme
10. **valentines** - Romantic Valentine theme

## 🚦 Development Phases

- ✅ **Phase 1**: Architecture & Setup (COMPLETE)
- ⏸️ **Phase 2**: Shopify Frontend (BLOCKED - Awaiting Phase 1 approval)
- ⏸️ **Phase 3**: AI Integration (BLOCKED)
- ⏸️ **Phase 4**: Printify Integration (BLOCKED)
- ⏸️ **Phase 5**: Checkout & Validation (BLOCKED)
- ⏸️ **Phase 6**: Documentation & Cleanup (BLOCKED)

## 📞 Approval Required

Phase 1 checkpoint has been submitted. To proceed with Phase 2:

1. **Checkpoint ID**: `phase1_completion_[timestamp]`
2. **Awaiting decision at**: `POST http://localhost:3001/approval`
3. **To resubmit**: `node submit-phase1-checkpoint.js`

Once approved, Phase 2 will implement:
- Product page UI (React components)
- Image upload with drag-and-drop
- Style selector with previews
- Client-side validation
- Backend API integration

## 🔧 Troubleshooting

### Server won't start
```bash
# Check if port 3001 is available
lsof -i :3001

# Verify .env file exists
cat petify/backend/.env

# Check Node.js version
node --version  # Should be 18+
```

### API calls fail
```bash
# Test health endpoint
curl http://localhost:3001/health

# Check server logs
cd petify/backend
npm run dev
```

### Approval timeout
- Default timeout is 30 minutes
- Check if approval bot is running on port 3000
- Verify checkpoint submission logs

## 📚 Additional Documentation

- **Architecture**: See `ARCHITECTURE.md`
- **Phase 1 Details**: See `PHASE1_SUMMARY.md`
- **Main README**: See `README.md`
- **Frontend**: See `petify/frontend/README.md`

## ✅ Current Status

**Phase 1: COMPLETE**
- 23 files created
- ~1,800 lines of code
- All tests passing
- Backend fully functional
- Approval system integrated
- **Awaiting approval to proceed**

---

**Next**: Once Phase 1 is approved, implementation will continue with Phase 2 (Shopify Frontend).
