# Petify - AI-Powered Pet Art E-Commerce

A full-stack Shopify + Printify e-commerce application that lets users upload pet photos, apply AI art styles, and purchase custom printed products.

## 🎯 Features

- **Pet Photo Upload**: Users upload photos of their pets
- **AI Art Generation**: Apply artistic styles or themed templates (holidays, events)
- **Custom Artwork**: AI generates unique artwork from pet photos
- **Print-on-Demand**: Create and fulfill products via Printify
- **Shopify Integration**: Full e-commerce checkout and order management
- **Approval System**: Integrated with local Discord approval bot for oversight

## 🏗️ Architecture

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

## 📁 Project Structure

```
petify/
├── backend/              # Node.js + Express API
│   ├── src/
│   │   ├── server.ts     # Main server entry point
│   │   ├── routes/       # API route handlers
│   │   ├── services/     # Business logic services
│   │   ├── utils/        # Helper utilities
│   │   └── types/        # TypeScript type definitions
│   ├── uploads/          # Uploaded pet photos
│   └── generated/        # AI-generated images
│
├── frontend/             # Shopify Hydrogen storefront
│   ├── app/
│   │   ├── routes/       # Page routes
│   │   └── components/   # React components
│   └── public/           # Static assets
│
└── ARCHITECTURE.md       # Detailed architecture documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Shopify store (for frontend)
- OpenAI API key
- Printify API credentials
- Local approval bot running on port 3000

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Start development server
npm run dev
```

Backend runs on `http://localhost:3001`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with Shopify credentials

# Start development server
npm run dev
```

Frontend runs on `http://localhost:3000`

## 🔑 Environment Variables

### Backend (.env)

```env
PORT=3001
BACKEND_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000
APPROVAL_BOT_URL=http://localhost:3000

OPENAI_API_KEY=sk-...
PRINTIFY_API_KEY=...
PRINTIFY_SHOP_ID=...
SHOPIFY_ADMIN_API_TOKEN=...
SHOPIFY_STORE_URL=...
```

### Frontend (.env)

```env
SHOPIFY_STOREFRONT_API_TOKEN=...
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
BACKEND_API_URL=http://localhost:3001
```

## 📡 API Endpoints

### Approval System
- `POST /approval` - Receive approval decisions from bot
- `GET /approval/pending` - List pending operations

### Image Processing
- `POST /upload` - Upload pet photo
- `GET /generate/styles` - Get available art styles
- `POST /generate` - Generate AI artwork (requires approval)

### Product Management
- `POST /printify/create` - Create Printify product (requires approval)
- `POST /printify/publish/:id` - Publish product to Shopify

### Health
- `GET /health` - Health check endpoint

## 🤖 Approval System Integration

The application integrates with a local Discord-based approval bot for oversight of expensive/irreversible operations.

### Checkpoint Submission

Before expensive operations, the backend submits checkpoints:

```typescript
POST http://localhost:3000/checkpoint
{
  "checkpointId": "ai_generation_1234567890_abc",
  "summary": "AI image generation with watercolor style",
  "agentName": "PetifyAgent",
  "context": "Requesting approval to generate AI artwork...",
  "metadata": {
    "style": "watercolor",
    "estimatedCost": "$0.02-0.04"
  }
}
```

### Approval Webhook

The backend receives approval decisions:

```typescript
POST http://localhost:3001/approval
{
  "decision": "approved | revise | stopped",
  "checkpointId": "ai_generation_1234567890_abc",
  "instructions": "Optional revision instructions"
}
```

### Decision Handling

- **approved**: Operation proceeds normally
- **revise**: Operation modified based on instructions, may resubmit
- **stopped**: Operation cancelled, resources cleaned up

## 🎨 Available Art Styles

### Artistic Styles
- **Watercolor**: Soft, flowing watercolor painting
- **Oil Painting**: Classical oil painting style
- **Cartoon**: Cute cartoon style
- **Pop Art**: Bold pop art style
- **Sketch**: Pencil sketch drawing
- **Digital Art**: Modern digital artwork

### Holiday Themes
- **Christmas**: Festive Christmas theme
- **Halloween**: Spooky Halloween theme
- **Valentine's Day**: Romantic Valentine theme

### Event Themes
- **Birthday**: Birthday celebration theme

## 🔄 User Flow

1. **Upload Photo**: User uploads pet photo via Shopify storefront
2. **Select Style**: User chooses AI art style or themed template
3. **Generate Artwork**: 
   - Backend requests approval
   - Upon approval, AI generates custom artwork
   - Image stored locally
4. **Preview**: User previews generated artwork
5. **Create Product**:
   - Backend requests approval
   - Upon approval, Printify product created
   - Product published to Shopify
6. **Checkout**: User completes purchase through Shopify
7. **Fulfillment**: Printify handles printing and shipping

## 📝 Development Phases

This project follows a structured approval-based development process:

- [x] **Phase 1**: Architecture & Project Setup
- [ ] **Phase 2**: Shopify Frontend (pending Phase 1 approval)
- [ ] **Phase 3**: AI Image Generation (pending Phase 2 approval)
- [ ] **Phase 4**: Printify Integration (pending Phase 3 approval)
- [ ] **Phase 5**: Checkout & Validation (pending Phase 4 approval)
- [ ] **Phase 6**: Documentation & Cleanup (pending Phase 5 approval)

Each phase requires approval before proceeding to the next.

## 🔒 Security Considerations

- File upload validation (size, type)
- Input sanitization
- API key protection via environment variables
- Rate limiting on expensive operations
- CORS configuration
- Secure webhook handling

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests  
cd frontend
npm test
```

## 📦 Deployment

### Backend
Deploy to Node.js hosting (Railway, Render, Heroku, etc.)

### Frontend
Deploy as Shopify Hydrogen app or custom storefront

### Storage
For production, migrate image storage to S3/Cloudinary

## 📄 License

MIT

## 👥 Contributing

This project follows an approval-based workflow. All significant changes require approval via the Discord bot before implementation.

## 🐛 Troubleshooting

### Backend won't start
- Check `.env` file exists with valid values
- Ensure approval bot is running on port 3000
- Verify Node.js version is 18+

### AI generation fails
- Verify `OPENAI_API_KEY` is valid
- Check OpenAI API quota/billing
- Review logs for specific error messages

### Printify integration issues
- Verify `PRINTIFY_API_KEY` and `PRINTIFY_SHOP_ID`
- Ensure Printify shop is properly configured
- Check Printify API status

## 📞 Support

For issues or questions, check the logs and ensure all environment variables are properly configured.
