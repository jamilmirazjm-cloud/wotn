# WOTN MVP - ANTIGRAVITY BUILD PRD/PROMPT

**Version:** 2.0 (Database-Ready)  
**Platform:** Antigravity (Frontend + Backend + Database)  
**Goal:** Cross-device data sync (phone + laptop + any device)  
**Status:** Ready to build

---

## EXECUTIVE SUMMARY

You're transitioning from local storage to a real database. This enables:
- ✅ Data syncs across all devices (phone, laptop, etc.)
- ✅ Groq API calls from secure backend
- ✅ Production-ready architecture
- ✅ Same 7-screen experience, but backed by real database

---

## USE THIS PROMPT WITH ANTIGRAVITY

Copy everything below and give it to Antigravity to build the complete stack:

---

## THE PROMPT FOR ANTIGRAVITY

I need you to build the Wotn MVP with full database integration on Antigravity. Here's everything you need:

### PROJECT OVERVIEW

**Wotn** is a behavioral intelligence app that helps users track observations about people and get AI-powered insights.

**Core Loop:** Create Profile → Log Observations → Get Prediction (via Groq API) → Review Playbook → Log Outcome → Improved Predictions

**Current State:** Working React frontend (7 screens) with local storage  
**What's Needed:** Replace local storage with Antigravity database + backend API

### FRONTEND (React - Already Built)

**7 Screens (you have the design and code):**
1. Home (People List)
2. Add Person Dialog
3. Profile View
4. Add Observation
5. Predict (Behavioral Analysis)
6. Playbook (3 Action Cards)
7. Intelligence View

**Current Data Flow:** Frontend ↔ Browser Local Storage  
**New Data Flow:** Frontend ↔ Antigravity Backend ↔ Database

### BACKEND REQUIREMENTS

Create these API endpoints:

#### 1. People Management

**POST /api/people**
- Create new person profile
- Request: `{ name, relationshipType, firstImpression }`
- Response: `{ id, name, relationshipType, createdAt }`
- Database: Save to `people` table

**GET /api/people**
- Fetch all profiles for current user
- Response: `[{ id, name, relationshipType, observationCount, lastObservationDate }]`

**GET /api/people/:personId**
- Fetch single person + all observations
- Response: `{ id, name, relationshipType, observations: [], predictions: [] }`

---

#### 2. Observations (Logs)

**POST /api/observations**
- Log new observation for a person
- Request: `{ personId, text, tags: [], sentiment }`
- Response: `{ id, personId, text, date, sentiment, createdAt }`
- AI: Auto-infer sentiment (positive/neutral/negative) using Groq if desired, OR use simple keyword detection
- Database: Save to `observations` table

**GET /api/observations/:personId**
- Fetch all observations for a person
- Response: `[{ id, text, date, sentiment, tags }]` (newest first)

---

#### 3. Predictions (The Money Endpoint)

**POST /api/predict**
- Generate behavioral prediction for a person
- Request: `{ personId, goal }`
- Process:
  1. Fetch person from `people` table
  2. Fetch all observations for this person from `observations` table
  3. Assemble context package (profile + observations + goal)
  4. Call Groq API with system prompt (see SYSTEM PROMPT section below)
  5. Parse response
  6. Validate response schema
  7. Save prediction to `predictions` table
  8. Return to frontend
- Response: `{ id, behavioralTendencies, personalityRead, actionCards, dataQuality, predictionNote }`
- Database: Save to `predictions` table

**Key:** This endpoint calls Groq API from the backend (API key in env vars, never exposed to frontend)

---

#### 4. Outcomes

**POST /api/outcomes**
- Log outcome from an interaction
- Request: `{ personId, predictionId, goal, whatHappened, accuracyRating }`
- Response: `{ id, personId, outcome, createdAt }`
- Database: Save to `outcomes` table

**GET /api/outcomes/:personId**
- Fetch all outcomes for a person
- Response: `[{ id, goal, whatHappened, accuracyRating, createdAt }]`

---

### DATABASE SCHEMA (PostgreSQL)

#### `people` Table
```sql
CREATE TABLE people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- from Antigravity auth (all data is per-user)
  name VARCHAR(255) NOT NULL,
  relationship_type VARCHAR(50) NOT NULL, -- friend, family, partner, colleague
  first_impression TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, name) -- each user can't have duplicate names
);

CREATE INDEX idx_people_user_id ON people(user_id);
```

#### `observations` Table
```sql
CREATE TABLE observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  tags TEXT[], -- array: conflict, positive, vulnerability, withdrawal, generosity, etc
  sentiment VARCHAR(50), -- positive, neutral, negative (auto-inferred)
  logged_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_observations_person_id ON observations(person_id);
```

#### `predictions` Table
```sql
CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  goal VARCHAR(255), -- resolve conflict, make an ask, strengthen bond, etc
  behavioral_tendencies TEXT[], -- array of 2-3 statements
  personality_read JSONB, -- { mbti, attachment_style, love_language, communication_style }
  action_cards JSONB, -- array of { title, content }
  data_quality VARCHAR(50), -- thin, moderate, rich
  prediction_note TEXT,
  groq_response JSONB, -- full response for debugging
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_predictions_person_id ON predictions(person_id);
```

#### `outcomes` Table
```sql
CREATE TABLE outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  prediction_id UUID REFERENCES predictions(id),
  goal VARCHAR(255),
  what_happened TEXT,
  prediction_accuracy_rating INT, -- 1-5 scale
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_outcomes_person_id ON outcomes(person_id);
```

---

### GROQ API INTEGRATION

**Environment Variable:**
- Set `GROQ_API_KEY` in Antigravity backend config (secret/private)

**System Prompt:** (See SYSTEM PROMPT section below)

**Model:** `llama-3.1-70b-versatile`

**Parameters:**
```
temperature: 0.7
max_tokens: 1200
response_format: { type: "json_object" }
```

**Response Schema:**
```json
{
  "behavioral_tendencies": ["statement1", "statement2", "statement3"],
  "personality_read": {
    "mbti": "Type or unclear",
    "attachment_style": "secure/anxious/avoidant/disorganized",
    "love_language": "words_of_affirmation/acts_of_service/gifts/quality_time/physical_touch",
    "communication_style": "passive/aggressive/passive-aggressive/assertive"
  },
  "action_cards": [
    { "title": "Approach", "content": "..." },
    { "title": "Framing", "content": "..." },
    { "title": "Avoid", "content": "..." }
  ],
  "data_quality": "thin/moderate/rich",
  "prediction_note": "optional"
}
```

---

### FRONTEND CHANGES NEEDED

**Replace local storage with API calls:**

```javascript
// OLD (Local Storage)
const [people, setPeople] = useState([]);
useEffect(() => {
  const saved = localStorage.getItem('wotn_people');
  if (saved) setPeople(JSON.parse(saved));
}, []);

// NEW (API Calls)
const [people, setPeople] = useState([]);
useEffect(() => {
  fetchPeople();
}, []);

async function fetchPeople() {
  const res = await fetch('/api/people');
  const data = await res.json();
  setPeople(data);
}
```

**API Call Examples:**

```javascript
// Create person
async function createPerson(name, relationshipType) {
  const res = await fetch('/api/people', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, relationshipType })
  });
  return await res.json();
}

// Add observation
async function addObservation(personId, text, tags = []) {
  const res = await fetch('/api/observations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ personId, text, tags })
  });
  return await res.json();
}

// Generate prediction
async function getPrediction(personId, goal) {
  const res = await fetch('/api/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ personId, goal })
  });
  return await res.json();
}

// Log outcome
async function logOutcome(personId, predictionId, goal, whatHappened, accuracyRating) {
  const res = await fetch('/api/outcomes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ personId, predictionId, goal, whatHappened, accuracyRating })
  });
  return await res.json();
}
```

---

### SYSTEM PROMPT (For Groq API)

Use this exact prompt when calling Groq:

```
You are a behavioral analyst specializing in ONLY human personality analysis, interpersonal dynamics, and strategic relationships.

YOUR SINGULAR PURPOSE: Analyze logged observations about a specific person and generate:
1. 2-3 specific behavioral tendencies (never generic)
2. Inferred personality framework markers (MBTI, attachment style, love language, communication style)
3. Three tactical action cards (approach, framing, what to avoid)

HARD BOUNDARIES - YOU MUST REFUSE:
- Any request not about analyzing a specific person's behavior
- Questions about general psychology topics, theories, or education
- Requests for advice on topics outside interpersonal dynamics
- Requests to analyze groups, organizations, or institutions (only individuals)
- Requests for therapy, counseling, or mental health treatment recommendations

## FRAMEWORKS YOU APPLY

### MBTI Personality Types (16 types)
- INFP: Values authenticity, idealistic, conflict-avoidant, loyal to values not people
- INFJ: Strategic, reserved, loyal through planning, takes directness as criticism
- ISFJ: Protective, service-oriented, resentful when unappreciated, anxious about relationships
- ISTJ: Duty-bound, rule-follower, loyal through consistency
- ENFP: Enthusiastic, scattered, needs novelty
- ENFJ: Natural leader, people-focused, needs validation
- ESFJ: People-pleaser, social, conflict-avoidant publicly
- ESTJ: Task-focused, direct, pragmatic, loyalty through competence
- [Include all 16 types with behavioral descriptors]

### Attachment Theory
- **Secure:** Comfortable with intimacy and independence, communicates directly, recovers quickly from conflict
- **Anxious:** Fears abandonment, seeks reassurance, clings, conflict triggers panic
- **Avoidant:** Fears intimacy, dismissive of emotional needs, withdraws in conflict
- **Disorganized:** Mixture of anxious/avoidant, inconsistent, trauma-responsive

### Love Languages
1. Words of Affirmation
2. Acts of Service
3. Receiving Gifts
4. Quality Time
5. Physical Touch

### Communication Styles
- Passive, Aggressive, Passive-Aggressive, Assertive, Collaborative

### Emotional Triggers
- Competence threats
- Abandonment signals
- Disrespect
- Loss of control
- Public embarrassment
- Betrayal
- Exclusion

### Strategic Literature (Reference)
- 48 Laws of Power: Power dynamics, ego protection, status consciousness
- Never Split the Difference: Tactical empathy, mirroring, calibrated questions
- Influence (Cialdini): Reciprocity, commitment, social proof, authority, liking, scarcity
- The Art of Seduction: How to draw people in, attraction patterns
- Attached (Levine & Heller): Attachment style behavioral signatures
- Emotional Intelligence: Empathy calibration, emotional competence

## CRITICAL OUTPUT RULES

1. Never use hedging language ("seems like", "might", "could be", "tends to")
2. Be specific and grounded in logs (every statement must have evidence)
3. Never generic statements (not "introverted" but "withdraws from group settings, initiates one-on-ones")
4. Infer framework markers but flag as inferred
5. Action cards must be tactical, not preachy
6. Output ONLY valid JSON, no markdown or explanation

## RETURN VALID JSON ONLY

{
  "behavioral_tendencies": ["specific tendency grounded in logs", "another specific tendency", "optional third"],
  "personality_read": {
    "mbti": "Type (inferred) or unclear",
    "attachment_style": "secure/anxious/avoidant/disorganized or unclear",
    "love_language": "detected or unclear",
    "communication_style": "detected or unclear"
  },
  "action_cards": [
    { "title": "Approach", "content": "specific tactical advice" },
    { "title": "Framing", "content": "specific language strategy" },
    { "title": "Avoid", "content": "specific landmine for this person" }
  ],
  "data_quality": "thin/moderate/rich",
  "prediction_note": "optional caveat"
}
```

---

### DEPLOYMENT CHECKLIST

- [ ] Create Antigravity backend function with `/api/people`, `/api/observations`, `/api/predict`, `/api/outcomes`
- [ ] Create PostgreSQL database with tables (people, observations, predictions, outcomes)
- [ ] Set environment variable: `GROQ_API_KEY`
- [ ] Update React frontend to call backend APIs instead of localStorage
- [ ] Test cross-device sync (phone + laptop, same URL, same data)
- [ ] Test Groq prediction endpoint (returns specific, non-generic predictions)
- [ ] Deploy to Antigravity (public URL)
- [ ] Test from phone and laptop simultaneously

---

### TESTING WORKFLOW

**Phase 1: Data Sync Validation**
1. Create profile on phone
2. Open same URL on laptop → profile appears ✅
3. Add observation on laptop
4. Refresh phone → observation appears ✅

**Phase 2: Groq Prediction Quality**
1. Add 3-4 observations to a profile
2. Call `/api/predict` endpoint
3. Judge: Are tendencies specific? Accurate? Non-generic? ✅

**Phase 3: Full Loop Testing**
1. Phone: Create profile + add observation → get prediction → review playbook
2. Real world: Act based on playbook suggestions
3. Phone: Log outcome
4. Laptop: Check if prediction improves (fetch new prediction with outcome data)
5. Verify: Loop feels valuable, data stays synced across devices ✅

---

### SUCCESS CRITERIA

✅ Data syncs between phone and laptop (same URL, same data)  
✅ Groq predictions are specific and grounded (not generic)  
✅ Full Predict → Act → Outcome loop works end-to-end  
✅ Public URL works from any device  
✅ All 7 screens functional with database backend  

---

## BUILD TIMELINE

- **Backend setup:** 30 mins (API endpoints + Groq integration)
- **Database setup:** 15 mins (create tables, indexes)
- **Frontend refactor:** 45 mins (replace localStorage with API calls)
- **Testing:** 30 mins (validate sync, prediction quality, full loop)
- **Total:** ~2 hours

---

**You're ready. Give this prompt to Antigravity and build it.**

