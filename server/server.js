require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const db = require('./db');
const { requestGroqPrediction } = require('./groq');

const app = express();
app.use(cors());
app.use(express.json());

// Middlewares to simulate auth for MVP (e.g. sending a user-id header)
app.use((req, res, next) => {
  // Use header if provided, default to 'default_user'
  req.user_id = req.headers['x-user-id'] || 'default_user';
  next();
});

// GET /api/people
app.get('/api/people', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.id, p.name, p.relationship_type, p.first_impression, p.created_at,
        (SELECT COUNT(*) FROM observations o WHERE o.person_id = p.id) as observationCount,
        (SELECT MAX(logged_at) FROM observations o WHERE o.person_id = p.id) as lastObservationDate
       FROM people p WHERE user_id = $1 ORDER BY p.created_at DESC`,
      [req.user_id]
    );
    // ensure numeric types are parsed if returned as strings
    result.rows.forEach(r => r.observationcount = parseInt(r.observationcount || 0));
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/people
app.post('/api/people', async (req, res) => {
  const { name, relationshipType, firstImpression } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO people (user_id, name, relationship_type, first_impression) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.user_id, name, relationshipType, firstImpression]
    );
    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') { // unique violation
      return res.status(400).json({ error: 'Person already exists' });
    }
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/people/:personId
app.get('/api/people/:personId', async (req, res) => {
  const { personId } = req.params;
  try {
    const personRes = await db.query('SELECT * FROM people WHERE id = $1 AND user_id = $2', [personId, req.user_id]);
    if (personRes.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    
    const obsRes = await db.query('SELECT * FROM observations WHERE person_id = $1 ORDER BY logged_at DESC', [personId]);
    const predRes = await db.query('SELECT * FROM predictions WHERE person_id = $1 ORDER BY created_at DESC', [personId]);
    const outRes = await db.query('SELECT * FROM outcomes WHERE person_id = $1 ORDER BY created_at DESC', [personId]);

    const person = personRes.rows[0];
    person.observations = obsRes.rows;
    person.predictions = predRes.rows;
    person.outcomes = outRes.rows;
    
    res.json(person);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/observations
app.post('/api/observations', async (req, res) => {
  const { personId, text, tags, sentiment } = req.body;
  try {
    const verify = await db.query('SELECT 1 FROM people WHERE id = $1 AND user_id = $2', [personId, req.user_id]);
    if (verify.rows.length === 0) return res.status(403).json({ error: 'Unauthorized' });

    const result = await db.query(
      `INSERT INTO observations (person_id, text, tags, sentiment) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [personId, text, tags || [], sentiment]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/observations/:personId
app.get('/api/observations/:personId', async (req, res) => {
  const { personId } = req.params;
  try {
    const verify = await db.query('SELECT 1 FROM people WHERE id = $1 AND user_id = $2', [personId, req.user_id]);
    if (verify.rows.length === 0) return res.status(403).json({ error: 'Unauthorized' });

    const result = await db.query('SELECT * FROM observations WHERE person_id = $1 ORDER BY logged_at DESC', [personId]);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/predict
app.post('/api/predict', async (req, res) => {
  const { personId, goal } = req.body;
  try {
    const personRes = await db.query('SELECT * FROM people WHERE id = $1 AND user_id = $2', [personId, req.user_id]);
    if (personRes.rows.length === 0) return res.status(403).json({ error: 'Unauthorized' });

    const obsRes = await db.query('SELECT * FROM observations WHERE person_id = $1 ORDER BY logged_at DESC LIMIT 20', [personId]);
    
    // Call Groq
    const prediction = await requestGroqPrediction(personRes.rows[0], obsRes.rows, goal);
    
    // Save prediction
    // behavioral_tendencies = TEXT[] (pass as JS array)
    // personality_read, action_cards, groq_response = JSONB (pass as JSON.stringify)
    const insertRes = await db.query(
      `INSERT INTO predictions (person_id, goal, behavioral_tendencies, personality_read, action_cards, data_quality, prediction_note, groq_response) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        personId, goal, 
        prediction.behavioral_tendencies || [],
        JSON.stringify(prediction.personality_read || {}), 
        JSON.stringify(prediction.action_cards || []), 
        prediction.data_quality, 
        prediction.prediction_note, 
        JSON.stringify(prediction)
      ]
    );

    res.json(insertRes.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// POST /api/outcomes
app.post('/api/outcomes', async (req, res) => {
  const { personId, predictionId, goal, whatHappened, accuracyRating } = req.body;
  try {
    const verify = await db.query('SELECT 1 FROM people WHERE id = $1 AND user_id = $2', [personId, req.user_id]);
    if (verify.rows.length === 0) return res.status(403).json({ error: 'Unauthorized' });

    const result = await db.query(
      `INSERT INTO outcomes (person_id, prediction_id, goal, what_happened, prediction_accuracy_rating) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [personId, predictionId, goal, whatHappened, accuracyRating]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/outcomes/:personId
app.get('/api/outcomes/:personId', async (req, res) => {
  const { personId } = req.params;
  try {
    const verify = await db.query('SELECT 1 FROM people WHERE id = $1 AND user_id = $2', [personId, req.user_id]);
    if (verify.rows.length === 0) return res.status(403).json({ error: 'Unauthorized' });

    const result = await db.query('SELECT * FROM outcomes WHERE person_id = $1 ORDER BY created_at DESC', [personId]);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

const path = require('path');

// --- API Routes End ---

// Serve static compiled frontend in production
app.use(express.static(path.join(__dirname, '../dist')));

// Catch-all route to serve React's index.html for client-side routing
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`WOTN Backend running on port ${PORT}`);
});
