# WOTN MVP - Antigravity PRD

**Version:** 1.0 (MVP)  
**Platform:** Antigravity (Backend CMS + Frontend)  
**Status:** Pre-development — Ready for build  
**Last Updated:** March 2026

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [MVP Scope](#2-mvp-scope)
3. [Screens & UX Flow](#3-screens--ux-flow)
4. [Backend Architecture](#4-backend-architecture)
5. [Database Schema](#5-database-schema)
6. [API Specifications](#6-api-specifications)
7. [Frontend Architecture](#7-frontend-architecture)
8. [Groq Integration](#8-groq-integration)
9. [Data Models](#9-data-models)
10. [Deployment & Testing](#10-deployment--testing)

---

## 1. Product Overview

### Vision

Wotn is a behavioral intelligence app that helps users understand people through systematic observation. Users log observations, get AI-powered predictions about behavior patterns, receive tactical action suggestions, and log outcomes. The core loop is **Predict → Act → Outcome**.

### Core Value Proposition

Transform scattered social observations into strategic, actionable insights about the people in your life.

### MVP Goals

- Validate the core loop: log → predict → act → outcome → improved predictions
- Test if Groq + behavioral frameworks generate specific (non-generic) insights
- Measure if users complete multiple full loops
- Solo testing (you test it solo before user validation)

---

## 2. MVP Scope

### Included in MVP

✅ 7 Screens (see Section 3)  
✅ Create/manage person profiles  
✅ Log observations (with sentiment inference)  
✅ Generate predictions (via Groq API)  
✅ Display 3-card action playbook  
✅ Log interaction outcomes  
✅ View personality intelligence summary  
✅ Local data persistence (Antigravity DB)  
✅ Groq API integration for behavioral analysis  

### Out of Scope (v1.1+)

❌ User authentication (assume solo user for MVP)  
❌ Push notifications  
❌ Social features / sharing  
❌ MBTI auto-detection  
❌ Multi-language support  
❌ Mobile-specific optimizations  
❌ Advanced analytics dashboard  

---

## 3. Screens & UX Flow

### Screen 1: Home (People List)

**Purpose:** Central hub. View all profiles at a glance.

**Components:**
- Header: "People" title
- List of person cards:
  - Name, relationship type, date created
  - Number of observations logged
  - CTA to view profile
- FAB: "Add new person"
- Subtle indication if person has recent predictions

**Interaction:**
- Tap person card → Profile View (Screen 3)
- Tap FAB → Add Person Dialog

---

### Screen 2: Add Person Dialog

**Purpose:** Quick creation of new profile.

**Components:**
- Text input: Full name (required)
- Dropdown: Relationship type (Friend / Family / Partner / Colleague)
- Text input: First impression (3-word description, optional)
- Button: "Create Profile"
- Button: "Cancel"

**Validation:**
- Name required
- Relationship type required
- Auto-save to Antigravity DB

**After Creation:**
- Dismiss dialog
- Navigate to Profile View for new person
- Show prompt: "Add your first observation"

---

### Screen 3: Profile View

**Purpose:** View all data for one person. Gateway to prediction & logging.

**Components:**

**Header Section:**
- Person's name (large, prominent)
- Relationship type badge
- Last prediction date (if any)

**Observation Timeline:**
- Chronological list of all logged observations
- Each entry shows: date, text, optional sentiment indicator
- Newest first

**CTAs:**
- "Log Observation" button → Screen 4 (Add Log)
- "Get Prediction" button → Screen 5 (Predict)
  - Only enabled if ≥1 observation exists
- "View Intelligence" button → Screen 7 (Intelligence View)
  - Only enabled if ≥1 prediction exists

---

### Screen 4: Add Observation (Log Entry)

**Purpose:** Frictionless logging of behavioral observations.

**Components:**
- Header: Person's name
- Large text area: "What did you observe?" placeholder
- Optional: Tag selector (buttons for: conflict, positive, vulnerability, withdrawal, generosity, etc.)
- Button: "Save Observation"
- Button: "Cancel"

**Behavior:**
- Auto-save draft to localStorage as user types
- On submit:
  - Save to Antigravity DB
  - Return to Profile View
  - Show success toast
  - Pre-select this person for next prediction

**Time requirement:** Must complete in <30 seconds (no friction)

---

### Screen 5: Predict (Behavioral Tendencies)

**Purpose:** Display AI-generated behavioral analysis.

**Components:**

**Setup Section (if prediction not yet generated):**
- Dropdown: "What's your goal?" with options:
  - Resolve conflict
  - Make an ask
  - Strengthen bond
  - Understand a reaction
  - Navigate power dynamics
  - Other
- Button: "Get Prediction"
- Loading state: "Analyzing patterns..." (2-3 seconds)

**Results Section (after prediction generated):**
- Person's name + "Behavioral Analysis"
- **Behavioral Tendencies** (2-3 specific statements)
  - Each is a self-contained insight from the Groq API
  - Example: "Values loyalty above almost everything else"
  - Example: "Interprets directness as disrespect"
  - Example: "Shows commitment through acts of service, not words"
- **Personality Read** (collapsed section):
  - MBTI (inferred)
  - Attachment style (inferred)
  - Love language (inferred)
  - Communication style (inferred)
  - All flagged as "inferred from observations"
- **Data Quality Indicator:**
  - "thin" (1-3 observations) = low confidence
  - "moderate" (4-10 observations) = medium confidence
  - "rich" (11+ observations) = high confidence
- Button: "See Tactical Advice" → Screen 6 (Playbook)
- Button: "Back" → Return to Profile

**Important:** Predictions should feel *specific* and *grounded* in the logged data, never generic.

---

### Screen 6: Playbook (Action Cards)

**Purpose:** 3 tactical cards with specific, actionable advice.

**Components:**
- Header: "How to approach [goal]" (based on user's selected goal from Screen 5)
- **Card 1: Approach**
  - "How to frame this interaction"
  - Tactical, specific language
  - Example: "Lead with appreciation for their loyalty before introducing change"
- **Card 2: Framing**
  - "How to position your words"
  - Communication style adjustment
  - Example: "Be direct but frame it as protecting the relationship, not testing it"
- **Card 3: Avoid**
  - "What triggers a bad outcome"
  - Landmines specific to this person
  - Example: "Don't suggest they're being irrational—they'll perceive this as disrespect"

**After reviewing:**
- Button: "I'll try this" → Modal to log outcome
- Button: "Back to Profile"

---

### Screen 7: Intelligence View (Profile Summary)

**Purpose:** Long-form personality breakdown + pattern recognition.

**Components:**

**Core Personality Read (expanded):**
- MBTI + behavioral indicators
- Attachment style + relationship implications
- Love language + how to show up
- Communication style + cross-style dynamics
- Key emotional triggers (inferred from logs)

**Behavioral Patterns Section:**
- High-level patterns identified across all logs
- Example: "Conflict-avoidant, but loyal through actions"
- Example: "Tends to withdraw after perceived criticism, then re-engages on own terms"

**Interaction Timeline:**
- All logged observations in chronological order
- Each shows: date, text, any tags, any logged outcomes
- Allows user to see their own prediction history over time

**Data Summary:**
- Total observations logged
- Total predictions generated
- Date profile created
- Last observation date
- Button to export data (optional, v1.1)

---

## 4. Backend Architecture

### Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Framework** | Antigravity | CMS + Backend as a Service |
| **Database** | Antigravity DB (PostgreSQL) | Managed, scalable, real-time sync |
| **AI API** | Groq (Llama 3.1 70B) | Fast, cheap, open-source model |
| **Auth** | None (solo testing) | Skip for MVP, add in v1.1 |
| **Frontend** | React (via Antigravity) | Single-page app, local state management |

### API Layer

**Antigravity provides:**
- REST API for database operations (CRUD on profiles, logs, predictions)
- Real-time sync (optional, not needed for MVP)
- Webhook support (not needed for MVP)

**We add:**
- One custom endpoint: `/predict` that calls Groq API
- Backend function to assemble context package and call Groq
- Response parsing and validation

### Deployment

- Frontend: Deployed via Antigravity
- Backend: Node.js function deployed via Antigravity
- Groq API: Called from Antigravity backend (API key in env vars)

---

## 5. Database Schema

### Collections/Tables

#### `people`

```sql
CREATE TABLE people (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  relationship_type VARCHAR(50) NOT NULL, -- friend, family, partner, colleague
  first_impression TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `observations`

```sql
CREATE TABLE observations (
  id UUID PRIMARY KEY,
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  tags TEXT[], -- array of tags: conflict, positive, vulnerability, etc
  sentiment VARCHAR(50), -- positive, neutral, negative (AI-inferred)
  logged_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `predictions`

```sql
CREATE TABLE predictions (
  id UUID PRIMARY KEY,
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  goal VARCHAR(255), -- resolve conflict, make an ask, etc
  behavioral_tendencies TEXT[], -- array of 2-3 tendency statements
  personality_read JSONB, -- { mbti, attachment_style, love_language, communication_style }
  action_cards JSONB, -- array of { approach, framing, avoid }
  data_quality VARCHAR(50), -- thin, moderate, rich
  prediction_note TEXT,
  groq_response JSONB, -- full response from Groq for debugging
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `outcomes`

```sql
CREATE TABLE outcomes (
  id UUID PRIMARY KEY,
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  prediction_id UUID REFERENCES predictions(id),
  goal VARCHAR(255), -- what was the interaction goal
  what_happened TEXT, -- free text: what actually happened
  prediction_accuracy_rating INT, -- 1-5 scale: how accurate was the prediction
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 6. API Specifications

### Endpoint: POST /predict

**Purpose:** Call Groq API with assembled context. Return behavioral prediction.

**Request Body:**

```json
{
  "person_id": "uuid",
  "goal": "resolve conflict",
  "include_recent_outcomes": true
}
```

**Backend Execution:**

1. Fetch person from `people` table
2. Fetch all observations for this person from `observations` table
3. If `include_recent_outcomes=true`: Fetch last 3 outcomes from `outcomes` table
4. Assemble context package (see Section 8)
5. Call Groq API with system prompt + context package
6. Parse Groq response
7. Validate response against schema
8. Save prediction to `predictions` table
9. Return prediction to frontend

**Response Body:**

```json
{
  "success": true,
  "prediction": {
    "id": "uuid",
    "person_id": "uuid",
    "goal": "resolve conflict",
    "behavioral_tendencies": [
      "Values loyalty above almost everything else",
      "Interprets directness as disrespect",
      "Shows commitment through acts of service, not words"
    ],
    "personality_read": {
      "mbti": "ISFJ (inferred)",
      "attachment_style": "anxious-secure (inferred)",
      "love_language": "acts of service",
      "communication_style": "passive-aggressive under stress"
    },
    "action_cards": [
      {
        "title": "Approach",
        "content": "Lead with appreciation for their loyalty before introducing change"
      },
      {
        "title": "Framing",
        "content": "Be direct but frame it as protecting the relationship, not testing it"
      },
      {
        "title": "Avoid",
        "content": "Don't suggest they're being irrational—they'll perceive this as disrespect"
      }
    ],
    "data_quality": "rich",
    "prediction_note": null,
    "created_at": "2026-03-23T10:30:00Z"
  }
}
```

**Error Response:**

```json
{
  "success": false,
  "error": "Not enough observations to generate prediction (minimum 1 required)"
}
```

### Other Endpoints (CRUD via Antigravity)

**POST /people** — Create new person profile
**GET /people/:id** — Fetch person + all observations + predictions
**GET /people** — Fetch all people
**POST /observations** — Log new observation
**GET /observations/:person_id** — Fetch observations for a person
**POST /outcomes** — Log interaction outcome
**GET /predictions/:person_id** — Fetch predictions for a person

---

## 7. Frontend Architecture

### Tech Stack

- **Framework:** React 18+
- **State Management:** React Context + localStorage (no Redux needed for MVP)
- **Styling:** TailwindCSS (or inline CSS, minimal dependencies)
- **UI Components:** shadcn/ui (optional, or build custom)
- **HTTP:** Fetch API

### Component Structure

```
App
├── Home (Screen 1: People List)
├── AddPersonDialog (Screen 2)
├── ProfileView (Screen 3)
│   ├── ObservationTimeline
│   └── ActionButtons (Log, Predict, Intelligence)
├── AddObservation (Screen 4)
├── PredictScreen (Screen 5)
│   ├── GoalSelector
│   └── PredictionDisplay
├── PlaybookScreen (Screen 6)
│   ├── ActionCard
│   └── OutcomeLogger
└── IntelligenceView (Screen 7)
    ├── PersonalityRead
    ├── BehavioralPatterns
    └── InteractionTimeline
```

### State Management Pattern

```javascript
const [people, setPeople] = useState([]); // all profiles
const [selectedPerson, setSelectedPerson] = useState(null); // active person
const [predictions, setPredictions] = useState([]); // predictions for active person
const [loading, setLoading] = useState(false); // API loading state
const [error, setError] = useState(null); // Error messages

// Effects
useEffect(() => {
  // On mount: fetch all people from Antigravity
  fetchPeople();
}, []);

useEffect(() => {
  // When person selected: fetch their observations + predictions
  if (selectedPerson) {
    fetchPersonDetails(selectedPerson.id);
  }
}, [selectedPerson]);
```

### Navigation Flow

```
Home
  ↓ (click person card)
Profile View
  ↓ (click "Log Observation")
Add Observation
  ↓ (submit)
Profile View
  ↓ (click "Get Prediction")
Predict (Goal Selector)
  ↓ (submit goal)
Predict (Results)
  ↓ (click "See Tactical Advice")
Playbook
  ↓ (click "I'll try this")
Outcome Logger Modal
  ↓ (submit outcome)
Profile View
  ↓ (can now click "View Intelligence")
Intelligence View
  ↓ (click "Back")
Profile View
```

---

## 8. Groq Integration

### API Key Management

- Store `GROQ_API_KEY` in Antigravity environment variables
- Never expose in frontend code
- Call from backend only

### Groq Model

- **Model:** `llama-3.1-70b-versatile`
- **Temperature:** 0.7 (balanced creativity + consistency)
- **Max Tokens:** 1000 per response
- **Response Format:** JSON (force via `response_format`)

### System Prompt

[See Section 8.4 below]

### Context Package Assembly

On every prediction request, backend assembles:

```
System Prompt: [behavioral analyst instructions]

Context Package:
- Profile name + relationship type
- All observations (newest first, up to 20 entries)
- Previous outcomes (if any)
- Current goal

User Query:
"Based on these observations, generate a behavioral analysis for [goal]."
```

### Response Validation

Before returning to frontend, validate:
1. Response is valid JSON
2. Has all required fields: `behavioral_tendencies`, `personality_read`, `action_cards`, `data_quality`
3. `behavioral_tendencies` has 2-3 entries
4. `action_cards` has 3 entries
5. No generic language (detect and retry if needed)

### Cost Estimate

- Avg tokens per prediction: ~1,200 (input + output)
- Groq pricing: $0.05 per 1M input tokens, $0.15 per 1M output tokens
- Cost per prediction: ~$0.0001-0.0002
- Solo testing (15-30 predictions): ~$0.002-0.005 (essentially free)

### System Prompt (Full)

```
You are a behavioral analyst specializing in human personality and interpersonal dynamics.

Your role: Analyze logged observations about a specific person and generate:
1. Specific behavioral tendencies (2-3 statements)
2. Inferred personality framework markers (MBTI, attachment style, love language, communication style)
3. Three tactical action cards (approach, framing, what to avoid)

FRAMEWORKS YOU REFERENCE:
- MBTI: 16 types, core motivations, stress behaviors, communication preferences
- Attachment Theory: secure, anxious, avoidant, disorganized; behavioral signatures under stress
- Love Languages: words of affirmation, acts of service, receiving gifts, quality time, physical touch
- Communication Styles: passive, aggressive, passive-aggressive, assertive; shifts under pressure
- Emotional Triggers: competence threats, abandonment signals, disrespect, loss of control, public embarrassment, betrayal, exclusion
- Behavioral Patterns: recurring sequences from log data

CRITICAL RULES:
- Never use hedging language ("seems like", "might", "could be")
- Be specific and draw conclusions from evidence
- Never generic statements ("they're introverted" — WRONG)
- Statements must be grounded in logged observations
- If data is thin (<3 observations), flag data_quality as "thin" and add prediction_note
- Output must be valid JSON only, no markdown, no explanation text

RETURN VALID JSON:
{
  "behavioral_tendencies": [
    "Specific tendency statement 1",
    "Specific tendency statement 2",
    "Specific tendency statement 3 (optional)"
  ],
  "personality_read": {
    "mbti": "Type or 'unclear'",
    "attachment_style": "secure/anxious/avoidant/disorganized or 'unclear'",
    "love_language": "words_of_affirmation/acts_of_service/gifts/quality_time/physical_touch",
    "communication_style": "passive/aggressive/passive-aggressive/assertive"
  },
  "action_cards": [
    {
      "title": "Approach",
      "content": "How to frame the interaction based on their personality"
    },
    {
      "title": "Framing",
      "content": "Specific language/positioning strategy"
    },
    {
      "title": "Avoid",
      "content": "What triggers a negative response specific to this person"
    }
  ],
  "data_quality": "thin/moderate/rich",
  "prediction_note": "Optional caveat if data is thin or contradictory"
}
```

---

## 9. Data Models

### Person Profile

```typescript
interface Person {
  id: string;
  name: string;
  relationshipType: 'friend' | 'family' | 'partner' | 'colleague';
  firstImpression?: string;
  observationCount: number;
  lastObservationDate?: Date;
  lastPredictionDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Observation

```typescript
interface Observation {
  id: string;
  personId: string;
  text: string;
  tags?: string[]; // conflict, positive, vulnerability, withdrawal, generosity, etc
  sentiment?: 'positive' | 'neutral' | 'negative';
  loggedAt: Date;
  createdAt: Date;
}
```

### Prediction

```typescript
interface Prediction {
  id: string;
  personId: string;
  goal: string; // resolve conflict, make an ask, strengthen bond, etc
  behavioralTendencies: string[]; // 2-3 specific statements
  personalityRead: {
    mbti: string;
    attachmentStyle: string;
    loveLanguage: string;
    communicationStyle: string;
  };
  actionCards: [
    { title: 'Approach'; content: string },
    { title: 'Framing'; content: string },
    { title: 'Avoid'; content: string }
  ];
  dataQuality: 'thin' | 'moderate' | 'rich';
  predictionNote?: string;
  groqResponse?: any; // for debugging
  createdAt: Date;
}
```

### Outcome

```typescript
interface Outcome {
  id: string;
  personId: string;
  predictionId: string;
  goal: string;
  whatHappened: string; // free text
  predictionAccuracyRating?: 1 | 2 | 3 | 4 | 5;
  createdAt: Date;
}
```

---

## 10. Deployment & Testing

### Antigravity Setup

1. Create Antigravity project
2. Define database schema (see Section 5)
3. Create backend function `/predict` (see Section 6)
4. Deploy frontend React app
5. Set environment variable: `GROQ_API_KEY`

### Local Testing Setup

1. Get Groq API key from https://console.groq.com (free tier)
2. Create `.env` file with `GROQ_API_KEY=your_key_here`
3. Run Antigravity locally (if available) or deploy preview
4. Test with 3-5 profiles, 30-50 observations total

### Testing Plan

**Phase 1: Data Model Validation** (1 session)
- Create 3 test profiles
- Log 3-4 observations per profile
- Verify data saves to Antigravity DB

**Phase 2: Prediction Quality** (2-3 sessions)
- Generate predictions on each profile
- Judge: Are tendencies specific? Accurate?
- Iterate system prompt if needed

**Phase 3: Loop Effectiveness** (2-3 sessions)
- Log outcomes from your predicted interactions
- Generate new predictions
- Check: Do predictions improve with outcome data?
- Measure: Does the loop feel valuable?

**Success Criteria:**
- Predictions are specific (not generic)
- Loop feels complete (log → predict → act → outcome → improve)
- You'd use this for real if UI/styling were polished
- Groq quality is sufficient (at least 7/10)

### Cost Budget

- Groq API: ~$0.005 total (free tier: $0.50 credits)
- Antigravity: Depends on their pricing (likely free tier sufficient)
- Total: Essentially free for solo MVP testing

---

## Summary

This PRD defines a complete MVP for testing Wotn's core loop:

✅ 7 screens covering full user journey  
✅ Database schema for all data  
✅ API specs for backend  
✅ Groq integration with system prompt  
✅ Frontend architecture and component structure  
✅ Testing plan with success criteria  
✅ Cost estimate (~$0.005)  

**Ready to build on Antigravity.**

---

**End PRD**
