# AI Text Humanization

A sophisticated system for transforming AI-generated text into natural, human-like content using advanced NLP techniques and mathematical models.

## Core Features

- Advanced text transformation pipeline with emotional intelligence
- Dynamic tone adjustments (neutral, positive, negative, professional, casual)
- Formal/informal style adaptation with context preservation
- Natural language pattern preservation using Markov chains
- Real-time authenticity verification with confidence scoring
- Memory-efficient caching system

## Technical Stack

### Frontend

- **Framework**: Next.js 15.0.2
- **UI**: React 19.0.0-rc, TailwindCSS 3.4
- **Components**: Radix UI primitives
- **Analytics**: Vercel Analytics

### NLP & Text Processing

- **Core**: Compromise 14.14.2
- **Extensions**:
  - compromise-numbers
  - compromise-sentences
  - Natural 8.0.1
  - String-similarity 4.0.4

### AI/ML

- **Models**: HuggingFace Inference API 2.8.1
- **Processing**: Custom transformer models
- **Verification**: Authenticity scoring system

### Architecture

- **Pattern**: Clean Architecture
- **State Management**: Functional programming (fp-ts 2.16.9)
- **Utilities**:
  - Ramda 0.30.1
  - Mathjs 13.2.0
