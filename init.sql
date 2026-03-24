CREATE TABLE people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name VARCHAR(255) NOT NULL,
  relationship_type VARCHAR(50) NOT NULL,
  first_impression TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, name)
);

CREATE INDEX idx_people_user_id ON people(user_id);

CREATE TABLE observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  tags TEXT[],
  sentiment VARCHAR(50),
  source VARCHAR(50) DEFAULT 'live_log',
  signal_category VARCHAR(50),
  question_id VARCHAR(50),
  relationship_context VARCHAR(50),
  logged_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_observations_person_id ON observations(person_id);

CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  goal VARCHAR(255),
  behavioral_tendencies TEXT[],
  personality_read JSONB,
  action_cards JSONB,
  data_quality VARCHAR(50),
  prediction_note TEXT,
  groq_response JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_predictions_person_id ON predictions(person_id);

CREATE TABLE outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  prediction_id UUID REFERENCES predictions(id),
  goal VARCHAR(255),
  what_happened TEXT,
  prediction_accuracy_rating INT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_outcomes_person_id ON outcomes(person_id);
